"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VerticalCutRevealProps {
    children: string;
    className?: string;
    splitBy?: "words" | "characters" | "lines";
    staggerDuration?: number;
    staggerFrom?: "first" | "last" | "center" | number;
    reverse?: boolean;
    containerClassName?: string;
    transition?: any;
}

export const VerticalCutReveal = ({
    children,
    className,
    splitBy = "words",
    staggerDuration = 0.1,
    staggerFrom = "first",
    reverse = false,
    containerClassName,
    transition,
}: VerticalCutRevealProps) => {
    const words = children.split(" ");

    return (
        <div className={cn("flex flex-wrap gap-2", containerClassName)}>
            {words.map((word, i) => (
                <span key={i} className="overflow-hidden inline-block">
                    <motion.span
                        initial={{ y: "100%" }}
                        whileInView={{ y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.5,
                            delay: i * staggerDuration,
                            ease: [0.33, 1, 0.68, 1],
                            ...transition,
                        }}
                        className={cn("inline-block", className)}
                    >
                        {word}
                    </motion.span>
                </span>
            ))}
        </div>
    );
};
