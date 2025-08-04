import { z } from 'zod';

/**
 * Environment validation schema for Jokerman79 Frontend (Next.js)
 * Provides type-safe environment variable validation for client and server
 */

// Custom validation functions
const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isWebSocketUrl = (value: string): boolean => {
  return value.startsWith('ws://') || value.startsWith('wss://');
};

const isSecureSecret = (value: string): boolean => {
  // Basic security check for secrets
  if (value.length < 16) return false;
  if (value.includes('your_secret') || value.includes('change_me')) return false;
  if (value === 'your_nextauth_secret_here') return false;
  
  return true;
};

// Public environment variables (exposed to client)
const PublicEnvSchema = z.object({
  NEXT_PUBLIC_STRAPI_URL: z.string()
    .url("NEXT_PUBLIC_STRAPI_URL must be a valid URL")
    .refine((url) => {
      // In production, should use HTTPS
      if (process.env.NODE_ENV === 'production') {
        return url.startsWith('https://');
      }
      return true;
    }, {
      message: "NEXT_PUBLIC_STRAPI_URL must use HTTPS in production"
    }),
  
  NEXT_PUBLIC_STRAPI_API_URL: z.string()
    .url("NEXT_PUBLIC_STRAPI_API_URL must be a valid URL")
    .optional()
    .transform((val, ctx) => {
      // Auto-generate from STRAPI_URL if not provided
      if (!val) {
        const strapiUrl = ctx.parent?.NEXT_PUBLIC_STRAPI_URL;
        return strapiUrl ? `${strapiUrl}/api` : undefined;
      }
      return val;
    }),
  
  NEXT_PUBLIC_STRAPI_GRAPHQL_URL: z.string()
    .url("NEXT_PUBLIC_STRAPI_GRAPHQL_URL must be a valid URL")
    .optional()
    .transform((val, ctx) => {
      // Auto-generate from STRAPI_URL if not provided
      if (!val) {
        const strapiUrl = ctx.parent?.NEXT_PUBLIC_STRAPI_URL;
        return strapiUrl ? `${strapiUrl}/graphql` : undefined;
      }
      return val;
    }),
  
  NEXT_PUBLIC_SITE_URL: z.string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .refine((url) => {
      // In production, should use HTTPS and not localhost
      if (process.env.NODE_ENV === 'production') {
        return url.startsWith('https://') && !url.includes('localhost');
      }
      return true;
    }, {
      message: "NEXT_PUBLIC_SITE_URL must use HTTPS and not localhost in production"
    }),
  
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Jokerman79"),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().min(1).default("Slot Demo Gratuite e Statistiche Live"),
  
  // Development server configuration
  NEXT_PUBLIC_DEV_SERVER_IP: z.string()
    .ip("NEXT_PUBLIC_DEV_SERVER_IP must be a valid IP address")
    .optional(),
  
  // Live stats configuration (public)
  NEXT_PUBLIC_LIVE_STATS_WS_URL: z.string()
    .optional()
    .refine((val) => !val || isWebSocketUrl(val), {
      message: "NEXT_PUBLIC_LIVE_STATS_WS_URL must be a valid WebSocket URL (ws:// or wss://)"
    }),
  
  // Analytics (if enabled)
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  
  // Gaming provider public configuration
  NEXT_PUBLIC_EVOLUTION_GAMING_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_PRAGMATIC_PLAY_BASE_URL: z.string().url().optional(),
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_PWA: z.coerce.boolean().default(true),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_LIVE_STATS: z.coerce.boolean().default(true),
  NEXT_PUBLIC_ENABLE_WEBSOCKETS: z.coerce.boolean().default(true),
  NEXT_PUBLIC_ENABLE_DEMO_MODE: z.coerce.boolean().default(true),
});

// Server-side only environment variables (NOT exposed to client)
const ServerEnvSchema = z.object({
  // Next.js configuration
  NEXTAUTH_SECRET: z.string()
    .min(16, "NEXTAUTH_SECRET must be at least 16 characters")
    .refine(isSecureSecret, {
      message: "NEXTAUTH_SECRET must be a secure secret (not default value)"
    })
    .optional(), // Optional if not using NextAuth
  
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Database configuration (if using database in frontend)
  DATABASE_URL: z.string().url().optional(),
  
  // Strapi API token (server-side)
  STRAPI_API_TOKEN: z.string().min(16).optional(),
  
  // Gaming provider server-side configuration
  EVOLUTION_GAMING_USERNAME: z.string().optional(),
  EVOLUTION_GAMING_PASSWORD: z.string().optional(),
  EVOLUTION_GAMING_BASE_URL: z.string().url().optional(),
  EVOLUTION_GAMING_WS_URL: z.string().optional(),
  
  PRAGMATIC_PLAY_API_KEY: z.string().optional(),
  PRAGMATIC_PLAY_SECRET: z.string().optional(),
  
  // External API keys (server-side only)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Email configuration (if needed)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // Security configuration
  ENCRYPTION_KEY: z.string().min(32).optional(),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001"),
  
  // Live stats server configuration
  LIVE_STATS_API_URL: z.string().url().optional(),
  WEBSOCKET_SERVER_PORT: z.coerce.number().int().min(1024).max(65535).optional(),
  
  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(900000), // 15 minutes
});

// Complete environment schema combining public and server variables
export const FrontendEnvSchema = z.object({
  ...PublicEnvSchema.shape,
  ...ServerEnvSchema.shape,
  
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
}).refine((data) => {
  // Custom validation: Ensure WebSocket URL matches site URL protocol in production
  if (data.NODE_ENV === 'production' && data.NEXT_PUBLIC_LIVE_STATS_WS_URL) {
    const siteUsesHttps = data.NEXT_PUBLIC_SITE_URL.startsWith('https://');
    const wsUsesWss = data.NEXT_PUBLIC_LIVE_STATS_WS_URL.startsWith('wss://');
    
    if (siteUsesHttps && !wsUsesWss) {
      return false;
    }
  }
  
  return true;
}, {
  message: "WebSocket URL must use wss:// when site uses HTTPS in production"
}).refine((data) => {
  // Ensure gaming provider credentials are complete if partially configured
  const hasEvolutionUsername = !!data.EVOLUTION_GAMING_USERNAME;
  const hasEvolutionPassword = !!data.EVOLUTION_GAMING_PASSWORD;
  
  if (hasEvolutionUsername || hasEvolutionPassword) {
    return hasEvolutionUsername && hasEvolutionPassword;
  }
  
  return true;
}, {
  message: "Both EVOLUTION_GAMING_USERNAME and EVOLUTION_GAMING_PASSWORD are required if either is provided"
});

// Infer TypeScript types from schemas
export type FrontendEnvConfig = z.infer<typeof FrontendEnvSchema>;
export type PublicEnvConfig = z.infer<typeof PublicEnvSchema>;
export type ServerEnvConfig = z.infer<typeof ServerEnvSchema>;

// Environment validation modes
export type ValidationMode = 'client' | 'server' | 'build';

/**
 * Validates environment variables based on the context (client/server/build)
 */
export function validateEnvironment(mode: ValidationMode = 'server'): FrontendEnvConfig {
  const env = process.env;
  
  try {
    let validatedEnv: FrontendEnvConfig;
    
    if (mode === 'client') {
      // Client-side validation: only validate public variables
      const publicEnv = Object.keys(env)
        .filter(key => key.startsWith('NEXT_PUBLIC_'))
        .reduce((acc, key) => {
          acc[key] = env[key];
          return acc;
        }, {} as Record<string, string | undefined>);
      
      validatedEnv = FrontendEnvSchema.parse({ ...publicEnv, NODE_ENV: env.NODE_ENV });
    } else {
      // Server-side validation: validate all variables
      validatedEnv = FrontendEnvSchema.parse(env);
    }
    
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      throw new Error(
        `❌ Frontend environment validation failed (${mode} mode):\n${errorMessages}\n\n` +
        `Please check your .env.local file and ensure all required variables are properly configured.`
      );
    }
    
    throw error;
  }
}

/**
 * Get public environment variables (safe for client-side use)
 */
export function getPublicEnv(): PublicEnvConfig {
  const env = process.env;
  
  const publicEnv = Object.keys(env)
    .filter(key => key.startsWith('NEXT_PUBLIC_'))
    .reduce((acc, key) => {
      acc[key] = env[key];
      return acc;
    }, {} as Record<string, string | undefined>);
  
  return PublicEnvSchema.parse(publicEnv);
}

/**
 * Check if environment is properly configured for specific features
 */
export const envChecks = {
  isStrapiConfigured: (env: FrontendEnvConfig): boolean => {
    return !!(env.NEXT_PUBLIC_STRAPI_URL && env.NEXT_PUBLIC_STRAPI_API_URL);
  },
  
  isGraphQLConfigured: (env: FrontendEnvConfig): boolean => {
    return !!env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL;
  },
  
  isLiveStatsConfigured: (env: FrontendEnvConfig): boolean => {
    return env.NEXT_PUBLIC_ENABLE_LIVE_STATS && !!env.NEXT_PUBLIC_LIVE_STATS_WS_URL;
  },
  
  isAnalyticsConfigured: (env: FrontendEnvConfig): boolean => {
    return env.NEXT_PUBLIC_ENABLE_ANALYTICS && !!(env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || env.NEXT_PUBLIC_GTM_ID);
  },
  
  isEvolutionGamingConfigured: (env: FrontendEnvConfig): boolean => {
    return !!(env.EVOLUTION_GAMING_USERNAME && env.EVOLUTION_GAMING_PASSWORD);
  },
  
  isPragmaticPlayConfigured: (env: FrontendEnvConfig): boolean => {
    return !!env.PRAGMATIC_PLAY_API_KEY;
  },
  
  isPWAConfigured: (env: FrontendEnvConfig): boolean => {
    return env.NEXT_PUBLIC_ENABLE_PWA;
  },
  
  isProductionReady: (env: FrontendEnvConfig): boolean => {
    if (env.NODE_ENV !== 'production') return true;
    
    const checks = [
      env.NEXT_PUBLIC_SITE_URL.startsWith('https://'),
      env.NEXT_PUBLIC_STRAPI_URL.startsWith('https://'),
      !env.NEXT_PUBLIC_SITE_URL.includes('localhost'),
      !env.NEXT_PUBLIC_STRAPI_URL.includes('localhost')
    ];
    
    return checks.every(check => check);
  }
};

/**
 * Security check: Validate that sensitive data is not exposed to client
 */
export function validateClientSecurity(): { isSecure: boolean; issues: string[] } {
  const issues: string[] = [];
  const env = process.env;
  
  // Check for server-only variables in client bundle
  const sensitiveKeys = [
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'STRAPI_API_TOKEN',
    'EVOLUTION_GAMING_PASSWORD',
    'PRAGMATIC_PLAY_SECRET',
    'CLOUDINARY_API_SECRET',
    'SMTP_PASSWORD',
    'ENCRYPTION_KEY'
  ];
  
  sensitiveKeys.forEach(key => {
    if (env[key] && typeof window !== 'undefined') {
      issues.push(`Sensitive variable ${key} may be exposed to client`);
    }
  });
  
  // Check for NEXT_PUBLIC_ variables that shouldn't be public
  const publicKeys = Object.keys(env).filter(key => key.startsWith('NEXT_PUBLIC_'));
  const riskyPublicKeys = publicKeys.filter(key => 
    key.toLowerCase().includes('secret') ||
    key.toLowerCase().includes('password') ||
    key.toLowerCase().includes('private')
  );
  
  riskyPublicKeys.forEach(key => {
    issues.push(`Public variable ${key} contains sensitive keyword`);
  });
  
  return {
    isSecure: issues.length === 0,
    issues
  };
}

/**
 * Development helper: Generate URL configurations based on detected network
 */
export function generateDevelopmentUrls(serverIP?: string): {
  strapiUrl: string;
  siteUrl: string;
  websocketUrl: string;
} {
  const ip = serverIP || 'localhost';
  const isMobile = typeof window !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const baseIP = isMobile && ip !== 'localhost' ? ip : 'localhost';
  
  return {
    strapiUrl: `http://${baseIP}:1337`,
    siteUrl: `http://${baseIP}:3001`,
    websocketUrl: `ws://${baseIP}:3001`
  };
}

export default {
  FrontendEnvSchema,
  PublicEnvSchema,
  ServerEnvSchema,
  validateEnvironment,
  getPublicEnv,
  envChecks,
  validateClientSecurity,
  generateDevelopmentUrls
};