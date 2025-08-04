/**
 * Cookie Policy Page - GDPR Compliant
 * Pagina completa della Cookie Policy per compliance GDPR
 */

import { Metadata } from 'next';
import { COOKIE_CATEGORIES, CookieDefinition } from '@/types/cookie-consent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cookie, Shield, BarChart3, Target, Settings2, Mail, Calendar, Globe } from 'lucide-react';
import Link from 'next/link';
import { CookiePreferencesButton } from '@/components/cookie-consent/CookiePreferencesButton';

export const metadata: Metadata = {
  title: 'Cookie Policy - Jokerman79',
  description: 'Informazioni complete sui cookie utilizzati da Jokerman79, come li utilizziamo e come gestire le tue preferenze. Conforme GDPR.',
  robots: {
    index: true,
    follow: true,
  },
};

function getCategoryIcon(categoryId: string) {
  switch (categoryId) {
    case 'necessary': return <Shield className="h-5 w-5 text-green-600" />;
    case 'analytics': return <BarChart3 className="h-5 w-5 text-blue-600" />;
    case 'marketing': return <Target className="h-5 w-5 text-purple-600" />;
    case 'functional': return <Settings2 className="h-5 w-5 text-orange-600" />;
    default: return <Cookie className="h-5 w-5" />;
  }
}

function CookieTable({ cookies }: { cookies: CookieDefinition[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome Cookie</TableHead>
            <TableHead>Descrizione</TableHead>
            <TableHead>Finalità</TableHead>
            <TableHead>Durata</TableHead>
            <TableHead>Provider</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cookies.map((cookie) => (
            <TableRow key={cookie.name}>
              <TableCell className="font-mono text-sm">{cookie.name}</TableCell>
              <TableCell className="text-sm">{cookie.description}</TableCell>
              <TableCell className="text-sm">{cookie.purpose}</TableCell>
              <TableCell className="text-sm">{cookie.duration}</TableCell>
              <TableCell className="text-sm">{cookie.provider}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function CookiePolicyPage() {
  const lastUpdated = new Date('2024-01-15').toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Cookie className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Informazioni complete sui cookie utilizzati da Jokerman79 e come gestire le tue preferenze
        </p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Ultimo aggiornamento: {lastUpdated}
          </div>
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            Valido per: Italia e UE
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="font-semibold mb-1">Gestisci le tue preferenze</h2>
              <p className="text-sm text-muted-foreground">
                Puoi modificare i tuoi consensi cookie in qualsiasi momento
              </p>
            </div>
            <div className="flex gap-3">
              <CookiePreferencesButton />
              <Button variant="outline" asChild>
                <Link href="#contatti">Contatti</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cosa sono i cookie */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cosa sono i Cookie?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo 
            (computer, tablet o mobile) quando visiti un sito web. Servono a far funzionare 
            il sito web in modo efficiente e a fornire informazioni ai proprietari del sito.
          </p>
          <p>
            <strong>Jokerman79</strong> utilizza cookie per migliorare la tua esperienza di navigazione, 
            comprendere come utilizzi il nostro sito e personalizzare i contenuti. Rispettiamo 
            la tua privacy e ci impegniamo a essere trasparenti su come utilizziamo i cookie.
          </p>
        </CardContent>
      </Card>

      {/* Tipi di cookie utilizzati */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold">Cookie Utilizzati da Jokerman79</h2>
        
        {COOKIE_CATEGORIES.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getCategoryIcon(category.id)}
                {category.name}
                <Badge variant={category.required ? 'default' : 'secondary'}>
                  {category.required ? 'Sempre Attivo' : 'Opzionale'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{category.description}</p>
              
              {category.required && (
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Nota Legale:</strong> Questi cookie sono strettamente necessari 
                    per il funzionamento del sito web e non possono essere disabilitati. 
                    Non richiedono consenso secondo l&apos;Art. 6(1)(f) GDPR.
                  </p>
                </div>
              )}

              {category.cookies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Cookie in questa categoria:</h4>
                  <CookieTable cookies={category.cookies} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Base Legale GDPR */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Base Legale (GDPR)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Cookie Necessari</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Base legale:</strong> Art. 6(1)(f) GDPR - Interesse legittimo<br />
                <strong>Interesse:</strong> Funzionamento essenziale del sito web
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Cookie Analytics/Marketing</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Base legale:</strong> Art. 6(1)(a) GDPR - Consenso<br />
                <strong>Requisiti:</strong> Consenso libero, specifico e informato
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Conformità ePrivacy Directive</h4>
            <p className="text-sm">
              In conformità alla Direttiva ePrivacy (2002/58/CE) e al D.Lgs. 196/2003 
              (Codice Privacy italiano), raccogliamo il consenso esplicito per cookie 
              non strettamente necessari prima di memorizzarli sul tuo dispositivo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* I tuoi diritti */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>I Tuoi Diritti GDPR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Diritto di Accesso (Art. 15)</h4>
                <p className="text-sm text-muted-foreground">
                  Puoi richiedere informazioni sui dati personali che trattiamo
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Diritto di Rettifica (Art. 16)</h4>
                <p className="text-sm text-muted-foreground">
                  Puoi richiedere la correzione di dati inesatti
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Diritto alla Cancellazione (Art. 17)</h4>
                <p className="text-sm text-muted-foreground">
                  Puoi richiedere la cancellazione dei tuoi dati personali
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Diritto di Opposizione (Art. 21)</h4>
                <p className="text-sm text-muted-foreground">
                  Puoi opporti al trattamento per finalità di marketing
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Revoca del Consenso (Art. 7)</h4>
                <p className="text-sm text-muted-foreground">
                  Puoi revocare il consenso in qualsiasi momento
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Portabilità dei Dati (Art. 20)</h4>
                <p className="text-sm text-muted-foreground">
                  Puoi richiedere i tuoi dati in formato leggibile
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Come gestire i cookie */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Come Gestire i Cookie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Attraverso il nostro sito:</h4>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Utilizza il banner cookie quando richiesto</li>
            <li>Accedi alle impostazioni cookie dal footer del sito</li>
            <li>Modifica le preferenze in qualsiasi momento</li>
          </ul>

          <h4 className="font-semibold mt-6">Attraverso il browser:</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie</p>
              <p><strong>Firefox:</strong> Impostazioni → Privacy e sicurezza → Cookie</p>
            </div>
            <div>
              <p><strong>Safari:</strong> Preferenze → Privacy → Gestisci dati siti web</p>
              <p><strong>Edge:</strong> Impostazioni → Cookie e autorizzazioni sito</p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg mt-4">
            <p className="text-sm">
              <strong>Attenzione:</strong> Disabilitare tutti i cookie potrebbe compromettere 
              il funzionamento di alcune parti del sito web.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conformità Gaming Italia */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Conformità Normative Gaming (Italia)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Jokerman79</strong>, in quanto piattaforma di demo slot, rispetta:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>D.Lgs. 88/2011:</strong> Normative sui giochi pubblici in Italia</li>
            <li><strong>Regolamento ADM:</strong> Autorità Dogane e Monopoli per il gaming</li>
            <li><strong>Art. 7 D.Lgs. 79/2021:</strong> Implementazione GDPR in Italia</li>
            <li><strong>Codice del Consumo:</strong> Tutela consumatori nel gaming online</li>
          </ul>
          
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Gioco Responsabile:</strong> Utilizziamo cookie analytics per monitorare 
              pattern di utilizzo e promuovere pratiche di gioco responsabile conformi alle 
              normative italiane.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contatti */}
      <Card id="contatti">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contatti e Reclami
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Per esercitare i tuoi diritti GDPR, fare reclami o richiedere informazioni 
            sui cookie, contattaci:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold">Titolare del Trattamento</h4>
              <p className="text-sm text-muted-foreground">
                Jokerman79<br />
                Email: privacy@jokerman79.com<br />
                Tempo di risposta: 30 giorni
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Autorità di Controllo</h4>
              <p className="text-sm text-muted-foreground">
                Garante per la Protezione dei Dati Personali<br />
                Website: garanteprivacy.it<br />
                Tel: +39 06 69677.1
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Reclami UE</h4>
            <p className="text-sm">
              Hai il diritto di presentare reclamo all&apos;autorità di controllo dello Stato 
              membro UE di tua residenza se ritieni che il trattamento dei tuoi dati violi il GDPR.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer legale */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Questa Cookie Policy è soggetta a modifiche. Le modifiche sostanziali 
          verranno notificate attraverso il nostro sito web.
        </p>
        <p className="mt-2">
          <Link href="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          {' • '}
          <Link href="/terms" className="text-primary hover:underline">
            Termini di Servizio
          </Link>
          {' • '}
          <Link href="/" className="text-primary hover:underline">
            Torna alla Home
          </Link>
        </p>
      </div>
    </div>
  );
}