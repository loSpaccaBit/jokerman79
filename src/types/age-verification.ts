"use client"

/**
 * Age Verification Types - Legal Compliance
 * Tipi TypeScript per la gestione della verifica età
 */

export interface AgeVerificationState {
  /** Utente ha confermato di essere maggiorenne */
  isVerified: boolean;
  /** Timestamp della verifica */
  verifiedAt?: string;
  /** Versione del sistema di verifica */
  version: string;
  /** Metodo di verifica utilizzato */
  method: 'modal' | 'direct';
}

export interface AgeVerificationContextType {
  /** Stato corrente della verifica età */
  ageVerification: AgeVerificationState;
  /** Indica se il modal deve essere mostrato */
  showModal: boolean;
  /** Verifica che l'utente sia maggiorenne */
  verifyAge: () => void;
  /** Utente ha dichiarato di essere minorenne */
  rejectAge: () => void;
  /** Reset della verifica (per testing) */
  resetVerification: () => void;
  /** Controllo se utente è verificato */
  isVerified: boolean;
}

export const AGE_VERIFICATION_VERSION = '1.0.0';
export const AGE_VERIFICATION_STORAGE_KEY = 'jokerman79_age_verification';

export const DEFAULT_AGE_VERIFICATION_STATE: AgeVerificationState = {
  isVerified: false,
  version: AGE_VERIFICATION_VERSION,
  method: 'modal'
};