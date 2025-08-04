/**
 * Script per popolare Strapi con advertisements di esempio
 * Da eseguire per testare il sistema di ads
 */

const fs = require('fs');
const path = require('path');

const sampleAdvertisements = [
  {
    title: "888 Casino",
    description: "Il miglior casino online con oltre 500 slot e giochi live. Bonus di benvenuto fino a €1000!",
    shortDescription: "Casino online premium con bonus fino a €1000",
    url: "https://888casino.it",
    buttonText: "Gioca Ora",
    brandColor: "#FF6B35",
    position: "sidebar",
    type: "card",
    priority: 90,
    order: 1,
    isActive: true,
    targetAudience: "all"
  },
  {
    title: "Eurobet",
    description: "Scommesse sportive e casino online. Oltre 1000 eventi live ogni giorno.",
    shortDescription: "Scommesse e casino con eventi live 24/7",
    url: "https://eurobet.it",
    buttonText: "Scommetti",
    brandColor: "#FFD700",
    position: "carousel",
    type: "card", 
    priority: 85,
    order: 2,
    isActive: true,
    targetAudience: "all"
  },
  {
    title: "Betsson",
    description: "Il casino online leader in Europa. Slot, roulette, blackjack e molto altro.",
    shortDescription: "Casino leader europeo con giochi premium",
    url: "https://betsson.com",
    buttonText: "Entra",
    brandColor: "#1B5E20",
    position: "sidebar",
    type: "card",
    priority: 80,
    order: 3,
    isActive: true,
    targetAudience: "vip_users"
  },
  {
    title: "Fastbet",
    description: "Registrazione istantanea senza documenti. Gioca subito con il tuo conto bancario.",
    shortDescription: "Registrazione istantanea, gioca subito",
    url: "https://fastbet.com",
    buttonText: "Registrati",
    brandColor: "#E53E3E",
    position: "carousel",
    type: "banner",
    priority: 75,
    order: 4,
    isActive: true,
    targetAudience: "new_users"
  },
  {
    title: "Revolut Business", 
    description: "Conto business multi-valuta con commissioni competitive. Perfetto per aziende moderne.",
    shortDescription: "Conto business con commissioni vantaggiose",
    url: "https://revolut.com/business",
    buttonText: "Scopri di più",
    brandColor: "#0075FF",
    position: "sidebar",
    type: "card",
    priority: 70,
    order: 5,
    isActive: true,
    targetAudience: "all"
  }
];

console.log('📝 Sample advertisements data:');
console.log(JSON.stringify(sampleAdvertisements, null, 2));

console.log(`
🎯 Per inserire questi dati in Strapi:

1. Avvia Strapi: npm run develop
2. Vai su http://localhost:1337/admin
3. Entra nella sezione "Content-Types Builder"
4. Verifica che il tipo "Advertisement" sia presente
5. Vai in "Content Manager" → "Advertisement"
6. Crea le ads utilizzando i dati sopra

🖼️  Per le immagini, copia questi file nella cartella uploads:
- /public/uploads/888casinologo_pc_53f2969c33.png
- /public/uploads/Eurobet_logo_light_800a22546d.svg  
- /public/uploads/betsson_2_1_8b01332d6f.webp
- /public/uploads/fastbet_49ee865652.png
- /public/uploads/large_Revolut_7aa284dff2.png

🔧 Query GraphQL di test:
query {
  advertisementsCarousel(limit: 5) {
    id
    title
    shortDescription
    url
    brandColor
    image {
      url
      alternativeText
    }
  }
}
`);

module.exports = { sampleAdvertisements };
