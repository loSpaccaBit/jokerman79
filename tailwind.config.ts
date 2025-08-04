import type { Config } from 'tailwindcss'


const config: Config = {
    darkMode: 'class',
    content: [
        './src/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            borderRadius: {
                sm: 'calc(var(--radius) - 4px)',
                md: 'calc(var(--radius) - 2px)',
                lg: 'var(--radius)',
                xl: 'calc(var(--radius) + 4px)',
                sidebar: 'var(--radius-sidebar)',
            },
            colors: {
                background: 'oklch(var(--background) / <alpha-value>)',
                foreground: 'oklch(var(--foreground) / <alpha-value>)',
                card: 'oklch(var(--card) / <alpha-value>)',
                'card-foreground': 'oklch(var(--card-foreground) / <alpha-value>)',
                popover: 'oklch(var(--popover) / <alpha-value>)',
                'popover-foreground': 'oklch(var(--popover-foreground) / <alpha-value>)',
                primary: 'oklch(var(--primary) / <alpha-value>)',
                'primary-foreground': 'oklch(var(--primary-foreground) / <alpha-value>)',
                secondary: 'oklch(var(--secondary) / <alpha-value>)',
                'secondary-foreground': 'oklch(var(--secondary-foreground) / <alpha-value>)',
                muted: 'oklch(var(--muted) / <alpha-value>)',
                'muted-foreground': 'oklch(var(--muted-foreground) / <alpha-value>)',
                accent: 'oklch(var(--accent) / <alpha-value>)',
                'accent-foreground': 'oklch(var(--accent-foreground) / <alpha-value>)',
                destructive: 'oklch(var(--destructive) / <alpha-value>)',
                'destructive-foreground': 'oklch(var(--destructive-foreground) / <alpha-value>)',
                border: 'oklch(var(--border) / <alpha-value>)',
                input: 'oklch(var(--input) / <alpha-value>)',
                ring: 'oklch(var(--ring) / <alpha-value>)',

                // Extra (charts, sidebar)
                'chart-1': 'oklch(var(--chart-1) / <alpha-value>)',
                'chart-2': 'oklch(var(--chart-2) / <alpha-value>)',
                'chart-3': 'oklch(var(--chart-3) / <alpha-value>)',
                'chart-4': 'oklch(var(--chart-4) / <alpha-value>)',
                'chart-5': 'oklch(var(--chart-5) / <alpha-value>)',

                sidebar: 'oklch(var(--sidebar) / <alpha-value>)',
                'sidebar-foreground': 'oklch(var(--sidebar-foreground) / <alpha-value>)',
                'sidebar-primary': 'oklch(var(--sidebar-primary) / <alpha-value>)',
                'sidebar-primary-foreground': 'oklch(var(--sidebar-primary-foreground) / <alpha-value>)',
                'sidebar-accent': 'oklch(var(--sidebar-accent) / <alpha-value>)',
                'sidebar-accent-foreground': 'oklch(var(--sidebar-accent-foreground) / <alpha-value>)',
                'sidebar-border': 'oklch(var(--sidebar-border) / <alpha-value>)',
                'sidebar-ring': 'oklch(var(--sidebar-ring) / <alpha-value>)',
            },
            fontFamily: {
                sans: 'var(--font-satoshi)', // Satoshi per il testo normale
                display: 'var(--font-tanker)', // Tanker per i titoli
                mono: 'var(--font-satoshi)', // Backup per mono
            },
            width: {
                sidebar: 'var(--sidebar-width)',
            },
        },
    },
    plugins: [
        function ({ addVariant }: { addVariant: (name: string, selector: string) => void }) {
            addVariant('dark', '&:is(.dark *)') // custom dark variant
        },
    ],
}
export default config
