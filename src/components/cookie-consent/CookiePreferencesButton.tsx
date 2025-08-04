"use client";

import { Button } from '@/components/ui/button';

export function CookiePreferencesButton() {
  return (
    <Button 
      onClick={() => {
        // Trigger banner preferences modal
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('openCookiePreferences'));
        }
      }}
    >
      Gestisci Preferenze
    </Button>
  );
}