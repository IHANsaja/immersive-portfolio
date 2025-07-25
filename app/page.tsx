"use client";

import { useEffect } from "react";
import SvgFrame from "@/components/Hero/Frame";
import gsap from "gsap";
import { ScrollTrigger, ScrollSmoother, ScrambleTextPlugin } from "gsap/all";

import HeroSection from "@/sections/HeroSection";
import AboutSection from "@/sections/AboutSection";
import Menu from "@/components/Hero/Menu";
import ProjectsSection from "@/sections/ProjectsSection";

// Register plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrambleTextPlugin);

const Home = () => {
    useEffect(() => {
        if (typeof window !== "undefined") {
            ScrollSmoother.create({
                smooth: 1,
                effects: true,
            });
        }
    }, []);

    return (
        <main className="relative">
            <SvgFrame />
            <div id="smooth-wrapper">
                <div id="smooth-content">
                    <HeroSection />
                    <AboutSection />
                    <ProjectsSection />
                </div>
            </div>
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[10000]">
                <Menu />
            </div>
        </main>
    );
};

export default Home;
