// import type { Core } from '@strapi/strapi';
import { initializeEnvironment } from './config/env';
import { validateBackendSecurity } from './config/security-validation';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {
    // Initialize and validate environment variables during registration
    try {
      console.log('🔧 Initializing Jokerman79 Backend Environment...');
      const env = initializeEnvironment();
      
      // Run comprehensive security validation
      console.log('🔒 Running security validation...');
      const securityResult = validateBackendSecurity(env);
      
      if (!securityResult.isSecure) {
        console.log('\n⚠️  Security Issues Detected:');
        securityResult.issues.forEach(issue => {
          const icon = issue.severity === 'critical' ? '🚨' : 
                      issue.severity === 'high' ? '⚠️' : 
                      issue.severity === 'medium' ? '🔶' : 'ℹ️';
          console.log(`${icon} [${issue.severity.toUpperCase()}] ${issue.message}`);
          if (issue.solution) {
            console.log(`   💡 Solution: ${issue.solution}`);
          }
        });
        
        console.log('\n📋 Security Recommendations:');
        securityResult.recommendations.forEach(rec => console.log(`   ${rec}`));
        
        console.log(`\n🛡️  Security Score: ${securityResult.score}/100`);
        
        // In production, fail if critical issues exist
        const criticalIssues = securityResult.issues.filter(i => i.severity === 'critical');
        if (process.env.NODE_ENV === 'production' && criticalIssues.length > 0) {
          console.error('\n❌ CRITICAL SECURITY ISSUES IN PRODUCTION - STARTUP ABORTED');
          process.exit(1);
        }
      } else {
        console.log(`✅ Security validation passed! Score: ${securityResult.score}/100`);
      }
      
    } catch (error) {
      console.error('❌ Environment initialization failed:', error.message);
      process.exit(1);
    }
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {
    console.log('🚀 Jokerman79 Backend started successfully!');
  },
};
