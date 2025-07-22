"use client";

import SvgFrame from "@/components/Hero/Frame";
import gsap from "@/app/utils/gsapClient";
import ScrollTrigger from "gsap/all";
import ScrollSmoother from "gsap/all";
import HeroSection from "@/sections/HeroSection";
import AboutSection from "@/sections/AboutSection";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const Home = () => {

    return (
        <main className="relative">
            <SvgFrame />
            <HeroSection />
            <AboutSection />
        </main>
    );
};

export default Home;
