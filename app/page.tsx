"use client";

import React, { useEffect, useRef, lazy } from 'react';
import SvgFrame from '@/components/Hero/Frame';
import gsap from 'gsap';
// Import only the GSAP plugins you need to reduce bundle size
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import ModelWrapper from '@/components/About/ModelWrapper';
import Menu from "@/components/Hero/Menu";
import MusicButton from "@/components/Ui/MusicButton";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);

// Custom event for section pinning
const SECTION_PINNED_EVENT = 'sectionPinned';

// --- Lazy-load your page sections ---
const HeroSection = lazy(() => import('@/sections/HeroSection'));
const AboutSection = lazy(() => import('@/sections/AboutSection'));
const ProjectsSection = lazy(() => import('@/sections/ProjectsSection'));
const SkillSection = lazy(() => import('@/sections/SkillSection'));
const ContactSection = lazy(() => import('@/sections/ContactSection'));

const Home: React.FC = () => {
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // This effect should only run on the client
        const smoother = ScrollSmoother.create({
            smooth: 1,
            effects: true,
        });

        const sections = ["#hero-section", "#about-section", "#projects-section", "#skill-section", "#contact-section"];

        sections.forEach((section, index) => {
            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
                onUpdate: (self) => {
                    if (progressRef.current) {
                        const width = (index + self.progress) / sections.length * 100;
                        progressRef.current.style.width = `${width}%`;
                    }
                },
                onEnter: () => {
                    const sectionId = section.replace('#', '');
                    window.dispatchEvent(new CustomEvent(SECTION_PINNED_EVENT, { detail: { sectionId } }));
                },
                onEnterBack: () => {
                    const sectionId = section.replace('#', '');
                    window.dispatchEvent(new CustomEvent(SECTION_PINNED_EVENT, { detail: { sectionId } }));
                }
            });
        });

        // Cleanup on unmount
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            smoother.kill();
        };
    }, []); // Empty dependency array ensures this runs only once

    return (
        <main>
            <SvgFrame />
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

            <div className="fixed bottom-10 md:bottom-20 left-1/2 transform -translate-x-1/2 z-[10000]">
                <Menu />
            </div>
            <div className="fixed top-10 left-10 z-[10000]">
                <MusicButton />
            </div>
        </main>
    );
};

export default Home;