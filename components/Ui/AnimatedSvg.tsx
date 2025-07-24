// components/AnimatedSvg.tsx
'use client'; // This directive is necessary for Next.js App Router

import React, { useEffect, useRef } from 'react';

/**
 * Calculates a "ping-pong" progress value (0 -> 1 -> 0) over a given duration.
 * @param elapsedTime - The total time elapsed since the animation started.
 * @param duration - The total duration for one full round trip.
 * @returns A progress value between 0 and 1.
 */
const calculatePingPongProgress = (elapsedTime: number, duration: number): number => {
    const halfDuration = duration / 2;
    const timeInCycle = elapsedTime % duration;

    if (timeInCycle < halfDuration) {
        // Forward trip: progress goes from 0 to 1
        return timeInCycle / halfDuration;
    } else {
        // Backward trip: progress goes from 1 to 0
        return 1 - (timeInCycle - halfDuration) / halfDuration;
    }
};

const AnimatedSvg = () => {
    const pathRef = useRef<SVGPathElement>(null);
    const emptyBoxRef = useRef<SVGRectElement>(null);
    const secondEmptyBoxRef = useRef<SVGRectElement>(null);
    const filledBoxRef = useRef<SVGRectElement>(null);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const path = pathRef.current;
        const emptyBox = emptyBoxRef.current;
        const filledBox = filledBoxRef.current;
        const secondEmptyBox = secondEmptyBoxRef.current;

        if (!path || !emptyBox || !filledBox) return;

        const pathLength = path.getTotalLength();

        const emptyBoxDuration = 4000;
        const filledBoxDuration = 4000;
        const secondEmptyBoxDuration = 3980;

        let startTime: number | undefined;
        let loopCount = 0;

        const animate = (timestamp: number) => {
            if (startTime === undefined) {
                startTime = timestamp;
            }

            const elapsedTime = timestamp - startTime;

            // Count full loops (1 loop = 1 full ping-pong cycle of the reference box)
            const fullLoops = Math.floor(elapsedTime / emptyBoxDuration);
            if (fullLoops >= 10) {
                // Reset animation loop
                startTime = timestamp;
                loopCount = 0;
            } else {
                loopCount = fullLoops;
            }

            // Animate emptyBox
            const emptyProgress = calculatePingPongProgress(elapsedTime, emptyBoxDuration);
            const { x: x1, y: y1 } = path.getPointAtLength(emptyProgress * pathLength);
            const emptyW = parseFloat(emptyBox.getAttribute('width') || '0');
            const emptyH = parseFloat(emptyBox.getAttribute('height') || '0');
            const emptyScale = 0.42813;
            emptyBox.setAttribute('transform', `translate(${x1 - (emptyW * emptyScale) / 2} ${y1 - (emptyH * emptyScale) / 2}) scale(${emptyScale})`);

            // Animate filledBox
            const filledProgress = calculatePingPongProgress(elapsedTime, filledBoxDuration);
            const { x: x2, y: y2 } = path.getPointAtLength(filledProgress * pathLength);
            const filledW = parseFloat(filledBox.getAttribute('width') || '0');
            const filledH = parseFloat(filledBox.getAttribute('height') || '0');
            const filledScale = 1 + filledProgress * (2.5 - 1);
            filledBox.setAttribute('transform', `translate(${x2 - (filledW * filledScale) / 2} ${y2 - (filledH * filledScale) / 2}) scale(${filledScale})`);

            // Animate secondEmptyBox
            if (secondEmptyBox) {
                const secondProgress = calculatePingPongProgress(elapsedTime, secondEmptyBoxDuration);
                const { x: x3, y: y3 } = path.getPointAtLength(secondProgress * pathLength);
                const secondW = parseFloat(secondEmptyBox.getAttribute('width') || '0');
                const secondH = parseFloat(secondEmptyBox.getAttribute('height') || '0');
                const secondScale = 0.42813;
                secondEmptyBox.setAttribute('transform', `translate(${x3 - (secondW * secondScale) / 2} ${y3 - (secondH * secondScale) / 2}) scale(${secondScale})`);
            }

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    return (
        <svg
            id="animated-svg-component"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 300 300"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            style={{ width: '300px', height: '300px', background: 'transparent', transform: 'scale(2)' }}
        >
            {/* The path the boxes will follow */}
            <path
                ref={pathRef}
                d="M100.457535,204.603946L215.413211,72.490706"
                fill="none"
                stroke="#f0dbee"
                strokeWidth="0.5"
            />
            {/* The empty, constant-size box */}
            <rect
                ref={emptyBoxRef}
                width="27.752359"
                height="27.752359"
                fill="none"
                stroke="#f0dbee"
            />
            <rect
                ref={secondEmptyBoxRef}
                width="27.752359"
                height="27.752359"
                fill="none"
                stroke="#f0dbee"
            />
            {/* The filled box that changes size */}
            <rect
                ref={filledBoxRef}
                width="5.940809"
                height="5.940809"
                fill="#f0dbee"
                strokeWidth="0"
            />
            {/* Decorative static elements for context */}
            <polygon
                points="0,-9.223868 7.988104,4.611934 -7.988104,4.611934 0,-9.223868"
                transform="matrix(-.307921-.268374 0.268373-.30792 101.972641 202.865575)"
                fill="#f0dbee"
                strokeWidth="0"
            />
            <ellipse
                rx="30"
                ry="30"
                transform="matrix(.107567 0 0 0.107567 215.413211 72.490706)"
                fill="none"
                stroke="#f0dbee"
            />
            <ellipse
                rx="30"
                ry="30"
                transform="matrix(.057729 0 0 0.057729 215.413211 72.490706)"
                fill="#f0dbee"
                strokeWidth="0"
            />
        </svg>
    );
};

export default AnimatedSvg;