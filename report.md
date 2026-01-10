# MediBridge Security Review (Medium-Level)

## Scope
- Frontend: `/Users/killashaw/Desktop/medi-bridge-next`
- Backend: `/Users/killashaw/Desktop/medi-bridge` (NestJS API)

## Summary
This is a targeted medium‑severity security pass focusing on auth/token handling, upload surfaces, logging, CORS, and runtime exposure. It is **not** a full pentest.

## Findings

### High
1) **JWTs and refresh tokens stored in `localStorage`**
- Evidence: `libs/auth/index.ts`
- Risk: Any XSS can exfiltrate both access and refresh tokens, enabling account takeover.
- Recommendation: Move refresh tokens to **HttpOnly, SameSite** cookies; consider keeping access tokens in memory only. Strip token fields from non‑auth GraphQL responses. (Implemented: refresh tokens moved to HttpOnly cookies; refresh token removed from GraphQL selections.)

2) **Sensitive request/response data logged**
- Evidence: `apps/medibridge-api/src/libs/interceptor/Logging.interceptor.ts`
- Risk: GraphQL requests can include passwords, tokens, and PII; logs may leak secrets.
- Recommendation: Redact sensitive fields (password, refreshToken, accessToken, auth headers) and reduce response logging in production. (Implemented with redaction.)

3) **GraphQL Playground enabled in production**
- Evidence: `apps/medibridge-api/src/app.module.ts`
- Risk: Exposes schema and interactive query interface to attackers in production.
- Recommendation: Disable Playground in production or gate behind environment checks and IP allowlists. (Implemented with env check.)

### Medium
4) **CORS defaults to allow any origin when `CORS_ORIGINS` is empty**
- Evidence: `apps/medibridge-api/src/main.ts`
- Risk: Misconfigured env can unintentionally allow cross‑origin access.
- Recommendation: Fail closed in production; require explicit allowlist and reject empty config. (Deferred: dev-only until production domain exists.)

5) **Upload `target` not validated (path traversal risk)**
- Evidence: `apps/medibridge-api/src/components/member/member.resolver.ts`
- Risk: Client-controlled `target` can potentially escape `/uploads` or write into unintended folders.
- Recommendation: Validate `target` against a strict allowlist (`member`, `product`, `article`, etc.) and reject any path separators. (Implemented with allowlist + traversal checks.)

6) **Public static `/uploads` without access control**
- Evidence: `apps/medibridge-api/src/main.ts`
- Risk: Any uploaded file is world‑readable; risky if sensitive content is uploaded.
- Recommendation: Use signed URLs or serve via authenticated endpoints for private media. (Accepted risk for now: only public avatars/product/article images are stored; no medical docs or chat media.)

7) **No rate limiting / brute‑force protection on auth**
- Evidence: no throttler/guard found in codebase
- Risk: Password stuffing and token abuse.
- Recommendation: Add NestJS Throttler or reverse‑proxy rate limits for login and token refresh. (Implemented with Throttler on auth mutations.)

### Low
8) **Error formatting may leak internal messages**
- Evidence: `apps/medibridge-api/src/app.module.ts` (`formatError`)
- Risk: Overly detailed errors can aid attackers.
- Recommendation: Use generic error messages in production and log full details server‑side only. (Implemented with production-only masking.)

## Positive Notes
- Refresh token rotation is implemented in backend (`apps/medibridge-api/src/components/auth/auth.service.ts`).
- ValidationPipe uses whitelist + forbidNonWhitelisted (`apps/medibridge-api/src/main.ts`).

## Recommended Remediation Plan (Order)
1) Move refresh tokens to HttpOnly cookies; stop returning refresh/access tokens in non‑auth responses.
2) Redact sensitive fields in logs and reduce request/response logging in production.
3) Disable GraphQL Playground in production.
4) Lock down CORS with explicit allowlist and fail-closed behavior.
5) Validate upload targets + add private media delivery options if needed.
6) Add rate limiting for auth and sensitive mutations.

## Open Questions / Assumptions
- Deployment plan: Nginx on Hostinger VPS (edge rate limits/WAF can be added there).
- CSP headers: not yet confirmed; add CSP at Nginx when moving to production to reduce XSS risk.
