#!/usr/bin/env node

/**
 * Secret Generator for Jokerman79 Backend
 * 
 * Generates cryptographically secure secrets for Strapi configuration
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Generate a cryptographically secure random string
 */
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Generate all secrets needed for Strapi
 */
function generateStrapiSecrets() {
  console.log(colorize('\n🔐 Generating Strapi Secrets...', 'cyan'));
  console.log(colorize('═══════════════════════════════════════\n', 'cyan'));

  const secrets = {
    APP_KEYS: [
      generateSecret(32),
      generateSecret(32),
      generateSecret(32),
      generateSecret(32)
    ].join(','),
    API_TOKEN_SALT: generateSecret(32),
    ADMIN_JWT_SECRET: generateSecret(32),
    TRANSFER_TOKEN_SALT: generateSecret(32),
    JWT_SECRET: generateSecret(32),
    ENCRYPTION_KEY: generateSecret(32)
  };

  // Display secrets
  Object.entries(secrets).forEach(([key, value]) => {
    console.log(colorize(`${key}:`, 'yellow'));
    console.log(colorize(`${value}`, 'green'));
    console.log('');
  });

  return secrets;
}

/**
 * Generate a complete .env file with secure secrets
 */
function generateEnvFile(secrets) {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  try {
    // Read the example file
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Replace placeholder secrets with real ones
    Object.entries(secrets).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      envContent = envContent.replace(regex, `${key}=${value}`);
    });
    
    // Replace other common placeholders
    const replacements = {
      'CHANGE_ME_1,CHANGE_ME_2,CHANGE_ME_3,CHANGE_ME_4': secrets.APP_KEYS,
      'CHANGE_ME_API_TOKEN_SALT_32_CHARS_MIN': secrets.API_TOKEN_SALT,
      'CHANGE_ME_ADMIN_JWT_SECRET_32_CHARS_MIN': secrets.ADMIN_JWT_SECRET,
      'CHANGE_ME_TRANSFER_TOKEN_SALT_32_CHARS': secrets.TRANSFER_TOKEN_SALT,
      'CHANGE_ME_JWT_SECRET_32_CHARACTERS_MINIMUM': secrets.JWT_SECRET,
      'CHANGE_ME_ENCRYPTION_KEY_32_CHARS_MIN': secrets.ENCRYPTION_KEY,
      'your_db_password_here': 'your_actual_db_password'
    };
    
    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      envContent = envContent.replace(new RegExp(placeholder, 'g'), replacement);
    });
    
    return envContent;
  } catch (error) {
    console.error(colorize('❌ Error reading .env.example file:', 'red'), error.message);
    return null;
  }
}

/**
 * Validate secret strength
 */
function validateSecretStrength(secret, name) {
  const issues = [];
  
  if (secret.length < 16) {
    issues.push(`${name} is too short (${secret.length} characters, minimum 16)`);
  }
  
  if (secret.length < 32) {
    issues.push(`${name} should be at least 32 characters for better security`);
  }
  
  // Check entropy (simplified)
  const uniqueChars = new Set(secret).size;
  const entropy = uniqueChars / secret.length;
  
  if (entropy < 0.6) {
    issues.push(`${name} has low entropy (${entropy.toFixed(2)})`);
  }
  
  return issues;
}

/**
 * Validate all generated secrets
 */
function validateSecrets(secrets) {
  console.log(colorize('\n🔍 Validating Secret Strength...', 'blue'));
  console.log(colorize('══════════════════════════════════════\n', 'blue'));
  
  let hasIssues = false;
  
  Object.entries(secrets).forEach(([key, value]) => {
    if (key === 'APP_KEYS') {
      // Validate each app key
      const keys = value.split(',');
      keys.forEach((key, index) => {
        const issues = validateSecretStrength(key.trim(), `APP_KEY[${index}]`);
        if (issues.length > 0) {
          hasIssues = true;
          console.log(colorize(`⚠️  ${key}:`, 'yellow'));
          issues.forEach(issue => console.log(colorize(`   - ${issue}`, 'red')));
        }
      });
    } else {
      const issues = validateSecretStrength(value, key);
      if (issues.length > 0) {
        hasIssues = true;
        console.log(colorize(`⚠️  ${key}:`, 'yellow'));
        issues.forEach(issue => console.log(colorize(`   - ${issue}`, 'red')));
      }
    }
  });
  
  if (!hasIssues) {
    console.log(colorize('✅ All secrets pass strength validation!', 'green'));
  }
  
  console.log('');
  return !hasIssues;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const shouldWriteFile = args.includes('--write') || args.includes('-w');
  const shouldForce = args.includes('--force') || args.includes('-f');
  
  console.log(colorize('🔐 Jokerman79 Secret Generator', 'bright'));
  console.log(colorize('═══════════════════════════════════════\n', 'bright'));
  
  // Check if .env already exists
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath) && !shouldForce) {
    console.log(colorize('⚠️  .env file already exists!', 'yellow'));
    console.log('Use --force flag to overwrite existing file.');
    console.log('Use --write flag to generate a new .env file.');
    console.log('\nGenerating secrets for display only...\n');
  }
  
  // Generate secrets
  const secrets = generateStrapiSecrets();
  
  // Validate secrets
  const isValid = validateSecrets(secrets);
  
  if (!isValid) {
    console.log(colorize('⚠️  Some secrets have validation warnings.', 'yellow'));
    console.log('This is normal for automatically generated secrets.\n');
  }
  
  // Write to file if requested
  if (shouldWriteFile || (shouldForce && !fs.existsSync(envPath))) {
    const envContent = generateEnvFile(secrets);
    
    if (envContent) {
      try {
        fs.writeFileSync(envPath, envContent);
        console.log(colorize('✅ Created .env file with generated secrets!', 'green'));
        console.log(colorize('📍 Location: ' + envPath, 'cyan'));
        console.log(colorize('\n🔒 Remember to:', 'yellow'));
        console.log('   - Update database configuration');
        console.log('   - Set gaming provider credentials');
        console.log('   - Configure CORS origins');
        console.log('   - Never commit the .env file to version control\n');
      } catch (error) {
        console.error(colorize('❌ Error writing .env file:', 'red'), error.message);
      }
    }
  } else {
    console.log(colorize('💡 To create a .env file with these secrets:', 'cyan'));
    console.log(colorize('   node scripts/generate-secrets.js --write', 'bright'));
    console.log(colorize('\n📋 Copy these secrets to your .env file manually:', 'blue'));
  }
  
  // Show security recommendations
  console.log(colorize('\n🛡️  Security Recommendations:', 'magenta'));
  console.log(colorize('══════════════════════════════════════', 'magenta'));
  console.log('• Store secrets securely (password manager, vault)');
  console.log('• Use different secrets for each environment');
  console.log('• Rotate secrets regularly in production');
  console.log('• Never share secrets in plain text');
  console.log('• Use environment variables in production deployment');
  console.log('• Enable database SSL in production');
  console.log('• Monitor secret usage and access logs\n');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateSecret,
  generateStrapiSecrets,
  validateSecretStrength,
  validateSecrets
};