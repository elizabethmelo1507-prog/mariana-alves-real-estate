import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
    children: React.ReactNode;
    className?: string;
    as?: any;
    animationNum?: number;
    timelineRef?: any;
    customVariants?: any;
    key?: any;
}

export const TimelineContent = ({
    children,
    className,
    as: Component = motion.div,
    animationNum = 0,
    customVariants,
    ...props
}: TimelineContentProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const defaultVariants = {
        hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.5,
                delay: animationNum * 0.2,
            },
        },
    };

    return (
        <Component
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={customVariants || defaultVariants}
            custom={animationNum}
            className={cn(className)}
            {...props}
        >
            {children}
        </Component>
    );
};
