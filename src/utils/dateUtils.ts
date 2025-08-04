/**
 * Utility per formattazione date
 */

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Controlla se la data è valida
    if (isNaN(date.getTime())) {
      return 'Data non valida';
    }

    // Formato italiano
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Errore formattazione data:', error);
    return 'Data non valida';
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Data non valida';
    }

    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Errore formattazione data/ora:', error);
    return 'Data non valida';
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      return 'Data non valida';
    }

    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Oggi';
    } else if (diffInDays === 1) {
      return 'Ieri';
    } else if (diffInDays < 7) {
      return `${diffInDays} giorni fa`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1 settimana fa' : `${weeks} settimane fa`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? '1 mese fa' : `${months} mesi fa`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return years === 1 ? '1 anno fa' : `${years} anni fa`;
    }
  } catch (error) {
    console.error('Errore formattazione tempo relativo:', error);
    return 'Data non valida';
  }
}
