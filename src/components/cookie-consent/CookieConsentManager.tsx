"use client"

/**
 * Cookie Consent Manager
 * Componente per gestire i consensi cookie da qualsiasi parte del sito
 */

import React from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Cookie, Settings, RotateCcw, Check, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface CookieConsentManagerProps {
  variant?: 'dropdown' | 'inline' | 'minimal';
  showStatus?: boolean;
}

export function CookieConsentManager({ 
  variant = 'dropdown', 
  showStatus = true 
}: CookieConsentManagerProps) {
  const { 
    consent, 
    consentGiven, 
    togglePreferences, 
    resetConsent,
    canUseAnalytics,
    canUseMarketing,
    lastUpdated
  } = useCookieConsent();

  const getConsentStatus = () => {
    if (!consentGiven) return 'Non configurato';
    
    const activeCount = Object.values(consent).filter(Boolean).length;
    const totalCount = Object.keys(consent).length;
    
    if (activeCount === totalCount) return 'Tutti accettati';
    if (activeCount === 1) return 'Solo necessari'; // necessary sempre true
    return `${activeCount}/${totalCount} attivi`;
  };

  const getStatusColor = () => {
    if (!consentGiven) return 'destructive';
    if (canUseAnalytics() || canUseMarketing()) return 'default';
    return 'secondary';
  };

  // Variant minimal - solo link
  if (variant === 'minimal') {
    return (
      <button
        onClick={togglePreferences}
        className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
        aria-label="Gestisci preferenze cookie"
      >
        Cookie
      </button>
    );
  }

  // Variant inline - status e pulsanti
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3">
        {showStatus && (
          <div className="flex items-center gap-2">
            <Cookie className="h-4 w-4 text-muted-foreground" />
            <Badge variant={getStatusColor()} className="text-xs">
              {getConsentStatus()}
            </Badge>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={togglePreferences} 
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            Gestisci
          </Button>
          
          {consentGiven && (
            <Button 
              onClick={resetConsent} 
              variant="ghost" 
              size="sm"
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Variant dropdown (default)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Cookie className="h-4 w-4" />
          {showStatus && (
            <Badge variant={getStatusColor()} className="text-xs">
              {getConsentStatus()}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3 border-b">
          <h4 className="font-semibold text-sm mb-1">Stato Cookie</h4>
          <p className="text-xs text-muted-foreground">
            {consentGiven 
              ? `Ultimo aggiornamento: ${lastUpdated ? new Date(lastUpdated).toLocaleDateString('it-IT') : 'N/A'}`
              : 'Consensi non ancora configurati'
            }
          </p>
        </div>

        <div className="p-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>Cookie Necessari</span>
            <Check className="h-3 w-3 text-green-600" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Cookie Analytics</span>
            {canUseAnalytics() ? 
              <Check className="h-3 w-3 text-green-600" /> : 
              <X className="h-3 w-3 text-gray-400" />
            }
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Cookie Marketing</span>
            {canUseMarketing() ? 
              <Check className="h-3 w-3 text-green-600" /> : 
              <X className="h-3 w-3 text-gray-400" />
            }
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Cookie Funzionali</span>
            {consent.functional ? 
              <Check className="h-3 w-3 text-green-600" /> : 
              <X className="h-3 w-3 text-gray-400" />
            }
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={togglePreferences}>
          <Settings className="h-4 w-4 mr-2" />
          Gestisci Preferenze
        </DropdownMenuItem>

        {consentGiven && (
          <DropdownMenuItem onClick={resetConsent} className="text-destructive">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Consensi
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/cookie-policy" target="_blank" className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Cookie Policy
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Componente footer per link cookie rapidi
 */
export function CookieFooterLinks() {
  return (
    <div className="flex items-center gap-4 text-sm">
      <CookieConsentManager variant="minimal" />
      <Link 
        href="/cookie-policy" 
        className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
      >
        Cookie Policy
      </Link>
    </div>
  );
}

/**
 * Hook per verificare se mostrare avvisi di consenso
 */
export function useCookieWarnings() {
  const { consentGiven, canUseAnalytics, canUseMarketing } = useCookieConsent();
  
  return {
    shouldWarnAnalytics: consentGiven && !canUseAnalytics(),
    shouldWarnMarketing: consentGiven && !canUseMarketing(),
    hasAnyConsent: consentGiven,
    warnings: {
      analytics: 'Analytics disabilitati - funzionalità limitate',
      marketing: 'Marketing disabilitato - personalizzazione limitata',
      noConsent: 'Consensi cookie non configurati - alcune funzionalità potrebbero non funzionare'
    }
  };
}