import { useMemo } from 'react';
import {
	ApolloClient,
	ApolloLink,
	InMemoryCache,
	NormalizedCacheObject,
	createHttpLink,
	split,
	from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { getJwtToken, logOut, setJwtToken, refreshTokens } from '@/libs/auth';
import { sweetErrorAlert } from '@/libs/sweetAlert';
import jwtDecode from 'jwt-decode';

const GRAPHQL_HTTP_URL =
	process.env.NEXT_PUBLIC_API_GRAPHQL_URL ??
	process.env.REACT_APP_API_GRAPHQL_URL ??
	'http://localhost:5885/graphql';

const defaultWsUrl = GRAPHQL_HTTP_URL.startsWith('https')
	? GRAPHQL_HTTP_URL.replace(/^https/, 'wss')
	: GRAPHQL_HTTP_URL.replace(/^http/, 'ws');

const GRAPHQL_WS_URL =
	process.env.NEXT_PUBLIC_API_WS ?? process.env.REACT_APP_API_WS ?? defaultWsUrl;

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

class PatchedInMemoryCache extends InMemoryCache {
	diff(options: any) {
		if (options && Object.prototype.hasOwnProperty.call(options, 'canonizeResults')) {
			const { canonizeResults, ...rest } = options;
			return super.diff(rest);
		}
		return super.diff(options);
	}
}

function safeGetJwtToken(): string | null {
	if (typeof window === 'undefined') return null;
	try {
		return getJwtToken() ?? null;
	} catch {
		return null;
	}
}

function buildAuthHeaders(): Record<string, string> {
	const token = safeGetJwtToken();
	if (!token) return {};
	return { Authorization: `Bearer ${token}` };
}

const authLink = new ApolloLink((operation, forward) => {
	const operationName = operation.operationName || '';
	
	operation.setContext(({ headers = {} }) => ({
		headers: {
			...headers,
			...buildAuthHeaders(),
			'x-apollo-operation-name': operationName,
			'apollo-require-preflight': 'true',
			'content-type': 'application/json',
		},
	}));

	return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors) {
		graphQLErrors.forEach(({ message, locations, path }) => {
			console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
			if (!message.includes('input')) sweetErrorAlert(message);
		});
	}

	if (networkError) {
		console.error(`[Network error]: ${networkError}`);
	}
});

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		const token = safeGetJwtToken();
    if (!token) return true;
    try {
      const { exp } = jwtDecode<{ exp?: number }>(token);
      if (!exp) return true;
      return Date.now() < exp * 1000;
    } catch {
      return false;
    }
	}, // @ts-ignore
	fetchAccessToken: refreshTokens,
	handleFetch: (accessToken) => setJwtToken(accessToken),
	handleError: () => logOut()
});

function createIsomorphicLink() {
	const httpLink = createHttpLink({
		uri: GRAPHQL_HTTP_URL,
		credentials: 'include',
	});

	const links: ApolloLink[] = [errorLink, tokenRefreshLink];

	// Server-side: HTTP only
	if (typeof window === 'undefined') {
		links.push(authLink.concat(httpLink));
		return from(links);
	}

	// Client-side: HTTP + Upload (file support)
	const uploadLink = createUploadLink({
		uri: GRAPHQL_HTTP_URL,
		credentials: 'include',
	});

	let terminatingLink: ApolloLink = authLink.concat(uploadLink);

	// Optional WebSocket support for subscriptions
	if (GRAPHQL_WS_URL) {
		const wsLink = new GraphQLWsLink(
			createClient({
				url: GRAPHQL_WS_URL,
				connectionParams: () => {
					const token = safeGetJwtToken();
					return {
						authorization: token ? `Bearer ${token}` : '',
					};
				},
				shouldRetry: () => true,
			}),
		);

		terminatingLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			wsLink,
			authLink.concat(uploadLink),
		);
	}

	links.push(terminatingLink);

	return from(links);
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new PatchedInMemoryCache(),
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();

	if (initialState) {
		_apolloClient.cache.restore(initialState);
	}

	if (typeof window === 'undefined') {
		return _apolloClient;
	}

	if (!apolloClient) {
		apolloClient = _apolloClient;
	}

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
