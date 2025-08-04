import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getStrapiGraphQLUrl } from './config';

// Log dell'URL GraphQL per debug
const graphqlUrl = getStrapiGraphQLUrl();
console.group('🌐 Apollo Client Configuration');
console.log('GraphQL URL:', graphqlUrl);
console.log('Environment:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_STRAPI_URL:', process.env.NEXT_PUBLIC_STRAPI_URL);
console.groupEnd();

const httpLink = createHttpLink({
    uri: graphqlUrl,
    // Usa POST per tutte le query GraphQL per evitare problemi con query complesse
    useGETForQueries: false,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    // Aggiungi fetch options per migliorare la gestione degli errori
    fetchOptions: {
        timeout: 15000, // 15 secondi timeout
    },
    // Custom fetch function con fallback
    fetch: async (uri, options) => {
        try {
            const urlString = typeof uri === 'string' ? uri : uri.toString();
            console.log('🌐 GraphQL Request:', { uri: urlString, method: options?.method || 'POST' });
            return await fetch(uri, options);
        } catch (error) {
            console.error('🚨 GraphQL Fetch Error:', error);
            // In sviluppo, prova il fallback diretto
            const urlString = typeof uri === 'string' ? uri : uri.toString();
            if (process.env.NODE_ENV === 'development' && urlString.includes('/api/strapi/graphql')) {
                const fallbackUri = 'http://localhost:1337/graphql';
                console.log('🔄 Trying fallback URI:', fallbackUri);
                return await fetch(fallbackUri, options);
            }
            throw error;
        }
    },
});

const authLink = setContext(async (_, { headers }) => {
    // Use secure storage for JWT token
    let token: string | null = null;
    
    if (typeof window !== 'undefined') {
        try {
            const { secureStorage } = await import('./secure-storage');
            token = await secureStorage.getJWT();
        } catch (error) {
            console.warn('Secure storage not available, using fallback');
            // Fallback to check localStorage for migration
            const legacyToken = localStorage.getItem('jwt');
            if (legacyToken) {
                console.log('Found legacy token, will migrate to secure storage');
                token = legacyToken;
                // Remove legacy token after successful use
                localStorage.removeItem('jwt');
            }
        }
    }

    return {
        headers: {
            ...headers,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            authorization: token ? `Bearer ${token}` : "",
        }
    }
});

// Link per gestire errori di rete
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    console.group('🔥 Apollo Error Link Triggered');
    console.log('Operation:', operation.operationName);
    console.log('Variables:', operation.variables);
    
    if (graphQLErrors) {
        console.error('GraphQL Errors:', graphQLErrors);
        graphQLErrors.forEach(({ message, locations, path }) => {
            console.warn(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
        });
    }

    if (networkError) {
        console.error('Network Error Object:', networkError);
        console.warn(`[Network error]: ${networkError}`);

        // Log informazioni aggiuntive per debug mobile
        if (process.env.NODE_ENV === 'development') {
            console.warn('Network error details:', {
                name: networkError.name,
                message: networkError.message,
                statusCode: (networkError as any)?.statusCode,
                result: (networkError as any)?.result,
                bodyText: (networkError as any)?.bodyText,
                response: (networkError as any)?.response,
                stack: networkError.stack
            });

            // Suggerisci soluzioni per errori comuni
            if (networkError.message.includes('Failed to fetch') ||
                networkError.message.includes('Network request failed')) {
                console.warn(
                    '💡 Suggestion: If testing on mobile device, make sure:\n' +
                    '1. Backend is running and accessible\n' +
                    '2. Use computer IP address instead of localhost\n' +
                    '3. Check firewall settings\n' +
                    '4. Ensure CORS is properly configured'
                );
            }
        }
        console.groupEnd();

        // Non bloccare l'app per errori di rete
        return;
    }
    
    console.groupEnd();
});

const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    ssrMode: typeof window === 'undefined',
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all', // Continua anche con errori
            notifyOnNetworkStatusChange: true,
        },
        query: {
            errorPolicy: 'all', // Continua anche con errori
            notifyOnNetworkStatusChange: true,
        },
    },
});

export default client;
