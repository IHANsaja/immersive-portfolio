import GPUFluidCanvas from "@/components/Ui/HoverEffect";
import Image from "next/image";
import Spline from "@splinetool/react-spline";
import GrButtons from "@/components/Hero/GrButtons";
import Welcome from "@/components/Hero/Welcome";
import React, { useRef, useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

const HeroSection = () => {
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const bgContainerRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const splineContainerRef = useRef<HTMLDivElement>(null);
    const gpuCanvasRef = useRef<HTMLDivElement>(null);

    // Mount assets in the background immediately so they are ready by the time the preloader finishes
    const [showSpline, setShowSpline] = useState(true);
    const [showGPUCanvas, setShowGPUCanvas] = useState(true);

    useGSAP(() => {
        const headline = headlineRef.current;
        const bgContainer = bgContainerRef.current;
        const buttons = buttonsRef.current;
        const splineContainer = splineContainerRef.current;
        const gpuCanvas = gpuCanvasRef.current;

        if (!headline || !bgContainer || !buttons || !splineContainer || !gpuCanvas) return;

        // Set initial states for elements before animation starts
        gsap.set(bgContainer, { opacity: 0, scale: 1.08 });
        gsap.set(headline, { opacity: 0 });
        gsap.set(buttons, { opacity: 0, y: -20 });
        gsap.set(splineContainer, { opacity: 0 });
        gsap.set(gpuCanvas, { opacity: 0 });

        const tl = gsap.timeline({
            paused: true,
            defaults: { ease: "power2.out" }
        });

        // 1. Starts with a background image as the first appearance in timeline
        tl.to(bgContainer, {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: "power2.inOut"
        });

        // 2. Animate the Welcome headline
        const split = new SplitText(headline, { type: "words" });
        tl.to(headline, {
            opacity: 1,
            duration: 0.4
        }, "-=0.5")
        .from(split.words, {
            duration: 1.2,
            ease: "power2.inOut",
            scrambleText: {
                text: "IHAN",
                chars: "@#$%^&*()",
                speed: 0.2,
                revealDelay: 0.1,
            },
            stagger: 0.2,
            onComplete: () => split.revert()
        }, "-=0.3")
        .fromTo(headline,
            { y: -150 },
            { y: 0, duration: 1.5, ease: "power3.out" },
            "-=0.6"
        );

        // 3. Fade in header buttons
        tl.to(buttons, {
            opacity: 1,
            y: 0,
            duration: 0.8
        }, "-=0.8");

        // 4. Before the last one, load and fade in the Spline scene
        tl.to(splineContainer, {
            opacity: 1,
            duration: 1.5,
            ease: "power2.out"
        }, "+=0.1");

        // 5. GPU fluid hover effect as the last element in timeline
        tl.to(gpuCanvas, {
            opacity: 1,
            duration: 1.0,
            ease: "power1.inOut"
        }, "+=0.1");

        // Play the timeline once preloader is complete
        const playTimeline = () => {
            tl.play();
        };

        window.addEventListener('preloaderComplete', playTimeline);

        // Fallback: If preloader is already gone
        if (!document.querySelector('[data-preloader]')) {
            tl.play();
        }

        return () => {
            window.removeEventListener('preloaderComplete', playTimeline);
            tl.kill();
        };

    }, []);

    return (
        <section id="hero-section" className="relative w-screen h-screen z-1">
            <div
                ref={bgContainerRef}
                id="background-container"
                className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            >
                <picture>
                    <source
                        media="(max-width: 799px)"
                        srcSet="/hero_section_backgroun_mobile.png"
                    />
                    <source
                        media="(min-width: 800px)"
                        srcSet="/background.png"
                    />
                    <img
                        src="/background.png"
                        alt="sci-fi background"
                        id="background-image"
                        loading="eager"
                        fetchPriority="high"
                        className="pointer-events-none w-full h-full object-cover mix-blend-plus-darker md:mix-blend-normal"
                    />
                </picture>
            </div>

            {/* Load GPU Canvas wrapper directly on top of the background image */}
            <div ref={gpuCanvasRef} className="absolute inset-0 z-[1] pointer-events-none">
                {showGPUCanvas && <GPUFluidCanvas />}
            </div>

            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.5%22%20cy=%220.5%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay pointer-events-none" />
            </div>

            {/* Spline scene wrapper */}
            <div ref={splineContainerRef} id="scene" className="absolute inset-0 z-[9998] pointer-events-auto">
                {showSpline && (
                    <Suspense fallback={
                        <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 animate-pulse" />
                    }>
                        <Spline
                            scene="https://prod.spline.design/1z1FrReDGZG28VHJ/scene.splinecode"
                            className="w-full h-full"
                        />
                    </Suspense>
                )}
            </div>

            <div ref={buttonsRef} className="absolute top-0 left-0 w-screen flex justify-center md:justify-end items-center z-[10000] px-4 py-3 md:px-8 md:py-4">
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
