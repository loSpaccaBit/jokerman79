/**
 * Startup validation for Jokerman79 Frontend
 * Validates environment configuration during application initialization
 */

import { validateClientSecurity, type FrontendEnvConfig } from './env-validation';
import { initializeServerEnvironment, initializeClientEnvironment } from './env';

export interface StartupValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  config: FrontendEnvConfig | null;
}

/**
 * Validates frontend environment during server-side startup
 * Should be called in next.config.js or during server initialization
 */
export function validateServerStartup(): StartupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let config: FrontendEnvConfig | null = null;

  try {
    console.log('🔧 Validating Next.js server environment...');
    
    // Initialize and validate server environment
    config = initializeServerEnvironment();
    
    // Check production readiness
    if (config.NODE_ENV === 'production') {
      if (config.NEXT_PUBLIC_SITE_URL.includes('localhost')) {
        errors.push('NEXT_PUBLIC_SITE_URL cannot use localhost in production');
      }
      
      if (config.NEXT_PUBLIC_STRAPI_URL.includes('localhost')) {
        errors.push('NEXT_PUBLIC_STRAPI_URL cannot use localhost in production');
      }
      
      if (!config.NEXT_PUBLIC_SITE_URL.startsWith('https://')) {
        errors.push('NEXT_PUBLIC_SITE_URL must use HTTPS in production');
      }
      
      if (!config.NEXT_PUBLIC_STRAPI_URL.startsWith('https://')) {
        errors.push('NEXT_PUBLIC_STRAPI_URL must use HTTPS in production');
      }
    }
    
    // Validate security
    const securityCheck = validateClientSecurity();
    if (!securityCheck.isSecure) {
      securityCheck.issues.forEach(issue => {
        if (issue.includes('Sensitive variable')) {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      });
    }
    
    // Check essential configuration
    if (!config.NEXT_PUBLIC_STRAPI_URL) {
      errors.push('NEXT_PUBLIC_STRAPI_URL is required');
    }
    
    if (!config.NEXT_PUBLIC_SITE_URL) {
      errors.push('NEXT_PUBLIC_SITE_URL is required');
    }
    
    // Log results
    if (errors.length === 0) {
      console.log('✅ Server environment validation passed');
    } else {
      console.error('❌ Server environment validation failed:');
      errors.forEach(error => console.error(`   - ${error}`));
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️  Server environment warnings:');
      warnings.forEach(warning => console.warn(`   - ${warning}`));
    }
    
    return {
      success: errors.length === 0,
      errors,
      warnings,
      config
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Environment validation failed: ${errorMessage}`);
    
    console.error('❌ Server startup validation failed:', errorMessage);
    
    return {
      success: false,
      errors,
      warnings,
      config: null
    };
  }
}

/**
 * Validates frontend environment during client-side initialization
 * Safe to call in browser environment
 */
export function validateClientStartup(): StartupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let config: FrontendEnvConfig | null = null;

  try {
    // Initialize client environment (public variables only)
    const publicConfig = initializeClientEnvironment();
    
    // Create a minimal config object for validation
    config = {
      ...publicConfig,
      NODE_ENV: (process.env.NODE_ENV as string) || 'development'
    } as FrontendEnvConfig;
    
    // Check essential client configuration
    if (!publicConfig.NEXT_PUBLIC_STRAPI_URL) {
      errors.push('NEXT_PUBLIC_STRAPI_URL is not configured');
    }
    
    // Check reachability in browser
    if (typeof window !== 'undefined') {
      // Basic URL validation
      try {
        new URL(publicConfig.NEXT_PUBLIC_STRAPI_URL);
      } catch {
        errors.push('NEXT_PUBLIC_STRAPI_URL is not a valid URL');
      }
      
      if (publicConfig.NEXT_PUBLIC_SITE_URL) {
        try {
          new URL(publicConfig.NEXT_PUBLIC_SITE_URL);
        } catch {
          errors.push('NEXT_PUBLIC_SITE_URL is not a valid URL');
        }
      }
      
      // Development-specific warnings
      if (config.NODE_ENV === 'development') {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile && publicConfig.NEXT_PUBLIC_STRAPI_URL.includes('localhost')) {
          warnings.push('Using localhost on mobile device - consider setting NEXT_PUBLIC_DEV_SERVER_IP');
        }
      }
    }
    
    return {
      success: errors.length === 0,
      errors,
      warnings,
      config
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Client environment validation failed: ${errorMessage}`);
    
    return {
      success: false,
      errors,
      warnings,
      config: null
    };
  }
}

/**
 * Validate environment during build process
 * Should be called during next build
 */
export function validateBuildEnvironment(): StartupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let config: FrontendEnvConfig | null = null;

  try {
    console.log('🔧 Validating build environment...');
    
    // For build, we need to validate both server and client environments
    const serverResult = validateServerStartup();
    const clientResult = validateClientStartup();
    
    // Combine results
    errors.push(...serverResult.errors, ...clientResult.errors);
    warnings.push(...serverResult.warnings, ...clientResult.warnings);
    config = serverResult.config;
    
    // Build-specific validations
    if (config) {
      // Check for missing required environment variables
      const requiredPublicVars = [
        'NEXT_PUBLIC_STRAPI_URL',
        'NEXT_PUBLIC_SITE_URL',
        'NEXT_PUBLIC_APP_NAME'
      ];
      
      requiredPublicVars.forEach(varName => {
        if (!process.env[varName]) {
          errors.push(`Required environment variable ${varName} is missing`);
        }
      });
      
      // Production build checks
      if (config.NODE_ENV === 'production') {
        if (!config.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && config.NEXT_PUBLIC_ENABLE_ANALYTICS) {
          warnings.push('Analytics enabled but NEXT_PUBLIC_GOOGLE_ANALYTICS_ID not configured');
        }
      }
    }
    
    // Log build validation results
    if (errors.length === 0) {
      console.log('✅ Build environment validation passed');
    } else {
      console.error('❌ Build environment validation failed:');
      errors.forEach(error => console.error(`   - ${error}`));
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️  Build environment warnings:');
      warnings.forEach(warning => console.warn(`   - ${warning}`));
    }
    
    return {
      success: errors.length === 0,
      errors,
      warnings,
      config
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Build environment validation failed: ${errorMessage}`);
    
    console.error('❌ Build validation failed:', errorMessage);
    
    return {
      success: false,
      errors,
      warnings,
      config: null
    };
  }
}

/**
 * Generate a development environment report
 */
export function generateDevelopmentReport(): string {
  const result = validateClientStartup();
  
  let report = '\n🔧 Jokerman79 Development Environment Report\n';
  report += '═══════════════════════════════════════════════\n\n';
  
  if (result.config) {
    report += `📍 Environment: ${result.config.NODE_ENV}\n`;
    report += `🌐 Site URL: ${result.config.NEXT_PUBLIC_SITE_URL || 'Not configured'}\n`;
    report += `🔌 Strapi URL: ${result.config.NEXT_PUBLIC_STRAPI_URL || 'Not configured'}\n`;
    report += `📱 Dev Server IP: ${result.config.NEXT_PUBLIC_DEV_SERVER_IP || 'Not configured'}\n\n`;
    
    // Feature status
    report += '🎮 Features:\n';
    report += `   PWA: ${result.config.NEXT_PUBLIC_ENABLE_PWA ? '✅' : '❌'}\n`;
    report += `   Live Stats: ${result.config.NEXT_PUBLIC_ENABLE_LIVE_STATS ? '✅' : '❌'}\n`;
    report += `   WebSockets: ${result.config.NEXT_PUBLIC_ENABLE_WEBSOCKETS ? '✅' : '❌'}\n`;
    report += `   Analytics: ${result.config.NEXT_PUBLIC_ENABLE_ANALYTICS ? '✅' : '❌'}\n`;
    report += `   Demo Mode: ${result.config.NEXT_PUBLIC_ENABLE_DEMO_MODE ? '✅' : '❌'}\n\n`;
  }
  
  if (result.errors.length > 0) {
    report += '❌ Errors:\n';
    result.errors.forEach(error => report += `   - ${error}\n`);
    report += '\n';
  }
  
  if (result.warnings.length > 0) {
    report += '⚠️  Warnings:\n';
    result.warnings.forEach(warning => report += `   - ${warning}\n`);
    report += '\n';
  }
  
  if (result.success) {
    report += '✅ Environment is properly configured!\n';
  } else {
    report += '❌ Environment configuration needs attention.\n';
  }
  
  report += '\n💡 For help with environment setup, check the .env.example file.\n';
  
  return report;
}

const startupValidation = {
  validateServerStartup,
  validateClientStartup,
  validateBuildEnvironment,
  generateDevelopmentReport
};

export default startupValidation;