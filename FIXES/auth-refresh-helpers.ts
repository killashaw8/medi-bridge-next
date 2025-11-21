/**
 * DROP-IN REFRESH-TOKEN HELPERS
 * ----------------------------------
 * Destination file: `libs/auth/index.ts`
 *
 * 1) Place the STORAGE HELPERS near the existing `getJwtToken/setJwtToken`
 *    functions (top of the file).
 * 2) Place `refreshTokens()` below the login/signup helpers (before
 *    `updateStorage` is fine).
 * 3) After adding these helpers, point `TokenRefreshLink.fetchAccessToken`
 *    to `refreshTokens`.
 */

// ====== 1. STORAGE HELPERS (put next to getJwtToken/setJwtToken) ======

export function getRefreshToken(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('refreshToken');
}

export function setRefreshToken(token: string | null) {
	if (typeof window === 'undefined') return;
	if (token) localStorage.setItem('refreshToken', token);
	else localStorage.removeItem('refreshToken');
}

// ====== 2. API CALL (place below login/signup helpers) ======

export async function refreshTokens(): Promise<string> {
	const refreshToken = getRefreshToken();
	if (!refreshToken) throw new Error('No refresh token found');

	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include', // keep if server stores token in HttpOnly cookie
		body: JSON.stringify({ refreshToken }),
	});

	if (!response.ok) {
		throw new Error('Failed to refresh token');
	}

	const { accessToken, refreshToken: rotatedRefresh } = await response.json();

	if (!accessToken) {
		throw new Error('No access token returned from refresh endpoint');
	}

	setJwtToken(accessToken);
	updateUserInfo(accessToken);

	if (rotatedRefresh) {
		setRefreshToken(rotatedRefresh);
	}

	return accessToken;
}

/**
 * ====== 3. TOKEN REFRESH LINK WIRING (apollo/client.ts) ======
 *
 * In `apollo/client.ts`, import `refreshTokens` and set:
 *
 * const tokenRefreshLink = new TokenRefreshLink({
 *   accessTokenField: 'accessToken',
 *   isTokenValidOrUndefined: () => { ... },
 *   fetchAccessToken: refreshTokens,      // <--- use the helper above
 *   handleFetch: (accessToken) => setJwtToken(accessToken),
 *   handleError: () => logOut(),
 * });
 *
 * That’s it—your refresh flow now uses the existing auth helpers.
 */

