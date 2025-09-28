"use client";

import React, { useState, useEffect } from 'react';
import AnimatedHoverButton from "@/components/Ui/Button";
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";

const GrButtons = () => {
    const [showGithub, setShowGithub] = useState(true); // Start as visible
    const [showResume, setShowResume] = useState(true); // Start as visible
    const [hasAnimated, setHasAnimated] = useState(false);

    // Animate buttons like menu button with same delay
    useGSAP(() => {
        // Set initial state - make them visible immediately
        gsap.set('#github-button', { y: 0, opacity: 1 });
        gsap.set('#resume-button', { y: 0, opacity: 1 });

        // Set states immediately for visibility
        setShowGithub(true);
        setShowResume(true);
        setHasAnimated(true);

        // Optional: Add a subtle entrance animation with stagger
        gsap.from('#github-button, #resume-button', {
            duration: 1.5,
            y: -80,
            opacity: 0,
            ease: 'power2.out',
            delay: 5,
            stagger: 0.8
        });
    }, []);

    // Re-animate when returning to hero section
    useEffect(() => {
        const handleSectionEnter = () => {
            if (hasAnimated) {
                gsap.from('#github-button', {
                    duration: 1,
                    y: 200,
                    opacity: 0,
                    ease: 'power2.out',
                    onComplete: () => setShowGithub(true)
                });

                gsap.from('#resume-button', {
                    duration: 1,
                    y: 200,
                    opacity: 0,
                    ease: 'power2.out',
                    delay: 0.2,
                    onComplete: () => setShowResume(true)
                });
            }
        };

        // Listen for section changes
        window.addEventListener('sectionPinned', (event: any) => {
            if (event.detail?.sectionId === 'hero-section') {
                handleSectionEnter();
            }
        });

        return () => {
            window.removeEventListener('sectionPinned', handleSectionEnter);
        };
    }, [hasAnimated]);

    const githubClick = () => {
        if (showGithub) {
            window.open('https://github.com/IHANsaja', '_blank');
        }
    }

    const resumeClick = () => {
        if (showResume) {
            const link = document.createElement('a');
            link.href = '/resume/Ihan_Hansaja_Resume.pdf';
            link.download = 'Ihan_Hansaja_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div id="gr-buttons" className="flex flex-row gap-8 mt-15 mr-15 relative z-[10002]">
            <div id="github-button" className="pointer-events-auto" style={{ opacity: 1, transform: 'translateY(0px)' }}>
                <AnimatedHoverButton 
                    text="github" 
                    bgColor={'#3F51B5'} 
                    onClick={githubClick}
                />
            </div>
            <div id="resume-button" className="pointer-events-auto" style={{ opacity: 1, transform: 'translateY(0px)' }}>
                <AnimatedHoverButton 
                    text="resume" 
                    bgColor={'#191919'} 
                    onClick={resumeClick}
                />
            </div>
        </div>
    )
}
export default GrButtons
