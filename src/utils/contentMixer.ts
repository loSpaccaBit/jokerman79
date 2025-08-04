import { BlogPost, ContentItem, ContentMixerConfig } from '@/types/blog';

/**
 * Configurazione default per il mixer di contenuti
 */
const DEFAULT_CONFIG: ContentMixerConfig = {
    adsAfterPosts: 2,
    bonusAfterPosts: 3,
    minPostsForAds: 2,
    maxAdsCount: 0,
    maxBonusCount: 1
};

/**
 * Calcola la configurazione ottimale basata sul numero di post
 */
function calculateOptimalConfig(postsCount: number): ContentMixerConfig {
    return {
        ...DEFAULT_CONFIG,
        maxAdsCount: Math.floor(postsCount / 2),
        maxBonusCount: Math.floor(postsCount / 3) || 1
    };
}

/**
 * Crea un mix intelligente di contenuti inserendo AdsCard e BonusCard
 * tra i post del blog secondo una strategia ottimizzata
 */
export function createMixedContent(posts: BlogPost[]): ContentItem[] {
    const mixedContent: ContentItem[] = [];
    const config = calculateOptimalConfig(posts.length);

    let adsCounter = 0;
    let bonusCounter = 0;

    posts.forEach((post, index) => {
        // Aggiungi sempre il post
        mixedContent.push({
            type: 'post',
            data: post,
            key: post.slug
        });

        // Strategia per dataset piccoli (≤4 post)
        if (shouldInsertAds(index + 1, config, adsCounter)) {
            adsCounter++;
            mixedContent.push({
                type: 'ads',
                key: `ads-${adsCounter}`
            });
        }

        if (shouldInsertBonus(index + 1, config, bonusCounter)) {
            bonusCounter++;
            mixedContent.push({
                type: 'bonus',
                key: `bonus-${bonusCounter}`
            });
        }

        // Strategia per dataset grandi (>4 post)
        if (posts.length > 4) {
            if (shouldInsertAdditionalAds(index, config, adsCounter)) {
                adsCounter++;
                mixedContent.push({
                    type: 'ads',
                    key: `ads-${adsCounter}`
                });
            }

            if (shouldInsertAdditionalBonus(index, config, bonusCounter)) {
                bonusCounter++;
                mixedContent.push({
                    type: 'bonus',
                    key: `bonus-${bonusCounter}`
                });
            }
        }
    });

    return mixedContent;
}

/**
 * Determina se inserire una AdsCard
 */
function shouldInsertAds(
    currentPosition: number,
    config: ContentMixerConfig,
    currentAdsCount: number
): boolean {
    return currentPosition === config.adsAfterPosts &&
        currentAdsCount < config.maxAdsCount;
}

/**
 * Determina se inserire una BonusCard
 */
function shouldInsertBonus(
    currentPosition: number,
    config: ContentMixerConfig,
    currentBonusCount: number
): boolean {
    return currentPosition === config.bonusAfterPosts &&
        currentBonusCount < config.maxBonusCount;
}

/**
 * Determina se inserire AdsCard aggiuntive per dataset grandi
 */
function shouldInsertAdditionalAds(
    index: number,
    config: ContentMixerConfig,
    currentAdsCount: number
): boolean {
    return index > config.adsAfterPosts &&
        (index + 1) % 4 === 0 &&
        currentAdsCount < config.maxAdsCount;
}

/**
 * Determina se inserire BonusCard aggiuntive per dataset grandi
 */
function shouldInsertAdditionalBonus(
    index: number,
    config: ContentMixerConfig,
    currentBonusCount: number
): boolean {
    return index > config.bonusAfterPosts &&
        (index + 1) % 5 === 0 &&
        currentBonusCount < config.maxBonusCount;
}
