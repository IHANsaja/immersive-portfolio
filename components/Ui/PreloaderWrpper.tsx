"use client";

import React, { useState, useEffect } from 'react';
import Preloader from './Preloader';

const PreloaderWrapper = ({ children }: { children: React.ReactNode }) => {
    const [showPreloader, setShowPreloader] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Wait for fonts to load before showing preloader
        document.fonts.ready.then(() => {
            setFontsLoaded(true);
        });
    }, []);

    const handleLoadingComplete = () => {
        // Add a small delay for smooth transition
        setTimeout(() => {
            setShowPreloader(false);
        }, 300);
    };

    // Don't render anything until client-side and fonts are loaded
    if (!isClient || !fontsLoaded) {
        return null;
    }

    return (
        <>
            {showPreloader ? (
                <Preloader onLoadingComplete={handleLoadingComplete} />
            ) : (
                children
            )}
        </>
    );
};

export default PreloaderWrapper;
