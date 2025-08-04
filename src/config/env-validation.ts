import { z } from 'zod';

/**
 * Environment validation schema for Jokerman79 Backend (Strapi)
 * Provides type-safe environment variable validation with security checks
 */

// Custom validation functions for security
const isSecureSecret = (value: string): boolean => {
  // Minimum 16 characters, should contain alphanumeric and special chars
  if (value.length < 16) return false;
  if (value === 'tobemodified' || value === 'toBeModified1' || value === 'toBeModified2') return false;
  if (value.includes('change_me') || value.includes('your_secret')) return false;

  // Check for base64-like pattern (common for Strapi secrets)
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  if (base64Pattern.test(value) && value.length >= 16) return true;

  // Check for complex password pattern
  const hasLetters = /[a-zA-Z]/.test(value);
  const hasNumbers = /\d/.test(value);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

  return hasLetters && (hasNumbers || hasSpecial);
};

const isValidDatabaseClient = (value: string): boolean => {
  return ['postgres', 'mysql', 'sqlite'].includes(value);
};

// Database configuration schema
const DatabaseConfigSchema = z.object({
  DATABASE_CLIENT: z.string()
    .refine(isValidDatabaseClient, {
      message: "DATABASE_CLIENT must be one of: postgres, mysql, sqlite"
    }),
  DATABASE_HOST: z.string().min(1, "Database host is required"),
  DATABASE_PORT: z.coerce.number().int().min(1).max(65535),
  DATABASE_NAME: z.string().min(1, "Database name is required"),
  DATABASE_USERNAME: z.string().min(1, "Database username is required"),
  DATABASE_PASSWORD: z.string().optional(), // Can be empty for local dev
  DATABASE_SSL: z.coerce.boolean().default(false),
  DATABASE_SCHEMA: z.string().default("public"),
  DATABASE_URL: z.string().url().optional(), // For connection strings
  DATABASE_POOL_MIN: z.coerce.number().int().min(0).default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(10),
  DATABASE_CONNECTION_TIMEOUT: z.coerce.number().int().min(1000).default(60000),
});

// Security configuration schema  
const SecurityConfigSchema = z.object({
  APP_KEYS: z.string()
    .min(1, "APP_KEYS is required")
    .refine((value) => {
      const keys = value.split(',');
      return keys.length >= 1 && keys.every(key => key.trim().length >= 16);
    }, {
      message: "APP_KEYS must contain at least one key with minimum 16 characters each"
    }),
  API_TOKEN_SALT: z.string()
    .min(16, "API_TOKEN_SALT must be at least 16 characters")
    .refine(isSecureSecret, {
      message: "API_TOKEN_SALT must be a secure secret (not default value)"
    }),
  ADMIN_JWT_SECRET: z.string()
    .min(16, "ADMIN_JWT_SECRET must be at least 16 characters")
    .refine(isSecureSecret, {
      message: "ADMIN_JWT_SECRET must be a secure secret (not default value)"
    }),
  TRANSFER_TOKEN_SALT: z.string()
    .min(16, "TRANSFER_TOKEN_SALT must be at least 16 characters")
    .refine(isSecureSecret, {
      message: "TRANSFER_TOKEN_SALT must be a secure secret (not default value)"
    }),
  JWT_SECRET: z.string()
    .min(16, "JWT_SECRET must be at least 16 characters")
    .refine(isSecureSecret, {
      message: "JWT_SECRET must be a secure secret (not default value)"
    }),
  ENCRYPTION_KEY: z.string()
    .min(16, "ENCRYPTION_KEY must be at least 16 characters")
    .refine(isSecureSecret, {
      message: "ENCRYPTION_KEY must be a secure secret (not default value)"
    }),
});

// Server configuration schema
const ServerConfigSchema = z.object({
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1024).max(65535).default(1337),
  NODE_ENV: z.enum(["development", "production", "test", "staging"]).default("development"),
});

// Gaming provider configuration schema
const GamingProviderConfigSchema = z.object({
  // Evolution Gaming API credentials (server-side only)
  EVOLUTION_GAMING_USERNAME: z.string().optional(),
  EVOLUTION_GAMING_PASSWORD: z.string().optional(),
  EVOLUTION_GAMING_BASE_URL: z.string().url().optional(),
  EVOLUTION_GAMING_WS_URL: z.string().optional(),

  // Pragmatic Play credentials (if any)
  PRAGMATIC_PLAY_API_KEY: z.string().optional(),
  PRAGMATIC_PLAY_BASE_URL: z.string().url().optional(),

  // Generic gaming provider settings
  GAMING_PROVIDERS_ENABLED: z.string().default("evolution,pragmatic"),
}).refine((data) => {
  // If Evolution Gaming is enabled, require credentials in production
  const enabledProviders = data.GAMING_PROVIDERS_ENABLED.split(',');
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && enabledProviders.includes('evolution')) {
    return data.EVOLUTION_GAMING_USERNAME && data.EVOLUTION_GAMING_PASSWORD;
  }

  return true;
}, {
  message: "Evolution Gaming credentials are required in production when provider is enabled"
});

// CORS and network configuration schema
const NetworkConfigSchema = z.object({
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001"),
  CORS_ENABLED: z.coerce.boolean().default(true),
});

// Live stats and WebSocket configuration schema
const LiveStatsConfigSchema = z.object({
  ENABLE_WEBSOCKET_CAPTURE: z.coerce.boolean().default(true),
  LIVE_STATS_WS_URL: z.string().optional(),
  WEBSOCKET_HEARTBEAT_INTERVAL: z.coerce.number().int().min(1000).default(30000),
  WEBSOCKET_RECONNECT_DELAY: z.coerce.number().int().min(1000).default(5000),
  WEBSOCKET_MAX_RECONNECT_ATTEMPTS: z.coerce.number().int().min(1).default(5),
});

// Data retention configuration schema
const DataRetentionConfigSchema = z.object({
  DEFAULT_RETENTION_PERIOD: z.string().default("7days"),
  CLEANUP_INTERVAL_HOURS: z.coerce.number().int().min(1).default(1),
  MAX_CLEANUP_BATCH_SIZE: z.coerce.number().int().min(100).default(1000),
  ENABLE_AUTO_CLEANUP: z.coerce.boolean().default(true),
});

// Upload and media configuration schema
const MediaConfigSchema = z.object({
  UPLOAD_PROVIDER: z.enum(["local", "aws-s3", "cloudinary"]).default("local"),
  UPLOAD_MAX_FILE_SIZE: z.coerce.number().int().min(1024).default(200 * 1024 * 1024), // 200MB
  UPLOAD_ALLOWED_FORMATS: z.string().default("image/*,video/*,audio/*,application/pdf"),

  // AWS S3 configuration (if using S3)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_BUCKET: z.string().optional(),

  // Cloudinary configuration (if using Cloudinary)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

// Complete environment schema
export const BackendEnvSchema = z.object({
  ...DatabaseConfigSchema.shape,
  ...SecurityConfigSchema.shape,
  ...ServerConfigSchema.shape,
  ...GamingProviderConfigSchema.shape,
  ...NetworkConfigSchema.shape,
  ...LiveStatsConfigSchema.shape,
  ...DataRetentionConfigSchema.shape,
  ...MediaConfigSchema.shape,
}).refine((data) => {
  // Custom validation: Ensure database pool max > min
  return data.DATABASE_POOL_MAX > data.DATABASE_POOL_MIN;
}, {
  message: "DATABASE_POOL_MAX must be greater than DATABASE_POOL_MIN"
}).refine((data) => {
  // In production, ensure all secrets are properly configured
  if (data.NODE_ENV === 'production') {
    const prodSecrets = [
      data.APP_KEYS,
      data.API_TOKEN_SALT,
      data.ADMIN_JWT_SECRET,
      data.TRANSFER_TOKEN_SALT,
      data.JWT_SECRET,
      data.ENCRYPTION_KEY
    ];

    return prodSecrets.every(secret =>
      secret &&
      secret.length >= 32 &&
      !secret.includes('tobemodified') &&
      !secret.includes('change_me')
    );
  }

  return true;
}, {
  message: "All security secrets must be properly configured in production (minimum 32 characters, no default values)"
});

// Infer TypeScript type from schema
export type BackendEnvConfig = z.infer<typeof BackendEnvSchema>;

// Environment validation modes
export type ValidationMode = 'strict' | 'development' | 'production';

/**
 * Validates environment variables based on the current NODE_ENV
 */
export function validateEnvironment(mode: ValidationMode = 'strict'): BackendEnvConfig {
  const env = process.env;

  try {
    // Parse and validate the environment
    const validatedEnv = BackendEnvSchema.parse(env);

    // Additional mode-specific validations
    if (mode === 'production' && validatedEnv.NODE_ENV === 'production') {
      // Ensure critical production settings
      if (!validatedEnv.DATABASE_SSL && validatedEnv.DATABASE_CLIENT === 'postgres') {
        console.warn('⚠️  WARNING: SSL is disabled for PostgreSQL in production');
      }

      if (validatedEnv.FRONTEND_URL.includes('localhost')) {
        throw new Error('FRONTEND_URL cannot use localhost in production');
      }
    }

    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');

      throw new Error(
        `❌ Environment validation failed:\n${errorMessages}\n\n` +
        `Please check your .env file and ensure all required variables are properly configured.`
      );
    }

    throw error;
  }
}

/**
 * Get environment configuration with validation
 */
export function getValidatedEnv(): BackendEnvConfig {
  const mode: ValidationMode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  return validateEnvironment(mode);
}

/**
 * Check if environment is properly configured for specific features
 */
export const envChecks = {
  isDatabaseConfigured: (env: BackendEnvConfig): boolean => {
    return !!(env.DATABASE_HOST && env.DATABASE_NAME && env.DATABASE_USERNAME);
  },

  isEvolutionGamingConfigured: (env: BackendEnvConfig): boolean => {
    return !!(env.EVOLUTION_GAMING_USERNAME && env.EVOLUTION_GAMING_PASSWORD);
  },

  isPragmaticPlayConfigured: (env: BackendEnvConfig): boolean => {
    return !!(env.PRAGMATIC_PLAY_API_KEY);
  },

  isWebSocketConfigured: (env: BackendEnvConfig): boolean => {
    return env.ENABLE_WEBSOCKET_CAPTURE && !!env.LIVE_STATS_WS_URL;
  },

  isUploadConfigured: (env: BackendEnvConfig): boolean => {
    if (env.UPLOAD_PROVIDER === 'local') return true;
    if (env.UPLOAD_PROVIDER === 'aws-s3') {
      return !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_BUCKET);
    }
    if (env.UPLOAD_PROVIDER === 'cloudinary') {
      return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
    }
    return false;
  }
};

export default {
  BackendEnvSchema,
  validateEnvironment,
  getValidatedEnv,
  envChecks
};