import { SlotDemo } from '@/types/slots';
import { LAYOUT_CONFIG, FEATURES_CONFIG, ANIMATION_CONFIG, formatPaylines } from '@/config/slotsConfig';

/**
 * Hook per logica di business delle SlotDemoCard
 */
export function useSlotCardLogic(slot: SlotDemo | undefined, variant: 'full' | 'grid') {
    // Guard contro slot undefined
    if (!slot) {
        return {
            isGrid: variant === 'grid',
            imageSizes: '',
            cardClasses: '',
            imageContainerClasses: '',
            contentClasses: '',
            titleClasses: '',
            descriptionClasses: '',
            visibleFeatures: [],
            remainingFeaturesCount: 0,
            paylinesDisplay: '',
            detailUrl: '#'
        };
    }

    const isGrid = variant === 'grid';

    // Configurazione immagini responsive
    const imageSizes = isGrid
        ? LAYOUT_CONFIG.IMAGE_SIZES.GRID
        : LAYOUT_CONFIG.IMAGE_SIZES.FULL;

    // Classi CSS dinamiche ottimizzate
    const cardClasses = [
        'overflow-hidden cursor-pointer hover:shadow-lg',
        ANIMATION_CONFIG.TRANSITION,
        isGrid && 'h-full flex flex-col',
        isGrid && ANIMATION_CONFIG.HOVER_SCALE
    ].filter(Boolean).join(' ');

    const imageContainerClasses = `relative overflow-hidden ${isGrid ? 'h-48' : 'h-64 md:h-80'
        }`;

    const contentClasses = isGrid ? 'flex-1 p-4' : 'p-6';

    const titleClasses = `font-tanker mb-3 line-clamp-2 ${isGrid ? 'text-lg' : 'text-2xl'
        }`;

    const descriptionClasses = `text-muted-foreground leading-relaxed mb-4 ${isGrid ? 'text-sm line-clamp-3' : 'text-base line-clamp-4'
        }`;

    // Logica per features con limite configurabile e guard per undefined
    const features = slot.features || [];
    const visibleFeatures = features.slice(0, FEATURES_CONFIG.MAX_VISIBLE);
    const remainingFeaturesCount = Math.max(0, features.length - FEATURES_CONFIG.MAX_VISIBLE);

    // Formattazione paylines con fallback
    const paylinesDisplay = formatPaylines(slot.paylines || 0);

    // URL della pagina dettaglio con fallback
    const detailUrl = slot.slug ? `/slots/${slot.slug}` : '#';

    return {
        isGrid,
        imageSizes,
        cardClasses,
        imageContainerClasses,
        contentClasses,
        titleClasses,
        descriptionClasses,
        visibleFeatures,
        remainingFeaturesCount,
        paylinesDisplay,
        detailUrl
    };
}
