import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte un URL di immagine di Strapi in un URL assoluto
 * @param imageUrl - URL dell'immagine che può essere relativo o assoluto
 * @returns URL assoluto dell'immagine
 */
export function getStrapiImageUrl(imageUrl: string | null | undefined): string {
  // Se l'immagine non esiste, restituisci un placeholder
  if (!imageUrl) {
    return '/assets/logo_2.svg';
  }

  // Se l'URL è già assoluto (inizia con http:// o https://), restituiscilo così com'è
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Se l'URL inizia con /uploads/ (URL relativo di Strapi), aggiungi il base URL
  if (imageUrl.startsWith('/uploads/')) {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    return `${strapiUrl}${imageUrl}`;
  }

  // Se l'URL non inizia con /, aggiungilo
  if (!imageUrl.startsWith('/')) {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    return `${strapiUrl}/uploads/${imageUrl}`;
  }

  // Per altri casi, restituisci l'URL così com'è (potrebbe essere un asset locale)
  return imageUrl;
}
