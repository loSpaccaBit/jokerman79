"use client"

/**
 * GDPR Cookie Consent Banner
 * Banner completo per gestione consensi cookie conforme GDPR
 */

import React, { useState } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { ConsentSettings, COOKIE_CATEGORIES, DEFAULT_BANNER_TEXTS } from '@/types/cookie-consent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Cookie, Shield, BarChart3, Target, Settings2, ExternalLink } from 'lucide-react';

interface CookieConsentBannerProps {
  position?: 'bottom' | 'top';
  theme?: 'light' | 'dark' | 'auto';
  compact?: boolean;
}

export function CookieConsentBanner({ 
  position = 'bottom', 
  theme = 'auto',
  compact = false 
}: CookieConsentBannerProps) {
  const {
    showBanner,
    showPreferences,
    consent,
    acceptAll,
    rejectNonEssential,
    updateConsent,
    dismissBanner,
    togglePreferences
  } = useCookieConsent();

  const [localConsent, setLocalConsent] = useState<ConsentSettings>(consent);

  if (!showBanner) return null;

  const handleCategoryToggle = (category: keyof ConsentSettings, enabled: boolean) => {
    if (category === 'necessary') return; // Non modificabile
    
    setLocalConsent(prev => ({
      ...prev,
      [category]: enabled
    }));
  };

  const handleSavePreferences = () => {
    updateConsent(localConsent);
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'necessary': return <Shield className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'marketing': return <Target className="h-4 w-4" />;
      case 'functional': return <Settings2 className="h-4 w-4" />;
      default: return <Cookie className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (required: boolean, enabled: boolean) => {
    if (required) return 'default';
    return enabled ? 'default' : 'secondary';
  };

  // Banner principale
  if (!showPreferences) {
    return (
      <div 
        className={`fixed inset-x-0 z-50 mx-4 ${position === 'bottom' ? 'bottom-4' : 'top-4'}`}
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
      >
        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 id="cookie-banner-title" className="text-lg font-semibold mb-2">
                    {DEFAULT_BANNER_TEXTS.title}
                  </h2>
                  
                  {!compact && (
                    <p id="cookie-banner-description" className="text-sm text-muted-foreground">
                      {DEFAULT_BANNER_TEXTS.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    onClick={acceptAll}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    aria-label="Accetta tutti i cookie inclusi quelli per analytics e marketing"
                  >
                    {DEFAULT_BANNER_TEXTS.acceptAll}
                  </Button>
                  
                  <Button 
                    onClick={rejectNonEssential}
                    variant="outline"
                    aria-label="Rifiuta cookie non necessari, mantieni solo quelli essenziali"
                  >
                    {DEFAULT_BANNER_TEXTS.rejectAll}
                  </Button>
                  
                  <Button 
                    onClick={togglePreferences}
                    variant="ghost"
                    aria-label="Apri le impostazioni dettagliate per personalizzare i consensi"
                  >
                    {DEFAULT_BANNER_TEXTS.customize}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Vedi la nostra{' '}
                  <button 
                    onClick={() => window.open('/cookie-policy', '_blank')}
                    className="underline hover:no-underline text-primary"
                    aria-label="Apri Cookie Policy in nuova finestra"
                  >
                    Cookie Policy <ExternalLink className="inline h-3 w-3" />
                  </button>
                  {' '}per maggiori dettagli.
                </div>
              </div>

              <Button
                onClick={dismissBanner}
                variant="ghost"
                size="sm"
                className="flex-shrink-0"
                aria-label="Chiudi banner senza modificare le impostazioni"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Modal delle preferenze dettagliate
  return (
    <Dialog open={showPreferences} onOpenChange={togglePreferences}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Gestisci Preferenze Cookie
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Utilizza i controlli sottostanti per gestire i tipi di cookie che desideri 
              accettare sul nostro sito. Puoi modificare queste impostazioni in qualsiasi momento.
            </div>

            {COOKIE_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(category.id)}
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <Badge 
                        variant={getBadgeVariant(category.required, localConsent[category.id as keyof ConsentSettings])}
                        className="text-xs"
                      >
                        {category.required ? 'Sempre Attivo' : 
                         localConsent[category.id as keyof ConsentSettings] ? 'Attivo' : 'Disattivo'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Switch
                    checked={localConsent[category.id as keyof ConsentSettings]}
                    onCheckedChange={(checked) => handleCategoryToggle(category.id as keyof ConsentSettings, checked)}
                    disabled={category.required}
                    aria-label={`${category.required ? 'Cookie necessari sempre attivi' : `Attiva/disattiva ${category.name}`}`}
                  />
                </div>

                <p className="text-sm text-muted-foreground pl-7">
                  {category.description}
                </p>

                {category.cookies.length > 0 && (
                  <div className="pl-7">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-primary hover:underline">
                        Vedi cookie ({category.cookies.length})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {category.cookies.map((cookie) => (
                          <div key={cookie.name} className="bg-muted/50 p-2 rounded text-xs">
                            <div className="font-medium">{cookie.name}</div>
                            <div className="text-muted-foreground">{cookie.description}</div>
                            <div className="text-muted-foreground">
                              <strong>Durata:</strong> {cookie.duration} | 
                              <strong> Provider:</strong> {cookie.provider}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}

                <Separator />
              </div>
            ))}

            <div className="bg-muted/30 p-4 rounded-lg text-xs text-muted-foreground">
              <strong>Informazioni GDPR:</strong> Ai sensi del GDPR, hai il diritto di 
              accedere, rettificare, cancellare i tuoi dati personali e revocare il consenso 
              in qualsiasi momento. Puoi esercitare questi diritti contattandoci o 
              modificando le tue preferenze qui.
            </div>
          </div>
        </ScrollArea>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            onClick={handleSavePreferences}
            className="flex-1"
            aria-label="Salva le preferenze cookie selezionate"
          >
            {DEFAULT_BANNER_TEXTS.save}
          </Button>
          
          <Button 
            onClick={acceptAll}
            variant="outline"
            className="flex-1"
            aria-label="Accetta tutti i cookie"
          >
            {DEFAULT_BANNER_TEXTS.acceptAll}
          </Button>
          
          <Button 
            onClick={rejectNonEssential}
            variant="outline"
            className="flex-1"
            aria-label="Mantieni solo cookie necessari"
          >
            Solo Necessari
          </Button>
        </div>

        <div className="text-center">
          <button 
            onClick={() => window.open('/cookie-policy', '_blank')}
            className="text-xs text-primary hover:underline"
            aria-label="Leggi Cookie Policy completa"
          >
            Leggi Cookie Policy Completa <ExternalLink className="inline h-3 w-3" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Componente per mostrare lo stato attuale dei consensi (per debugging)
 */
export function CookieConsentStatus() {
  const { consent, consentGiven, lastUpdated } = useCookieConsent();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-3 text-xs shadow-lg max-w-xs">
      <div className="font-semibold mb-2">Cookie Consent Status</div>
      <div className="space-y-1">
        <div>Consenso dato: {consentGiven ? '✅' : '❌'}</div>
        <div>Necessari: ✅</div>
        <div>Analytics: {consent.analytics ? '✅' : '❌'}</div>
        <div>Marketing: {consent.marketing ? '✅' : '❌'}</div>
        <div>Funzionali: {consent.functional ? '✅' : '❌'}</div>
        {lastUpdated && (
          <div className="text-muted-foreground">
            Aggiornato: {new Date(lastUpdated).toLocaleString('it-IT')}
          </div>
        )}
      </div>
    </div>
  );
}