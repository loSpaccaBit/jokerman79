// Secure CORS configuration based on environment
const getCorsOrigins = (env) => {
  const isProduction = env('NODE_ENV') === 'production';
  const isStaging = env('NODE_ENV') === 'staging';
  
  if (isProduction) {
    // Production: Only allow specific domains
    return [
      'https://jokerman79.com',
      'https://www.jokerman79.com',
      'https://live.jokerman79.com',
      env('PRODUCTION_URL')
    ].filter(Boolean);
  }
  
  if (isStaging) {
    // Staging: Allow staging domains
    return [
      'https://staging.jokerman79.com',
      'https://staging-live.jokerman79.com',
      env('STAGING_URL')
    ].filter(Boolean);
  }
  
  // Development: Allow local development URLs
  return [
    env('FRONTEND_URL', 'http://localhost:3000'),
    'http://localhost:3000',
    'http://localhost:3001', // Next.js development server
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://192.168.1.12:3000', // Fixed IP for mobile development
    'http://192.168.1.12:3001', // Fixed IP for Next.js dev server
  ];
};

const getSecureHeaders = (env) => {
  const isProduction = env('NODE_ENV') === 'production';
  
  if (isProduction) {
    // Production: Minimal required headers only
    return [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Forwarded-For',
      'X-Real-IP'
    ];
  }
  
  // Development: Allow additional headers for debugging
  return [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Forwarded-For',
    'X-Real-IP',
    'X-Debug-Token',
    'Cache-Control'
  ];
};

export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      // SECURITY: Specific headers only - no wildcards
      headers: getSecureHeaders(env),
      // SECURITY: Environment-specific origins - no wildcards
      origin: getCorsOrigins(env),
      // SECURITY: Specific HTTP methods only
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      // SECURITY: Enable credentials for authenticated requests
      credentials: true,
      // SECURITY: Preflight cache for performance
      optionsSuccessStatus: 200,
      preflightContinue: false,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
