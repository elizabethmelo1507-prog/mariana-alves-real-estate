"use client";
import React from "react";
import { motion } from "framer-motion";

export interface Testimonial {
    text: string;
    image: string;
    name: string;
    role: string;
}

export const TestimonialsColumn = (props: {
    className?: string;
    testimonials: Testimonial[];
    duration?: number;
}) => {
    return (
        <div className={props.className}>
            <motion.div
                animate={{
                    translateY: "-50%",
                }}
                transition={{
                    duration: props.duration || 10,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                }}
                className="flex flex-col gap-6 pb-6"
            >
                {[...new Array(2)].map((_, index) => (
                    <React.Fragment key={index}>
                        {props.testimonials.map(({ text, image, name, role }, i) => (
                            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow max-w-sm w-full" key={i}>
                                <div className="text-gray-600 leading-relaxed mb-6">"{text}"</div>
                                <div className="flex items-center gap-3">
                                    <img
                                        width={48}
                                        height={48}
                                        src={image}
                                        alt={name}
                                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-100"
                                    />
                                    <div className="flex flex-col">
                                        <div className="font-bold text-dark-accent tracking-tight leading-tight">{name}</div>
                                        <div className="text-xs font-medium text-primary uppercase tracking-wider mt-0.5">{role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </motion.div>
        </div>
    );
};
