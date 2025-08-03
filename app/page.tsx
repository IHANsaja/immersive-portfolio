"use client";

import React, { useEffect, useRef } from 'react';
import SvgFrame from '@/components/Hero/Frame';
import gsap from 'gsap';
import { ScrollTrigger, ScrollSmoother, ScrambleTextPlugin } from 'gsap/all';
import ModelWrapper from '@/components/About/ModelWrapper';
import HeroSection from '@/sections/HeroSection';
import AboutSection from '@/sections/AboutSection';
import ProjectsSection from '@/sections/ProjectsSection';
import ContactSection from '@/sections/ContactSection';
import Menu from "@/components/Hero/Menu";
import SkillSection from "@/sections/SkillSection";

// Custom event for section pinning
const SECTION_PINNED_EVENT = 'sectionPinned';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrambleTextPlugin);

const Home: React.FC = () => {
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Create ScrollSmoother first
            const smoother = ScrollSmoother.create({ 
                smooth: 1, 
                effects: true,
                normalizeScroll: { allowNestedScroll: true }, // helps with compatibility
            });

            // Create a timeline for section pinning
            const sections = ["#hero-section", "#about-section", "#projects-section", "#skill-section", "#contact-section"];

            // Set up pinning for each section
            sections.forEach((section, index) => {
                ScrollTrigger.create({
                    trigger: section,
                    start: "top top",
                    end: "bottom top",
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1, // helps prevent jittering
                    markers: false,
                    id: `section-pin-${index}`,
                    onUpdate: (self) => {
                        // Update progress bar for the current section
                        if (progressRef.current) {
                            const progress = self.progress;
                            const width = (index + progress) / sections.length * 100;
                            progressRef.current.style.width = `${width}%`;
                        }
                    },
                    onEnter: () => {
                        // Dispatch custom event when section is pinned
                        const sectionId = section.replace('#', '');
                        window.dispatchEvent(new CustomEvent(SECTION_PINNED_EVENT, { 
                            detail: { sectionId, action: 'enter' } 
                        }));
                    },
                    onEnterBack: () => {
                        // Dispatch custom event when returning to a section
                        const sectionId = section.replace('#', '');
                        window.dispatchEvent(new CustomEvent(SECTION_PINNED_EVENT, { 
                            detail: { sectionId, action: 'enterBack' } 
                        }));
                    }
                });
            });

            // Clean up ScrollTrigger instances on unmount
            return () => {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
                smoother.kill();
            };
        }
    }, []);

    return (
        <main>
            <SvgFrame />
            {/* Progress bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-[10001]">
                <div
                    ref={progressRef}
                    className="h-full bg-blue-500"
                    style={{ width: '0%', transition: 'width 0.1s ease-out' }}
                ></div>
            </div>
            <div id="smooth-wrapper">
                <div id="smooth-content">
                    <HeroSection />
                    <AboutSection />
                    <ProjectsSection />
                    <SkillSection />
                    <ContactSection />
                </div>
            </div>
            <ModelWrapper />
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[10000]">
                <Menu />
            </div>
        </main>
    );
};

export default Home;
