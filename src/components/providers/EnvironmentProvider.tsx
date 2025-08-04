'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { validateClientStartup, generateDevelopmentReport, type StartupValidationResult } from '@/lib/startup-validation';
import { useEnvironmentValidation } from '@/lib/env';

interface EnvironmentContextType {
  validation: StartupValidationResult | null;
  isConfigured: {
    strapi: boolean;
    graphql: boolean;
    liveStats: boolean;
    analytics: boolean;
    pwa: boolean;
  };
  features: {
    pwa: boolean;
    liveStats: boolean;
    websockets: boolean;
    analytics: boolean;
    demoMode: boolean;
  };
  developmentReport: string;
  isLoading: boolean;
  hasErrors: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

interface EnvironmentProviderProps {
  children: React.ReactNode;
}

/**
 * Environment validation provider for client-side validation
 * Validates environment configuration and provides context to all components
 */
export function EnvironmentProvider({ children }: EnvironmentProviderProps) {
  const [validation, setValidation] = useState<StartupValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [developmentReport, setDevelopmentReport] = useState('');

  // Use the existing environment validation hook
  const envValidation = useEnvironmentValidation();

  useEffect(() => {
    const validateEnvironment = async () => {
      try {
        // Run client-side validation
        const result = validateClientStartup();
        setValidation(result);

        // Generate development report
        const report = generateDevelopmentReport();
        setDevelopmentReport(report);

        // Log results in development
        if (process.env.NODE_ENV === 'development') {
          if (result.success) {
            console.log('✅ Client environment validation passed');
          } else {
            console.error('❌ Client environment validation failed:');
            result.errors.forEach(error => console.error(`   - ${error}`));
          }

          if (result.warnings.length > 0) {
            console.warn('⚠️  Client environment warnings:');
            result.warnings.forEach(warning => console.warn(`   - ${warning}`));
          }

          // Log development report
          console.log(report);
        }

      } catch (error) {
        console.error('❌ Environment validation error:', error);
        setValidation({
          success: false,
          errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
          warnings: [],
          config: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    validateEnvironment();
  }, []);

  const contextValue: EnvironmentContextType = {
    validation,
    isConfigured: envValidation.isConfigured,
    features: envValidation.features,
    developmentReport,
    isLoading,
    hasErrors: validation ? !validation.success : false
  };

  // In development, show environment status in UI
  const showEnvironmentStatus = process.env.NODE_ENV === 'development' && validation && !validation.success;

  return (
    <EnvironmentContext.Provider value={contextValue}>
      {showEnvironmentStatus && <EnvironmentStatusBanner validation={validation} />}
      {children}
    </EnvironmentContext.Provider>
  );
}

/**
 * Environment status banner for development
 * Shows validation errors and warnings in development mode
 */
function EnvironmentStatusBanner({ validation }: { validation: StartupValidationResult }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || validation.success) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">🔧 Environment Configuration Issues:</span>
          <span>
            {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}
            {validation.warnings.length > 0 && 
              `, ${validation.warnings.length} warning${validation.warnings.length !== 1 ? 's' : ''}`
            }
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="hover:bg-red-700 px-2 py-1 rounded"
          aria-label="Close environment status banner"
        >
          ✕
        </button>
      </div>
      <div className="container mx-auto mt-2">
        {validation.errors.slice(0, 3).map((error, index) => (
          <div key={index} className="text-xs opacity-90">
            • {error}
          </div>
        ))}
        {validation.errors.length > 3 && (
          <div className="text-xs opacity-75">
            ... and {validation.errors.length - 3} more error{validation.errors.length - 3 !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to use environment context
 */
export function useEnvironmentContext(): EnvironmentContextType {
  const context = useContext(EnvironmentContext);
  
  if (context === undefined) {
    throw new Error('useEnvironmentContext must be used within an EnvironmentProvider');
  }
  
  return context;
}

/**
 * Hook to check if a feature is available and configured
 */
export function useFeatureAvailable(feature: keyof EnvironmentContextType['features']): boolean {
  const { features, isConfigured } = useEnvironmentContext();
  
  // Feature must be enabled and properly configured
  switch (feature) {
    case 'liveStats':
      return features.liveStats && isConfigured.strapi;
    case 'analytics':
      return features.analytics && isConfigured.analytics;
    case 'pwa':
      return features.pwa && isConfigured.pwa;
    default:
      return features[feature];
  }
}

/**
 * Development-only component to show environment report
 */
export function EnvironmentReportButton() {
  const { developmentReport } = useEnvironmentContext();
  const [showReport, setShowReport] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowReport(true)}
        className="fixed bottom-4 left-4 z-40 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        title="Show Environment Report"
      >
        🔧 Env
      </button>

      {showReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Environment Report</h2>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto whitespace-pre-wrap">
                {developmentReport}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EnvironmentProvider;