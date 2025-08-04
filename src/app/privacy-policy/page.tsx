/**
 * Privacy Policy Page - GDPR Compliant
 * Informativa completa per il trattamento dei dati personali di Jokerman79
 * Conforme a GDPR, ePrivacy Directive e normative gaming italiane
 */

import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  Eye, 
  Globe, 
  Clock, 
  Mail, 
  Calendar, 
  Scale, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Database,
  Lock,
  Zap,
  BarChart3,
  Settings2,
  UserCheck,
  Gavel
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - Jokerman79 | Informativa GDPR',
  description: 'Informativa completa sulla privacy e trattamento dati personali di Jokerman79. Conforme GDPR, normative gaming italiane e diritti utenti.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Privacy Policy - Jokerman79',
    description: 'Informativa privacy completa e conforme GDPR per la piattaforma gaming Jokerman79',
    type: 'website',
  },
};

// Definizione delle categorie di dati trattati
const DATA_CATEGORIES = [
  {
    id: 'navigation',
    name: 'Dati di Navigazione',
    icon: <Globe className="h-5 w-5 text-blue-600" />,
    description: 'Informazioni raccolte automaticamente durante la navigazione',
    legal_basis: 'Legittimo interesse (Art. 6(1)(f) GDPR)',
    retention: '24 mesi',
    data: [
      'Indirizzo IP e geolocalizzazione approssimativa',
      'User Agent e informazioni browser',
      'Pagine visitate e tempo di permanenza',
      'Referrer e sorgenti di traffico',
      'Dispositivo e sistema operativo utilizzato'
    ]
  },
  {
    id: 'analytics',
    name: 'Dati Analytics',
    icon: <BarChart3 className="h-5 w-5 text-green-600" />,
    description: 'Metriche di utilizzo per migliorare il servizio',
    legal_basis: 'Consenso (Art. 6(1)(a) GDPR)',
    retention: '26 mesi (Google Analytics)',
    data: [
      'Eventi di interazione (click, scroll, tempo)',
      'Web Vitals e performance metriche',
      'Sessioni e comportamenti utente',
      'Conversioni e obiettivi completati',
      'Dati demografici aggregati (se disponibili)'
    ]
  },
  {
    id: 'gaming',
    name: 'Dati Gaming',
    icon: <Zap className="h-5 w-5 text-purple-600" />,
    description: 'Informazioni sulle demo slot e statistiche live',
    legal_basis: 'Legittimo interesse (Art. 6(1)(f) GDPR)',
    retention: '12 mesi',
    data: [
      'Slot demo giocate e preferenze',
      'Statistiche live visualizzate',
      'Provider gaming preferiti',
      'Dati di connessione ai provider (Evolution, Pragmatic)',
      'Pattern di utilizzo delle funzionalità gaming'
    ]
  },
  {
    id: 'technical',
    name: 'Dati Tecnici',
    icon: <Settings2 className="h-5 w-5 text-orange-600" />,
    description: 'Informazioni per funzionamento e sicurezza',
    legal_basis: 'Legittimo interesse (Art. 6(1)(f) GDPR)',
    retention: '6 mesi',
    data: [
      'Log di errori e debugging',
      'Performance e metriche tecniche',
      'Dati PWA e service worker',
      'Informazioni sicurezza e fraud prevention',
      'Backup e recovery data'
    ]
  },
  {
    id: 'communication',
    name: 'Dati Comunicazione',
    icon: <Mail className="h-5 w-5 text-red-600" />,
    description: 'Dati forniti per contatti e richieste',
    legal_basis: 'Consenso (Art. 6(1)(a) GDPR)',
    retention: '5 anni (obblighi contabili)',
    data: [
      'Email e informazioni di contatto',
      'Contenuto comunicazioni',
      'Richieste supporto e feedback',
      'Preferenze comunicazione',
      'Storico interazioni'
    ]
  }
];

// Terze parti che trattano dati
const THIRD_PARTIES = [
  {
    name: 'Google LLC',
    purpose: 'Analytics e performance monitoring',
    data_transferred: 'Dati di navigazione anonimi',
    legal_basis: 'Consenso',
    country: 'USA',
    safeguards: 'Data Processing Addendum, Standard Contractual Clauses'
  },
  {
    name: 'Evolution Gaming',
    purpose: 'Provider live casino streams',
    data_transferred: 'Dati connessione e viewing',
    legal_basis: 'Legittimo interesse', 
    country: 'Malta/Lettonia',
    safeguards: 'Adequacy Decision UE'
  },
  {
    name: 'Pragmatic Play',
    purpose: 'Provider slot demos',
    data_transferred: 'Dati utilizzo demo',
    legal_basis: 'Legittimo interesse',
    country: 'Malta',
    safeguards: 'Adequacy Decision UE'
  }
];

// Diritti GDPR degli interessati
const GDPR_RIGHTS = [
  {
    article: 'Art. 15',
    right: 'Diritto di Accesso',
    description: 'Ottenere conferma che i dati sono trattati e accesso agli stessi',
    how_to_exercise: 'Richiesta via email con documento identità'
  },
  {
    article: 'Art. 16',
    right: 'Diritto di Rettifica',
    description: 'Correggere dati personali inesatti o incompleti',
    how_to_exercise: 'Richiesta scritta con nuovi dati corretti'
  },
  {
    article: 'Art. 17',
    right: 'Diritto alla Cancellazione',
    description: 'Ottenere cancellazione dati quando non più necessari',
    how_to_exercise: 'Richiesta motivata via email'
  },
  {
    article: 'Art. 18',
    right: 'Diritto di Limitazione',
    description: 'Limitare il trattamento in circostanze specifiche',
    how_to_exercise: 'Richiesta con motivazione specifica'
  },
  {
    article: 'Art. 20',
    right: 'Diritto alla Portabilità',
    description: 'Ricevere dati in formato strutturato e leggibile',
    how_to_exercise: 'Richiesta specificando formato desiderato'
  },
  {
    article: 'Art. 21',
    right: 'Diritto di Opposizione',
    description: 'Opporsi al trattamento per legittimo interesse',
    how_to_exercise: 'Comunicazione scritta con motivazioni'
  },
  {
    article: 'Art. 7(3)',
    right: 'Revoca del Consenso',
    description: 'Revocare consenso precedentemente prestato',
    how_to_exercise: 'Gestione preferenze o richiesta scritta'
  }
];

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date('2024-01-31').toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Informativa Privacy</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Informativa completa sul trattamento dei dati personali secondo il Regolamento UE 2016/679 (GDPR) 
          e normative italiane per la piattaforma gaming Jokerman79
        </p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Ultimo aggiornamento: {lastUpdated}
          </div>
          <div className="flex items-center gap-1">
            <Scale className="h-4 w-4" />
            Conforme GDPR e normative italiane
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
              <Link href="#titolare">Titolare</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#dati-trattati">Dati Trattati</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#finalita">Finalità</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#diritti">I Tuoi Diritti</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#trasferimenti">Trasferimenti</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#sicurezza">Sicurezza</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#gaming-compliance">Gaming</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#contatti">Contatti</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 1. Titolare del Trattamento */}
      <Card id="titolare" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            1. Titolare del Trattamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Jokerman79</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Denominazione:</strong> Jokerman79</p>
                <p><strong>Tipologia:</strong> Piattaforma gaming demo</p>
                <p><strong>Settore:</strong> Gaming/Entertainment</p>
              </div>
              <div>
                <p><strong>Email Privacy:</strong> privacy@jokerman79.com</p>
                <p><strong>Email Generale:</strong> info@jokerman79.com</p>
                <p><strong>PEC:</strong> jokerman79@pec.it</p>
              </div>
            </div>
          </div>
          
          <p>
            Il Titolare del trattamento, ai sensi dell&apos;Art. 4(7) GDPR, è il soggetto che determina 
            le finalità e i mezzi del trattamento dei dati personali. Jokerman79 agisce come 
            titolare per tutti i trattamenti descritti in questa informativa.
          </p>
        </CardContent>
      </Card>

      {/* 2. Dati Personali Trattati */}
      <div id="dati-trattati" className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6" />
          2. Categorie di Dati Personali Trattati
        </h2>
        
        {DATA_CATEGORIES.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {category.icon}
                {category.name}
                <Badge variant="secondary">{category.retention}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{category.description}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Base Giuridica:</h4>
                  <p className="text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded">
                    {category.legal_basis}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Periodo Conservazione:</h4>
                  <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                    {category.retention}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Dati Specifici Trattati:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  {category.data.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. Finalità del Trattamento */}
      <Card id="finalita" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            3. Finalità del Trattamento e Base Giuridica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Finalità Principali:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Erogazione Servizio:</strong> Fornire accesso alle slot demo e statistiche live
                    <br /><span className="text-muted-foreground">Base: Art. 6(1)(b) GDPR - Esecuzione contratto</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Miglioramento Servizio:</strong> Analisi utilizzo e ottimizzazione piattaforma
                    <br /><span className="text-muted-foreground">Base: Art. 6(1)(f) GDPR - Legittimo interesse</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Sicurezza:</strong> Prevenzione frodi e protezione piattaforma
                    <br /><span className="text-muted-foreground">Base: Art. 6(1)(f) GDPR - Legittimo interesse</span>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Finalità su Consenso:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Analytics Avanzati:</strong> Google Analytics e metriche dettagliate
                    <br /><span className="text-muted-foreground">Base: Art. 6(1)(a) GDPR - Consenso</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Marketing:</strong> Comunicazioni promozionali (se richieste)
                    <br /><span className="text-muted-foreground">Base: Art. 6(1)(a) GDPR - Consenso</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Personalizzazione:</strong> Contenuti e raccomandazioni personalizzate
                    <br /><span className="text-muted-foreground">Base: Art. 6(1)(a) GDPR - Consenso</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Compliance Gaming Italia
            </h4>
            <p className="text-sm">
              In conformità al <strong>D.Lgs. 88/2011</strong> e regolamenti <strong>ADM</strong>, 
              trattiamo dati per finalità di compliance gaming inclusi monitoraggio pattern di gioco, 
              age verification e gioco responsabile.
              <br /><strong>Base giuridica:</strong> Art. 6(1)(c) GDPR - Obbligo legale
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Destinatari e Trasferimenti Internazionali */}
      <Card id="trasferimenti" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            4. Destinatari e Trasferimenti Internazionali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            I tuoi dati personali possono essere comunicati a terze parti per finalità strettamente 
            connesse all&apos;erogazione del servizio. Tutti i trasferimenti rispettano l&apos;Art. 44-49 GDPR.
          </p>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Finalità</TableHead>
                  <TableHead>Dati Trasferiti</TableHead>
                  <TableHead>Paese</TableHead>
                  <TableHead>Garanzie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {THIRD_PARTIES.map((party, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-semibold">{party.name}</TableCell>
                    <TableCell className="text-sm">{party.purpose}</TableCell>
                    <TableCell className="text-sm">{party.data_transferred}</TableCell>
                    <TableCell>
                      <Badge variant={party.country === 'USA' ? 'destructive' : 'default'}>
                        {party.country}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{party.safeguards}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Trasferimenti Extra-UE</h4>
            <p className="text-sm">
              I trasferimenti verso USA (Google) sono basati su <strong>Standard Contractual Clauses</strong> 
              approvate dalla Commissione Europea (Decisione 2021/914/UE) e misure supplementari di sicurezza.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 5. Periodi di Conservazione */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            5. Periodi di Conservazione
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            I periodi di conservazione sono determinati secondo i principi di <strong>necessità</strong>, 
            <strong>proporzionalità</strong> e <strong>minimizzazione</strong> (Art. 5 GDPR):
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Conservazione Standard:</h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Dati navigazione:</strong> 24 mesi</li>
                <li>• <strong>Analytics Google:</strong> 26 mesi (default)</li>
                <li>• <strong>Gaming data:</strong> 12 mesi</li>
                <li>• <strong>Log tecnici:</strong> 6 mesi</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Conservazione Legale:</h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Comunicazioni:</strong> 5 anni (obblighi fiscali)</li>
                <li>• <strong>Gaming compliance:</strong> 5 anni (ADM)</li>
                <li>• <strong>Reclami GDPR:</strong> 3 anni (prescrizione)</li>
                <li>• <strong>Consent records:</strong> 3 anni (dimostrabilità)</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Cancellazione automatica:</strong> Implementiamo procedure automatiche di cancellazione 
              allo scadere dei periodi previsti, salvo obblighi legali di conservazione più lunghi.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 6. I Tuoi Diritti GDPR */}
      <Card id="diritti" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            6. I Tuoi Diritti secondo il GDPR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>
            Come interessato, hai specifici diritti garantiti dal GDPR. Puoi esercitarli gratuitamente, 
            salvo richieste manifestamente infondate o eccessive.
          </p>

          <div className="grid gap-4">
            {GDPR_RIGHTS.map((right, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{right.right}</h4>
                  <Badge variant="outline">{right.article}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{right.description}</p>
                <p className="text-xs">
                  <strong>Come esercitarlo:</strong> {right.how_to_exercise}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Tempi di Risposta</h4>
            <p className="text-sm">
              Risponderemo alle tue richieste <strong>entro 1 mese</strong> dal ricevimento 
              (Art. 12(3) GDPR). In casi complessi, il termine può essere esteso di 2 mesi 
              con comunicazione motivata.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 7. Sicurezza e Misure Tecniche */}
      <Card id="sicurezza" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            7. Sicurezza dei Dati (Art. 32 GDPR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Implementiamo misure tecniche e organizzative appropriate per garantire un livello 
            di sicurezza adeguato al rischio del trattamento.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Misure Tecniche:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Crittografia HTTPS/TLS 1.3</li>
                <li>• Pseudonimizzazione dati analytics</li>
                <li>• Backup crittografati e ridondanti</li>
                <li>• Firewall e protezione DDoS</li>
                <li>• Monitoring sicurezza 24/7</li>
                <li>• Vulnerability scanning regolare</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Misure Organizzative:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Policy privacy e sicurezza interne</li>
                <li>• Formazione staff su GDPR</li>
                <li>• Access control e principio need-to-know</li>
                <li>• Procedure incident response</li>
                <li>• Audit sicurezza periodici</li>
                <li>• Contratti data processing con fornitori</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Data Breach Notification</h4>
            <p className="text-sm">
              In caso di violazione che comporti rischi per i diritti e libertà, notificheremo 
              l&apos;Autorità entro <strong>72 ore</strong> (Art. 33 GDPR) e gli interessati 
              <strong>senza ingiustificato ritardo</strong> (Art. 34 GDPR).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 8. Compliance Gaming Specifico */}
      <Card id="gaming-compliance" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            8. Compliance Gaming e Normative Italiane
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Jokerman79</strong>, operando nel settore gaming con demo slot e statistiche live, 
            rispetta specifiche normative italiane ed europee per il gaming online.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Normative di Riferimento:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>D.Lgs. 88/2011:</strong> Riordino gioco pubblico</li>
                <li>• <strong>Regolamenti ADM:</strong> Autorità Dogane Monopoli</li>
                <li>• <strong>D.Lgs. 196/2003:</strong> Codice Privacy italiano</li>
                <li>• <strong>D.Lgs. 101/2018:</strong> Adeguamento GDPR Italia</li>
                <li>• <strong>Codice del Consumo:</strong> Tutela consumatori</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Misure Specifiche Gaming:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Age Verification:</strong> Controlli età utenti</li>
                <li>• <strong>Gioco Responsabile:</strong> Pattern monitoring</li>
                <li>• <strong>Provider Compliance:</strong> Evolution/Pragmatic certified</li>
                <li>• <strong>Demo Only:</strong> Nessun denaro reale coinvolto</li>
                <li>• <strong>Trasparenza RTP:</strong> Return to Player disclosed</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Gioco Responsabile</h4>
            <p className="text-sm">
              Monitoriamo pattern di utilizzo per identificare comportamenti problematici e promuovere 
              gioco responsabile. Forniamo risorse educative e link a organizzazioni di supporto 
              conformemente alle linee guida ADM.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 9. DPO e Contatti */}
      <Card id="contatti" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            9. Contatti e Esercizio Diritti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Titolare del Trattamento</h4>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm space-y-1">
                  <strong>Jokerman79</strong><br />
                  Email: <a href="mailto:privacy@jokerman79.com" className="text-primary">privacy@jokerman79.com</a><br />
                  Email generale: <a href="mailto:info@jokerman79.com" className="text-primary">info@jokerman79.com</a><br />
                  PEC: <a href="mailto:jokerman79@pec.it" className="text-primary">jokerman79@pec.it</a>
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Autorità di Controllo</h4>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <p className="text-sm space-y-1">
                  <strong>Garante Privacy</strong><br />
                  Piazza di Monte Citorio, 121<br />
                  00186 Roma<br />
                  Tel: +39 06 69677.1<br />
                  Web: <a href="https://garanteprivacy.it" className="text-primary">garanteprivacy.it</a>
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Come Esercitare i Tuoi Diritti</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Richiesta Scritta</p>
                  <p className="text-sm text-muted-foreground">
                    Invia email a privacy@jokerman79.com con documento identità e richiesta specifica
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Tempi di Risposta</p>
                  <p className="text-sm text-muted-foreground">
                    Massimo 30 giorni dalla ricezione, estendibili a 60 in casi complessi
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">Gratuità</p>
                  <p className="text-sm text-muted-foreground">
                    L&apos;esercizio dei diritti è gratuito, salvo richieste manifestamente infondate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 10. Modifiche e Aggiornamenti */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            10. Modifiche e Aggiornamenti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Questa Privacy Policy può essere modificata per adeguamenti normativi, 
            miglioramenti del servizio o cambiamenti nelle pratiche di trattamento.
          </p>
          
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Notifica Modifiche</h4>
            <p className="text-sm">
              Le modifiche sostanziali saranno notificate attraverso:
            </p>
            <ul className="list-disc pl-6 mt-2 text-sm">
              <li>Banner informativo sul sito web</li>
              <li>Email agli utenti registrati (se applicabile)</li>
              <li>Aggiornamento data &quot;ultimo aggiornamento&quot;</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            <strong>Versione corrente:</strong> v2.1 - {lastUpdated}<br />
            <strong>Prossima revisione prevista:</strong> Gennaio 2025
          </p>
        </CardContent>
      </Card>

      {/* Footer Navigation */}
      <div className="text-center space-y-4">
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/cookie-policy">Cookie Policy</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/terms-of-service">Termini di Servizio</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/disclaimer">Disclaimer</Link>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Per ulteriori informazioni sulla protezione dei dati, consulta il sito del{' '}
          <a href="https://garanteprivacy.it" className="text-primary hover:underline">
            Garante per la Protezione dei Dati Personali
          </a>
        </p>
      </div>
    </div>
  );
}