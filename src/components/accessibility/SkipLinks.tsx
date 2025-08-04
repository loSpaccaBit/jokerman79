"use client"

import Link from 'next/link';
import { a11y } from '@/lib/accessibility';
import { cn } from '@/lib/utils';

interface SkipLink {
    href: string;
    label: string;
}

interface SkipLinksProps {
    links?: SkipLink[];
    className?: string;
}

const defaultSkipLinks: SkipLink[] = [
    { href: "#main-content", label: "Vai al contenuto principale" },
    { href: "#navigation", label: "Vai alla navigazione" },
    { href: "#search", label: "Vai alla ricerca" },
    { href: "#footer", label: "Vai al footer" },
];

export function SkipLinks({ links = defaultSkipLinks, className }: SkipLinksProps) {
    return (
        <nav aria-label="Link di navigazione rapida" className={className}>
            <ul className="flex flex-col">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className={cn(
                                a11y.skipLink,
                                a11y.focusRing,
                                "bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm",
                                "transition-all duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            )}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

// Hook per gestire i skip links automaticamente
export function useSkipLinks() {
    const scrollToElement = (id: string) => {
        const element = document.getElementById(id.replace('#', ''));
        if (element) {
            element.focus({ preventScroll: false });
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return { scrollToElement };
}
