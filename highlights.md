# Security Highlights

## 1) Upload target validation (Fix for report #5)
**What was wrong**
- The upload `target` came from the client and was used directly in the file path, which could allow path traversal (e.g., `../../`).

**What I changed**
- Added a strict allowlist and traversal checks before writing files.

**Code**
```ts
// apps/medibridge-api/src/components/member/member.resolver.ts
private readonly allowedUploadTargets = new Set(['member', 'product', 'article', 'clinic']);

private validateUploadTarget(target: string): void {
  if (!target || target.includes('..') || target.includes('/') || target.includes('\\')) {
    throw new Error(Message.UPLOAD_FAILED);
  }
  if (!this.allowedUploadTargets.has(target)) {
    throw new Error(Message.UPLOAD_FAILED);
  }
}
```

**Result**
- Uploads can only go into known safe folders; traversal attempts fail immediately.

---

## 2) Auth rate limiting (Fix for report #7)
**What was wrong**
- Login and token refresh were unthrottled, allowing brute‑force and credential‑stuffing attempts.

**What I changed**
- Added NestJS Throttler and applied a 5 requests / 60s limit to auth mutations.

**Code**
```ts
// apps/medibridge-api/src/components/member/member.resolver.ts
@UseGuards(GqlThrottlerGuard)
@Throttle({ auth: { limit: 5, ttl: 60 } })
public async login(@Args("input") input: LoginInput): Promise<MemberEntity> { ... }

@UseGuards(GqlThrottlerGuard)
@Throttle({ auth: { limit: 5, ttl: 60 } })
async refreshMemberTokens(@Args('input') input: RefreshInput): Promise<MemberEntity> { ... }
```

```ts
// apps/medibridge-api/src/app.module.ts
ThrottlerModule.forRoot([
  {
    name: 'auth',
    ttl: Number(process.env.THROTTLE_TTL ?? 60),
    limit: Number(process.env.THROTTLE_LIMIT ?? 10),
  },
]),
```

**Result**
- Brute‑force login attempts are rate‑limited, reducing account‑takeover risk and abuse.


---

## 3) Safe error formatting (Fix for report #8)
**What was wrong**
- GraphQL errors could expose internal messages and stack details to clients.

**What I changed**
- In production, return a generic message while keeping detailed logs for dev.

**Code**
```ts
// apps/medibridge-api/src/app.module.ts
formatError: (error: T) => {
  const isProd = process.env.NODE_ENV === 'production';
  const message =
    error?.extensions?.exception?.response?.message ||
    error?.extensions?.response?.message ||
    error?.message;

  return {
    code: error?.extensions?.code,
    message: isProd ? 'Internal server error' : message,
  };
},
```

**Result**
- Attackers can’t learn internal error details in production, while developers still see useful errors in dev.

---

## 4) Refresh token rotation (Positive note)
**What’s in place**
- Refresh tokens are rotated and stored securely (hashed in Redis), reducing replay risk.

**Code**
```ts
// apps/medibridge-api/src/components/auth/auth.service.ts
public async rotateRefreshToken(oldRefreshToken: string) {
  const payload = await this.jwtService.verifyAsync<{ sub: string; jti: string }>(
    oldRefreshToken,
    { secret: process.env.JWT_REFRESH_SECRET! },
  );

  const ok = await this.tokenStore.verifyRefresh(payload.sub, payload.jti, oldRefreshToken);
  if (!ok) throw new Error('Invalid or rotated refresh token');

  await this.tokenStore.deleteRefresh(payload.sub, payload.jti);
  const newRefreshToken = await this.createRefreshToken(payload.sub);
  return { userId: payload.sub, refreshToken: newRefreshToken };
}
```

**Result**
- Stolen refresh tokens become useless after rotation; improves session security.

---

## 5) Strict validation pipe (Positive note)
**What’s in place**
- Requests are validated globally with whitelist + forbid non‑whitelisted fields.

**Code**
```ts
// apps/medibridge-api/src/main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
}));
```

**Result**
- Prevents unexpected fields from sneaking into handlers; reduces injection and data pollution risks.

---

## 6) Sensitive log redaction (Fix for report #2)
**What was wrong**
- Request/response logs could include passwords, access tokens, and refresh tokens.

**What I changed**
- Added a redaction pass that masks sensitive keys before logging.

**Code**
```ts
// apps/medibridge-api/src/libs/interceptor/Logging.interceptor.ts
private readonly sensitiveKeys = new Set([
  'memberPassword', 'password', 'accessToken', 'refreshToken', 'authorization', 'Authorization', 'token',
]);

private redactSensitive(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => this.redactSensitive(item));
  const out: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)) {
    out[key] = this.sensitiveKeys.has(key) ? '[REDACTED]' : this.redactSensitive(val);
  }
  return out;
}
```

**Result**
- Logs remain useful for debugging without exposing credentials or tokens.

---

## 7) Disable GraphQL Playground in production (Fix for report #3)
**What was wrong**
- Playground exposes the schema and query UI in production.

**What I changed**
- Enabled Playground only in non‑production environments.

**Code**
```ts
// apps/medibridge-api/src/app.module.ts
playground: process.env.NODE_ENV !== 'production',
```

**Result**
- Production does not expose an interactive schema explorer to attackers.

---

## 8) HttpOnly refresh tokens (Fix for report #1)
**What was wrong**
- Refresh tokens were stored in `localStorage`, making them accessible to XSS.

**What I changed**
- Set refresh tokens as **HttpOnly cookies** on login/refresh and removed refresh tokens from GraphQL selections on the frontend.
- Refresh now reads from cookies; frontend no longer stores refresh tokens.

**Code**
```ts
// apps/medibridge-api/src/components/member/member.resolver.ts
private setRefreshCookie(res: Response | undefined, token: string): void {
  if (!res?.cookie || !token) return;
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') ?? (isProd ? 'none' : 'lax');
  const secure = sameSite === 'none' ? true : isProd;
  const maxAge = ms(process.env.JWT_REFRESH_EXPIRES ?? '30d');

  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite,
    secure,
    maxAge: Number.isFinite(maxAge) ? maxAge : undefined,
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
}
```

```ts
// libs/auth/index.ts (frontend)
export async function refreshTokens(): Promise<string> {
  const graphQlUrl = process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? 'http://localhost:5885/graphql';
  const response = await fetch(graphQlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      query: `mutation RefreshTokens($input: RefreshInput!) { refreshMemberTokens(input: $input) { accessToken } }`,
      variables: { input: {} },
    }),
  });
  const payload = await response.json();
  const accessToken = payload?.data?.refreshMemberTokens?.accessToken;
  if (!accessToken) throw new Error('No access token returned');
  setJwtToken(accessToken);
  updateUserInfo(accessToken);
  return accessToken;
}
```

**Result**
- Refresh tokens are no longer accessible to JavaScript (reduces XSS impact).
- Access tokens remain in localStorage for now; moving them to cookies would be the next hardening step.

---

## Latest UI Updates
- Polished admin dashboard with skeleton loaders that mirror table/card layouts, quick member actions (copy + view profile), and improved mobile sidebar tabs.
- Added star ratings for doctor/clinic/product reviews with averaged scores and rating counts.
