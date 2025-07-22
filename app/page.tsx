"use client";

import SvgFrame from "@/components/Hero/Frame";
import gsap from "gsap";
import ScrollTrigger from "gsap/all";
import ScrollSmoother from "gsap/all";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import HeroSection from "@/sections/HeroSection";
import AboutSection from "@/sections/AboutSection";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrambleTextPlugin);

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
