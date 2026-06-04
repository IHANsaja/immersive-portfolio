"use client";

import React, { useState, useEffect } from 'react';
import AnimatedHoverButton from "@/components/Ui/Button";
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";

const GrButtons = () => {
    const [showGithub, setShowGithub] = useState(true); // Start as visible
    const [showResume, setShowResume] = useState(true); // Start as visible
    const [hasAnimated, setHasAnimated] = useState(false);

    // Initial states: let them be driven by parent timeline or visible by default
    const { contextSafe } = useGSAP(() => {
        setShowGithub(true);
        setShowResume(true);
        setHasAnimated(true);
    }, []);

    // Re-animate when returning to hero section
    useEffect(() => {
        const handleSectionEnter = contextSafe(() => {
            if (hasAnimated) {
                // Kill any running animations on these elements to prevent conflicts
                gsap.killTweensOf('#github-button, #resume-button');

                // Reset to starting position for the "enter" animation
                // We want them to fly UP from the bottom (y: 200 -> y: 0)
                // But first, ensure they are visible so the 'from' tween works
                gsap.set('#github-button', { opacity: 1, y: 0 });
                gsap.set('#resume-button', { opacity: 1, y: 0 });

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
        });

        // Listen for section changes
        const handleSectionPinned = (event: Event) => {
            const customEvent = event as CustomEvent<{ sectionId: string }>;
            if (customEvent.detail?.sectionId === 'hero-section') {
                handleSectionEnter();
            }
        };
        window.addEventListener('sectionPinned', handleSectionPinned);

        return () => {
            window.removeEventListener('sectionPinned', handleSectionPinned);
        };
    }, [hasAnimated, contextSafe]);

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
        <div id="gr-buttons" className="flex flex-row gap-4 md:gap-8 mt-20 md:mt-15 mr-0 md:mr-15 relative z-[10002]">
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
