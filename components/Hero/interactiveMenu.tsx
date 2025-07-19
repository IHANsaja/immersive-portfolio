// components/FullPage/interactiveMenu.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import SpaceshipNav from '@/components/Ui/navbar';
import MenuButton from './menuButton';

export default function InteractiveMenu() {
    const [showNav, setShowNav] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // This effect ensures that the portal is only created on the client-side,
    // as `document.body` is not available during server-side rendering.
    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <>
            {/* The button is rendered in its normal place in the component tree */}
            <MenuButton onClick={() => setShowNav(true)} />

            {/* If mounted and showNav is true, create a portal */}
            {isMounted && showNav && createPortal(
                // The SpaceshipNav is rendered inside the portal, attached to the body
                <SpaceshipNav showPopup={showNav} onClose={() => setShowNav(false)} />,
                document.body
            )}
        </>
    );
}