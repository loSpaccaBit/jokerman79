"use client"

import { motion } from "motion/react";

interface AnimatedSectionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
}

export function AnimatedSection({
    children,
    className = "",
    delay = 0,
    duration = 0.8
}: AnimatedSectionProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{
                duration: duration,
                delay: delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
        >
            {children}
        </motion.div>
    );
}

export default AnimatedSection;