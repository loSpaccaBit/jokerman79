import { BonusCard } from '@/components/_home/BonusCard';

interface SlotBonus {
    id: string;
    title: string;
    description: string;
    type: 'welcome' | 'deposit' | 'free-spins' | 'cashback' | 'reload';
    amount: string;
    freeSpins?: number;
    code?: string;
    minDeposit?: string;
    wagering: string;
    validUntil?: string;
    casinoName: string;
    casinoLogo: string;
    url: string;
    isExclusive?: boolean;
}

interface SlotBonusSectionProps {
    slotName: string;
    bonuses: SlotBonus[];
}

export function SlotBonusSection({ slotName, bonuses }: SlotBonusSectionProps) {
    // Non mostrare la sezione se non ci sono bonus
    if (!bonuses || bonuses.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">🎁 Bonus per {slotName}</h2>
                <p className="text-muted-foreground">
                    Approfitta di questi bonus esclusivi per giocare alla slot
                </p>
            </div>

            <div className="grid gap-6">
                {bonuses.map((bonus) => (
                    <BonusCard
                        key={bonus.id}
                        variant="full"
                        bonusData={bonus}
                    />
                ))}
            </div>
        </div>
    );
}
