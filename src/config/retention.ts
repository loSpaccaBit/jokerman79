// Configurazione per la gestione delle scadenze dei dati
export interface RetentionConfig {
    defaultPeriod: string;
    cleanupInterval: number; // in millisecondi
    maxBatchSize: number;
    retentionPolicies: {
        [key: string]: {
            days: number;
            description: string;
        };
    };
    priorityRules: {
        [key: string]: {
            multiplierThreshold?: number;
            winnerPattern?: string;
            retentionPeriod: string;
            priority: string;
        };
    };
}

export const RETENTION_CONFIG: RetentionConfig = {
    // Periodo di default per i risultati normali
    defaultPeriod: 'days7',

    // Cleanup automatico ogni ora (3600000 ms)
    cleanupInterval: 60 * 60 * 1000,

    // Massimo numero di record da eliminare per volta
    maxBatchSize: 1000,

    // Definizione dei periodi di retention
    retentionPolicies: {
        'day1': {
            days: 1,
            description: 'Dati temporanei - 1 giorno'
        },
        'days3': {
            days: 3,
            description: 'Dati a breve termine - 3 giorni'
        },
        'days7': {
            days: 7,
            description: 'Dati standard - 1 settimana'
        },
        'days30': {
            days: 30,
            description: 'Dati importanti - 1 mese'
        },
        'permanent': {
            days: 365 * 10, // 10 anni
            description: 'Dati permanenti - 10 anni'
        }
    },

    // Regole per determinare priorità e retention period
    priorityRules: {
        'mega_win': {
            multiplierThreshold: 100,
            retentionPeriod: 'days30',
            priority: 'permanent'
        },
        'big_win': {
            multiplierThreshold: 10,
            retentionPeriod: 'days30',
            priority: 'high'
        },
        'bonus_win': {
            winnerPattern: 'bonus',
            retentionPeriod: 'days7',
            priority: 'high'
        },
        'jackpot_win': {
            winnerPattern: 'jackpot',
            retentionPeriod: 'permanent',
            priority: 'permanent'
        }
    }
};

// Funzione per calcolare scadenza basata su regole
export function calculateRetentionForResult(resultData: any): {
    expiresAt: string;
    retentionPeriod: string;
    priority: string;
} {
    const now = new Date();
    let retentionPeriod = RETENTION_CONFIG.defaultPeriod;
    let priority = 'normal';

    // Applica regole di priorità
    for (const [ruleName, rule] of Object.entries(RETENTION_CONFIG.priorityRules)) {
        let matches = false;

        // Controlla soglia moltiplicatore
        if (rule.multiplierThreshold && resultData.multiplier >= rule.multiplierThreshold) {
            matches = true;
        }

        // Controlla pattern nel winner
        if (rule.winnerPattern && resultData.winner &&
            resultData.winner.toLowerCase().includes(rule.winnerPattern.toLowerCase())) {
            matches = true;
        }

        if (matches) {
            retentionPeriod = rule.retentionPeriod;
            priority = rule.priority;
            break; // Prima regola che matcha vince
        }
    }

    // Calcola data di scadenza
    const policy = RETENTION_CONFIG.retentionPolicies[retentionPeriod];
    const expiresAt = new Date(now.getTime() + policy.days * 24 * 60 * 60 * 1000);

    return {
        expiresAt: expiresAt.toISOString(),
        retentionPeriod,
        priority
    };
}

// Funzione per verificare se un record è scaduto
export function isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) <= new Date();
}

// Funzione per calcolare tempo rimanente
export function getTimeUntilExpiry(expiresAt: string): {
    days: number;
    hours: number;
    minutes: number;
    expired: boolean;
} {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, expired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, expired: false };
}
