"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import MusicButton from "./MusicButton";
import { useGSAP } from "@gsap/react";
import { AssetPreloader, LoadingProgress } from "@/utils/AssetPreloader";
import PreloaderShader from "./PreloaderShader"; // Import the shader

interface PreloaderProps {
    onLoadingComplete: () => void;
}

const Preloader = ({ onLoadingComplete }: PreloaderProps) => {
    const preloaderRef = useRef<HTMLDivElement>(null);
    const greetingRef = useRef<HTMLDivElement>(null);
    const logoContainerRef = useRef<HTMLDivElement>(null);
    const soundSectionRef1 = useRef<HTMLDivElement>(null);
    const soundSectionRef2 = useRef<HTMLDivElement>(null);
    const progressNumberRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const loadingTextRef = useRef<HTMLDivElement>(null);

    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("Initializing...");
    const [isExiting, setIsExiting] = useState(false);
    const [isClickable, setIsClickable] = useState(false);
    const [assetPreloader] = useState(() => new AssetPreloader());


    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });

        tl.from(greetingRef.current, { autoAlpha: 0, y: -30, delay: 2.5 });
        tl.from(soundSectionRef1.current, { autoAlpha: 0, x: -30 }, "-=0.4");
        tl.from(soundSectionRef2.current, { autoAlpha: 0, x: 30 }, "-=0.4");
        tl.from(logoContainerRef.current, { autoAlpha: 0, scale: 0.8 }, "-=0.4");

        // Progress numbers and loading text are visible from the beginning - no animation needed
    });

    useEffect(() => {
        if (progress >= 100) {
            setIsClickable(true);
        }
    }, [progress]);

    // Initialize asset preloading
    useEffect(() => {
        // Log asset statistics for debugging
        const stats = assetPreloader.getAssetCount();
        console.log('AssetPreloader Statistics:', stats);

        // Set up progress callback
        assetPreloader.setProgressCallback((loadingProgress: LoadingProgress) => {
            setProgress(loadingProgress.percentage);
            setLoadingStage('loading');

            // Update loading text based on stage with creative descriptions
            let stageText = "";
            let creativeDescription = "";

            switch (loadingProgress.stage) {
                case 'images':
                    stageText = "Rendering Visual Assets";
                    creativeDescription = "Preparing stunning visuals...";
                    break;
                case 'videos':
                    stageText = "Buffering Media Content";
                    creativeDescription = "Loading cinematic experiences...";
                    break;
                case 'audio':
                    stageText = "Tuning Audio Systems";
                    creativeDescription = "Calibrating sound frequencies...";
                    break;
                case 'models':
                    stageText = "Initializing 3D Environment";
                    creativeDescription = "Building immersive worlds...";
                    break;
                case 'spline':
                    stageText = "Loading Interactive Scene";
                    creativeDescription = "Preparing 3D experience...";
                    break;
                case 'complete':
                    stageText = "System Ready";
                    creativeDescription = "All systems operational!";
                    setLoadingStage('ready');
                    break;
                default:
                    stageText = "Optimizing Performance";
                    creativeDescription = "Fine-tuning experience...";
            }

            setLoadingText(`${stageText}... ${creativeDescription}`);

            // Update progress bar directly without animation
            if (progressBarRef.current) {
                progressBarRef.current.style.width = `${loadingProgress.percentage}%`;
            }
        });

        // Set up completion callback
        assetPreloader.setCompleteCallback(() => {
            setLoadingText("System Ready - All systems operational!");
            setLoadingStage('ready');
            setIsClickable(true);
            console.log('Asset preloading completed successfully!');
        });

        // Start preloading immediately
        console.log('Starting asset preloading...');
        assetPreloader.preloadAssets().catch((error) => {
            console.error('Asset preloading failed:', error);
            // Still allow user to proceed even if some assets fail
            setLoadingText("Ready to Enter");
            setIsClickable(true);
        });
    }, [assetPreloader]);


    const handleExitAnimation = () => {
        if (isExiting || !isClickable) return;
        setIsExiting(true);

        // Dispatch preloader completion event
        window.dispatchEvent(new CustomEvent('preloaderComplete'));

        const exitTl = gsap.timeline({ onComplete: onLoadingComplete });

        const exitTargets: gsap.TweenTarget[] = [
            greetingRef.current,
            soundSectionRef1.current,
            soundSectionRef2.current,
            progressNumberRef.current,
            loadingTextRef.current,
        ];

        const progressBarParent = progressBarRef.current?.parentElement;
        if (progressBarParent) exitTargets.push(progressBarParent);

        exitTl.to(exitTargets, {
            autoAlpha: 0,
            duration: 0.5,
            ease: "power3.in",
        });

        exitTl.to(preloaderRef.current, {
            clipPath: "circle(0% at 50% 50%)",
            duration: 1.2,
            ease: "expo.inOut",
        }, "+=0.1");
    };

    return (
        <div
            ref={preloaderRef}
            data-preloader="true"
            className="h-screen w-screen grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 bg-[#191919] text-foreground fixed top-0 left-0 z-[10001]"
            style={{ clipPath: "circle(100% at 50% 50%)", willChange: "clip-path" }}
        >
            {/* Background Shader */}
            <PreloaderShader />

            <div></div>
            <div ref={greetingRef} className="flex items-start justify-center p-8 font-neotriad-sans text-4xl relative z-10">
                <p>{getGreeting()}</p>
            </div>
            <div className="hidden md:block"></div>

            <div className="flex items-center justify-center p-8 gap-6 relative z-10" ref={soundSectionRef1}>
                <div className="shadow-md shadow-foreground"><MusicButton /></div>
                <p className="font-inconsolata-sans text-md text-ex">C://Protocol_Freya/<br />&gt;&gt; Enable Sound</p>
            </div>

            <div ref={logoContainerRef} className="relative flex flex-col items-center justify-center z-10">
                <div className="group relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56">
                    <button
                        onClick={handleExitAnimation}
                        disabled={!isClickable}
                        className={`w-full h-full focus:outline-none transition-transform duration-300 group-hover:scale-110 ${isClickable ? "cursor-pointer" : "cursor-default"
                            }`}
                        style={{ opacity: isClickable ? 1 : 0.4 }}
                    >
                        {/* Spinning SVG - larger and behind */}
                        <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 animate-spin opacity-20"
                            style={{ animationDuration: '6s' }}
                        >
                            <Image
                                src="/svg/clickToEnter.svg"
                                alt="click to enter button guide"
                                width={240}
                                height={240}
                                className="object-contain scale-140"
                                priority
                            />
                        </div>

                        {/* Foreground logo */}
                        <div className="relative z-10 w-full h-full">
                            <Image
                                src="/logo.png"
                                alt="Click to enter site"
                                fill
                                sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
                                className="object-contain pb-4"
                                priority
                            />
                        </div>
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-center p-8 gap-3 relative z-10" ref={soundSectionRef2}>
                <p className="font-inconsolata-sans text-base text-justify">A://Best_Experience/<br />&gt;&gt; From Headphones</p>
            </div>

            <div className="hidden md:flex items-end justify-start p-8 font-neotriad-sans text-5xl tabular-nums"></div>

            <div className="flex flex-col items-end justify-center p-8 w-full relative z-10">
                <div ref={progressNumberRef} className="flex items-end justify-start p-8 font-neotriad-sans text-5xl tabular-nums opacity-100">
                    <p className="relative">
                        {progress.toString().padStart(3, '0')}%
                    </p>
                </div>
                <div className="w-full h-1 bg-foreground/10">
                    <div ref={progressBarRef} className="h-full bg-foreground" style={{ width: '0%' }}></div>
                </div>
                <div ref={loadingTextRef} className="flex items-center justify-start p-2 font-inconsolata-sans text-sm text-foreground/70 opacity-100">
                    <p>{loadingText}</p>
                </div>
            </div>

            <div className="hidden md:flex items-end justify-end p-8"></div>
        </div>
    );
};

export default Preloader;
