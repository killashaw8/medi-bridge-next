# Backend JWT memberImage Analysis

## Backend Code Analysis

### ✅ JWT Token DOES Include memberImage

**File:** `apps/medibridge-api/src/components/auth/auth.service.ts`

**Line 59-73:** `createToken` function includes `memberImage` in payload:
```typescript
public async createToken(subject: TokenSubject): Promise<string> {
  const sub = typeof subject._id === 'string' ? subject._id : subject._id.toString();

  const payload = {
    sub,
    memberNick: subject.memberNick,
    memberType: subject.memberType,
    memberImage: subject.memberImage,  // ✅ INCLUDED IN JWT PAYLOAD
  };

  return this.jwtService.signAsync(payload, {
    secret: process.env.JWT_ACCESS_SECRET!,
    expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '30d',
  });
}
```

### ❌ TypeScript Type Missing memberImage

**File:** `apps/medibridge-api/src/components/auth/auth.service.ts`

**Line 27-33:** `AccessTokenPayload` type doesn't include `memberImage`:
```typescript
export type AccessTokenPayload = {
  sub: string;           // user id
  memberNick?: string;
  role?: any;
  iat: number;           // issued at (added by JWT)
  exp: number;           // expiry (added by JWT)
  // ❌ memberImage is MISSING from type definition!
};
```

### ✅ memberImage is Passed to createToken

**File:** `apps/medibridge-api/src/components/member/member.service.ts`

**Line 40 (signup):**
```typescript
const doc = await this.memberModel.create(input);
const accessToken = await this.authService.createToken(doc);  // ✅ doc has memberImage
```

**Line 87 (login):**
```typescript
const doc = await this.memberModel.findOne({ memberNick })...
const accessToken = await this.authService.createToken(doc);  // ✅ doc has memberImage
```

## Issues Found

### Issue 1: TypeScript Type Mismatch
- JWT payload includes `memberImage` ✅
- TypeScript type doesn't include it ❌
- This causes type errors but doesn't break runtime

### Issue 2: Empty memberImage Value
- If database has empty string `""` for `memberImage`, JWT will have `""`
- Frontend receives empty string → shows default image
- This is expected behavior, but we need to handle it

### Issue 3: GraphQL Response vs JWT Token
- GraphQL response returns full member object with `memberImage` ✅
- JWT token also includes `memberImage` ✅
- **BUT:** If `memberImage` is empty in database, both will be empty

## Root Cause

The backend IS including `memberImage` in the JWT token. The issue is likely:

1. **Database has empty `memberImage`** - User hasn't uploaded an image yet
2. **Frontend only uses JWT token** - Should also use GraphQL response data
3. **Type mismatch** - TypeScript type doesn't match actual payload

## Recommended Backend Fixes

### Fix 1: Update AccessTokenPayload Type
**File:** `apps/medibridge-api/src/components/auth/auth.service.ts`

**Line 27-33:**
```typescript
// BEFORE:
export type AccessTokenPayload = {
  sub: string;
  memberNick?: string;
  role?: any;
  iat: number;
  exp: number;
};

// AFTER:
export type AccessTokenPayload = {
  sub: string;
  memberNick?: string;
  memberType?: string;      // ✅ Add
  memberImage?: string;      // ✅ Add
  role?: any;
  iat: number;
  exp: number;
};
```

### Fix 2: Ensure memberImage is Always Included
**File:** `apps/medibridge-api/src/components/auth/auth.service.ts`

**Line 59-73:**
```typescript
// BEFORE:
const payload = {
  sub,
  memberNick: subject.memberNick,
  memberType: subject.memberType,
  memberImage: subject.memberImage,
};

// AFTER (ensure it's always a string, never undefined):
const payload = {
  sub,
  memberNick: subject.memberNick,
  memberType: subject.memberType,
  memberImage: subject.memberImage || null,  // ✅ Explicit null instead of undefined
};
```

### Fix 3: Check Member Schema Default
**File:** `apps/medibridge-api/src/schemas/Member.model.ts`

Check if `memberImage` has a default value. If not, consider adding one.

## Frontend Fix (Still Needed)

Even with backend fixes, frontend should:
1. Use GraphQL response data (which has `memberImage`)
2. Fallback to JWT token if GraphQL data unavailable
3. Handle empty strings properly

See: `FIXES/auth-memberImage-exact-fix.ts` for frontend solution.

