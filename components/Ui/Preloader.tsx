"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import MusicButton from "./MusicButton";
import { useGSAP } from "@gsap/react";

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

    const [progress, setProgress] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [isClickable, setIsClickable] = useState(false);

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
        tl.from(progressNumberRef.current, { autoAlpha: 0, y: 20 }, "-=0.2");

        const progressBarParent = progressBarRef.current?.parentElement;
        if (progressBarParent) {
            tl.from(progressBarParent, { autoAlpha: 0, y: 20 }, "-=0.6");
        }
    });

    useEffect(() => {
        if (progress >= 100) {
            setIsClickable(true);
        }
    }, [progress]);

    // Example simulated progress increment (remove if using actual loading logic)
    useEffect(() => {
        // Start progress after a 500ms delay
        const delay = setTimeout(() => {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev < 100) {
                        if (progressBarRef.current) {
                            progressBarRef.current.style.width = `${prev + 1}%`;
                        }
                        return prev + 1;
                    } else {
                        clearInterval(interval);
                        return prev;
                    }
                });
            }, 50); // speed of progress
        }, 6000); // <-- delay before progress starts (in ms)

        return () => clearTimeout(delay);
    }, []);


    const handleExitAnimation = () => {
        if (isExiting || !isClickable) return;
        setIsExiting(true);

        const exitTl = gsap.timeline({ onComplete: onLoadingComplete });

        const exitTargets: gsap.TweenTarget[] = [
            greetingRef.current,
            soundSectionRef1.current,
            soundSectionRef2.current,
            progressNumberRef.current,
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
            className="h-screen w-screen grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 bg-[#191919] text-foreground fixed top-0 left-0 z-[10001]"
            style={{ clipPath: "circle(100% at 50% 50%)", willChange: "clip-path" }}
        >
            <div></div>
            <div ref={greetingRef} className="flex items-start justify-center p-8 font-neotriad-sans text-4xl">
                <p>{getGreeting()}</p>
            </div>
            <div className="hidden md:block"></div>

            <div className="flex items-center justify-center p-8 gap-6" ref={soundSectionRef1}>
                <div className="shadow-md shadow-foreground"><MusicButton /></div>
                <p className="font-inconsolata-sans text-md text-ex">C://Protocol_Freya/<br/>&gt;&gt; Enable Sound</p>
            </div>

            <div ref={logoContainerRef} className="relative flex flex-col items-center justify-center">
                <div className="group relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56">
                    <button
                        onClick={handleExitAnimation}
                        disabled={!isClickable}
                        className={`w-full h-full focus:outline-none transition-transform duration-300 group-hover:scale-110 ${
                            isClickable ? "cursor-pointer" : "cursor-default"
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
                            />
                        </div>

                        {/* Foreground logo */}
                        <div className="relative z-10 w-full h-full">
                            <Image
                                src="/logo.png"
                                alt="Click to enter site"
                                fill
                                className="object-contain pb-4"
                                priority
                            />
                        </div>
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-center p-8 gap-3" ref={soundSectionRef2}>
                <p className="font-inconsolata-sans text-base text-justify">A://Best_Experience/<br/>&gt;&gt; From Headphones</p>
            </div>

            <div className="hidden md:flex items-end justify-start p-8 font-neotriad-sans text-5xl tabular-nums"></div>

            <div className="flex flex-col items-end justify-center p-8 w-full">
                <div ref={progressNumberRef} className="flex items-end justify-start p-8 font-neotriad-sans text-5xl tabular-nums">
                    <p>{progress.toString().padStart(3, '0')}%</p>
                </div>
                <div className="w-full h-1 bg-foreground/10">
                    <div ref={progressBarRef} className="h-full bg-foreground" style={{ width: '0%' }}></div>
                </div>
            </div>

            <div className="hidden md:flex items-end justify-end p-8"></div>
        </div>
    );
};

export default Preloader;
