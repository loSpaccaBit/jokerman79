/**
 * Age Restricted Page - Legal Compliance
 * Pagina per utenti minorenni secondo normative italiane
 */

import React from 'react';
import type { Metadata } from 'next';
import { AlertTriangle, Home, ExternalLink, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Accesso Riservato ai Maggiorenni',
  description: 'Questa piattaforma è riservata esclusivamente ai maggiorenni in conformità alla normativa italiana.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AgeRestrictedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-red-950 dark:via-orange-950 dark:to-amber-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-2 border-red-200 dark:border-red-800 shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Accesso Non Consentito
            </CardTitle>
            
            <p className="text-gray-600 dark:text-gray-400">
              Spiacenti, questa piattaforma è riservata ai maggiorenni
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">
                    Normativa Italiana sul Gioco d&apos;Azzardo
                  </h3>
                  <p className="text-red-700 dark:text-red-300 leading-relaxed mb-4">
                    L&apos;accesso ai contenuti relativi al gioco d&apos;azzardo è riservato 
                    esclusivamente ai soggetti maggiorenni (18 anni) in conformità alla 
                    normativa italiana vigente.
                  </p>
                  <p className="text-red-700 dark:text-red-300 leading-relaxed">
                    Questa restrizione è necessaria per garantire la protezione dei minori 
                    e il rispetto delle leggi nazionali.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Informazioni sui Rischi
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Il gioco d&apos;azzardo può causare dipendenza. 
                    Gioca responsabilmente.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                  >
                    <a 
                      href="https://www.giocoproblemi.it" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Aiuto e Supporto
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Contenuti Alternativi
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Esplora contenuti educativi e informativi 
                    adatti alla tua età.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
                  >
                    <a 
                      href="https://www.educazione-digitale.it" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Educazione Digitale
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Se hai compiuto 18 anni, puoi tornare alla homepage e 
                ripetere la verifica dell&apos;età.
              </p>
              
              <Button asChild className="bg-gray-600 hover:bg-gray-700 text-white">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Torna alla Homepage
                </Link>
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Questa pagina è stata implementata in conformità alla normativa italiana 
                sui giochi e alle direttive europee sulla protezione dei minori online.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}