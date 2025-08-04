"use client"

import { motion } from "motion/react";

interface AnimatedGridProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
    duration?: number;
}

export function AnimatedGrid({
    children,
    className = "",
    staggerDelay = 0.1,
    duration = 0.8
}: AnimatedGridProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20%" }}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: 0.1
                    }
                }
            }}
        >
            {Array.isArray(children) ?
                children.map((child, index) => (
                    <motion.div
                        key={index}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: duration,
                                    ease: [0.25, 0.1, 0.25, 1]
                                }
                            }
                        }}
                    >
                        {child}
                    </motion.div>
                )) : (
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: duration,
                                    ease: [0.25, 0.1, 0.25, 1]
                                }
                            }
                        }}
                    >
                        {children}
                    </motion.div>
                )
            }
        </motion.div>
    );
}

export default AnimatedGrid;
