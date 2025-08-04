"use client"

import { useState, useEffect } from 'react';
import { Settings, Eye, Volume2, Focus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { aria, roles, a11y } from '@/lib/accessibility';
import { cn } from '@/lib/utils';

// Componente Switch semplificato
interface SwitchProps {
    id?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
    disabled?: boolean;
    'aria-label'?: string;
    'aria-describedby'?: string;
}

function Switch({ id, checked, onCheckedChange, className, ...ariaProps }: SwitchProps) {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                checked ? "bg-primary" : "bg-input",
                className
            )}
            {...ariaProps}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                    checked ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );
}

// Componente Dialog semplificato
interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative z-50">
                {children}
            </div>
        </div>
    );
}

function DialogTrigger({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

function DialogContent({ children, className, ...props }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
}) {
    return (
        <div className={cn("bg-background p-6 rounded-lg shadow-lg border", className)} {...props}>
            {children}
        </div>
    );
}

function DialogHeader({ children }: { children: React.ReactNode }) {
    return <div className="mb-4">{children}</div>;
}

function DialogTitle({ id, children }: { id?: string; children: React.ReactNode }) {
    return <h2 id={id} className="text-lg font-semibold">{children}</h2>;
}

function DialogDescription({ id, children }: { id?: string; children: React.ReactNode }) {
    return <p id={id} className="text-sm text-muted-foreground mt-1">{children}</p>;
}

export function AccessibilityControlPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const { preferences, updatePreference, resetPreferences } = useAccessibility();

    const fontSizeOptions = [
        { value: 'small', label: 'Piccolo' },
        { value: 'medium', label: 'Medio' },
        { value: 'large', label: 'Grande' },
        { value: 'x-large', label: 'Molto Grande' },
    ] as const;

    const focusStyleOptions = [
        { value: 'subtle', label: 'Sottile' },
        { value: 'prominent', label: 'Prominente' },
    ] as const;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(a11y.focusRing, "fixed bottom-4 right-4 z-50")}
                    {...aria.label("Apri pannello accessibilità")}
                    {...aria.expanded(isOpen)}
                >
                    <Settings className="h-4 w-4 mr-2" {...aria.hidden()} />
                    Accessibilità
                </Button>
            </DialogTrigger>

            <DialogContent
                className="max-w-md max-h-[80vh] overflow-y-auto"
                {...roles.dialog}
                {...aria.labelledBy("accessibility-title")}
                {...aria.describedBy("accessibility-description")}
            >
                <DialogHeader>
                    <DialogTitle id="accessibility-title">
                        Impostazioni Accessibilità
                    </DialogTitle>
                    <DialogDescription id="accessibility-description">
                        Personalizza l&apos;esperienza per le tue esigenze di accessibilità
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Visual Settings */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Eye className="h-4 w-4" {...aria.hidden()} />
                                Impostazioni Visive
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* High Contrast */}
                            <div className="flex items-center justify-between">
                                <Label htmlFor="high-contrast" className="text-sm">
                                    Alto Contrasto
                                </Label>
                                <Switch
                                    id="high-contrast"
                                    checked={preferences.highContrast}
                                    onCheckedChange={(checked: boolean) => updatePreference('highContrast', checked)}
                                    {...aria.describedBy("high-contrast-desc")}
                                />
                            </div>
                            <p id="high-contrast-desc" className="text-xs text-muted-foreground">
                                Aumenta il contrasto per una migliore leggibilità
                            </p>

                            {/* Font Size */}
                            <div className="space-y-2">
                                <Label htmlFor="font-size" className="text-sm">
                                    Dimensione Testo
                                </Label>
                                <Select
                                    value={preferences.fontSize}
                                    onValueChange={(value: string) => updatePreference('fontSize', value as 'small' | 'medium' | 'large' | 'x-large')}
                                >
                                    <SelectTrigger id="font-size" {...aria.describedBy("font-size-desc")}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fontSizeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p id="font-size-desc" className="text-xs text-muted-foreground">
                                    Regola la dimensione del testo
                                </p>
                            </div>

                            {/* Focus Indicator */}
                            <div className="space-y-2">
                                <Label htmlFor="focus-style" className="text-sm">
                                    Indicatore Focus
                                </Label>
                                <Select
                                    value={preferences.focusIndicator}
                                    onValueChange={(value: string) => updatePreference('focusIndicator', value as 'subtle' | 'prominent')}
                                >
                                    <SelectTrigger id="focus-style" {...aria.describedBy("focus-style-desc")}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {focusStyleOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p id="focus-style-desc" className="text-xs text-muted-foreground">
                                    Scegli lo stile dell&apos;indicatore di focus
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Motion Settings */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Focus className="h-4 w-4" {...aria.hidden()} />
                                Movimento e Animazioni
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="reduced-motion" className="text-sm">
                                    Riduci Movimento
                                </Label>
                                <Switch
                                    id="reduced-motion"
                                    checked={preferences.reducedMotion}
                                    onCheckedChange={(checked: boolean) => updatePreference('reducedMotion', checked)}
                                    {...aria.describedBy("reduced-motion-desc")}
                                />
                            </div>
                            <p id="reduced-motion-desc" className="text-xs text-muted-foreground mt-2">
                                Disabilita animazioni e transizioni per ridurre disagio
                            </p>
                        </CardContent>
                    </Card>

                    {/* Screen Reader Settings */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Volume2 className="h-4 w-4" {...aria.hidden()} />
                                Screen Reader
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="screen-reader" className="text-sm">
                                    Modalità Screen Reader
                                </Label>
                                <Switch
                                    id="screen-reader"
                                    checked={preferences.screenReader}
                                    onCheckedChange={(checked: boolean) => updatePreference('screenReader', checked)}
                                    {...aria.describedBy("screen-reader-desc")}
                                />
                            </div>
                            <p id="screen-reader-desc" className="text-xs text-muted-foreground mt-2">
                                Ottimizza l&apos;interfaccia per lettori di schermo
                            </p>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Reset Button */}
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => {
                                resetPreferences();
                                // Announce to screen reader
                                const announcer = document.createElement('div');
                                announcer.setAttribute('aria-live', 'polite');
                                announcer.className = a11y.srOnly;
                                announcer.textContent = 'Impostazioni di accessibilità ripristinate ai valori predefiniti';
                                document.body.appendChild(announcer);
                                setTimeout(() => document.body.removeChild(announcer), 1000);
                            }}
                            className="w-full"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" {...aria.hidden()} />
                            Ripristina Impostazioni
                        </Button>
                    </div>

                    {/* Keyboard Shortcuts Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                                Scorciatoie da Tastiera
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Apri menu principale:</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + M</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span>Vai al contenuto:</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cerca:</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + K</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span>Accessibilità:</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + A</kbd>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Hook per gestire le scorciatoie da tastiera globali
export function useAccessibilityShortcuts() {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Alt + A: Apri pannello accessibilità
            if (event.altKey && event.key === 'a') {
                event.preventDefault();
                const button = document.querySelector('[aria-label*="accessibilità"]') as HTMLElement;
                button?.click();
            }

            // Alt + M: Vai al menu principale
            if (event.altKey && event.key === 'm') {
                event.preventDefault();
                const nav = document.querySelector('[role="navigation"]') as HTMLElement;
                nav?.focus();
            }

            // Ctrl + K: Vai alla ricerca
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                const search = document.querySelector('[role="search"] input') as HTMLElement;
                search?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);
}
