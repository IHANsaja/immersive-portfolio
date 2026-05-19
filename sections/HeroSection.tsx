import GPUFluidCanvas from "@/components/Ui/HoverEffect";
import Image from "next/image";
import Spline from "@splinetool/react-spline";
import GrButtons from "@/components/Hero/GrButtons";
import Welcome from "@/components/Hero/Welcome";
import React, {useRef, useState, useEffect, Suspense} from "react";
import { motion } from "framer-motion";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {SplitText} from "gsap/SplitText";

const HeroSection = () => {
    const headlineRef = useRef(null);
    const tl = useRef(gsap.timeline()).current;
    const [isReady, setIsReady] = useState(false);
    const [showSpline, setShowSpline] = useState(false);
    const [showGPUCanvas, setShowGPUCanvas] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);

    // Initialize hero section immediately without waiting for fonts
    useGSAP(() => {
        const headline = headlineRef.current;
        if (!headline) return;

        // Start animation immediately, don't wait for fonts
        gsap.set(headline, { opacity: 0 });
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            const split = new SplitText(headline, { type: "words" });

            tl.to(headline, {
                opacity: 1,
                duration: 0.5,
            })
                .from(split.words, {
                    duration: 1.5,
                    ease: "power2.inOut",
                    scrambleText: {
                        text: "IHAN",
                        chars: "@#$%^&*()",
                        speed: 0.2,
                        revealDelay: 0.2,
                    },
                    stagger: 0.3,
                    onComplete: () => split.revert(),
                })
                .from(headline, {
                    y: -300,
                    duration: 2,
                    ease: "power2.inOut",
                }, "+=0.2")
                .call(() => {
                    setIsReady(true);
                    setHasAnimated(true);
                });
        });
    }, []);


    // Load heavy components after hero animation starts
    useEffect(() => {
        const timer1 = setTimeout(() => setShowGPUCanvas(true), 1000);
        const timer2 = setTimeout(() => setShowSpline(true), 2000);
        
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    // Load Spline scene when user enters hero section (after preloader)
    useEffect(() => {
        const handlePreloaderComplete = () => {
            // Load Spline scene immediately when preloader completes
            setShowSpline(true);
        };

        // Listen for preloader completion
        window.addEventListener('preloaderComplete', handlePreloaderComplete);
        
        // Also check if we're already past the preloader
        const checkIfReady = () => {
            const preloader = document.querySelector('[data-preloader]');
            if (!preloader) {
                setShowSpline(true);
            }
        };
        
        // Check immediately and after a delay
        checkIfReady();
        const checkTimer = setTimeout(checkIfReady, 1000);
        
        return () => {
            window.removeEventListener('preloaderComplete', handlePreloaderComplete);
            clearTimeout(checkTimer);
        };
    }, []);

    return (
        <section id="hero-section" className="relative w-screen h-screen z-1">
            {/* Load GPU Canvas after delay to prevent blocking */}
            {showGPUCanvas && <GPUFluidCanvas />}

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

            <div className="absolute top-0 left-0 w-screen flex justify-end gap-8 items-center z-[10000]">
                <GrButtons />
            </div>

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
