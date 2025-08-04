/**
 * Secure Storage Implementation for JWT and Sensitive Data
 * Provides secure alternatives to localStorage for sensitive information
 */

interface SecureStorageOptions {
  encrypt?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number; // in seconds
}

class SecureStorage {
  private static instance: SecureStorage;
  private encryptionKey?: CryptoKey;

  private constructor() {
    this.initializeEncryption();
  }

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  private async initializeEncryption() {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        this.encryptionKey = await window.crypto.subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256,
          },
          false, // not extractable
          ['encrypt', 'decrypt']
        );
      } catch (error) {
        console.warn('Encryption not available, falling back to secure alternatives');
      }
    }
  }

  /**
   * Store JWT token securely using httpOnly cookie (preferred) or encrypted sessionStorage
   */
  async setJWT(token: string, options: SecureStorageOptions = {}): Promise<void> {
    const { httpOnly = true, sameSite = 'strict', maxAge = 3600 } = options;

    if (typeof window === 'undefined') {
      return; // Server-side, handled by HTTP-only cookies
    }

    if (httpOnly) {
      // Use fetch to set HTTP-only cookie via API route
      try {
        await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, maxAge, sameSite }),
          credentials: 'include',
        });
      } catch (error) {
        console.error('Failed to set secure cookie:', error);
        // Fallback to encrypted sessionStorage
        await this.setEncrypted('jwt_token', token);
      }
    } else {
      // Use encrypted sessionStorage as fallback
      await this.setEncrypted('jwt_token', token);
    }
  }

  /**
   * Get JWT token from secure storage
   */
  async getJWT(): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    // First try to get from HTTP-only cookie via API
    try {
      const response = await fetch('/api/auth/get-token', {
        credentials: 'include',
      });
      if (response.ok) {
        const { token } = await response.json();
        return token;
      }
    } catch (error) {
      console.warn('Could not retrieve token from secure cookie');
    }

    // Fallback to encrypted sessionStorage
    return await this.getEncrypted('jwt_token');
  }

  /**
   * Remove JWT token from all storage locations
   */
  async removeJWT(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    // Clear HTTP-only cookie
    try {
      await fetch('/api/auth/clear-token', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.warn('Could not clear secure cookie');
    }

    // Clear from sessionStorage
    sessionStorage.removeItem('jwt_token_encrypted');
    sessionStorage.removeItem('jwt_token');
  }

  /**
   * Store data with encryption if available
   */
  private async setEncrypted(key: string, value: string): Promise<void> {
    if (!this.encryptionKey || typeof window === 'undefined') {
      // Fallback to sessionStorage (less secure but better than localStorage)
      sessionStorage.setItem(key, value);
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(value);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        this.encryptionKey,
        data
      );

      const encryptedData = {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted)),
      };

      sessionStorage.setItem(`${key}_encrypted`, JSON.stringify(encryptedData));
    } catch (error) {
      console.error('Encryption failed, using fallback:', error);
      sessionStorage.setItem(key, value);
    }
  }

  /**
   * Get encrypted data
   */
  private async getEncrypted(key: string): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    // Try encrypted storage first
    const encryptedItem = sessionStorage.getItem(`${key}_encrypted`);
    if (encryptedItem && this.encryptionKey) {
      try {
        const encryptedData = JSON.parse(encryptedItem);
        const iv = new Uint8Array(encryptedData.iv);
        const data = new Uint8Array(encryptedData.data);

        const decrypted = await window.crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv,
          },
          this.encryptionKey,
          data
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
      } catch (error) {
        console.error('Decryption failed:', error);
        sessionStorage.removeItem(`${key}_encrypted`);
      }
    }

    // Fallback to plain sessionStorage
    return sessionStorage.getItem(key);
  }

  /**
   * Clear all stored data
   */
  clearAll(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Clear all sessionStorage
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('jwt_') || key?.includes('_encrypted')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }

  /**
   * Check if secure storage is available
   */
  isSecureStorageAvailable(): boolean {
    return typeof window !== 'undefined' && !!this.encryptionKey;
  }
}

export const secureStorage = SecureStorage.getInstance();

/**
 * Legacy localStorage migration utility
 * Migrates existing localStorage JWT to secure storage
 */
export async function migrateLegacyTokens(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const legacyToken = localStorage.getItem('jwt');
  if (legacyToken) {
    console.log('Migrating legacy JWT token to secure storage');
    await secureStorage.setJWT(legacyToken);
    localStorage.removeItem('jwt');
    console.log('Legacy token migration completed');
  }
}