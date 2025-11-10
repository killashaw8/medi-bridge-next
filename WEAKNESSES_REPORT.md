# Medi-Bridge Next.js Project - Weaknesses & Issues Report

## 🔴 CRITICAL ISSUES (App Router Patterns in Pages Router)

### 1. **App Router Directives in Pages Router** ❌ FIXED
- **Files:** 
  - `libs/components/layout/Navbar.tsx` - Had `"use client"` directive
  - `libs/components/layout/NavbarTwo.tsx` - Had `"use client"` directive
  - `libs/components/layout/GoTop.tsx` - Had `"use client"` directive
- **Issue:** `"use client"` is an App Router (Next.js 13+) pattern, not used in Pages Router
- **Impact:** These directives are ignored in Pages Router but indicate confusion about routing architecture
- **Status:** ✅ FIXED - Removed all `"use client"` directives

### 2. **Wrong Navigation Hook** ❌ FIXED
- **Files:**
  - `libs/components/layout/Navbar.tsx` - Used `usePathname()` from `next/navigation`
  - `libs/components/layout/NavbarTwo.tsx` - Used `usePathname()` from `next/navigation`
- **Issue:** `usePathname()` from `next/navigation` is App Router only. Pages Router uses `useRouter()` from `next/router`
- **Impact:** Will cause runtime errors - `next/navigation` doesn't exist in Pages Router context
- **Fix:** Changed to `useRouter().pathname` from `next/router`
- **Status:** ✅ FIXED

### 3. **Incorrect Import Path** ❌ FIXED
- **File:** `libs/components/layout/NavbarTwo.tsx`
- **Issue:** Import path `"../../components/Layout/Menus"` is incorrect
- **Actual Path:** Should be `"./Menus"` (same directory)
- **Status:** ✅ FIXED

---

## 🟡 HIGH PRIORITY ISSUES

### 4. **Environment Variable Naming Convention**
- **Files:** 
  - `next.config.js`
  - `apollo/client.ts`
  - `libs/config.ts`
- **Issue:** Using `REACT_APP_` prefix (Create React App convention) instead of `NEXT_PUBLIC_` (Next.js convention)
- **Impact:** Works because exposed in `next.config.js`, but not following Next.js best practices
- **Recommendation:** Migrate to `NEXT_PUBLIC_` prefix for consistency

### 5. **Version Compatibility Issues**
- **Package.json Issues:**
  - Next.js 15.5.4 with React 19.1.0 - Very new versions, may have compatibility issues
  - `eslint-config-next: 12.1.0` - Outdated (should match Next.js version ~15.x)
  - `react-scripts: 4.0.3` - Unnecessary in Next.js project (Create React App dependency)
- **Impact:** Potential compatibility issues, outdated tooling
- **Recommendation:** Update ESLint config to match Next.js version, remove react-scripts

### 6. **Deprecated WebSocket Package**
- **File:** `package.json`
- **Issue:** Using `subscriptions-transport-ws: ^0.9.19` (deprecated)
- **Impact:** Package is deprecated, may have security issues
- **Recommendation:** Migrate to `graphql-ws` (modern WebSocket implementation)

### 7. **TypeScript Type Safety Issues**
- **Files with `any` types:**
  - `pages/index.tsx:16` - `getStaticProps` parameter typed as `any`
  - `libs/auth/index.ts:9` - `getJwtToken()` returns `any`
  - `libs/components/Chat.tsx:106, 113, 118` - Event handlers use `any`
  - Multiple files with `@ts-ignore` comments
- **Impact:** Loss of type safety, potential runtime errors
- **Recommendation:** Replace `any` with proper types, remove `@ts-ignore` where possible

### 8. **Missing Error Handling**
- **File:** `apollo/client.ts`
- **Issue:** 
  - Empty 401 error handler (line 104-105)
  - Token refresh link returns `null` (line 30)
  - No server-side link implementation (only client-side)
- **Impact:** Poor error handling, potential authentication issues
- **Recommendation:** Implement proper error handling and token refresh logic

---

## 🟢 MEDIUM PRIORITY ISSUES

### 9. **Unused Imports** ❌ FIXED
- **File:** `pages/index.tsx`
- **Issue:** 
  - `useDeviceDetect` imported but never used
  - `Navbar` and `Footer` imported but not used (handled by layout HOC)
- **Status:** ✅ FIXED

### 10. **Memory Leak in GoTop Component** ❌ FIXED
- **File:** `libs/components/layout/GoTop.tsx`
- **Issue:** Event listener not cleaned up in useEffect
- **Impact:** Memory leaks on component unmount
- **Status:** ✅ FIXED - Added cleanup function

### 11. **Console Warnings in Production**
- **File:** `apollo/client.ts:73`
- **Issue:** `console.warn('requesting.. ', operation)` logs all GraphQL operations
- **Impact:** Performance impact, cluttered console in production
- **Recommendation:** Remove or conditionally log only in development

### 12. **Missing SSR Support for Apollo Client**
- **File:** `apollo/client.ts:64-118`
- **Issue:** `createIsomorphicLink()` only returns link for client-side (`typeof window !== 'undefined'`)
- **Impact:** No server-side rendering support for GraphQL queries
- **Recommendation:** Add server-side link implementation

### 13. **Incomplete Type Definitions**
- **File:** `apollo/client.ts`
- **Issue:** Multiple `@ts-ignore` comments (lines 18, 27, 77, 103)
- **Impact:** Type safety bypassed, potential runtime errors
- **Recommendation:** Add proper types instead of ignoring TypeScript

### 14. **Hardcoded Fallback Values**
- **File:** `apollo/client.ts:84`
- **Issue:** Hardcoded WebSocket URL fallback `'ws://127.0.0.1:5885'`
- **Impact:** May connect to wrong backend if env var missing
- **Recommendation:** Fail fast if env var not provided

---

## 🔵 LOW PRIORITY / CODE QUALITY

### 15. **Inconsistent Code Style**
- Mixed use of single/double quotes
- Inconsistent indentation (tabs vs spaces)
- Some files use semicolons, others don't

### 16. **Missing Error Boundaries**
- No React Error Boundaries implemented
- Unhandled errors could crash entire app

### 17. **Performance Concerns**
- **File:** `libs/components/Chat.tsx:87`
- **Issue:** `messagesList` in useEffect dependency array causes unnecessary re-renders
- **Recommendation:** Use functional updates or refs

### 18. **Missing Loading States**
- No loading indicators for async operations
- Poor user experience during data fetching

### 19. **Security Concerns**
- JWT token stored in cookies without httpOnly flag (assumed)
- No CSRF protection mentioned
- WebSocket connections without proper authentication validation

### 20. **Documentation**
- Missing API documentation
- No JSDoc comments for complex functions
- README doesn't document environment variables

---

## 📋 SUMMARY

### Fixed Issues ✅
1. Removed `"use client"` directives from 3 files
2. Replaced `usePathname` with `useRouter().pathname`
3. Fixed incorrect import path in NavbarTwo.tsx
4. Removed unused imports from index.tsx
5. Fixed memory leak in GoTop component

### Critical Issues Remaining 🔴
1. Environment variable naming (REACT_APP_ → NEXT_PUBLIC_)
2. Version compatibility (ESLint config outdated)
3. Deprecated WebSocket package
4. Missing SSR support for Apollo Client
5. Type safety issues (any types, @ts-ignore)

### Recommendations
1. **Immediate:** Fix environment variable naming and update ESLint config
2. **Short-term:** Replace deprecated packages, add proper TypeScript types
3. **Long-term:** Add error boundaries, improve error handling, add comprehensive testing

---

## 🛠️ QUICK FIXES NEEDED

### 1. Update ESLint Config
```json
"eslint-config-next": "^15.5.4"
```

### 2. Remove react-scripts
```bash
yarn remove react-scripts
```

### 3. Migrate to graphql-ws
```bash
yarn remove subscriptions-transport-ws
yarn add graphql-ws
```

### 4. Environment Variables
Create `.env.local` with:
```
NEXT_PUBLIC_API_URL=http://localhost:5885
NEXT_PUBLIC_API_GRAPHQL_URL=http://localhost:5885/graphql
NEXT_PUBLIC_API_WS=ws://localhost:5885
```

Then update `next.config.js` and all references to use `NEXT_PUBLIC_` prefix.

