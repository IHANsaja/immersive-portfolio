'use client';

import React from 'react';
import AnimatedHoverButton from '@/components/Ui/Button';
import gsap from 'gsap';
import {useGSAP} from "@gsap/react";

interface MenuButtonProps {
    onClick: () => void;
}

export default function MenuButton({ onClick }: MenuButtonProps) {

    useGSAP(() => {
        gsap.from('#menu-button', {
            duration: 2,
            y: 200,
            opacity: 0,
            ease: 'power1.in',
            delay: 4,
        })
    }, [])

    return (
        <div id="menu-button" className="pointer-events-auto">
            <AnimatedHoverButton
                text="MENU"
                bgColor="#191919"
                onClick={onClick}
            />
        </div>
    );
}