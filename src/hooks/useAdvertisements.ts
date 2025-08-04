"use client"

import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { getStrapiBaseUrl } from '@/lib/config';
import localAdvertisements from '@/data/advertisements.json';

// Hook per utilizzare i dati locali delle pubblicità
export const useLocalAdvertisements = (limit?: number, position?: string) => {
    const [advertisements, setAdvertisements] = React.useState<Advertisement[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        try {
            setLoading(true);
            console.log('🔄 Loading local advertisements with params:', { limit, position });
            
            let filteredAds = localAdvertisements.advertisements.filter(ad => ad.isActive);
            console.log('📊 Initial active ads:', filteredAds.length);
            
            // Filtra per posizione se specificata
            if (position) {
                filteredAds = filteredAds.filter(ad => ad.position === position);
                console.log(`📊 Ads for position "${position}":`, filteredAds.length);
            }
            
            // Ordina per priorità
            filteredAds.sort((a, b) => a.priority - b.priority);
            
            // Limita il numero se specificato
            if (limit) {
                filteredAds = filteredAds.slice(0, limit);
                console.log(`� Limited ads to ${limit}:`, filteredAds.length);
            }
            
            console.log('📄 Final filtered advertisements:', filteredAds);
            
            setAdvertisements(filteredAds);
            setError(null);
        } catch (err) {
            console.error('❌ Error loading local advertisements:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setAdvertisements([]);
        } finally {
            setLoading(false);
        }
    }, [limit, position]);

    return { advertisements, loading, error };
};

// Hook semplificato per il tracking delle pubblicità locali
export const useLocalAdvertisementTracking = () => {
    const handleClick = React.useCallback((id: string, url: string) => {
        console.log('🔗 Local ad clicked:', { id, url });
        
        // Apri il link in una nuova finestra
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }, []);

    const handleImpression = React.useCallback((id: string) => {
        console.log('👁️ Local ad impression:', { id });
        // Per dati locali, logghiamo solo l'impression
    }, []);

    return { handleClick, handleImpression };
};

// Helper function to build complete image URL
const buildImageUrl = (path?: string): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path; // URL già completo
    }
    const baseUrl = getStrapiBaseUrl();
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Hook di test per verificare la connettività a Strapi
export const useStrapiConnectivity = () => {
    const [status, setStatus] = React.useState<'checking' | 'connected' | 'failed'>('checking');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const checkConnectivity = async () => {
            try {
                const baseUrl = getStrapiBaseUrl();
                console.log('🔍 Testing connectivity to:', baseUrl);

                // Usa l'endpoint GraphQL che sappiamo funzionare
                const response = await fetch(`${baseUrl}/graphql`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        query: '{ __schema { queryType { name } } }'
                    }),
                    signal: AbortSignal.timeout(5000)
                });

                console.log('🔗 Connectivity test response:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.data && data.data.__schema) {
                        setStatus('connected');
                        console.log('✅ Strapi GraphQL server is reachable and responding');
                    } else {
                        setStatus('failed');
                        setError('GraphQL endpoint non configurato correttamente');
                    }
                } else {
                    setStatus('failed');
                    setError(`Server error: ${response.status} ${response.statusText}`);
                }
            } catch (err: any) {
                console.group('❌ Connectivity test failed');
                console.error('Error details:', err);
                console.error('Error type:', err.constructor?.name);
                console.error('Error message:', err.message);
                console.groupEnd();

                setStatus('failed');

                // Messaggio più descrittivo basato sul tipo di errore
                if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
                    setError('Server Strapi GraphQL non raggiungibile. Verificare che Strapi sia avviato correttamente');
                } else if (err.name === 'AbortError') {
                    setError('Timeout di connessione - server troppo lento o non disponibile');
                } else {
                    setError(err.message || 'Errore di connessione sconosciuto');
                }
            }
        };

        checkConnectivity();
    }, []);

    return { status, error };
};

// Test query semplificata per debug
const GET_TEST_ADVERTISEMENTS = gql`
  query TestAdvertisements {
    advertisements(pagination: { limit: 1 }) {
      documentId
      title
    }
  }
`;

// Hook di test semplificato per debug
export const useTestAdvertisements = () => {
    const { data, loading, error } = useQuery(GET_TEST_ADVERTISEMENTS, {
        errorPolicy: 'all',
        fetchPolicy: 'no-cache',
    });

    React.useEffect(() => {
        if (error) {
            console.group('🧪 Test Query Error');
            console.error('Test error:', error);
            console.error('Test error message:', error.message);
            console.error('Test GraphQL errors:', error.graphQLErrors);
            console.error('Test network error:', error.networkError);
            console.groupEnd();
        }
        if (data) {
            console.log('🧪 Test Query Success:', data);
        }
    }, [data, error]);

    return { data, loading, error };
};

// GraphQL Queries
const GET_CAROUSEL_ADVERTISEMENTS = gql`
  query GetCarouselAdvertisements($limit: Int = 5) {
    advertisements(pagination: { limit: $limit }, filters: { isActive: { eq: true }, position: { eq: "sidebar" } }) {
      documentId
      title
      description
      shortDescription
      url
      buttonText
      brandColor
      position
      type
      priority
      isActive
      image {
        url
        alternativeText
        width
        height
        formats
      }
      thumbnailImage {
        url
        alternativeText
        width
        height
        formats
      }
    }
  }
`;

const GET_ADVERTISEMENTS_BY_POSITION = gql`
  query GetAdvertisementsByPosition($position: String!, $limit: Int = 10) {
    advertisements(
      pagination: { limit: $limit }, 
      filters: { 
        isActive: { eq: true }, 
        position: { eq: $position } 
      }
    ) {
      documentId
      title
      description
      shortDescription
      url
      buttonText
      brandColor
      position
      type
      priority
      isActive
      image {
        url
        alternativeText
        width
        height
        formats
      }
      thumbnailImage {
        url
        alternativeText
        width
        height
        formats
      }
    }
  }
`;

// GraphQL Mutations
const UPDATE_ADVERTISEMENT_CLICK = gql`
  mutation UpdateAdvertisementClick($documentId: ID!, $clickCount: Int!) {
    updateAdvertisement(documentId: $documentId, data: { clickCount: $clickCount }) {
      documentId
      clickCount
    }
  }
`;

const UPDATE_ADVERTISEMENT_IMPRESSION = gql`
  mutation UpdateAdvertisementImpression($documentId: ID!, $impressionCount: Int!) {
    updateAdvertisement(documentId: $documentId, data: { impressionCount: $impressionCount }) {
      documentId
      impressionCount
    }
  }
`;

// Types
export interface Advertisement {
    id: string; // Manterremo id come alias per documentId per compatibilità
    title: string;
    description?: string;
    shortDescription?: string;
    url?: string;
    buttonText?: string;
    brandColor?: string;
    position: string;
    type: string;
    priority?: number;
    isActive: boolean;
    image?: {
        url: string;
        alternativeText?: string;
        width?: number;
        height?: number;
        formats?: any;
    };
    thumbnailImage?: {
        url: string;
        alternativeText?: string;
        width?: number;
        height?: number;
        formats?: any;
    };
    clickCount?: number;
    impressionCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

// Transform function to convert Strapi v5 response to our interface
const transformAdvertisement = (item: any): Advertisement => {
    const transformedAd = {
        id: item.documentId, // Mappiamo documentId a id per compatibilità
        title: item.title,
        description: item.description,
        shortDescription: item.shortDescription,
        url: item.url,
        buttonText: item.buttonText,
        brandColor: item.brandColor,
        position: item.position,
        type: item.type,
        priority: item.priority,
        isActive: item.isActive,
        image: item.image ? {
            url: buildImageUrl(item.image.url),
            alternativeText: item.image.alternativeText,
            width: item.image.width,
            height: item.image.height,
            formats: item.image.formats,
        } : undefined,
        thumbnailImage: item.thumbnailImage ? {
            url: buildImageUrl(item.thumbnailImage.url),
            alternativeText: item.thumbnailImage.alternativeText,
            width: item.thumbnailImage.width,
            height: item.thumbnailImage.height,
            formats: item.thumbnailImage.formats,
        } : undefined,
        clickCount: item.clickCount,
        impressionCount: item.impressionCount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    };

    // Debug log per verificare gli URL delle immagini
    if (process.env.NODE_ENV === 'development') {
        console.log('Transformed advertisement:', {
            id: transformedAd.id,
            title: transformedAd.title,
            imageUrl: transformedAd.image?.url,
            thumbnailUrl: transformedAd.thumbnailImage?.url,
            originalImagePath: item.image?.url,
            originalThumbnailPath: item.thumbnailImage?.url,
        });
    }

    return transformedAd;
};

// Hook for carousel advertisements
export const useCarouselAdvertisements = (limit: number = 5) => {
    const { data, loading, error } = useQuery(GET_CAROUSEL_ADVERTISEMENTS, {
        variables: { limit },
        errorPolicy: 'all',
        fetchPolicy: 'cache-first', // Prima controlla la cache, poi fa richiesta solo se necessario
        notifyOnNetworkStatusChange: false, // Evita re-render inutili
        skip: limit <= 0, // Skip se limit non valido
        context: {
            timeout: 10000, // Timeout di 10 secondi
        },
    });

    // Log dettagliato degli errori per debugging
    React.useEffect(() => {
        if (error) {
            console.group('🚨 GraphQL Error Details');
            console.error('Error object:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('GraphQL errors:', error.graphQLErrors);
            console.error('Network error:', error.networkError);
            console.error('Extra info:', error.extraInfo);
            console.groupEnd();
        }
    }, [error]);

    const advertisements = data?.advertisements?.map(transformAdvertisement) || [];

    return {
        advertisements,
        loading,
        error,
    };
};

// Hook for advertisements by position
export const useAdvertisementsByPosition = (position: string, limit: number = 10) => {
    const { data, loading, error } = useQuery(GET_ADVERTISEMENTS_BY_POSITION, {
        variables: { position, limit },
        errorPolicy: 'all',
        fetchPolicy: 'cache-first', // Prima controlla la cache, poi fa richiesta solo se necessario
        notifyOnNetworkStatusChange: false, // Evita re-render inutili
    });

    const advertisements = data?.advertisements?.map(transformAdvertisement) || [];

    return {
        advertisements,
        loading,
        error,
    };
};

// Hook for tracking advertisement clicks
export const useAdvertisementTracking = () => {
    const [updateClick] = useMutation(UPDATE_ADVERTISEMENT_CLICK);
    const [updateImpression] = useMutation(UPDATE_ADVERTISEMENT_IMPRESSION);

    const trackClick = async (id: string, currentClickCount: number = 0) => {
        try {
            await updateClick({
                variables: {
                    documentId: id, // Usiamo l'id che è mappato da documentId
                    clickCount: currentClickCount + 1,
                },
            });
        } catch (error) {
            console.error('Error tracking click:', error);
        }
    };

    const trackImpression = async (id: string, currentImpressionCount: number = 0) => {
        try {
            await updateImpression({
                variables: {
                    documentId: id, // Usiamo l'id che è mappato da documentId
                    impressionCount: currentImpressionCount + 1,
                },
            });
        } catch (error) {
            console.error('Error tracking impression:', error);
        }
    };

    // Funzioni con i nomi che il componente AdsCard si aspetta
    const handleClick = (id: string, url?: string) => {
        trackClick(id);
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleImpression = (id: string) => {
        trackImpression(id);
    };

    return {
        trackClick,
        trackImpression,
        handleClick,
        handleImpression,
    };
};
