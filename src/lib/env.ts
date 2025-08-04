import { 
  validateEnvironment, 
  getPublicEnv, 
  validateClientSecurity,
  type FrontendEnvConfig, 
  type PublicEnvConfig,
  envChecks 
} from './env-validation';

/**
 * Validated environment configuration for Jokerman79 Frontend
 * Provides type-safe access to environment variables with client/server separation
 */

let validatedEnv: FrontendEnvConfig | null = null;
let publicEnv: PublicEnvConfig | null = null;

/**
 * Initialize and validate environment variables for server-side use
 * Should be called during application startup (server-side only)
 */
export function initializeServerEnvironment(): FrontendEnvConfig {
  if (typeof window !== 'undefined') {
    throw new Error('initializeServerEnvironment should only be called on the server side');
  }

  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    console.log('🔧 Validating frontend environment configuration...');
    
    validatedEnv = validateEnvironment('server');
    
    // Validate client security
    const securityCheck = validateClientSecurity();
    if (!securityCheck.isSecure) {
      console.warn('⚠️  Security issues detected:');
      securityCheck.issues.forEach(issue => console.warn(`   - ${issue}`));
    }
    
    // Log configuration status
    logEnvironmentStatus(validatedEnv);
    
    console.log('✅ Frontend environment validation completed successfully');
    
    return validatedEnv;
  } catch (error) {
    console.error('❌ Frontend environment validation failed:', error.message);
    
    // In development, provide helpful guidance
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔧 Development Setup Help:');
      console.log('1. Copy .env.example to .env.local');
      console.log('2. Update NEXT_PUBLIC_STRAPI_URL to match your backend');
      console.log('3. Configure NEXT_PUBLIC_SITE_URL for your frontend');
      console.log('4. Set NEXT_PUBLIC_DEV_SERVER_IP for mobile testing');
    }
    
    process.exit(1);
  }
}

/**
 * Initialize and validate public environment variables for client-side use
 * Safe to call on both client and server
 */
export function initializeClientEnvironment(): PublicEnvConfig {
  if (publicEnv) {
    return publicEnv;
  }

  try {
    publicEnv = getPublicEnv();
    
    // Client-side logging (only in development)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🔧 Client Environment Configuration:', {
        strapiUrl: publicEnv.NEXT_PUBLIC_STRAPI_URL,
        siteUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
        appName: publicEnv.NEXT_PUBLIC_APP_NAME,
        liveStatsEnabled: publicEnv.NEXT_PUBLIC_ENABLE_LIVE_STATS,
        pwaEnabled: publicEnv.NEXT_PUBLIC_ENABLE_PWA,
      });
    }
    
    return publicEnv;
  } catch (error) {
    console.error('❌ Client environment validation failed:', error.message);
    throw error;
  }
}

/**
 * Get the validated server environment configuration
 * Throws an error if environment hasn't been initialized
 */
export function getServerEnv(): FrontendEnvConfig {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv should only be called on the server side');
  }

  if (!validatedEnv) {
    throw new Error('Server environment not initialized. Call initializeServerEnvironment() first.');
  }
  
  return validatedEnv;
}

/**
 * Get the validated client environment configuration
 * Safe to call on both client and server
 */
export function getClientEnv(): PublicEnvConfig {
  if (!publicEnv) {
    return initializeClientEnvironment();
  }
  
  return publicEnv;
}

/**
 * Type-safe environment variable access for server-side code
 */
export const serverEnv = {
  // Server configuration
  get NODE_ENV() { return getServerEnv().NODE_ENV; },
  get NEXTAUTH_SECRET() { return getServerEnv().NEXTAUTH_SECRET; },
  get NEXTAUTH_URL() { return getServerEnv().NEXTAUTH_URL; },
  
  // Database configuration
  get DATABASE_URL() { return getServerEnv().DATABASE_URL; },
  
  // Strapi configuration (server-side)
  get STRAPI_API_TOKEN() { return getServerEnv().STRAPI_API_TOKEN; },
  
  // Gaming providers (server-side)
  get EVOLUTION_GAMING_USERNAME() { return getServerEnv().EVOLUTION_GAMING_USERNAME; },
  get EVOLUTION_GAMING_PASSWORD() { return getServerEnv().EVOLUTION_GAMING_PASSWORD; },
  get EVOLUTION_GAMING_BASE_URL() { return getServerEnv().EVOLUTION_GAMING_BASE_URL; },
  get EVOLUTION_GAMING_WS_URL() { return getServerEnv().EVOLUTION_GAMING_WS_URL; },
  get PRAGMATIC_PLAY_API_KEY() { return getServerEnv().PRAGMATIC_PLAY_API_KEY; },
  get PRAGMATIC_PLAY_SECRET() { return getServerEnv().PRAGMATIC_PLAY_SECRET; },
  
  // External services
  get CLOUDINARY_CLOUD_NAME() { return getServerEnv().CLOUDINARY_CLOUD_NAME; },
  get CLOUDINARY_API_KEY() { return getServerEnv().CLOUDINARY_API_KEY; },
  get CLOUDINARY_API_SECRET() { return getServerEnv().CLOUDINARY_API_SECRET; },
  
  // Email configuration
  get SMTP_HOST() { return getServerEnv().SMTP_HOST; },
  get SMTP_PORT() { return getServerEnv().SMTP_PORT; },
  get SMTP_USER() { return getServerEnv().SMTP_USER; },
  get SMTP_PASSWORD() { return getServerEnv().SMTP_PASSWORD; },
  
  // Security
  get ENCRYPTION_KEY() { return getServerEnv().ENCRYPTION_KEY; },
  get ALLOWED_ORIGINS() { return getServerEnv().ALLOWED_ORIGINS; },
  
  // Live stats
  get LIVE_STATS_API_URL() { return getServerEnv().LIVE_STATS_API_URL; },
  get WEBSOCKET_SERVER_PORT() { return getServerEnv().WEBSOCKET_SERVER_PORT; },
  
  // Rate limiting
  get RATE_LIMIT_MAX() { return getServerEnv().RATE_LIMIT_MAX; },
  get RATE_LIMIT_WINDOW_MS() { return getServerEnv().RATE_LIMIT_WINDOW_MS; },
  
  // Feature checks (server-side)
  checks: {
    get isEvolutionGamingConfigured() { return envChecks.isEvolutionGamingConfigured(getServerEnv()); },
    get isPragmaticPlayConfigured() { return envChecks.isPragmaticPlayConfigured(getServerEnv()); },
    get isProductionReady() { return envChecks.isProductionReady(getServerEnv()); },
  }
};

/**
 * Type-safe environment variable access for client-side code
 * Only includes NEXT_PUBLIC_ variables
 */
export const clientEnv = {
  // Public configuration
  get STRAPI_URL() { return getClientEnv().NEXT_PUBLIC_STRAPI_URL; },
  get STRAPI_API_URL() { return getClientEnv().NEXT_PUBLIC_STRAPI_API_URL; },
  get STRAPI_GRAPHQL_URL() { return getClientEnv().NEXT_PUBLIC_STRAPI_GRAPHQL_URL; },
  get SITE_URL() { return getClientEnv().NEXT_PUBLIC_SITE_URL; },
  get APP_NAME() { return getClientEnv().NEXT_PUBLIC_APP_NAME; },
  get APP_DESCRIPTION() { return getClientEnv().NEXT_PUBLIC_APP_DESCRIPTION; },
  
  // Development configuration
  get DEV_SERVER_IP() { return getClientEnv().NEXT_PUBLIC_DEV_SERVER_IP; },
  
  // Live stats configuration
  get LIVE_STATS_WS_URL() { return getClientEnv().NEXT_PUBLIC_LIVE_STATS_WS_URL; },
  
  // Analytics
  get GOOGLE_ANALYTICS_ID() { return getClientEnv().NEXT_PUBLIC_GOOGLE_ANALYTICS_ID; },
  get GTM_ID() { return getClientEnv().NEXT_PUBLIC_GTM_ID; },
  
  // Gaming provider public URLs
  get EVOLUTION_GAMING_BASE_URL() { return getClientEnv().NEXT_PUBLIC_EVOLUTION_GAMING_BASE_URL; },
  get PRAGMATIC_PLAY_BASE_URL() { return getClientEnv().NEXT_PUBLIC_PRAGMATIC_PLAY_BASE_URL; },
  
  // Feature flags
  get ENABLE_PWA() { return getClientEnv().NEXT_PUBLIC_ENABLE_PWA; },
  get ENABLE_ANALYTICS() { return getClientEnv().NEXT_PUBLIC_ENABLE_ANALYTICS; },
  get ENABLE_LIVE_STATS() { return getClientEnv().NEXT_PUBLIC_ENABLE_LIVE_STATS; },
  get ENABLE_WEBSOCKETS() { return getClientEnv().NEXT_PUBLIC_ENABLE_WEBSOCKETS; },
  get ENABLE_DEMO_MODE() { return getClientEnv().NEXT_PUBLIC_ENABLE_DEMO_MODE; },
  
  // Feature checks (client-side)
  checks: {
    get isStrapiConfigured() { return envChecks.isStrapiConfigured(getClientEnv()); },
    get isGraphQLConfigured() { return envChecks.isGraphQLConfigured(getClientEnv()); },
    get isLiveStatsConfigured() { return envChecks.isLiveStatsConfigured(getClientEnv()); },
    get isAnalyticsConfigured() { return envChecks.isAnalyticsConfigured(getClientEnv()); },
    get isPWAConfigured() { return envChecks.isPWAConfigured(getClientEnv()); },
  }
};

/**
 * Log environment configuration status
 */
function logEnvironmentStatus(config: FrontendEnvConfig): void {
  const isDevelopment = config.NODE_ENV === 'development';
  
  console.log(`\n🚀 Jokerman79 Frontend Environment Status (${config.NODE_ENV})`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Site configuration
  console.log(`🌐 Site URL: ${config.NEXT_PUBLIC_SITE_URL}`);
  console.log(`🔌 Strapi URL: ${config.NEXT_PUBLIC_STRAPI_URL}`);
  
  // Feature configuration
  const featuresEnabled: string[] = [];
  if (config.NEXT_PUBLIC_ENABLE_PWA) featuresEnabled.push('PWA');
  if (config.NEXT_PUBLIC_ENABLE_LIVE_STATS) featuresEnabled.push('Live Stats');
  if (config.NEXT_PUBLIC_ENABLE_WEBSOCKETS) featuresEnabled.push('WebSockets');
  if (config.NEXT_PUBLIC_ENABLE_ANALYTICS) featuresEnabled.push('Analytics');
  if (config.NEXT_PUBLIC_ENABLE_DEMO_MODE) featuresEnabled.push('Demo Mode');
  
  console.log(`🎮 Features: ${featuresEnabled.join(', ') || 'None'}`);
  
  // Gaming providers status
  const strapiStatus = envChecks.isStrapiConfigured(config) ? '✅' : '❌';
  const graphqlStatus = envChecks.isGraphQLConfigured(config) ? '✅' : '❌';
  const liveStatsStatus = envChecks.isLiveStatsConfigured(config) ? '✅' : '❌';
  
  console.log(`${strapiStatus} Strapi API: ${envChecks.isStrapiConfigured(config) ? 'Connected' : 'Not configured'}`);
  console.log(`${graphqlStatus} GraphQL: ${envChecks.isGraphQLConfigured(config) ? 'Enabled' : 'Disabled'}`);
  console.log(`${liveStatsStatus} Live Stats: ${envChecks.isLiveStatsConfigured(config) ? 'Enabled' : 'Disabled'}`);
  
  // Development specific
  if (isDevelopment && config.NEXT_PUBLIC_DEV_SERVER_IP) {
    console.log(`📱 Mobile Dev IP: ${config.NEXT_PUBLIC_DEV_SERVER_IP}`);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Production readiness check
  if (config.NODE_ENV === 'production') {
    const isReady = envChecks.isProductionReady(config);
    if (!isReady) {
      console.log('🚨 Production Readiness Issues:');
      if (!config.NEXT_PUBLIC_SITE_URL.startsWith('https://')) {
        console.log('   - Site URL should use HTTPS');
      }
      if (!config.NEXT_PUBLIC_STRAPI_URL.startsWith('https://')) {
        console.log('   - Strapi URL should use HTTPS');
      }
      if (config.NEXT_PUBLIC_SITE_URL.includes('localhost')) {
        console.log('   - Site URL should not use localhost');
      }
      if (config.NEXT_PUBLIC_STRAPI_URL.includes('localhost')) {
        console.log('   - Strapi URL should not use localhost');
      }
      console.log('');
    }
  }
}

/**
 * Runtime environment validation for React components
 */
export function useEnvironmentValidation() {
  const env = getClientEnv();
  
  return {
    env,
    isConfigured: {
      strapi: envChecks.isStrapiConfigured(env),
      graphql: envChecks.isGraphQLConfigured(env),
      liveStats: envChecks.isLiveStatsConfigured(env),
      analytics: envChecks.isAnalyticsConfigured(env),
      pwa: envChecks.isPWAConfigured(env),
    },
    features: {
      pwa: env.NEXT_PUBLIC_ENABLE_PWA,
      liveStats: env.NEXT_PUBLIC_ENABLE_LIVE_STATS,
      websockets: env.NEXT_PUBLIC_ENABLE_WEBSOCKETS,
      analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
      demoMode: env.NEXT_PUBLIC_ENABLE_DEMO_MODE,
    }
  };
}

/**
 * Get CORS configuration for API routes
 */
export function getCorsConfig() {
  const config = getServerEnv();
  
  return {
    origins: config.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH']
  };
}

/**
 * Get rate limiting configuration
 */
export function getRateLimitConfig() {
  const config = getServerEnv();
  
  return {
    max: config.RATE_LIMIT_MAX,
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  };
}

/**
 * Development helper: Check if running on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Development helper: Get optimal URLs for current context
 */
export function getOptimalUrls() {
  const env = getClientEnv();
  const isMobile = isMobileDevice();
  const devIP = env.NEXT_PUBLIC_DEV_SERVER_IP;
  
  if (env.NODE_ENV === 'production') {
    return {
      strapiUrl: env.NEXT_PUBLIC_STRAPI_URL,
      siteUrl: env.NEXT_PUBLIC_SITE_URL,
      websocketUrl: env.NEXT_PUBLIC_LIVE_STATS_WS_URL,
    };
  }
  
  // Development mode optimizations
  const baseIP = isMobile && devIP ? devIP : 'localhost';
  
  return {
    strapiUrl: env.NEXT_PUBLIC_STRAPI_URL || `http://${baseIP}:1337`,
    siteUrl: env.NEXT_PUBLIC_SITE_URL || `http://${baseIP}:3001`,
    websocketUrl: env.NEXT_PUBLIC_LIVE_STATS_WS_URL || `ws://${baseIP}:3001`,
  };
}

export default {
  initializeServerEnvironment,
  initializeClientEnvironment,
  getServerEnv,
  getClientEnv,
  serverEnv,
  clientEnv,
  useEnvironmentValidation,
  getCorsConfig,
  getRateLimitConfig,
  isMobileDevice,
  getOptimalUrls
};