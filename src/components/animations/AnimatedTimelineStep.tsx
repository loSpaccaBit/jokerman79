"use client"

import { motion } from "motion/react";

interface AnimatedTimelineStepProps {
    children: React.ReactNode;
    stepNumber: number;
    delay?: number;
    className?: string;
}

export function AnimatedTimelineStep({
    children,
    stepNumber,
    delay = 0,
    className = ""
}: AnimatedTimelineStepProps) {
    return (
        <motion.div
            className={`relative flex items-start gap-4 md:gap-6 ${className}`}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-30%" }}
            transition={{
                duration: 0.8,
                delay: delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
        >
            {/* Step number circle */}
            <div className="flex-shrink-0 mt-1">
                <motion.div
                    className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm md:text-base shadow-lg border-2 border-background"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true, margin: "-30%" }}
                    transition={{
                        duration: 0.6,
                        delay: delay + 0.2,
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                    }}
                >
                    {stepNumber}
                </motion.div>
            </div>

            {/* Content */}
            <motion.div
                className="flex-1 min-w-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30%" }}
                transition={{
                    duration: 0.7,
                    delay: delay + 0.4,
                    ease: [0.25, 0.1, 0.25, 1]
                }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

export default AnimatedTimelineStep;
