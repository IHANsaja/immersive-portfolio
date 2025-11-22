"use client";

import React, { useRef, useState, useEffect, Suspense, memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

// Lazy load heavy components
const GPUFluidCanvas = React.lazy(() => import("@/components/Ui/HoverEffect"));
const Spline = React.lazy(() => import("@splinetool/react-spline"));
const GrButtons = React.lazy(() => import("@/components/Hero/GrButtons"));

interface WelcomeProps {
    headlineRef?: React.RefObject<null>
}

const Welcome = memo(({ headlineRef }: WelcomeProps) => {
    return (
        <div className="flex justify-center items-center h-screen w-screen overflow-hidden">
            <h1
                ref={headlineRef}
                id="welcome"
                className="
          font-neotriad-sans
          text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-[100px]
          text-[var(--foreground)]
          text-shadow-lg text-center whitespace-nowrap
          px-4 sm:px-8 z-5
        "
            >
                <span className="text-6xl">WELCOME TO </span><br />
                MY PORTFOLIO
            </h1>
        </div>
    );
});

Welcome.displayName = 'Welcome';

const HeroSection = () => {
    const headlineRef = useRef(null);
    const tl = useRef(gsap.timeline()).current;
    const [isReady, setIsReady] = useState(false);
    const [showSpline, setShowSpline] = useState(false);
    const [showGPUCanvas, setShowGPUCanvas] = useState(false);
    const [showButtons, setShowButtons] = useState(false);

    // Initialize hero section
    useGSAP(() => {
        const headline = headlineRef.current;
        if (!headline) return;

        // Initial state
        gsap.set(headline, { opacity: 0 });

        const startAnimation = () => {
            requestAnimationFrame(() => {
                const split = new SplitText(headline, { type: "words" });

                tl.to(headline, {
                    opacity: 1,
                    duration: 0.5,
                })
                    .from(split.words, {
                        duration: 1.2,
                        ease: "power2.inOut",
                        scrambleText: {
                            text: "IHAN",
                            chars: "@#$%^&*()",
                            speed: 0.2,
                            revealDelay: 0.2,
                        },
                        stagger: 0.2,
                        onComplete: () => split.revert(),
                    })
                    .from(headline, {
                        y: -300,
                        duration: 1.5,
                        ease: "power2.inOut",
                    }, "+=0.2")
                    .call(() => setIsReady(true));
            });
        };

        // Check if preloader is already done (e.g. on navigation back to home)
        // Since we don't have a global state for preloader here, we can listen for the event.
        // However, if the component mounts AFTER preloader is done, we might miss the event.
        // But HeroSection is mounted immediately now.

        const handlePreloaderComplete = () => {
            startAnimation();
        };

        window.addEventListener('preloaderComplete', handlePreloaderComplete);

        // Fallback: if preloader is not present (e.g. dev mode or disabled), start after a delay
        // or check a global flag if available. For now, we assume preloader is always there on first load.
        // But if we navigate away and back? PreloaderWrapper handles that.

        return () => {
            window.removeEventListener('preloaderComplete', handlePreloaderComplete);
        };
    }, []);

    // Load heavy components after hero animation starts
    useEffect(() => {
        const timer1 = setTimeout(() => setShowButtons(true), 200); // Faster button loading
        const timer2 = setTimeout(() => setShowGPUCanvas(true), 1000);
        const timer3 = setTimeout(() => setShowSpline(true), 2000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    return (
        <section id="hero-section" className="relative w-screen h-screen z-1">
            {/* Load GPU Canvas after delay to prevent blocking */}
            {showGPUCanvas && (
                <Suspense fallback={null}>
                    <GPUFluidCanvas />
                </Suspense>
            )}

            <div
                id="background-container"
                className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            >
                <Image
                    src="/background.jpg"
                    alt="sci-fi background"
                    fill
                    style={{ objectFit: "cover" }}
                    className="pointer-events-none mix-blend-plus-darker md:mix-blend-normal"
                    id="background-image"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/webp;base64,..."
                />
            </div>

            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.5%22%20cy=%220.5%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay pointer-events-none" />
            </div>

            {/* Load Spline scene after delay to prevent blocking */}
            <div id="scene" className="absolute inset-0 z-[9998]">
                {showSpline ? (
                    <Suspense fallback={
                        <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 animate-pulse" />
                    }>
                        <Spline
                            scene="https://prod.spline.design/1z1FrReDGZG28VHJ/scene.splinecode"
                            className="w-full h-full"
                        />
                    </Suspense>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 animate-pulse" />
                )}
            </div>

            {/* Load buttons after delay - MADE VISIBLE */}
            {showButtons && (
                <div className="absolute top-0 left-0 w-screen flex justify-end gap-8 items-center z-[10000] p-4">
                    <Suspense fallback={
                        <div className="flex gap-8">
                            <div className="w-24 h-12 bg-gray-800 animate-pulse rounded"></div>
                            <div className="w-24 h-12 bg-gray-800 animate-pulse rounded"></div>
                        </div>
                    }>
                        <GrButtons />
                    </Suspense>
                </div>
            )}

            <Welcome headlineRef={headlineRef} />

            <div className="absolute bottom-[-50px] md:bottom-[-300px] left-0 w-screen z-[9998] pointer-events-none overflow-visible flex justify-center">
                <motion.div
                    animate={{
                        y: [0, -10, 0], // gentle up and down
                        x: [0, 5, 0],   // slight horizontal drift
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="w-full max-w-[90vw]"
                >
                    <Image
                        src="/backgrounds/clouds.png"
                        alt="clouds"
                        width={1920}
                        height={200}
                        className="w-full h-auto object-contain opacity-85"
                        priority
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;