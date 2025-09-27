"use client";

import React, { useState, useEffect } from 'react';
import AnimatedHoverButton from "@/components/Ui/Button";
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";

const GrButtons = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showGithub, setShowGithub] = useState(false);
    const [showResume, setShowResume] = useState(false);

    // Check if we're on hero section
    useEffect(() => {
        const checkHeroSection = () => {
            const heroSection = document.querySelector('#hero-section');
            if (heroSection) {
                const rect = heroSection.getBoundingClientRect();
                const isInHero = rect.top <= 0 && rect.bottom >= window.innerHeight;
                setIsVisible(isInHero);
            }
        };

        checkHeroSection();
        window.addEventListener('scroll', checkHeroSection);
        window.addEventListener('sectionPinned', checkHeroSection);

        return () => {
            window.removeEventListener('scroll', checkHeroSection);
            window.removeEventListener('sectionPinned', checkHeroSection);
        };
    }, []);

    // Animate buttons like menu button with same delay
    useGSAP(() => {
        if (isVisible) {
            gsap.from('#github-button', {
                duration: 2,
                y: 200,
                opacity: 0,
                ease: 'power1.in',
                delay: 5,
                onComplete: () => setShowGithub(true)
            });

            gsap.from('#resume-button', {
                duration: 2,
                y: 200,
                opacity: 0,
                ease: 'power1.in',
                delay: 5.2, // Slight stagger
                onComplete: () => setShowResume(true)
            });
        }
    }, [isVisible]);

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

    // Only render if visible (on hero section)
    if (!isVisible) return null;

    return (
        <div id="gr-buttons" className="flex flex-row gap-8 mt-15 mr-15">
            <div id="github-button" className="pointer-events-auto">
                <AnimatedHoverButton 
                    text="github" 
                    bgColor={'#3F51B5'} 
                    onClick={githubClick}
                />
            </div>
            <div id="resume-button" className="pointer-events-auto">
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
