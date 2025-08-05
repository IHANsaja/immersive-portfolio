"use client";

import React, { useState, useEffect } from 'react';
import Preloader from './Preloader';

const PreloaderWrapper = ({ children }: { children: React.ReactNode }) => {
    const [showPreloader, setShowPreloader] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        setIsClient(true);
        document.fonts.ready.then(() => setFontsLoaded(true));
    }, []);

    const handleLoadingComplete = () => {
        setTimeout(() => {
            setShowPreloader(false); // Only now render the children
        }, 300);
    };

    if (!isClient || !fontsLoaded) return null;

    return (
        <>
            {showPreloader ? (
                <Preloader onLoadingComplete={handleLoadingComplete} />
            ) : (
                children // Only render children AFTER preloader completes
            )}
        </>
    );
};

export default PreloaderWrapper;
