import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Target, Coins, Zap } from 'lucide-react';

interface SlotReviewProps {
    slotName: string;
    provider: string;
    rating: number;
    rtp: number;
    volatility: 'low' | 'medium' | 'high';
    maxWin: string;
    features: string[];
    review: {
        summary: string;
        pros: string[];
        cons: string[];
        verdict: string;
    };
}

export function SlotReview({
    slotName,
    provider,
    rating,
    rtp,
    volatility,
    maxWin,
    features,
    review
}: SlotReviewProps) {
    const getVolatilityColor = (vol: string) => {
        switch (vol) {
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getVolatilityLabel = (vol: string) => {
        switch (vol) {
            case 'low': return 'Bassa';
            case 'medium': return 'Media';
            case 'high': return 'Alta';
            default: return vol;
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-5 w-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
            />
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header con valutazione */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold">{slotName}</CardTitle>
                            {provider && <p className="text-muted-foreground">di {provider}</p>}
                        </div>
                        {rating > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex">{renderStars(rating)}</div>
                                <span className="font-semibold">{rating}/5</span>
                            </div>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Statistiche principali */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {rtp > 0 && (
                    <Card>
                        <CardContent className="p-4 text-center">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <div className="font-semibold text-lg">{rtp}%</div>
                            <div className="text-sm text-muted-foreground">RTP</div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardContent className="p-4 text-center">
                        <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <Badge className={`${getVolatilityColor(volatility)} mb-1`}>
                            {getVolatilityLabel(volatility)}
                        </Badge>
                        <div className="text-sm text-muted-foreground">Volatilità</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 text-center">
                        <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="font-semibold text-lg">
                            {maxWin || 'N/D'}
                        </div>
                        <div className="text-sm text-muted-foreground">Vincita Max</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 text-center">
                        <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="font-semibold text-lg">{features.length}</div>
                        <div className="text-sm text-muted-foreground">Features</div>
                    </CardContent>
                </Card>
            </div>

            {/* Features */}
            {features.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Caratteristiche</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {features.map((feature, index) => (
                                <Badge key={index} variant="secondary">
                                    {feature}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recensione dettagliata */}
            {(review.summary || review.pros.length > 0 || review.cons.length > 0 || review.verdict) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recensione</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Summary */}
                        {review.summary && (
                            <div>
                                <h4 className="font-semibold mb-2">La nostra opinione</h4>
                                <p className="text-muted-foreground leading-relaxed">{review.summary}</p>
                            </div>
                        )}

                        {/* Pro e Contro */}
                        {(review.pros.length > 0 || review.cons.length > 0) && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {review.pros.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-green-700">✅ Pro</h4>
                                        <ul className="space-y-2">
                                            {review.pros.map((pro, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="text-green-600 text-sm mt-1">•</span>
                                                    <span className="text-sm">{pro}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {review.cons.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-red-700">❌ Contro</h4>
                                        <ul className="space-y-2">
                                            {review.cons.map((con, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="text-red-600 text-sm mt-1">•</span>
                                                    <span className="text-sm">{con}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Verdetto finale */}
                        {review.verdict && (
                            <div className="bg-accent/20 p-4 rounded-lg border border-accent/30">
                                <h4 className="font-semibold mb-2">🎯 Verdetto finale</h4>
                                <p className="text-sm leading-relaxed">{review.verdict}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
