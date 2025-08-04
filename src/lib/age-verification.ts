"use client"

/**
 * Age Verification Utilities - Legal Compliance
 * Utilità per gestione verifica età secondo normative italiane
 */

import { 
  AgeVerificationState, 
  DEFAULT_AGE_VERIFICATION_STATE,
  AGE_VERIFICATION_STORAGE_KEY,
  AGE_VERIFICATION_VERSION 
} from '@/types/age-verification';

/**
 * Salva lo stato di verifica età nel localStorage
 */
export function saveAgeVerification(state: AgeVerificationState): void {
  if (typeof window === 'undefined') return;
  
  try {
    const record = {
      ...state,
      verifiedAt: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    localStorage.setItem(AGE_VERIFICATION_STORAGE_KEY, JSON.stringify(record));
    
    // Log per audit trail (solo in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Age verification saved:', record);
    }
  } catch (error) {
    console.error('Failed to save age verification:', error);
  }
}

/**
 * Carica lo stato di verifica età dal localStorage
 */
export function loadAgeVerification(): AgeVerificationState {
  if (typeof window === 'undefined') {
    return DEFAULT_AGE_VERIFICATION_STATE;
  }
  
  try {
    const stored = localStorage.getItem(AGE_VERIFICATION_STORAGE_KEY);
    
    if (!stored) {
      return DEFAULT_AGE_VERIFICATION_STATE;
    }
    
    const parsed = JSON.parse(stored);
    
    // Controlla compatibilità versione
    if (parsed.version !== AGE_VERIFICATION_VERSION) {
      console.warn('Age verification version mismatch, resetting');
      clearAgeVerification();
      return DEFAULT_AGE_VERIFICATION_STATE;
    }
    
    // Valida struttura dati
    if (typeof parsed.isVerified !== 'boolean') {
      console.warn('Invalid age verification data, resetting');
      clearAgeVerification();
      return DEFAULT_AGE_VERIFICATION_STATE;
    }
    
    return {
      isVerified: parsed.isVerified,
      verifiedAt: parsed.verifiedAt,
      version: parsed.version,
      method: parsed.method || 'modal'
    };
    
  } catch (error) {
    console.error('Failed to load age verification:', error);
    return DEFAULT_AGE_VERIFICATION_STATE;
  }
}

/**
 * Verifica se l'utente ha già confermato l'età
 */
export function isAgeVerified(): boolean {
  const state = loadAgeVerification();
  return state.isVerified;
}

/**
 * Verifica età con timestamp
 */
export function verifyAge(): AgeVerificationState {
  const state: AgeVerificationState = {
    isVerified: true,
    verifiedAt: new Date().toISOString(),
    version: AGE_VERIFICATION_VERSION,
    method: 'modal'
  };
  
  saveAgeVerification(state);
  return state;
}

/**
 * Cancella completamente la verifica età
 */
export function clearAgeVerification(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(AGE_VERIFICATION_STORAGE_KEY);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Age verification cleared');
    }
  } catch (error) {
    console.error('Failed to clear age verification:', error);
  }
}

/**
 * Controllo di validità della verifica
 * Per future implementazioni con scadenza
 */
export function isVerificationValid(state: AgeVerificationState): boolean {
  if (!state.isVerified) return false;
  
  // Controllo versione
  if (state.version !== AGE_VERIFICATION_VERSION) return false;
  
  // Controllo timestamp (opzionale per implementazioni future)
  if (state.verifiedAt) {
    const verifiedDate = new Date(state.verifiedAt);
    const now = new Date();
    
    // Per ora verifica è permanente, ma si può aggiungere scadenza
    if (isNaN(verifiedDate.getTime())) return false;
  }
  
  return true;
}

/**
 * Gestione redirect per utenti minorenni
 */
export function handleMinorUser(): void {
  if (typeof window === 'undefined') return;
  
  // Salva stato di rifiuto (per audit)
  const rejectionState: AgeVerificationState = {
    isVerified: false,
    verifiedAt: new Date().toISOString(),
    version: AGE_VERIFICATION_VERSION,
    method: 'modal'
  };
  
  // Non salviamo il rifiuto nel localStorage per permettere retry
  // saveAgeVerification(rejectionState);
  
  // Redirect a pagina di blocco
  window.location.href = '/age-restricted';
}

/**
 * Utility per testing e debug
 */
export function getAgeVerificationDebugInfo() {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return {
    stored: localStorage.getItem(AGE_VERIFICATION_STORAGE_KEY),
    parsed: loadAgeVerification(),
    isVerified: isAgeVerified(),
    version: AGE_VERIFICATION_VERSION
  };
}