import React, { useRef, useState, useEffect } from 'react';

interface BlurFadeProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
    yOffset?: number;
    inView?: boolean;
    blur?: string;
}

export const BlurFade: React.FC<BlurFadeProps> = ({
    children,
    delay = 0,
    duration = 0.5,
    className = "",
    yOffset = 10,
    inView = true,
    blur = "6px"
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!inView) {
            setIsVisible(false);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(ref.current!);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [inView]);

    const style = {
        transitionDelay: `${delay}s`,
        transitionDuration: `${duration}s`,
        filter: isVisible ? 'blur(0px)' : `blur(${blur})`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${yOffset}px)`,
    };

    return (
        <div
            ref={ref}
            className={`transition-all ease-out will-change-[transform,opacity,filter] ${className}`}
            style={style}
        >
            {children}
        </div>
    );
};
