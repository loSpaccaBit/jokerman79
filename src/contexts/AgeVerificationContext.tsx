"use client"

/**
 * Age Verification Context - Legal Compliance
 * Context React per gestione globale verifica età
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  AgeVerificationState,
  AgeVerificationContextType,
  DEFAULT_AGE_VERIFICATION_STATE
} from '@/types/age-verification';
import {
  loadAgeVerification,
  saveAgeVerification,
  isAgeVerified,
  verifyAge as verifyAgeUtil,
  clearAgeVerification,
  handleMinorUser,
  isVerificationValid
} from '@/lib/age-verification';

const AgeVerificationContext = createContext<AgeVerificationContextType | undefined>(undefined);

interface AgeVerificationProviderProps {
  children: React.ReactNode;
}

export function AgeVerificationProvider({ children }: AgeVerificationProviderProps) {
  // Stati per gestione verifica età
  const [ageVerification, setAgeVerification] = useState<AgeVerificationState>(DEFAULT_AGE_VERIFICATION_STATE);
  const [showModal, setShowModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inizializzazione del context
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedVerification = loadAgeVerification();
    
    // Controlla se verifica è valida
    const isValid = isVerificationValid(storedVerification);
    
    if (isValid && storedVerification.isVerified) {
      setAgeVerification(storedVerification);
      setShowModal(false);
    } else {
      // Se non verificato o verifica non valida, mostra modal
      setAgeVerification(DEFAULT_AGE_VERIFICATION_STATE);
      setShowModal(true);
      
      // Pulisci verifica non valida
      if (!isValid) {
        clearAgeVerification();
      }
    }
    
    setIsInitialized(true);
    
    // Debug info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Age verification initialized:', {
        stored: storedVerification,
        isValid,
        showModal: !isValid || !storedVerification.isVerified
      });
    }
  }, []);

  // Verifica età - utente maggiorenne
  const verifyAge = useCallback(() => {
    const newState = verifyAgeUtil();
    setAgeVerification(newState);
    setShowModal(false);
    
    // Analytics event per tracking verifica (se consentito)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'age_verified', {
        event_category: 'Legal_Compliance',
        event_label: 'age_verification_success',
        value: 1
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Age verified successfully:', newState);
    }
  }, []);

  // Rifiuto età - utente minorenne
  const rejectAge = useCallback(() => {
    // Analytics event per tracking rifiuto
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'age_rejected', {
        event_category: 'Legal_Compliance',
        event_label: 'age_verification_denied',
        value: 0
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Age verification rejected - redirecting to restricted page');
    }
    
    // Gestisce redirect per minorenni
    handleMinorUser();
  }, []);

  // Reset verifica (per testing o cambio policy)
  const resetVerification = useCallback(() => {
    clearAgeVerification();
    setAgeVerification(DEFAULT_AGE_VERIFICATION_STATE);
    setShowModal(true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Age verification reset');
    }
  }, []);

  // Computed property per verifica stato
  const isVerified = ageVerification.isVerified && isVerificationValid(ageVerification);

  const contextValue: AgeVerificationContextType = {
    ageVerification,
    showModal: showModal && isInitialized, // Mostra modal solo dopo inizializzazione
    verifyAge,
    rejectAge,
    resetVerification,
    isVerified
  };

  return (
    <AgeVerificationContext.Provider value={contextValue}>
      {children}
    </AgeVerificationContext.Provider>
  );
}

/**
 * Hook per utilizzare l'Age Verification Context
 */
export function useAgeVerification(): AgeVerificationContextType {
  const context = useContext(AgeVerificationContext);
  
  if (context === undefined) {
    throw new Error('useAgeVerification must be used within an AgeVerificationProvider');
  }
  
  return context;
}

/**
 * HOC per componenti che richiedono verifica età
 */
export function withAgeVerification<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithAgeVerificationComponent(props: P) {
    const { isVerified } = useAgeVerification();
    
    if (!isVerified) {
      return null; // O un componente placeholder
    }
    
    return <Component {...props} />;
  };
}

/**
 * Hook per componenti condizionali basati su verifica età
 */
export function useConditionalAgeRender(): boolean {
  const { isVerified } = useAgeVerification();
  return isVerified;
}