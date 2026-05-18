"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import MusicButton from "./MusicButton";
import { useGSAP } from "@gsap/react";
import { AssetPreloader, LoadingProgress } from "@/utils/AssetPreloader";
import PreloaderShader from "./PreloaderShader";

interface PreloaderProps {
    onLoadingComplete: () => void;
}

const Preloader = ({ onLoadingComplete }: PreloaderProps) => {
    const preloaderRef = useRef<HTMLDivElement>(null);
    const hudContainerRef = useRef<HTMLDivElement>(null);
    const progressRingRef = useRef<SVGCircleElement>(null);
    const loadingTextRef = useRef<HTMLDivElement>(null);
    const percentageRef = useRef<HTMLDivElement>(null);
    const enterButtonRef = useRef<HTMLButtonElement>(null);
    
    // New UI Element Refs
    const cornerTopLeftRef = useRef<HTMLDivElement>(null);
    const cornerTopRightRef = useRef<HTMLDivElement>(null);
    const cornerBottomLeftRef = useRef<HTMLDivElement>(null);
    const cornerBottomRightRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);
    const topBarRef = useRef<HTMLDivElement>(null);

    const [isExiting, setIsExiting] = useState(false);
    const [isClickable, setIsClickable] = useState(false);
    const [assetPreloader] = useState(() => new AssetPreloader());
    const [isMobile, setIsMobile] = useState(false);
    
    const [loadingStage, setLoadingStage] = useState("Initializing System...");
    const [terminalLogs, setTerminalLogs] = useState<string[]>(["[SYS] BOOT SEQUENCE INITIATED..."]);

    // Smooth progress interpolation
    const targetProgress = useRef(0);
    const currentProgress = useRef(0);
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.2 } });

        // HUD fade in
        tl.from(hudContainerRef.current, { 
            autoAlpha: 0, 
            scale: 0.9, 
            y: 20,
            delay: 0.2
        });

        // Corner brackets slide in
        tl.from([cornerTopLeftRef.current, cornerTopRightRef.current], {
            y: -50,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.1
        }, "-=0.8");

        tl.from([cornerBottomLeftRef.current, cornerBottomRightRef.current], {
            y: 50,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.1
        }, "-=0.9");

        // UI bars and terminal
        tl.from(topBarRef.current, {
            scaleX: 0,
            transformOrigin: "left",
            duration: 1,
            ease: "expo.out"
        }, "-=1.0");

        tl.from(terminalRef.current, {
            x: 50,
            autoAlpha: 0,
            duration: 0.8
        }, "-=0.8");
    });

    useEffect(() => {
        // Smooth progress loop
        const updateSmoothProgress = () => {
            currentProgress.current += (targetProgress.current - currentProgress.current) * 0.1;
            
            if (percentageRef.current) {
                percentageRef.current.innerText = `${Math.round(currentProgress.current).toString().padStart(3, '0')}%`;
            }
            
            if (progressRingRef.current) {
                const radius = progressRingRef.current.r.baseVal.value;
                const circumference = radius * 2 * Math.PI;
                const offset = circumference - (currentProgress.current / 100) * circumference;
                progressRingRef.current.style.strokeDashoffset = `${offset}`;
            }

            if (currentProgress.current < 99.9 || targetProgress.current < 100) {
                animationFrameRef.current = requestAnimationFrame(updateSmoothProgress);
            } else {
                if (targetProgress.current >= 100) {
                    setIsClickable(true);
                    setLoadingStage("SYSTEM READY - CLICK TO ENTER");
                    if (percentageRef.current) percentageRef.current.innerText = "100%";
                    if (progressRingRef.current) progressRingRef.current.style.strokeDashoffset = "0";
                    
                    setTerminalLogs(prev => [...prev, "[SYS] ALL SYSTEMS OPTIMAL.", "[SYS] AWAITING USER INPUT..."]);
                }
            }
        };

        animationFrameRef.current = requestAnimationFrame(updateSmoothProgress);

        return () => cancelAnimationFrame(animationFrameRef.current);
    }, []);

    useEffect(() => {
        assetPreloader.setProgressCallback((loadingProgress: LoadingProgress) => {
            targetProgress.current = loadingProgress.percentage;

            let stageText = "";
            switch (loadingProgress.stage) {
                case 'images': stageText = "RENDERING VISUAL ASSETS..."; break;
                case 'videos': stageText = "BUFFERING MEDIA CONTENT..."; break;
                case 'audio': stageText = "CALIBRATING AUDIO SYSTEMS..."; break;
                case 'models': stageText = "CONSTRUCTING 3D ENVIRONMENT..."; break;
                case 'spline': stageText = "INITIALIZING INTERACTIVE SCENE..."; break;
                case 'complete': stageText = "SYSTEM OPTIMIZED."; break;
                default: stageText = "PROCESSING DATA...";
            }
            
            if (loadingProgress.percentage < 100) {
                const newStage = `${stageText} [${loadingProgress.currentAsset || 'SYSTEM'}]`;
                setLoadingStage(newStage);
                
                // Add to terminal occasionally to avoid spam
                if (loadingProgress.loaded % 5 === 0) {
                    setTerminalLogs(prev => {
                        const newLogs = [...prev, `> LOADED: ${loadingProgress.currentAsset}`];
                        return newLogs.length > 6 ? newLogs.slice(newLogs.length - 6) : newLogs;
                    });
                }
            }
        });

        assetPreloader.setCompleteCallback(() => {
            targetProgress.current = 100;
        });

        const preloadTimeout = setTimeout(() => {
            assetPreloader.preloadAssets().catch((error) => {
                console.error('Asset preloading failed:', error);
                targetProgress.current = 100;
            });
        }, 800);

        return () => clearTimeout(preloadTimeout);
    }, [assetPreloader]);

    const handleExitAnimation = () => {
        if (isExiting || !isClickable) return;
        setIsExiting(true);

        window.dispatchEvent(new CustomEvent('preloaderComplete'));

        const exitTl = gsap.timeline({ onComplete: onLoadingComplete });

        exitTl.to([
            hudContainerRef.current, 
            cornerTopLeftRef.current, cornerTopRightRef.current,
            cornerBottomLeftRef.current, cornerBottomRightRef.current,
            terminalRef.current, topBarRef.current
        ], {
            autoAlpha: 0,
            scale: 1.1,
            stagger: 0.05,
            duration: 0.6,
            ease: "power3.in",
        });

        exitTl.to(preloaderRef.current, {
            clipPath: "circle(0% at 50% 50%)",
            duration: 1.2,
            ease: "expo.inOut",
        }, "-=0.2");
    };

    return (
        <div
            ref={preloaderRef}
            data-preloader="true"
            className="h-screen w-screen bg-[#070A1E] text-foreground fixed top-0 left-0 z-[10001] flex items-center justify-center overflow-hidden"
            style={{ clipPath: "circle(100% at 50% 50%)", willChange: "clip-path" }}
        >
            {!isMobile && <PreloaderShader />}

            {/* Corner Brackets */}
            <div ref={cornerTopLeftRef} className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-[#46a0f9]/50 z-20 pointer-events-none"></div>
            <div ref={cornerTopRightRef} className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-[#46a0f9]/50 z-20 pointer-events-none"></div>
            <div ref={cornerBottomLeftRef} className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-[#46a0f9]/50 z-20 pointer-events-none"></div>
            <div ref={cornerBottomRightRef} className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-[#46a0f9]/50 z-20 pointer-events-none"></div>

            {/* Top Info Bar */}
            <div ref={topBarRef} className="absolute top-8 left-28 right-28 h-px bg-gradient-to-r from-[#46a0f9]/0 via-[#46a0f9]/40 to-[#46a0f9]/0 z-20 hidden md:block">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#070A1E] px-4 text-[#8B9AEF] text-[10px] tracking-widest font-inconsolata-sans">
                    SECURE CONNECTION ESTABLISHED
                </div>
            </div>

            {/* Audio & Version Info (Top Left & Bottom Left) */}
            <div className="absolute top-10 left-10 z-20 flex items-center gap-4 opacity-80">
                <MusicButton />
                <div className="text-[10px] font-inconsolata-sans tracking-widest text-[#46a0f9] uppercase flex flex-col">
                    <span>SYS.AUDIO // ENABLED</span>
                    <span className="text-[#8B9AEF]">REC: HEADPHONES</span>
                </div>
            </div>
            
            <div className="absolute bottom-10 left-10 z-20 opacity-60">
                <p className="font-inconsolata-sans text-[10px] tracking-[0.2em] text-[#8B9AEF]">v.2.0.4 // IMMERSIVE_PROTOCOL</p>
            </div>

            {/* Terminal Console (Right Side) */}
            <div ref={terminalRef} className="absolute right-10 bottom-1/2 transform translate-y-1/2 w-64 hidden lg:flex flex-col gap-1 z-20 opacity-80 pointer-events-none">
                <div className="border-b border-[#46a0f9]/30 pb-2 mb-2">
                    <p className="font-inconsolata-sans text-[10px] text-[#46a0f9] tracking-widest">&gt;&gt; SYSTEM_LOGS</p>
                </div>
                {terminalLogs.map((log, index) => (
                    <p key={index} className="font-inconsolata-sans text-[10px] text-[#8B9AEF] tracking-wider truncate animate-pulse" style={{ animationDuration: '2s' }}>
                        {log}
                    </p>
                ))}
            </div>

            {/* Central HUD */}
            <div ref={hudContainerRef} className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-8">
                
                {/* Glowing Outer Ring */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                    
                    {/* Targeting Crosshairs */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-0 w-4 h-px bg-[#46a0f9]/60 transform -translate-y-1/2"></div>
                        <div className="absolute top-1/2 right-0 w-4 h-px bg-[#46a0f9]/60 transform -translate-y-1/2"></div>
                        <div className="absolute left-1/2 top-0 w-px h-4 bg-[#46a0f9]/60 transform -translate-x-1/2"></div>
                        <div className="absolute left-1/2 bottom-0 w-px h-4 bg-[#46a0f9]/60 transform -translate-x-1/2"></div>
                    </div>

                    {/* Background Ring */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle 
                            cx="50" cy="50" r="46" 
                            fill="none" 
                            stroke="rgba(70, 160, 249, 0.1)" 
                            strokeWidth="1" 
                        />
                        {/* Progress Ring */}
                        <circle 
                            ref={progressRingRef}
                            cx="50" cy="50" r="46" 
                            fill="none" 
                            stroke="url(#blue-gradient)" 
                            strokeWidth="2"
                            strokeLinecap="round"
                            style={{ 
                                strokeDasharray: 289.027, 
                                strokeDashoffset: 289.027,
                                transition: 'stroke-dashoffset 0.1s linear'
                            }}
                        />
                        <defs>
                            <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#46a0f9" />
                                <stop offset="100%" stopColor="#8B9AEF" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Additional Tech Ring */}
                    <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] animate-[spin_20s_linear_infinite_reverse] opacity-30" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="#8B9AEF" strokeWidth="0.5" strokeDasharray="4 8" />
                    </svg>

                    {/* Central Interaction Area */}
                    <button
                        ref={enterButtonRef}
                        onClick={handleExitAnimation}
                        disabled={!isClickable}
                        className={`relative w-48 h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center focus:outline-none transition-all duration-700 ease-out ${isClickable ? "cursor-pointer hover:scale-105 hover:shadow-[0_0_50px_rgba(70,160,249,0.4)] bg-gradient-to-tr from-[#070A1E] to-[#11172d]/80 backdrop-blur-sm" : "cursor-default grayscale opacity-50 backdrop-blur-none"}`}
                    >
                        {/* Inner rotating decorative elements */}
                        {isClickable && (
                            <div className="absolute inset-0 border border-[#46a0f9]/40 rounded-full animate-[spin_10s_linear_infinite] border-dashed"></div>
                        )}
                        
                        <div className="relative z-10 w-24 h-24 mb-4">
                            <Image
                                src="/logo.png"
                                alt="IHAN Logo"
                                fill
                                sizes="96px"
                                className="object-contain"
                                priority
                            />
                        </div>
                        
                        <div className={`font-andvari-sans text-xl tracking-widest text-white transition-opacity duration-300 ${isClickable ? 'opacity-100 animate-pulse' : 'opacity-0'}`}>
                            ENTER
                        </div>
                    </button>
                </div>

                {/* Status Bar Section */}
                <div className="mt-12 w-full flex flex-col items-center gap-3">
                    <div className="flex items-end justify-between w-full px-4">
                        <div className="flex gap-2">
                            <span className="w-1.5 h-1.5 bg-[#46a0f9] animate-pulse rounded-full mb-1"></span>
                            <span className="w-1.5 h-1.5 bg-[#8B9AEF] animate-pulse rounded-full mb-1" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                        <div 
                            ref={percentageRef} 
                            className="font-andvari-sans text-4xl text-white tabular-nums tracking-wider text-shadow-sm"
                            style={{ textShadow: '0 0 10px rgba(70,160,249,0.5)' }}
                        >
                            000%
                        </div>
                    </div>
                    
                    {/* Futuristic Line Separator */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-[#46a0f9]/50 to-transparent relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-[#46a0f9] blur-[2px]"></div>
                    </div>
                    
                    <div ref={loadingTextRef} className="font-inconsolata-sans text-[10px] md:text-xs text-[#8B9AEF] tracking-[0.15em] uppercase w-full text-center h-4 overflow-hidden text-ellipsis whitespace-nowrap px-2">
                        {loadingStage}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Preloader;
