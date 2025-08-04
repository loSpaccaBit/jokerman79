/**
 * Configurazioni e costanti per il sistema delle slot demo
 */

// Configurazione RTP con colori
export const RTP_CONFIG = {
    EXCELLENT: { min: 97, color: 'bg-green-500/80 border-green-400', label: 'Eccellente' },
    GOOD: { min: 96, color: 'bg-blue-500/80 border-blue-400', label: 'Buono' },
    AVERAGE: { min: 95, color: 'bg-yellow-500/80 border-yellow-400', label: 'Medio' },
    LOW: { min: 0, color: 'bg-red-500/80 border-red-400', label: 'Basso' }
} as const;

// Configurazione volatilità
export const VOLATILITY_CONFIG = {
    low: { emoji: '🟢', label: 'Bassa', description: 'Vincite frequenti e piccole' },
    medium: { emoji: '🟡', label: 'Media', description: 'Equilibrio tra frequenza e importo' },
    high: { emoji: '🔴', label: 'Alta', description: 'Vincite rare ma consistenti' }
} as const;

// Configurazione layout responsive
export const LAYOUT_CONFIG = {
    IMAGE_SIZES: {
        GRID: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
        FULL: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
    },
    GRID_CLASSES: {
        MOBILE: "grid-cols-1",
        TABLET: "md:grid-cols-2",
        DESKTOP: "lg:grid-cols-3",
        LARGE: "xl:grid-cols-4"
    }
} as const;

// Limiti per features visibili
export const FEATURES_CONFIG = {
    MAX_VISIBLE: 3,
    MAX_DESCRIPTION_LENGTH: 150
} as const;

// Configurazione animazioni
export const ANIMATION_CONFIG = {
    HOVER_SCALE: 'hover:scale-[1.02]',
    TRANSITION: 'transition-all duration-300',
    STAGGER_DELAY: 0.05
} as const;

// Utilities per RTP
export function getRTPConfig(rtp: number) {
    if (rtp >= RTP_CONFIG.EXCELLENT.min) return RTP_CONFIG.EXCELLENT;
    if (rtp >= RTP_CONFIG.GOOD.min) return RTP_CONFIG.GOOD;
    if (rtp >= RTP_CONFIG.AVERAGE.min) return RTP_CONFIG.AVERAGE;
    return RTP_CONFIG.LOW;
}

// Utilities per paylines
export function formatPaylines(paylines: number): string {
    if (paylines === 0) return 'Cluster Pays';
    if (paylines >= 100000) return `${Math.floor(paylines / 1000)}k linee`;
    return `${paylines.toLocaleString()} linee`;
}

// Utilities per description
export function truncateDescription(description: string, maxLength = FEATURES_CONFIG.MAX_DESCRIPTION_LENGTH): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trimEnd() + '...';
}
