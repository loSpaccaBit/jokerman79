"use client"

import React from 'react';
import { AdsCard } from '@/components/layout/AdsCard';
import { useLocalAdvertisements } from '@/hooks/useAdvertisements';

interface MobileAdsSectionProps {
  className?: string;
}

/**
 * Sezione ads specifica per dispositivi mobili
 * Utilizza advertisements locali con position "mobile" o "sidebar" come fallback
 */
export function MobileAdsSection({ className }: MobileAdsSectionProps) {
  // Prima prova a cercare ads specifiche per mobile, poi fallback su sidebar
  const { advertisements: mobileAds, loading: mobileLoading } = useLocalAdvertisements(1, 'mobile');
  const { advertisements: sidebarAds, loading: sidebarLoading } = useLocalAdvertisements(1, 'sidebar');

  const loading = mobileLoading || sidebarLoading;
  
  // Usa mobile ads se disponibili, altrimenti fallback su sidebar ads
  const advertisements = mobileAds.length > 0 ? mobileAds : sidebarAds;

  if (loading) {
    return (
      <section className={className}>
        <div className="w-full h-48 bg-muted animate-pulse rounded-lg" />
      </section>
    );
  }

  if (!advertisements.length) {
    return null; // Non mostrare nulla se non ci sono ads
  }

  const mobileAd = advertisements[0];

  return (
    <section className={className}>
      <AdsCard advertisement={mobileAd} />
    </section>
  );
}
