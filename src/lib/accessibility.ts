// Utilities per l'accessibilità
export const a11y = {
    // Screen reader only content
    srOnly: "sr-only absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0",

    // Focus styles
    focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

    // Skip link styles
    skipLink: "absolute left-[-10000px] top-auto w-1 h-1 overflow-hidden focus:left-6 focus:top-6 focus:w-auto focus:h-auto focus:overflow-visible focus:z-50",

    // High contrast mode support
    highContrast: "supports-[color:color(display-p3_1_1_1)]:bg-black supports-[color:color(display-p3_1_1_1)]:text-white",
};

// ARIA role helpers
export const roles = {
    main: { role: "main" },
    navigation: { role: "navigation" },
    banner: { role: "banner" },
    contentinfo: { role: "contentinfo" },
    complementary: { role: "complementary" },
    search: { role: "search" },
    button: { role: "button" },
    dialog: { role: "dialog" },
    alert: { role: "alert" },
    status: { role: "status" },
    tablist: { role: "tablist" },
    tab: { role: "tab" },
    tabpanel: { role: "tabpanel" },
    menubar: { role: "menubar" },
    menu: { role: "menu" },
    menuitem: { role: "menuitem" },
    grid: { role: "grid" },
    gridcell: { role: "gridcell" },
    listbox: { role: "listbox" },
    option: { role: "option" },
    progressbar: { role: "progressbar" },
    slider: { role: "slider" },
    spinbutton: { role: "spinbutton" },
};

// ARIA attributes helpers
export const aria = {
    hidden: (hidden = true) => ({ "aria-hidden": hidden }),
    label: (label: string) => ({ "aria-label": label }),
    labelledBy: (id: string) => ({ "aria-labelledby": id }),
    describedBy: (id: string) => ({ "aria-describedby": id }),
    expanded: (expanded: boolean) => ({ "aria-expanded": expanded }),
    selected: (selected: boolean) => ({ "aria-selected": selected }),
    checked: (checked: boolean | "mixed") => ({ "aria-checked": checked }),
    disabled: (disabled = true) => ({ "aria-disabled": disabled }),
    required: (required = true) => ({ "aria-required": required }),
    invalid: (invalid = true) => ({ "aria-invalid": invalid }),
    live: (level: "off" | "polite" | "assertive") => ({ "aria-live": level }),
    busy: (busy = true) => ({ "aria-busy": busy }),
    controls: (id: string) => ({ "aria-controls": id }),
    owns: (id: string) => ({ "aria-owns": id }),
    level: (level: number) => ({ "aria-level": level }),
    setSize: (size: number) => ({ "aria-setsize": size }),
    posInSet: (position: number) => ({ "aria-posinset": position }),
    current: (current: "page" | "step" | "location" | "date" | "time" | boolean) => ({ "aria-current": current }),
    orientation: (orientation: "horizontal" | "vertical") => ({ "aria-orientation": orientation }),
    valueNow: (value: number) => ({ "aria-valuenow": value }),
    valueMin: (value: number) => ({ "aria-valuemin": value }),
    valueMax: (value: number) => ({ "aria-valuemax": value }),
    valueText: (text: string) => ({ "aria-valuetext": text }),
};

// Keyboard navigation helpers
export const keyboard = {
    keys: {
        ENTER: "Enter",
        SPACE: " ",
        ESCAPE: "Escape",
        ARROW_UP: "ArrowUp",
        ARROW_DOWN: "ArrowDown",
        ARROW_LEFT: "ArrowLeft",
        ARROW_RIGHT: "ArrowRight",
        HOME: "Home",
        END: "End",
        PAGE_UP: "PageUp",
        PAGE_DOWN: "PageDown",
        TAB: "Tab",
    },

    // Key event handlers
    onKeyDown: (handlers: Record<string, (event: React.KeyboardEvent) => void>) =>
        (event: React.KeyboardEvent) => {
            const handler = handlers[event.key];
            if (handler) {
                event.preventDefault();
                handler(event);
            }
        },

    // Focus management
    trap: (element: HTMLElement) => {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }

            if (e.key === "Escape") {
                element.focus();
            }
        };

        element.addEventListener("keydown", handleTabKey);
        firstElement?.focus();

        return () => element.removeEventListener("keydown", handleTabKey);
    },
};

// Screen reader announcements
export const announcer = {
    announce: (message: string, priority: "polite" | "assertive" = "polite") => {
        const announcer = document.createElement("div");
        announcer.setAttribute("aria-live", priority);
        announcer.setAttribute("aria-atomic", "true");
        announcer.className = a11y.srOnly;
        document.body.appendChild(announcer);

        // Slight delay to ensure screen reader picks it up
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);

        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcer);
        }, 1000);
    },
};

// Color contrast helpers
export const contrast = {
    // High contrast color combinations
    colors: {
        highContrast: {
            bg: "hsl(0 0% 0%)",
            text: "hsl(0 0% 100%)",
            accent: "hsl(60 100% 50%)",
            focus: "hsl(300 100% 50%)",
        },
        standardContrast: {
            bg: "hsl(var(--background))",
            text: "hsl(var(--foreground))",
            accent: "hsl(var(--primary))",
            focus: "hsl(var(--ring))",
        },
    },

    // Utility to check if high contrast mode is preferred
    prefersHighContrast: () =>
        window.matchMedia("(prefers-contrast: high)").matches,

    // Utility to check if reduced motion is preferred
    prefersReducedMotion: () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

// Form accessibility helpers
export const form = {
    // Error message association
    errorProps: (fieldId: string, errorId: string, hasError: boolean) => ({
        id: fieldId,
        ...(hasError && aria.describedBy(errorId)),
        ...(hasError && aria.invalid(true)),
    }),

    // Required field props
    requiredProps: (fieldId: string, labelId: string) => ({
        id: fieldId,
        ...aria.labelledBy(labelId),
        ...aria.required(true),
    }),

    // Field with description
    describedProps: (fieldId: string, labelId: string, descId: string) => ({
        id: fieldId,
        ...aria.labelledBy(labelId),
        ...aria.describedBy(descId),
    }),
};

// Progress and loading states
export const progress = {
    loading: (label: string) => ({
        ...roles.status,
        ...aria.label(label),
        ...aria.live("polite"),
    }),

    progress: (value: number, max: number, label?: string) => ({
        ...roles.progressbar,
        ...aria.valueNow(value),
        ...aria.valueMin(0),
        ...aria.valueMax(max),
        ...(label && aria.label(label)),
        ...aria.valueText(`${Math.round((value / max) * 100)}%`),
    }),
};
