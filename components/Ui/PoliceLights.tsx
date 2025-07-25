'use client';

import React, { useEffect, useRef } from 'react';

interface PoliceLightsProps {
    rectWidth?: number;
    rectHeight?: number;
}

const PoliceLights: React.FC<PoliceLightsProps> = ({
                                                       rectWidth = 70,
                                                       rectHeight = 30,
                                                   }) => {
    const redLightRef = useRef<SVGRectElement>(null);
    const blueLightRef = useRef<SVGRectElement>(null);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const red = redLightRef.current;
        const blue = blueLightRef.current;

        if (!red || !blue) return;

        const blinkDuration = 1500;
        let startTime: number | undefined;

        const animate = (timestamp: number) => {
            if (startTime === undefined) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const t = (elapsed % blinkDuration) / blinkDuration;

            const redFade = Math.sin(Math.PI * t) ** 2;
            const blueFade = 1 - redFade;

            red.setAttribute('fill-opacity', redFade.toFixed(2));
            blue.setAttribute('fill-opacity', blueFade.toFixed(2));

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, []);

    return (
        <svg
            viewBox="0 0 200 100"
            style={{
                width: '100px',
                height: '50px',
                background: 'transparent',
            }}
        >
            <rect
                ref={redLightRef}
                x="30"
                y="30"
                width={rectWidth}
                height={rectHeight}
                fill="#f0dbee"
                fillOpacity="1"
            />
            <rect
                ref={blueLightRef}
                x={30 + rectWidth}
                y="30"
                width={rectWidth}
                height={rectHeight}
                fill="#f0dbee"
                fillOpacity="0"
            />
        </svg>
    );
};

export default PoliceLights;
