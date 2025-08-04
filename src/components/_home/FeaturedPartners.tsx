'use client';

import React from 'react';
import { Partner } from './Partner';
import { useHomepagePartners } from '@/hooks/useHomepagePartners';

export function FeaturedPartners() {
  const { partners, loading, error } = useHomepagePartners();

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">I Nostri Partner</h2>
          <div className="grid gap-8 md:gap-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-64 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error loading partners:', error);
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">I Nostri Partner</h2>
          <div className="text-center text-muted-foreground">
            <p>Al momento non è possibile caricare i partner.</p>
            <p>Riprova più tardi.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">I Nostri Partner</h2>
        <div className="space-y-12">
          {partners.map((partner) => (
            <Partner
              key={partner.documentId}
              {...partner}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
