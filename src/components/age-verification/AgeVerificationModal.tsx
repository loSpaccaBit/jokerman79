"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAgeVerification } from '@/contexts/AgeVerificationContext';

/**
 * Modal di verifica età con design brandizzato per Jokerman79
 * Conforme alla normativa italiana sui giochi ADM
 */
export function AgeVerificationModal() {
  const { showModal, verifyAge, rejectAge } = useAgeVerification();

  return (
    <Dialog open={showModal} onOpenChange={() => { }}>
      <DialogContent
        className="sm:max-w-md w-[95vw] max-h-[95vh] overflow-y-auto p-0 border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5"
        hideCloseButton
      >
        {/* Header con pattern casino-style */}
        <div
          className="relative p-6 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground overflow-hidden"
          style={{
            backgroundImage: `url('/assets/patterns/casino-pattern.svg')`,
            backgroundSize: '120px 120px'
          }}
        >
          <div className="relative z-10">
            <DialogHeader className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Shield className="h-8 w-8" />
                </div>
              </div>
              <DialogTitle className="font-tanker text-2xl font-bold text-white drop-shadow-md">
                Verifica dell'Età
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/90 font-medium">
                Accesso riservato ai maggiorenni
              </DialogDescription>
            </DialogHeader>

            {/* Badge ADM */}
            <div className="flex justify-center mt-4">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
              >
                <Shield className="h-3 w-3 mr-1" />
                Conforme ADM
              </Badge>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Alert */}
          <Alert className="border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive font-medium">
              <strong>Attenzione:</strong> Il gioco può causare dipendenza patologica.
              È vietato ai minori di 18 anni.
            </AlertDescription>
          </Alert>

          {/* Main Question Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="font-tanker text-xl">
                Conferma di aver compiuto 18 anni
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Per accedere al sito è necessario essere maggiorenni.
                La tua età verrà verificata secondo le normative vigenti.
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button
                  onClick={rejectAge}
                  variant="outline"
                  className="font-tanker border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                >
                  Ho meno di 18 anni
                </Button>
                <Button
                  onClick={verifyAge}
                  className="font-tanker bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold"
                >
                  Ho più di 18 anni
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Information Cards */}
          <div className="grid gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <h4 className="font-tanker font-semibold mb-2 text-primary">
                  🎰 Gioco Responsabile
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ricorda di giocare sempre con moderazione.
                  Stabilisci dei limiti di tempo e denaro prima di iniziare.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <h4 className="font-tanker font-semibold mb-2 text-primary">
                  📞 Hai bisogno di aiuto?
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Se pensi di avere problemi con il gioco, contatta:
                </p>
                <div className="space-y-2">
                  <a
                    href="tel:800558822"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <span>📞 800.558.822</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://www.giocoresponsabile.it"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <span>🌐 www.giocoresponsabile.it</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Legal */}
          <div className="text-center space-y-2 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Continuando accetti i nostri{' '}
              <a href="/termini" className="text-primary hover:underline">
                Termini di Servizio
              </a>{' '}
              e l'{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Informativa Privacy
              </a>
            </p>
            <div className="flex justify-center">
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Licenza ADM • Gioco Sicuro
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AgeVerificationModal;
