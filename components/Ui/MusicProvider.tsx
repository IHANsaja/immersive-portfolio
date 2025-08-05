"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface MusicContextType {
    isPlaying: boolean;
    toggleMusic: () => void;
    playHover: () => void;
    playClick: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const mainAudioRef = useRef<HTMLAudioElement | null>(null);
    const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
    const clickAudioRef = useRef<HTMLAudioElement | null>(null);
    const hasInteracted = useRef(false);

    useEffect(() => {
        // Mark the first user interaction to allow autoplay
        const markInteraction = () => {
            hasInteracted.current = true;
            window.removeEventListener("click", markInteraction);
        };
        window.addEventListener("click", markInteraction);

        mainAudioRef.current = new Audio("/sounds/backgroundMusic.mp3");
        mainAudioRef.current.volume = 0.2;
        mainAudioRef.current.loop = true;

        hoverAudioRef.current = new Audio("/sounds/hover.mp3");
        hoverAudioRef.current.volume = 0.5;

        clickAudioRef.current = new Audio("/sounds/click.mp3");
        clickAudioRef.current.volume = 0.5;
    }, []);

    useEffect(() => {
        if (mainAudioRef.current) {
            if (isPlaying) {
                mainAudioRef.current.play().catch(() => {
                    // Suppress autoplay error silently
                });
            } else {
                mainAudioRef.current.pause();
                mainAudioRef.current.currentTime = 0;
            }
        }
    }, [isPlaying]);

    const toggleMusic = () => {
        setIsPlaying((prev) => !prev);
        if (clickAudioRef.current) {
            try {
                clickAudioRef.current.currentTime = 0;
                clickAudioRef.current.play().catch(() => {});
            } catch {}
        }
    };

    const playHover = () => {
        if (!hasInteracted.current) return; // Skip hover sound if no interaction
        if (hoverAudioRef.current) {
            try {
                hoverAudioRef.current.currentTime = 0;
                hoverAudioRef.current.play().catch(() => {});
            } catch {}
        }
    };

    return (
        <MusicContext.Provider value={{ isPlaying, toggleMusic, playHover, playClick: toggleMusic }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (!context) throw new Error("useMusic must be used within MusicProvider");
    return context;
};
