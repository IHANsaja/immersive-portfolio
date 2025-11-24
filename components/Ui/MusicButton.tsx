"use client";
import React, { useRef, useEffect } from "react";
import { animate, utils, svg } from "animejs";
import { useMusic } from "./MusicProvider";

const MusicButton = () => {
    const { isPlaying, toggleMusic, playHover } = useMusic();
    const animationRef = useRef<ReturnType<typeof animate> | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const generatePoints = () => {
        const total = 20;
        const width = 100;
        const height = 16;
        const midY = height / 2;
        let points = "";
        for (let i = 0; i <= total; i++) {
            const x = (i / total) * width;
            const variance = utils.random(2, midY);
            const y = midY + (i % 2 === 0 ? variance : -variance) / 2;
            points += `${x},${y} `;
        }
        return points.trim();
    };

    useEffect(() => {
        const wave1 = document.querySelector("#wave1") as SVGPolygonElement;
        const wave2 = document.querySelector("#wave2") as SVGPolygonElement;

        const animateWave = () => {
            if (!isPlaying || !wave1 || !wave2) return;
            const newPoints = generatePoints();
            utils.set(wave2, { points: newPoints });

            animationRef.current = animate(wave1, {
                points: svg.morphTo(wave2),
                duration: 5000,
                easing: "easeInOutSine",
                complete: () => {
                    if (isPlaying) {
                        timeoutRef.current = window.setTimeout(() => animateWave(), 0);
                    }
                },
            });
        };

        if (isPlaying) animateWave();

        return () => {
            if (animationRef.current) animationRef.current.pause();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isPlaying]);

    return (
        <button
            onMouseEnter={playHover}
            onClick={toggleMusic}
            className="sound-button relative w-12 h-6 bg-[#191919] rounded-sm flex items-center justify-center overflow-hidden cursor-pointer border border-[#46a0f9] md:border-none"
        >
            {isPlaying ? (
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <polygon id="wave1" points={generatePoints()} fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
                    <polygon id="wave2" points="" fill="none" stroke="none" opacity="0" />
                </svg>
            ) : (
                <span className="font-inconsolata-sans">OFF</span>
            )}
        </button>
    );
};

export default MusicButton;
