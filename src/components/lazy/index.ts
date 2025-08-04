import dynamic from 'next/dynamic';

// Lazy load animation components
export const AnimatedGrid = dynamic(
    () => import('@/components/animations/AnimatedGrid').then(mod => ({ default: mod.AnimatedGrid })),
    {
        loading: () => null,
        ssr: false,
    }
);

export const AnimatedSection = dynamic(
    () => import('@/components/animations/AnimatedSection').then(mod => ({ default: mod.AnimatedSection })),
    {
        loading: () => null,
        ssr: false,
    }
);

// Lazy load heavy UI components
export const StatsGrid = dynamic(
    () => import('@/components/_stats/StatsGrid').then(mod => ({ default: mod.StatsGrid })),
    {
        loading: () => null,
    }
);

export const FeaturedSlots = dynamic(
    () => import('@/components/_home/FeaturedSlots').then(mod => ({ default: mod.FeaturedSlots })),
    {
        loading: () => null,
    }
);
