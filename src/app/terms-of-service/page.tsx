/**
 * Terms of Service Page - GDPR Compliant
 * Termini di Servizio completi per la piattaforma gaming Jokerman79
 * Conformi a GDPR, Codice del Consumo italiano e normative gaming
 */

import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Scale,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  Gavel,
  Globe,
  Clock,
  Mail,
  Calendar,
  FileText,
  UserCheck,
  Ban,
  Eye,
  Zap,
  Settings,
  BookOpen,
  Award,
  Phone,
  Heart,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termini di Servizio - Jokerman79 | Condizioni Uso GDPR',
  description: 'Termini di Servizio completi per Jokerman79. Condizioni d&apos;uso conformi GDPR, normative gaming italiane e tutela consumatori.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Termini di Servizio - Jokerman79',
    description: 'Condizioni d&apos;uso complete e conformi GDPR per la piattaforma gaming Jokerman79',
    type: 'website',
  },
};

// Definizione delle attività consentite
const PERMITTED_ACTIVITIES = [
  {
    id: 'slot-demos',
    name: 'Slot Machine Demo',
    description: 'Utilizzo gratuito delle demo slot senza denaro reale',
    icon: <Zap className="h-5 w-5 text-green-600" />,
    restrictions: ['Solo modalità demo', 'Nessuna vincita reale', 'Età minima 18 anni']
  },
  {
    id: 'live-stats',
    name: 'Statistiche Live',
    description: 'Visualizzazione statistiche live dei tavoli casinò',
    icon: <Eye className="h-5 w-5 text-blue-600" />,
    restrictions: ['Solo visualizzazione', 'Dati informativi', 'Non costituiscono consigli']
  },
  {
    id: 'content-browsing',
    name: 'Navigazione Contenuti',
    description: 'Accesso a recensioni, blog e informazioni sui provider',
    icon: <BookOpen className="h-5 w-5 text-purple-600" />,
    restrictions: ['Contenuto informativo', 'Non promozionale', 'Scopo educativo']
  }
];

// Attività vietate
const PROHIBITED_ACTIVITIES = [
  {
    category: 'Sicurezza',
    icon: <Shield className="h-5 w-5 text-red-600" />,
    activities: [
      'Tentativi di hacking o reverse engineering',
      'Utilizzo di bot, script automatici o software di automazione',
      'Bypass delle misure di sicurezza o autenticazione',
      'Distribuzione di malware o codice dannoso',
      'Violazione dei sistemi di protezione dati'
    ]
  },
  {
    category: 'Contenuti',
    icon: <FileText className="h-5 w-5 text-orange-600" />,
    activities: [
      'Pubblicazione di contenuti diffamatori, offensivi o illegali',
      'Violazione dei diritti di proprietà intellettuale',
      'Spam, pubblicità non autorizzata o comunicazioni massive',
      'Contenuti che promuovono attività illegali',
      'False informazioni o recensioni fraudolente'
    ]
  },
  {
    category: 'Gaming',
    icon: <Ban className="h-5 w-5 text-purple-600" />,
    activities: [
      'Utilizzo della piattaforma per gioco d\'azzardo con denaro reale',
      'Tentativi di manipolazione delle statistiche live',
      'Uso commerciale non autorizzato dei dati gaming',
      'Violazione delle condizioni dei provider (Evolution, Pragmatic)',
      'Accesso da giurisdizioni dove il gaming online è vietato'
    ]
  },
  {
    category: 'Comportamentali',
    icon: <Users className="h-5 w-5 text-indigo-600" />,
    activities: [
      'Molestie, minacce o comportamenti abusivi',
      'Impersonificazione di terzi o identità false',
      'Utilizzo multiplo di account per aggirare limitazioni',
      'Condivisione non autorizzata di dati personali di terzi',
      'Interferenza con il normale funzionamento del servizio'
    ]
  }
];

// Responsabilità e limitazioni
const LIABILITY_LIMITATIONS = [
  {
    type: 'Contenuti Demo',
    description: 'Le slot demo sono fornite "as is" senza garanzie di funzionamento',
    legal_basis: 'Art. 1229 Codice Civile - Limitazione responsabilità'
  },
  {
    type: 'Statistiche Live',
    description: 'Dati live informativi, non garantiamo accuratezza al 100%',
    legal_basis: 'Clausola di esclusione responsabilità per dati di terzi'
  },
  {
    type: 'Interruzioni Servizio',
    description: 'Manutenzioni programmate e impreviste non comportano risarcimenti',
    legal_basis: 'Forza maggiore e caso fortuito ex Art. 1218 CC'
  },
  {
    type: 'Link Esterni',
    description: 'Non siamo responsabili per contenuti di siti linkati',
    legal_basis: 'Principio di autonomia siti web esterni'
  }
];

// Procedura risoluzione controversie
const DISPUTE_RESOLUTION_STEPS = [
  {
    step: 1,
    title: 'Contatto Diretto',
    description: 'Prima fase: contatto via email per risoluzione amichevole',
    timeframe: '30 giorni',
    contact: 'disputes@jokerman79.com'
  },
  {
    step: 2,
    title: 'Mediazione',
    description: 'Mediazione presso organismo ADR competente',
    timeframe: '60 giorni',
    contact: 'Camera di Commercio territorialmente competente'
  },
  {
    step: 3,
    title: 'Arbitrato/Tribunale',
    description: 'Arbitrato o giurisdizione ordinaria italiana',
    timeframe: 'Secondo tempi processuali',
    contact: 'Foro di Roma (sede legale)'
  }
];

// Diritti consumatori
const CONSUMER_RIGHTS = [
  {
    right: 'Informazione',
    description: 'Diritto a informazioni chiare su servizi e condizioni',
    article: 'Art. 2, 5, 6 Codice del Consumo',
    how_to_exercise: 'Richiesta scritta via email'
  },
  {
    right: 'Reclamo',
    description: 'Diritto di presentare reclami per disservizi',
    article: 'Art. 2, Tit. II Codice del Consumo',
    how_to_exercise: 'Email o PEC con descrizione dettagliata'
  },
  {
    right: 'Risoluzione ADR',
    description: 'Accesso a procedure alternative di risoluzione controversie',
    article: 'D.Lgs. 130/2015 su ADR',
    how_to_exercise: 'Richiesta mediazione o arbitrato'
  },
  {
    right: 'Privacy/GDPR',
    description: 'Tutti i diritti GDPR su dati personali',
    article: 'Reg. UE 2016/679',
    how_to_exercise: 'Vedi Privacy Policy dedicata'
  }
];

export default function TermsOfServicePage() {
  const lastUpdated = new Date('2025-01-31').toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Scale className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Termini di Servizio</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Condizioni generali d&apos;uso per la piattaforma gaming Jokerman79.
          Conformi al GDPR, Codice del Consumo italiano e normative gaming nazionali.
        </p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Ultimo aggiornamento: {lastUpdated}
          </div>
          <div className="flex items-center gap-1">
            <Gavel className="h-4 w-4" />
            Conforme normative UE e italiane
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Navigazione Rapida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="#definizioni">Definizioni</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#accesso-servizio">Accesso</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#utilizzo-consentito">Uso</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#privacy-dati">Privacy</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#responsabilita">Responsabilità</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#gioco-responsabile">Gioco Responsabile</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#controversie">Controversie</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#contatti">Contatti</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 1. Oggetto e Definizioni */}
      <Card id="definizioni" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            1. Oggetto e Definizioni
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            I presenti Termini di Servizio disciplinano l&apos;accesso e l&apos;utilizzo della piattaforma
            <strong> Jokerman79</strong>, servizio di intrattenimento gaming che offre demo slot,
            statistiche live casinò e contenuti informativi sui provider gaming.
          </p>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Definizioni Principali:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><strong>Piattaforma:</strong> Il sito web Jokerman79 e tutti i suoi servizi</p>
                <p><strong>Utente:</strong> Qualsiasi persona che accede alla piattaforma</p>
                <p><strong>Demo Slot:</strong> Versioni gratuite di slot machine senza denaro reale</p>
                <p><strong>Statistiche Live:</strong> Dati in tempo reale sui tavoli casinò</p>
              </div>
              <div className="space-y-2">
                <p><strong>Provider:</strong> Fornitori gaming (Evolution Gaming, Pragmatic Play)</p>
                <p><strong>Contenuti:</strong> Tutti i materiali presenti sulla piattaforma</p>
                <p><strong>Servizi:</strong> Tutte le funzionalità offerte da Jokerman79</p>
                <p><strong>Account:</strong> Profilo utente (se applicabile)</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Importante - Natura del Servizio
            </h4>
            <p className="text-sm">
              <strong>Jokerman79 è una piattaforma puramente informativa e dimostrativa.</strong>
              Non offriamo gioco d&apos;azzardo con denaro reale, scommesse o servizi finanziari.
              Tutti i giochi sono in modalità demo gratuita per scopi di intrattenimento ed educativi.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Accesso al Servizio e Registrazione */}
      <Card id="accesso-servizio" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            2. Accesso al Servizio e Age Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Requisiti di Età - Maggiorenni
            </h4>
            <p className="text-sm">
              <strong>L&apos;accesso è riservato esclusivamente a utenti maggiorenni (18+ anni).</strong>
              Anche per contenuti demo, rispettiamo le normative gaming italiane e europee.
              L&apos;utilizzo da parte di minori è severamente vietato.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Modalità di Accesso:</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h5 className="font-medium">Accesso Libero:</h5>
                <ul className="space-y-1 text-sm">
                  <li>• Navigazione contenuti informativi</li>
                  <li>• Visualizzazione slot demo basic</li>
                  <li>• Accesso statistiche live pubbliche</li>
                  <li>• Lettura blog e recensioni</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium">Registrazione (Opzionale):</h5>
                <ul className="space-y-1 text-sm">
                  <li>• Personalizzazione preferenze</li>
                  <li>• Salvataggio statistiche personali</li>
                  <li>• Accesso contenuti premium</li>
                  <li>• Newsletter e aggiornamenti</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Processo di Verifica Età:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <strong>Autodichiarazione:</strong> Conferma di maggiore età all&apos;accesso
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <strong>Controlli Tecnici:</strong> Sistemi automatici di rilevamento
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <strong>Verifica Documenti:</strong> Richiesta documento se necessario
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            <strong>Base Legale:</strong> Art. 6(1)(c) GDPR - Obbligo legale (normative gaming italiane D.Lgs. 88/2011)
          </p>
        </CardContent>
      </Card>

      {/* 3. Utilizzo Consentito della Piattaforma */}
      <Card id="utilizzo-consentito" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            3. Utilizzo Consentito della Piattaforma
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>
            Jokerman79 può essere utilizzata per le seguenti attività lecite e conformi
            alle normative italiane ed europee:
          </p>

          <div className="grid gap-4">
            {PERMITTED_ACTIVITIES.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  {activity.icon}
                  <div className="flex-1">
                    <h4 className="font-semibold">{activity.name}</h4>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">Limitazioni e Condizioni:</h5>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    {activity.restrictions.map((restriction, index) => (
                      <li key={index}>{restriction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Finalità Educativa</h4>
            <p className="text-sm">
              L&apos;utilizzo della piattaforma è consentito per <strong>finalità educative, informative
                e di intrattenimento</strong>. Non promuoviamo il gioco d&apos;azzardo e forniamo
              sempre informazioni sul gioco responsabile.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Attività Vietate */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            4. Attività Vietate e Sanzioni
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>
            È severamente vietato utilizzare Jokerman79 per le seguenti attività,
            che comportano immediate sanzioni inclusa la sospensione dell&apos;accesso:
          </p>

          <div className="space-y-4">
            {PROHIBITED_ACTIVITIES.map((category) => (
              <Card key={category.category}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {category.icon}
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {category.activities.map((activity, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Sanzioni per Violazioni</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Violazioni Lievi:</strong> Avvertimento scritto e monitoraggio rafforzato</p>
              <p><strong>Violazioni Gravi:</strong> Sospensione temporanea dell&apos;accesso (7-30 giorni)</p>
              <p><strong>Violazioni Severe:</strong> Ban permanente e segnalazione alle autorità competenti</p>
              <p><strong>Attività Illegali:</strong> Denuncia immediata a Polizia Postale e autorità giudiziarie</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Privacy e Trattamento Dati GDPR */}
      <Card id="privacy-dati" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            5. Privacy e Trattamento Dati (GDPR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Il trattamento dei dati personali avviene in conformità al <strong>Regolamento UE 2016/679 (GDPR)</strong>
            e al <strong>D.Lgs. 196/2003</strong> come modificato dal <strong>D.Lgs. 101/2018</strong>.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Base Giuridica del Trattamento:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Art. 6(1)(b) GDPR:</strong> Esecuzione servizio richiesto
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Art. 6(1)(f) GDPR:</strong> Legittimo interesse (sicurezza, miglioramenti)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Art. 6(1)(a) GDPR:</strong> Consenso esplicito (analytics, marketing)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Art. 6(1)(c) GDPR:</strong> Obbligo legale (age verification, gaming compliance)
                  </div>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">I Tuoi Diritti GDPR:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <strong>Accesso:</strong> Ottenere copia dei tuoi dati (Art. 15)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Settings className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <strong>Rettifica:</strong> Correggere dati inesatti (Art. 16)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Ban className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <strong>Cancellazione:</strong> Diritto all&apos;oblio (Art. 17)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Portabilità:</strong> Trasferire i dati (Art. 20)
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Privacy by Design</h4>
            <p className="text-sm">
              Implementiamo <strong>privacy by design</strong> e <strong>privacy by default</strong>
              (Art. 25 GDPR): raccogliamo solo i dati strettamente necessari, implementiamo
              pseudonimizzazione, crittografia e cancellazione automatica.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Button asChild>
              <Link href="/privacy-policy" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Leggi la Privacy Policy Completa
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 6. Cookie e Tecnologie di Tracciamento */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            6. Cookie e Consenso Digitale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Utilizziamo cookie e tecnologie simili in conformità alla <strong>Direttiva ePrivacy</strong>
            (2002/58/CE) e al <strong>GDPR</strong>. Il consenso è gestito attraverso un sistema
            conforme alle linee guida del Garante Privacy italiano.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-green-700">Cookie Necessari</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Indispensabili per il funzionamento del sito
              </p>
              <ul className="text-xs space-y-1">
                <li>• Sessione utente</li>
                <li>• Sicurezza CSRF</li>
                <li>• Preferenze privacy</li>
                <li>• Stato consenso cookie</li>
              </ul>
              <Badge variant="default" className="mt-2">Sempre Attivi</Badge>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-700">Cookie Analytics</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Misurazione audience e performance
              </p>
              <ul className="text-xs space-y-1">
                <li>• Google Analytics</li>
                <li>• Web Vitals</li>
                <li>• Heatmaps comportamento</li>
                <li>• Metriche conversione</li>
              </ul>
              <Badge variant="secondary" className="mt-2">Consenso Richiesto</Badge>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-purple-700">Cookie Marketing</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Personalizzazione e targeting
              </p>
              <ul className="text-xs space-y-1">
                <li>• Personalizzazione contenuti</li>
                <li>• Remarketing (se attivo)</li>
                <li>• Social media integration</li>
                <li>• Campagne pubblicitarie</li>
              </ul>
              <Badge variant="outline" className="mt-2">Consenso Opzionale</Badge>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Gestione Consenso</h4>
            <p className="text-sm">
              Puoi modificare le tue preferenze cookie in qualsiasi momento attraverso
              il pannello di gestione consenso presente nel footer del sito.
              Il consenso può essere revocato liberamente senza conseguenze.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Button asChild variant="outline">
              <Link href="/cookie-policy" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Cookie Policy Dettagliata
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 7. Proprietà Intellettuale */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            7. Proprietà Intellettuale e Diritti d&apos;Autore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Tutti i contenuti, design, software e materiali presenti su Jokerman79 sono
            protetti da diritti di proprietà intellettuale secondo la normativa italiana
            ed europea (Legge 633/1941, Direttive UE copyright).
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Contenuti di Nostra Proprietà:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-gold-600 mt-0.5" />
                  <div>
                    <strong>Design e Layout:</strong> Interfaccia grafica e user experience
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-gold-600 mt-0.5" />
                  <div>
                    <strong>Contenuti Editoriali:</strong> Recensioni, blog, descrizioni
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-gold-600 mt-0.5" />
                  <div>
                    <strong>Software e Codice:</strong> Piattaforma tecnologica
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-gold-600 mt-0.5" />
                  <div>
                    <strong>Marchio Jokerman79:</strong> Nome, logo e identità visiva
                  </div>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Contenuti di Terzi:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <strong>Slot Demo:</strong> Proprietà dei rispettivi provider
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <strong>Statistiche Live:</strong> Dati Evolution Gaming, Pragmatic Play
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <strong>Media Partner:</strong> Loghi e materiali affiliati
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <strong>Font e Icone:</strong> Librerie terze (con licenza)
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Uso Non Autorizzato</h4>
            <p className="text-sm">
              È <strong>severamente vietato</strong> copiare, riprodurre, distribuire o modificare
              i contenuti senza autorizzazione scritta. Le violazioni sono perseguite secondo
              gli <strong>Art. 171-174 L. 633/1941</strong> e comportano sanzioni civili e penali.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Uso Consentito</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Link e Citazioni:</strong> Consentiti con attribuzione corretta</p>
              <p><strong>Screenshot Personali:</strong> Per uso privato non commerciale</p>
              <p><strong>Condivisione Social:</strong> Tramite pulsanti ufficiali del sito</p>
              <p><strong>Fair Use Giornalistico:</strong> Secondo normative copyright</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 8. Responsabilità e Limitazioni */}
      <Card id="responsabilita" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            8. Limitazioni di Responsabilità
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            In conformità agli <strong>Art. 1229, 1218 Codice Civile</strong> e alla normativa
            europea sui servizi digitali, definiamo i limiti di responsabilità per l'uso di Jokerman79.
          </p>

          <div className="space-y-4">
            {LIABILITY_LIMITATIONS.map((limitation, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{limitation.type}</h4>
                <p className="text-sm text-muted-foreground mb-2">{limitation.description}</p>
                <Badge variant="outline" className="text-xs">{limitation.legal_basis}</Badge>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Esclusioni di Responsabilità</h4>
            <div className="space-y-1 text-sm">
              <p>• <strong>Danni Indiretti:</strong> Perdite di profitto, danni consequenziali</p>
              <p>• <strong>Interruzioni:</strong> Manutenzione, problemi tecnici, force majeure</p>
              <p>• <strong>Contenuti Terzi:</strong> Accuratezza dati provider esterni</p>
              <p>• <strong>Decisioni Utente:</strong> Conseguenze di scelte gaming personali</p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Cosa Garantiamo</h4>
            <div className="space-y-1 text-sm">
              <p>• <strong>Sicurezza Dati:</strong> Protezione secondo standard GDPR</p>
              <p>• <strong>Uptime:</strong> Massimo impegno per disponibilità servizio</p>
              <p>• <strong>Supporto:</strong> Assistenza per problemi tecnici</p>
              <p>• <strong>Trasparenza:</strong> Informazioni chiare su servizi offerti</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Le limitazioni non si applicano a danni derivanti da dolo,
            colpa grave o violazioni di diritti fondamentali della persona.
          </p>
        </CardContent>
      </Card>

      {/* 9. Gioco Responsabile */}
      <Card id="gioco-responsabile" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            9. Politiche Gioco Responsabile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Sebbene Jokerman79 offra solo contenuti demo senza denaro reale, promuoviamo
            attivamente il <strong>gioco responsabile</strong> in linea con le normative
            <strong>ADM</strong> e le migliori pratiche europee.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Misure Preventive:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Age Verification:</strong> Controllo rigoroso maggiore età
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Messaggi Educativi:</strong> Avvisi su rischi gaming
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Tempo Limite:</strong> Suggerimenti per pause regolari
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Reality Check:</strong> Promemoria durata sessione
                  </div>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Risorse di Supporto:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <strong>Telefono Verde ADM:</strong> 800 558 822
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <strong>Giocatori Anonimi:</strong> <a href="https://www.giocatorianonimiitalia.org" className="text-primary">Supporto GAI</a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>BeGambleAware:</strong> Risorse educative internazionali
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <strong>Supporto Diretto:</strong> responsible@jokerman79.com
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Segnali di Allarme</h4>
            <p className="text-sm mb-2">Interrompi l'utilizzo e cerca aiuto se noti:</p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Pensiero costante al gaming anche in demo</li>
              <li>Utilizzo della piattaforma per evitare problemi personali</li>
              <li>Tempo eccessivo dedicato anche a contenuti demo</li>
              <li>Interesse crescente verso gaming con denaro reale</li>
              <li>Nascondere il tempo trascorso sulla piattaforma</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Il Nostro Impegno</h4>
            <p className="text-sm">
              <strong>Jokerman79 si impegna a mantenere un ambiente sicuro</strong> che promuove
              intrattenimento responsabile. Collaboriamo con organizzazioni specializzate
              e implementiamo le migliori pratiche per la tutela degli utenti.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 10. Risoluzione Controversie */}
      <Card id="controversie" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            10. Risoluzione Controversie e Tutela Consumatori
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            In conformità al <strong>D.Lgs. 130/2015</strong> su ADR (Alternative Dispute Resolution)
            e al <strong>Codice del Consumo</strong>, offriamo diverse opzioni per la risoluzione
            di eventuali controversie.
          </p>

          <div className="space-y-4">
            <h4 className="font-semibold">Procedura Graduata di Risoluzione:</h4>
            {DISPUTE_RESOLUTION_STEPS.map((step) => (
              <div key={step.step} className="border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                  <Badge variant="outline">{step.step}</Badge>
                  <div className="flex-1">
                    <h5 className="font-semibold">{step.title}</h5>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <Badge variant="secondary">{step.timeframe}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Contatto:</strong> {step.contact}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Giurisdizione e Foro Competente</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Consumatori:</strong> Foro del consumatore o Roma (scelta del consumatore)</p>
              <p><strong>Utenti Business:</strong> Esclusivamente Tribunale di Roma</p>
              <p><strong>Legge Applicabile:</strong> Diritto italiano e normative UE</p>
              <p><strong>Lingua Processuale:</strong> Italiano</p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Diritti Consumatori</h4>
            <p className="text-sm">
              Come consumatore hai diritto a procedure ADR gratuite o a costo ridotto.
              Puoi anche rivolgerti alle <strong>Associazioni Consumatori</strong> riconosciute
              o utilizzare la piattaforma <strong>ODR</strong> della Commissione Europea.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 11. Diritti dei Consumatori */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            11. Diritti dei Consumatori (Codice del Consumo)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Come consumatore hai specifici diritti garantiti dal <strong>D.Lgs. 206/2005
              (Codice del Consumo)</strong> e dalle normative europee di tutela consumatori.
          </p>

          <div className="grid gap-4">
            {CONSUMER_RIGHTS.map((right, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">Diritto di {right.right}</h4>
                  <Badge variant="outline">{right.article}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{right.description}</p>
                <p className="text-xs">
                  <strong>Come esercitarlo:</strong> {right.how_to_exercise}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Pratiche Commerciali Scorrette</h4>
            <p className="text-sm">
              Jokerman79 si impegna a evitare qualsiasi pratica commerciale scorretta
              secondo gli <strong>Art. 20-27 Codice del Consumo</strong>. Segnala
              comportamenti sospetti a: <a href="mailto:consumer@jokerman79.com" className="text-primary">consumer@jokerman79.com</a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 12. Modifiche e Terminazione */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            12. Modifiche ai Termini e Terminazione Servizio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3">Modifiche ai Termini di Servizio:</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Notifica Preventiva</p>
                  <p className="text-sm text-muted-foreground">
                    30 giorni di preavviso per modifiche sostanziali via email o banner sito
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Diritto di Opposizione</p>
                  <p className="text-sm text-muted-foreground">
                    Puoi interrompere l'uso se non accetti le modifiche
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">Continuazione Uso = Accettazione</p>
                  <p className="text-sm text-muted-foreground">
                    L'uso dopo le modifiche implica accettazione
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Terminazione del Servizio:</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Da Parte dell&apos;Utente:</h5>
                <ul className="space-y-1 text-sm">
                  <li>• Cessazione immediata dell&apos;utilizzo</li>
                  <li>• Richiesta cancellazione dati personali</li>
                  <li>• Nessun preavviso richiesto</li>
                  <li>• Diritto rimborso (se applicabile)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Da Parte di Jokerman79:</h5>
                <ul className="space-y-1 text-sm">
                  <li>• 30 giorni preavviso (salvo gravi violazioni)</li>
                  <li>• Conservazione dati secondo retention</li>
                  <li>• Assistenza per recupero dati utente</li>
                  <li>• Comunicazione motivi terminazione</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Terminazione Immediata</h4>
            <p className="text-sm">
              In caso di <strong>violazioni gravi</strong> (attività illegali, minacce sicurezza,
              frodi) possiamo terminare immediatamente l'accesso senza preavviso,
              riservandoci il diritto di azioni legali.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 13. Contatti e Informazioni Legali */}
      <Card id="contatti" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            13. Contatti e Informazioni Legali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Jokerman79 - Dati Legali</h4>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <div className="space-y-1 text-sm">
                  <p><strong>Denominazione:</strong> Jokerman79</p>
                  <p><strong>Tipologia:</strong> Piattaforma Gaming Demo</p>
                  <p><strong>Settore:</strong> Intrattenimento Digitale</p>
                  <p><strong>Paese:</strong> Italia</p>
                  <p><strong>Giurisdizione:</strong> Diritto Italiano/UE</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contatti Specializzati</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <strong>Legale:</strong> <a href="mailto:legal@jokerman79.com" className="text-primary">legal@jokerman79.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <div>
                    <strong>Privacy:</strong> <a href="mailto:privacy@jokerman79.com" className="text-primary">privacy@jokerman79.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div>
                    <strong>Consumatori:</strong> <a href="mailto:consumer@jokerman79.com" className="text-primary">consumer@jokerman79.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-red-600" />
                  <div>
                    <strong>Gioco Responsabile:</strong> <a href="mailto:responsible@jokerman79.com" className="text-primary">responsible@jokerman79.com</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Autorità di Controllo e Organismi ADR</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold mb-2">Garante Privacy</h5>
                <div className="text-xs space-y-1">
                  <p>Piazza di Monte Citorio, 121</p>
                  <p>00186 Roma</p>
                  <p>Tel: +39 06 69677.1</p>
                  <p><a href="https://garanteprivacy.it" className="text-primary">garanteprivacy.it</a></p>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold mb-2">ADM - Agenzia Dogane</h5>
                <div className="text-xs space-y-1">
                  <p>Via Mario Carucci, 71</p>
                  <p>00143 Roma</p>
                  <p>Numero Verde: 800 558 822</p>
                  <p><a href="https://adm.gov.it" className="text-primary">adm.gov.it</a></p>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold mb-2">Camera di Commercio</h5>
                <div className="text-xs space-y-1">
                  <p>Per mediazioni ADR</p>
                  <p>Secondo territorio competente</p>
                  <p>Costo: €40-200 circa</p>
                  <p><a href="https://www.camcom.it" className="text-primary">camcom.it</a></p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Tempi di Risposta Garantiti</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Richieste Generali:</strong> 48 ore lavorative</p>
                <p><strong>Privacy/GDPR:</strong> 30 giorni (Art. 12 GDPR)</p>
              </div>
              <div>
                <p><strong>Reclami Consumatori:</strong> 15 giorni lavorativi</p>
                <p><strong>Emergenze Sicurezza:</strong> 24 ore</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
          <h4 className="font-semibold mb-3">Versione e Validità</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Versione Corrente:</strong> v3.0</p>
              <p><strong>Data Entrata in Vigore:</strong> {lastUpdated}</p>
              <p><strong>Prossima Revisione:</strong> Luglio 2025</p>
            </div>
            <div>
              <p><strong>Lingua Ufficiale:</strong> Italiano</p>
              <p><strong>Traduzioni:</strong> Solo italiano ha valore legale</p>
              <p><strong>Archiviazione:</strong> Versioni precedenti su richiesta</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4 flex-wrap">
            <Button asChild>
              <Link href="/privacy-policy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy Policy
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/cookie-policy" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Cookie Policy
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Torna alla Home
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Per ulteriori informazioni sui tuoi diritti come consumatore, visita il{' '}
            <a href="https://www.mise.gov.it/index.php/it/tutela-del-consumatore" className="text-primary hover:underline">
              Ministero dello Sviluppo Economico
            </a>{' '}
            o le{' '}
            <a href="https://www.consumatori.it" className="text-primary hover:underline">
              Associazioni Consumatori
            </a>
          </p>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          <p>
            Termini di Servizio Jokerman79 - Conformi a GDPR, Codice del Consumo, normative gaming italiane.
            <br />
            Tutti i diritti riservati. Riproduzione vietata senza autorizzazione scritta.
          </p>
        </div>
      </div>
    </div>
  );
}