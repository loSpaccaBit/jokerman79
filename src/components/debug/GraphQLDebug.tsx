'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const TEST_QUERY = gql`
  query TestQuery {
    __schema {
      queryType {
        name
      }
    }
  }
`;

interface ConnectionStatus {
    proxy: 'unknown' | 'success' | 'failed';
    direct: 'unknown' | 'success' | 'failed';
    proxyError?: string;
    directError?: string;
}

export function GraphQLDebug() {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        proxy: 'unknown',
        direct: 'unknown'
    });

    const { data, loading, error } = useQuery(TEST_QUERY, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
    });

    // Test connettività manuale
    useEffect(() => {
        async function testConnections() {
            // Test proxy Next.js
            try {
                const proxyResponse = await fetch('/api/strapi/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: '{ __schema { queryType { name } } }' })
                });
                
                if (proxyResponse.ok) {
                    setConnectionStatus(prev => ({ ...prev, proxy: 'success' }));
                } else {
                    setConnectionStatus(prev => ({ 
                        ...prev, 
                        proxy: 'failed', 
                        proxyError: `${proxyResponse.status}: ${proxyResponse.statusText}` 
                    }));
                }
            } catch (err) {
                setConnectionStatus(prev => ({ 
                    ...prev, 
                    proxy: 'failed', 
                    proxyError: err instanceof Error ? err.message : 'Unknown error' 
                }));
            }

            // Test diretto a Strapi
            try {
                const directResponse = await fetch('http://localhost:1337/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: '{ __schema { queryType { name } } }' })
                });
                
                if (directResponse.ok) {
                    setConnectionStatus(prev => ({ ...prev, direct: 'success' }));
                } else {
                    setConnectionStatus(prev => ({ 
                        ...prev, 
                        direct: 'failed', 
                        directError: `${directResponse.status}: ${directResponse.statusText}` 
                    }));
                }
            } catch (err) {
                setConnectionStatus(prev => ({ 
                    ...prev, 
                    direct: 'failed', 
                    directError: err instanceof Error ? err.message : 'Unknown error' 
                }));
            }
        }

        testConnections();
    }, []);

    useEffect(() => {
        console.group('🔍 GraphQL Debug Information');
        console.log('Apollo Client Status:', {
            loading,
            hasData: !!data,
            hasError: !!error,
            data,
            error: error?.message || null,
            networkError: error?.networkError?.message || null,
            graphQLErrors: error?.graphQLErrors?.map(e => e.message) || []
        });

        console.log('Manual Connection Tests:', connectionStatus);

        if (error?.networkError) {
            console.error('Network Error Details:', error.networkError);
        }

        if (error?.graphQLErrors) {
            console.error('GraphQL Errors:', error.graphQLErrors);
        }
        console.groupEnd();
    }, [data, loading, error, connectionStatus]);

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white p-3 rounded text-xs max-w-sm">
            <div className="font-bold mb-2">GraphQL Debug</div>
            
            <div className="space-y-1">
                <div>Apollo: {loading ? '⏳' : data ? '✅' : error ? '❌' : '❓'}</div>
                <div>Proxy: {connectionStatus.proxy === 'success' ? '✅' : connectionStatus.proxy === 'failed' ? '❌' : '⏳'}</div>
                <div>Direct: {connectionStatus.direct === 'success' ? '✅' : connectionStatus.direct === 'failed' ? '❌' : '⏳'}</div>
            </div>

            {error && (
                <div className="mt-2 text-xs bg-red-600 p-1 rounded">
                    {error.message}
                </div>
            )}

            {connectionStatus.proxyError && (
                <div className="mt-1 text-xs bg-orange-600 p-1 rounded">
                    Proxy: {connectionStatus.proxyError}
                </div>
            )}

            {connectionStatus.directError && (
                <div className="mt-1 text-xs bg-yellow-600 p-1 rounded">
                    Direct: {connectionStatus.directError}
                </div>
            )}
        </div>
    );
}
