import React, { useEffect, useState } from 'react';

interface IntroLoaderProps {
    onComplete?: () => void;
    targetRect?: { top: number; left: number; width: number; height: number } | null;
}

const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete, targetRect }) => {
    const [constructing, setConstructing] = useState(false);
    const [moved, setMoved] = useState(false);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        // 1. Start Construction Animation immediately
        const timer1 = setTimeout(() => {
            setConstructing(true);
        }, 100);

        // 2. Final Transition (Move to header)
        const timer2 = setTimeout(() => {
            setMoved(true);
            setFinished(true);
            if (onComplete) onComplete();
        }, 2500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onComplete]);

    const getLogoStyle = () => {
        if (moved && targetRect) {
            return {
                top: `${targetRect.top}px`,
                left: `${targetRect.left}px`,
                width: `${targetRect.width}px`,
                height: `${targetRect.height}px`,
                marginLeft: 0,
                marginTop: 0,
                transform: 'none',
                opacity: 1,
                strokeWidth: 2
            } as React.CSSProperties;
        }
        return {};
    };

    return (
        <div id="intro-loader" style={{ pointerEvents: 'none' }}>
            <div className={`bg-layer ${finished ? 'finished' : ''}`} id="bg-layer"></div>

            <svg
                id="main-logo"
                className={`logo-svg ${constructing ? 'constructing' : ''} ${moved ? 'moved-to-header' : ''}`}
                viewBox="0 0 24 24"
                style={getLogoStyle()}
            >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
        </div>
    );
};

export default IntroLoader;
