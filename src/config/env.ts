import { getValidatedEnv, type BackendEnvConfig, envChecks } from './env-validation';

/**
 * Validated environment configuration for Jokerman79 Backend
 * Provides type-safe access to environment variables
 */

let validatedEnv: BackendEnvConfig | null = null;

/**
 * Initialize and validate environment variables
 * Should be called during application startup
 */
export function initializeEnvironment(): BackendEnvConfig {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    console.log('🔧 Validating environment configuration...');
    
    validatedEnv = getValidatedEnv();
    
    // Log configuration status
    logEnvironmentStatus(validatedEnv);
    
    console.log('✅ Environment validation completed successfully');
    
    return validatedEnv;
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    
    // In development, provide helpful guidance
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔧 Development Setup Help:');
      console.log('1. Copy .env.example to .env');
      console.log('2. Update the configuration values');
      console.log('3. Ensure all secrets are properly generated');
      console.log('4. Check database connection settings');
      console.log('\nFor help generating secrets, run: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
    }
    
    process.exit(1);
  }
}

/**
 * Get the validated environment configuration
 * Throws an error if environment hasn't been initialized
 */
export function getEnv(): BackendEnvConfig {
  if (!validatedEnv) {
    throw new Error('Environment not initialized. Call initializeEnvironment() first.');
  }
  
  return validatedEnv;
}

/**
 * Type-safe environment variable access with fallbacks
 */
export const env = {
  // Server configuration
  get HOST() { return getEnv().HOST; },
  get PORT() { return getEnv().PORT; },
  get NODE_ENV() { return getEnv().NODE_ENV; },
  
  // Database configuration
  get DATABASE_CLIENT() { return getEnv().DATABASE_CLIENT; },
  get DATABASE_HOST() { return getEnv().DATABASE_HOST; },
  get DATABASE_PORT() { return getEnv().DATABASE_PORT; },
  get DATABASE_NAME() { return getEnv().DATABASE_NAME; },
  get DATABASE_USERNAME() { return getEnv().DATABASE_USERNAME; },
  get DATABASE_PASSWORD() { return getEnv().DATABASE_PASSWORD; },
  get DATABASE_SSL() { return getEnv().DATABASE_SSL; },
  get DATABASE_SCHEMA() { return getEnv().DATABASE_SCHEMA; },
  get DATABASE_URL() { return getEnv().DATABASE_URL; },
  
  // Security configuration
  get APP_KEYS() { return getEnv().APP_KEYS; },
  get API_TOKEN_SALT() { return getEnv().API_TOKEN_SALT; },
  get ADMIN_JWT_SECRET() { return getEnv().ADMIN_JWT_SECRET; },
  get TRANSFER_TOKEN_SALT() { return getEnv().TRANSFER_TOKEN_SALT; },
  get JWT_SECRET() { return getEnv().JWT_SECRET; },
  get ENCRYPTION_KEY() { return getEnv().ENCRYPTION_KEY; },
  
  // Gaming providers
  get EVOLUTION_GAMING_USERNAME() { return getEnv().EVOLUTION_GAMING_USERNAME; },
  get EVOLUTION_GAMING_PASSWORD() { return getEnv().EVOLUTION_GAMING_PASSWORD; },
  get EVOLUTION_GAMING_BASE_URL() { return getEnv().EVOLUTION_GAMING_BASE_URL; },
  get EVOLUTION_GAMING_WS_URL() { return getEnv().EVOLUTION_GAMING_WS_URL; },
  get PRAGMATIC_PLAY_API_KEY() { return getEnv().PRAGMATIC_PLAY_API_KEY; },
  get PRAGMATIC_PLAY_BASE_URL() { return getEnv().PRAGMATIC_PLAY_BASE_URL; },
  
  // Network configuration
  get FRONTEND_URL() { return getEnv().FRONTEND_URL; },
  get ALLOWED_ORIGINS() { return getEnv().ALLOWED_ORIGINS; },
  get CORS_ENABLED() { return getEnv().CORS_ENABLED; },
  
  // Live stats configuration
  get ENABLE_WEBSOCKET_CAPTURE() { return getEnv().ENABLE_WEBSOCKET_CAPTURE; },
  get LIVE_STATS_WS_URL() { return getEnv().LIVE_STATS_WS_URL; },
  get WEBSOCKET_HEARTBEAT_INTERVAL() { return getEnv().WEBSOCKET_HEARTBEAT_INTERVAL; },
  get WEBSOCKET_RECONNECT_DELAY() { return getEnv().WEBSOCKET_RECONNECT_DELAY; },
  get WEBSOCKET_MAX_RECONNECT_ATTEMPTS() { return getEnv().WEBSOCKET_MAX_RECONNECT_ATTEMPTS; },
  
  // Data retention
  get DEFAULT_RETENTION_PERIOD() { return getEnv().DEFAULT_RETENTION_PERIOD; },
  get CLEANUP_INTERVAL_HOURS() { return getEnv().CLEANUP_INTERVAL_HOURS; },
  get MAX_CLEANUP_BATCH_SIZE() { return getEnv().MAX_CLEANUP_BATCH_SIZE; },
  get ENABLE_AUTO_CLEANUP() { return getEnv().ENABLE_AUTO_CLEANUP; },
  
  // Upload configuration
  get UPLOAD_PROVIDER() { return getEnv().UPLOAD_PROVIDER; },
  get UPLOAD_MAX_FILE_SIZE() { return getEnv().UPLOAD_MAX_FILE_SIZE; },
  get UPLOAD_ALLOWED_FORMATS() { return getEnv().UPLOAD_ALLOWED_FORMATS; },
  
  // Feature checks
  checks: {
    get isDatabaseConfigured() { return envChecks.isDatabaseConfigured(getEnv()); },
    get isEvolutionGamingConfigured() { return envChecks.isEvolutionGamingConfigured(getEnv()); },
    get isPragmaticPlayConfigured() { return envChecks.isPragmaticPlayConfigured(getEnv()); },
    get isWebSocketConfigured() { return envChecks.isWebSocketConfigured(getEnv()); },
    get isUploadConfigured() { return envChecks.isUploadConfigured(getEnv()); },
  }
};

/**
 * Log environment configuration status
 */
function logEnvironmentStatus(config: BackendEnvConfig): void {
  const isDevelopment = config.NODE_ENV === 'development';
  
  console.log(`\n🚀 Jokerman79 Backend Environment Status (${config.NODE_ENV})`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Server configuration
  console.log(`🖥️  Server: ${config.HOST}:${config.PORT}`);
  
  // Database configuration
  const dbStatus = envChecks.isDatabaseConfigured(config) ? '✅' : '❌';
  console.log(`${dbStatus} Database: ${config.DATABASE_CLIENT} on ${config.DATABASE_HOST}:${config.DATABASE_PORT}/${config.DATABASE_NAME}`);
  
  // Security configuration
  const hasSecureSecrets = config.NODE_ENV === 'production' ? 
    !config.APP_KEYS.includes('tobemodified') : true;
  const securityStatus = hasSecureSecrets ? '✅' : '⚠️';
  console.log(`${securityStatus} Security: ${hasSecureSecrets ? 'Properly configured' : 'Using default secrets'}`);
  
  // Gaming providers
  const evolutionStatus = envChecks.isEvolutionGamingConfigured(config) ? '✅' : '❌';
  const pragmaticStatus = envChecks.isPragmaticPlayConfigured(config) ? '✅' : '❌';
  console.log(`${evolutionStatus} Evolution Gaming: ${envChecks.isEvolutionGamingConfigured(config) ? 'Configured' : 'Not configured'}`);
  console.log(`${pragmaticStatus} Pragmatic Play: ${envChecks.isPragmaticPlayConfigured(config) ? 'Configured' : 'Not configured'}`);
  
  // WebSocket configuration
  const wsStatus = envChecks.isWebSocketConfigured(config) ? '✅' : '❌';
  console.log(`${wsStatus} WebSocket: ${config.ENABLE_WEBSOCKET_CAPTURE ? 'Enabled' : 'Disabled'}`);
  
  // Upload configuration
  const uploadStatus = envChecks.isUploadConfigured(config) ? '✅' : '❌';
  console.log(`${uploadStatus} Upload: ${config.UPLOAD_PROVIDER} provider`);
  
  // CORS configuration
  const corsOrigins = config.ALLOWED_ORIGINS.split(',').length;
  console.log(`🌐 CORS: ${corsOrigins} allowed origin${corsOrigins > 1 ? 's' : ''}`);
  
  // Data retention
  console.log(`🗄️  Data Retention: ${config.DEFAULT_RETENTION_PERIOD} (cleanup: ${config.ENABLE_AUTO_CLEANUP ? 'enabled' : 'disabled'})`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Development warnings
  if (isDevelopment) {
    const warnings: string[] = [];
    
    if (config.APP_KEYS.includes('tobemodified')) {
      warnings.push('Default APP_KEYS detected');
    }
    
    if (!config.DATABASE_SSL && config.DATABASE_CLIENT === 'postgres') {
      warnings.push('Database SSL is disabled');
    }
    
    if (warnings.length > 0) {
      console.log('⚠️  Development Warnings:');
      warnings.forEach(warning => console.log(`   - ${warning}`));
      console.log('');
    }
  }
  
  // Production checks
  if (config.NODE_ENV === 'production') {
    const issues: string[] = [];
    
    if (config.FRONTEND_URL.includes('localhost')) {
      issues.push('FRONTEND_URL uses localhost');
    }
    
    if (!config.DATABASE_SSL && config.DATABASE_CLIENT === 'postgres') {
      issues.push('Database SSL is disabled');
    }
    
    if (issues.length > 0) {
      console.log('🚨 Production Issues:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('');
    }
  }
}

/**
 * Generate a secure random secret
 * Utility function for development setup
 */
export function generateSecret(length: number = 32): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Validate a single environment variable
 */
export function validateEnvVar(key: string, value: string | undefined): boolean {
  try {
    const schema = getValidatedEnv();
    return key in schema && value !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get environment-specific database configuration
 */
export function getDatabaseConfig() {
  const config = getEnv();
  
  return {
    client: config.DATABASE_CLIENT,
    connection: {
      host: config.DATABASE_HOST,
      port: config.DATABASE_PORT,
      database: config.DATABASE_NAME,
      user: config.DATABASE_USERNAME,
      password: config.DATABASE_PASSWORD,
      ssl: config.DATABASE_SSL,
      schema: config.DATABASE_SCHEMA,
      ...(config.DATABASE_URL && { connectionString: config.DATABASE_URL })
    },
    pool: {
      min: config.DATABASE_POOL_MIN,
      max: config.DATABASE_POOL_MAX
    },
    acquireConnectionTimeout: config.DATABASE_CONNECTION_TIMEOUT
  };
}

/**
 * Get CORS configuration
 */
export function getCorsConfig() {
  const config = getEnv();
  
  return {
    enabled: config.CORS_ENABLED,
    origins: config.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH']
  };
}

export default {
  initializeEnvironment,
  getEnv,
  env,
  generateSecret,
  validateEnvVar,
  getDatabaseConfig,
  getCorsConfig
};