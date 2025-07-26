"use client";

import React, { useEffect } from 'react';
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

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrambleTextPlugin);

const Home: React.FC = () => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            ScrollSmoother.create({ smooth: 1, effects: true });
        }
    }, []);

    return (
        <main>
            <SvgFrame />
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