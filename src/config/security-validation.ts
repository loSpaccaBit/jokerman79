/**
 * Security validation utilities for Jokerman79
 * Provides comprehensive security checks for environment variables and secrets
 */

import crypto from 'crypto';
import { BackendEnvConfig } from './env-validation';

// Common weak secrets and patterns to avoid
const WEAK_SECRETS = [
  'tobemodified',
  'toBeModified1',
  'toBeModified2',
  'change_me',
  'your_secret_here',
  'default_secret',
  'strapi_secret',
  'admin_secret',
  'jwt_secret',
  'password',
  '123456',
  'secret',
  'admin',
  'root',
  'test'
];

const WEAK_PATTERNS = [
  /^(password|secret|admin|root|test)$/i,
  /^(password|secret|admin|root|test)\d*$/i,
  /^(demo|example|sample|default).*$/i,
  /^.*(password|secret|admin|root|test)$/i,
  /^(abc|xyz|111|000|999).*$/i,
  /^(.)\1{3,}$/, // Repeated characters (aaaa, 1111, etc.)
  /^(qwerty|asdf|zxcv|1234|abcd|test).*$/i
];

export interface SecurityValidationResult {
  isSecure: boolean;
  issues: SecurityIssue[];
  recommendations: string[];
  score: number; // 0-100
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'secret_strength' | 'environment_separation' | 'production_readiness' | 'network_security';
  message: string;
  variable?: string;
  solution: string;
}

/**
 * Validates the strength of a secret/password
 */
export function validateSecretStrength(secret: string, variableName: string): {
  isStrong: boolean;
  issues: SecurityIssue[];
  score: number;
} {
  const issues: SecurityIssue[] = [];
  let score = 0;

  if (!secret || secret.length === 0) {
    issues.push({
      severity: 'critical',
      category: 'secret_strength',
      message: `${variableName} is empty`,
      variable: variableName,
      solution: 'Generate a strong secret using crypto.randomBytes(32).toString("base64")'
    });
    return { isStrong: false, issues, score: 0 };
  }

  // Length checks
  if (secret.length < 16) {
    issues.push({
      severity: 'high',
      category: 'secret_strength',
      message: `${variableName} is too short (${secret.length} characters, minimum 16)`,
      variable: variableName,
      solution: 'Use a secret with at least 16 characters, preferably 32 or more'
    });
  } else if (secret.length >= 16 && secret.length < 32) {
    score += 20;
  } else if (secret.length >= 32) {
    score += 30;
  }

  // Check against weak secrets list
  const lowerSecret = secret.toLowerCase();
  if (WEAK_SECRETS.some(weak => lowerSecret.includes(weak))) {
    issues.push({
      severity: 'critical',
      category: 'secret_strength',
      message: `${variableName} contains common weak patterns`,
      variable: variableName,
      solution: 'Generate a truly random secret that doesn\'t contain dictionary words'
    });
  } else {
    score += 20;
  }

  // Check against weak patterns
  if (WEAK_PATTERNS.some(pattern => pattern.test(secret))) {
    issues.push({
      severity: 'high',
      category: 'secret_strength',
      message: `${variableName} matches weak pattern`,
      variable: variableName,
      solution: 'Use a randomly generated secret without predictable patterns'
    });
  } else {
    score += 15;
  }

  // Entropy check
  const entropy = calculateEntropy(secret);
  if (entropy < 3.0) {
    issues.push({
      severity: 'medium',
      category: 'secret_strength',
      message: `${variableName} has low entropy (${entropy.toFixed(2)})`,
      variable: variableName,
      solution: 'Use a secret with more varied characters to increase entropy'
    });
  } else if (entropy >= 3.0 && entropy < 4.0) {
    score += 10;
  } else if (entropy >= 4.0) {
    score += 20;
  }

  // Character diversity check
  const hasLowercase = /[a-z]/.test(secret);
  const hasUppercase = /[A-Z]/.test(secret);
  const hasNumbers = /\d/.test(secret);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret);
  const hasBase64Chars = /^[A-Za-z0-9+/=]+$/.test(secret);

  // For base64-encoded secrets (common in Strapi)
  if (hasBase64Chars && secret.length >= 24) {
    score += 15;
  } else {
    // For regular passwords, check diversity
    let diversity = 0;
    if (hasLowercase) diversity++;
    if (hasUppercase) diversity++;
    if (hasNumbers) diversity++;
    if (hasSpecialChars) diversity++;

    if (diversity < 2) {
      issues.push({
        severity: 'medium',
        category: 'secret_strength',
        message: `${variableName} lacks character diversity`,
        variable: variableName,
        solution: 'Include a mix of uppercase, lowercase, numbers, and special characters'
      });
    } else {
      score += diversity * 4; // Max 16 points
    }
  }

  return {
    isStrong: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
    issues,
    score: Math.min(score, 100)
  };
}

/**
 * Calculate Shannon entropy of a string
 */
function calculateEntropy(str: string): number {
  const freqs = new Map<string, number>();
  
  for (const char of str) {
    freqs.set(char, (freqs.get(char) || 0) + 1);
  }
  
  let entropy = 0;
  const length = str.length;
  
  for (const freq of freqs.values()) {
    const probability = freq / length;
    entropy -= probability * Math.log2(probability);
  }
  
  return entropy;
}

/**
 * Validates environment separation (dev vs staging vs production)
 */
export function validateEnvironmentSeparation(config: BackendEnvConfig): {
  isSecure: boolean;
  issues: SecurityIssue[];
} {
  const issues: SecurityIssue[] = [];
  const { NODE_ENV } = config;

  // Production-specific checks
  if (NODE_ENV === 'production') {
    // Check for development URLs in production
    if (config.FRONTEND_URL.includes('localhost')) {
      issues.push({
        severity: 'high',
        category: 'production_readiness',
        message: 'Production environment using localhost frontend URL',
        variable: 'FRONTEND_URL',
        solution: 'Set FRONTEND_URL to your production domain with HTTPS'
      });
    }

    // Check for HTTP in production (should use HTTPS)
    if (config.FRONTEND_URL.startsWith('http://')) {
      issues.push({
        severity: 'high',
        category: 'network_security',
        message: 'Production environment using HTTP instead of HTTPS',
        variable: 'FRONTEND_URL',
        solution: 'Update FRONTEND_URL to use HTTPS for secure connections'
      });
    }

    // Check database SSL in production
    if (config.DATABASE_CLIENT === 'postgres' && !config.DATABASE_SSL) {
      issues.push({
        severity: 'medium',
        category: 'network_security',
        message: 'PostgreSQL SSL is disabled in production',
        variable: 'DATABASE_SSL',
        solution: 'Enable DATABASE_SSL=true for secure database connections'
      });
    }

    // Check for development-like hostnames
    if (config.DATABASE_HOST === 'localhost' || config.DATABASE_HOST === '127.0.0.1') {
      issues.push({
        severity: 'medium',
        category: 'production_readiness',
        message: 'Production database using localhost/127.0.0.1',
        variable: 'DATABASE_HOST',
        solution: 'Use a proper database server hostname/IP for production'
      });
    }
  }

  // Development-specific warnings
  if (NODE_ENV === 'development') {
    // Warn about production-like secrets in development
    const appKeys = config.APP_KEYS.split(',');
    const hasStrongSecrets = appKeys.every(key => 
      key.length >= 32 && !WEAK_SECRETS.includes(key.toLowerCase())
    );

    if (hasStrongSecrets) {
      issues.push({
        severity: 'low',
        category: 'environment_separation',
        message: 'Using production-strength secrets in development',
        solution: 'Consider using weaker secrets for development to avoid confusion'
      });
    }
  }

  return {
    isSecure: issues.filter(i => i.severity === 'high' || i.severity === 'critical').length === 0,
    issues
  };
}

/**
 * Validates network security configuration
 */
export function validateNetworkSecurity(config: BackendEnvConfig): {
  isSecure: boolean;
  issues: SecurityIssue[];
} {
  const issues: SecurityIssue[] = [];

  // CORS validation
  const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  
  // Check for wildcard CORS (dangerous)
  if (allowedOrigins.includes('*')) {
    issues.push({
      severity: 'critical',
      category: 'network_security',
      message: 'CORS allows all origins (*)',
      variable: 'ALLOWED_ORIGINS',
      solution: 'Specify explicit domains instead of using wildcard (*)'
    });
  }

  // Check for HTTP origins in production
  if (config.NODE_ENV === 'production') {
    const httpOrigins = allowedOrigins.filter(origin => 
      origin.startsWith('http://') && !origin.includes('localhost')
    );
    
    if (httpOrigins.length > 0) {
      issues.push({
        severity: 'high',
        category: 'network_security',
        message: 'CORS allows HTTP origins in production',
        variable: 'ALLOWED_ORIGINS',
        solution: 'Use HTTPS origins only in production'
      });
    }
  }

  // Check for suspicious domains
  const suspiciousDomains = allowedOrigins.filter(origin => {
    const domain = origin.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
    return domain.includes('ngrok') || 
           domain.includes('localtunnel') || 
           domain.includes('herokuapp') ||
           domain.includes('vercel.app') ||
           domain.includes('netlify.app');
  });

  if (suspiciousDomains.length > 0 && config.NODE_ENV === 'production') {
    issues.push({
      severity: 'medium',
      category: 'network_security',
      message: 'CORS allows tunnel/temporary domains in production',
      variable: 'ALLOWED_ORIGINS',
      solution: 'Review and remove temporary domains from production CORS settings'
    });
  }

  return {
    isSecure: issues.filter(i => i.severity === 'high' || i.severity === 'critical').length === 0,
    issues
  };
}

/**
 * Comprehensive security validation for backend environment
 */
export function validateBackendSecurity(config: BackendEnvConfig): SecurityValidationResult {
  const allIssues: SecurityIssue[] = [];
  const recommendations: string[] = [];
  let totalScore = 0;
  let maxScore = 0;

  // Validate secret strength
  const secretsToValidate = [
    { value: config.APP_KEYS.split(',')[0], name: 'APP_KEYS[0]' },
    { value: config.API_TOKEN_SALT, name: 'API_TOKEN_SALT' },
    { value: config.ADMIN_JWT_SECRET, name: 'ADMIN_JWT_SECRET' },
    { value: config.TRANSFER_TOKEN_SALT, name: 'TRANSFER_TOKEN_SALT' },
    { value: config.JWT_SECRET, name: 'JWT_SECRET' },
    { value: config.ENCRYPTION_KEY, name: 'ENCRYPTION_KEY' }
  ];

  secretsToValidate.forEach(({ value, name }) => {
    const result = validateSecretStrength(value, name);
    allIssues.push(...result.issues);
    totalScore += result.score;
    maxScore += 100;
  });

  // Validate environment separation
  const envSeparation = validateEnvironmentSeparation(config);
  allIssues.push(...envSeparation.issues);

  // Validate network security
  const networkSecurity = validateNetworkSecurity(config);
  allIssues.push(...networkSecurity.issues);

  // Generate recommendations based on issues
  const criticalIssues = allIssues.filter(i => i.severity === 'critical');
  const highIssues = allIssues.filter(i => i.severity === 'high');
  const mediumIssues = allIssues.filter(i => i.severity === 'medium');

  if (criticalIssues.length > 0) {
    recommendations.push('🚨 CRITICAL: Address all critical security issues immediately before deploying');
  }

  if (highIssues.length > 0) {
    recommendations.push('⚠️  HIGH: Fix high-severity issues to improve security posture');
  }

  if (config.NODE_ENV === 'production') {
    recommendations.push('🔒 Production: Ensure all secrets are rotated regularly and never shared');
    recommendations.push('🔐 Production: Consider using a secrets management service (HashiCorp Vault, AWS Secrets Manager)');
  }

  if (mediumIssues.length > 0) {
    recommendations.push('📋 Review medium-severity issues for additional hardening');
  }

  // Calculate overall security score
  const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  
  // Adjust score based on issue severity
  const scoreDeduction = 
    criticalIssues.length * 25 + 
    highIssues.length * 15 + 
    mediumIssues.length * 5;

  const adjustedScore = Math.max(0, finalScore - scoreDeduction);

  return {
    isSecure: criticalIssues.length === 0 && highIssues.length === 0,
    issues: allIssues,
    recommendations,
    score: adjustedScore
  };
}

/**
 * Generate a cryptographically secure secret
 */
export function generateSecureSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Generate multiple secrets for Strapi configuration
 */
export function generateStrapiSecrets(): {
  APP_KEYS: string;
  API_TOKEN_SALT: string;
  ADMIN_JWT_SECRET: string;
  TRANSFER_TOKEN_SALT: string;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
} {
  return {
    APP_KEYS: [
      generateSecureSecret(32),
      generateSecureSecret(32),
      generateSecureSecret(32),
      generateSecureSecret(32)
    ].join(','),
    API_TOKEN_SALT: generateSecureSecret(32),
    ADMIN_JWT_SECRET: generateSecureSecret(32),
    TRANSFER_TOKEN_SALT: generateSecureSecret(32),
    JWT_SECRET: generateSecureSecret(32),
    ENCRYPTION_KEY: generateSecureSecret(32)
  };
}

/**
 * Validate gaming provider credentials security
 */
export function validateGamingProviderSecurity(config: BackendEnvConfig): {
  isSecure: boolean;
  issues: SecurityIssue[];
} {
  const issues: SecurityIssue[] = [];

  // Evolution Gaming validation
  if (config.EVOLUTION_GAMING_USERNAME) {
    if (config.EVOLUTION_GAMING_USERNAME.length < 5) {
      issues.push({
        severity: 'medium',
        category: 'secret_strength',
        message: 'Evolution Gaming username is too short',
        variable: 'EVOLUTION_GAMING_USERNAME',
        solution: 'Ensure username meets Evolution Gaming requirements'
      });
    }

    if (!config.EVOLUTION_GAMING_PASSWORD) {
      issues.push({
        severity: 'critical',
        category: 'secret_strength',
        message: 'Evolution Gaming password is missing',
        variable: 'EVOLUTION_GAMING_PASSWORD',
        solution: 'Set the Evolution Gaming password from your provider account'
      });
    } else {
      const passwordCheck = validateSecretStrength(config.EVOLUTION_GAMING_PASSWORD, 'EVOLUTION_GAMING_PASSWORD');
      if (!passwordCheck.isStrong) {
        issues.push({
          severity: 'high',
          category: 'secret_strength',
          message: 'Evolution Gaming password is weak',
          variable: 'EVOLUTION_GAMING_PASSWORD',
          solution: 'Use a strong password as provided by Evolution Gaming'
        });
      }
    }
  }

  // Pragmatic Play validation
  if (config.PRAGMATIC_PLAY_API_KEY) {
    const keyCheck = validateSecretStrength(config.PRAGMATIC_PLAY_API_KEY, 'PRAGMATIC_PLAY_API_KEY');
    if (!keyCheck.isStrong) {
      issues.push({
        severity: 'high',
        category: 'secret_strength',
        message: 'Pragmatic Play API key appears weak',
        variable: 'PRAGMATIC_PLAY_API_KEY',
        solution: 'Verify the API key is correctly copied from Pragmatic Play'
      });
    }
  }

  return {
    isSecure: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
    issues
  };
}

export default {
  validateSecretStrength,
  validateEnvironmentSeparation,
  validateNetworkSecurity,
  validateBackendSecurity,
  validateGamingProviderSecurity,
  generateSecureSecret,
  generateStrapiSecrets
};