// Backend Fix: auth.service.ts
// File: apps/medibridge-api/src/components/auth/auth.service.ts

// ============================================
// FIX 1: Update AccessTokenPayload Type
// ============================================

// CURRENT CODE (line 27-33):
export type AccessTokenPayload = {
  sub: string;           // user id
  memberNick?: string;
  role?: any;
  iat: number;           // issued at (added by JWT)
  exp: number;           // expiry (added by JWT)
};

// FIXED CODE:
export type AccessTokenPayload = {
  sub: string;           // user id
  memberNick?: string;
  memberType?: string;  // ✅ Add - matches JWT payload
  memberImage?: string;  // ✅ Add - matches JWT payload
  role?: any;
  iat: number;           // issued at (added by JWT)
  exp: number;           // expiry (added by JWT)
};

// ============================================
// FIX 2: Ensure memberImage is Always Included (Optional)
// ============================================

// CURRENT CODE (line 59-73):
public async createToken(subject: TokenSubject): Promise<string> {
  const sub = typeof subject._id === 'string' ? subject._id : subject._id.toString();

  const payload = {
    sub,
    memberNick: subject.memberNick,
    memberType: subject.memberType,
    memberImage: subject.memberImage,
  };

  return this.jwtService.signAsync(payload, {
    secret: process.env.JWT_ACCESS_SECRET!,
    expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '30d',
  });
}

// FIXED CODE (explicit null instead of undefined):
public async createToken(subject: TokenSubject): Promise<string> {
  const sub = typeof subject._id === 'string' ? subject._id : subject._id.toString();

  const payload = {
    sub,
    memberNick: subject.memberNick || null,
    memberType: subject.memberType || null,
    memberImage: subject.memberImage || null,  // ✅ Explicit null for empty strings
  };

  return this.jwtService.signAsync(payload, {
    secret: process.env.JWT_ACCESS_SECRET!,
    expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '30d',
  });
}

// OR keep as is (undefined is fine, but null is more explicit):
// Current code is actually fine - undefined will be omitted from JWT
// But if you want to be explicit:
memberImage: subject.memberImage ?? null,

