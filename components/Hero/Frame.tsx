"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";

const SvgFrame = () => {
    const desktopFrameRef = useRef<HTMLDivElement>(null);
    const upTextRef = useRef<HTMLDivElement>(null);
    const botTextRef = useRef<HTMLDivElement>(null);
    const leftLoaderRef = useRef<HTMLDivElement>(null);
    const rightLoaderRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const desktopFrame = desktopFrameRef.current;
        const upText = upTextRef.current;
        const botText = botTextRef.current;
        const leftLoader = leftLoaderRef.current;
        const rightLoader = rightLoaderRef.current;

        if (!desktopFrame || !upText || !botText || !leftLoader || !rightLoader) return;

        // Set initial invisible/scaled states for the frame elements
        gsap.set(desktopFrame, { opacity: 0, scale: 1.03 });
        gsap.set([upText, botText], { opacity: 0, y: (i) => i === 0 ? -10 : 10 });
        gsap.set([leftLoader, rightLoader], { opacity: 0 });

        // Scramble loop timeline
        const loopTl = gsap.timeline({ repeat: -1, repeatDelay: 8, paused: true });

        // Phase 1: INIT message
        loopTl.to([upText, botText], {
            duration: 2.5,
            ease: 'power1.in',
            scrambleText: {
                text: "INITIATING UI...",
                chars: "|||||||||||||||",
                speed: 1,
            }
        });

        // Phase 2: Dev Name
        loopTl.to(upText, {
            duration: 1.5,
            scrambleText: {
                text: "[ DEV.NAME :: IHAN_HANSAJA ]",
                chars: "//////////////",
                speed: 0.2,
            },
            delay: 0.8,
        });

        // Phase 3: System Log
        loopTl.to(botText, {
            duration: 1.5,
            scrambleText: {
                text: "[ SYSTEM.LOG :: 2025 // ROLE::DEVELOPER ]",
                chars: "//////////////",
                speed: 0.2,
            },
            delay: 0.2,
        });

        // Optional small idle time before loop
        loopTl.to({}, { duration: 2 });

        // Entrance timeline triggered on preloader complete
        const entranceTl = gsap.timeline({ paused: true });

        entranceTl.to(desktopFrame, {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: "power3.out"
        })
        .to([upText, botText], {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power2.out"
        }, "-=1.0")
        .to([leftLoader, rightLoader], {
            opacity: 1,
            duration: 1.0,
            ease: "power2.out",
            onComplete: () => {
                // Start the text scramble loop once the frame entrance completes
                loopTl.play();
            }
        }, "-=0.8");

        const startEntrance = () => {
            entranceTl.play();
        };

        window.addEventListener('preloaderComplete', startEntrance);

        // Fallback: If preloader is already gone when mounting
        if (!document.querySelector('[data-preloader]')) {
            entranceTl.play();
        }

        return () => {
            window.removeEventListener('preloaderComplete', startEntrance);
            entranceTl.kill();
            loopTl.kill();
        };
    }, []);

    return (
        <>
            {/* Full-screen fixed wrapper */}
            <div className="fixed inset-0 w-screen h-screen pointer-events-none z-[10000]">
                {/* Mobile Frame: visible on small screens */}
                <div className="relative w-full h-full md:hidden pointer-events-none">
                    {/* Main Border */}
                    <div className="absolute inset-0 border-[10px] border-[#191919] pointer-events-none"></div>

                    {/* Top Left Corner */}
                    <div className="absolute top-[4px] left-[4px] w-[23px] h-[23px] pointer-events-none z-10">
                        <div className="absolute top-0 left-0 w-[2px] h-full bg-[#D9D9D9]"></div>
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#D9D9D9]"></div>
                    </div>

                    {/* Top Right Corner */}
                    <div className="absolute top-[4px] right-[4px] w-[23px] h-[23px] pointer-events-none z-10">
                        <div className="absolute top-0 right-0 w-[2px] h-full bg-[#D9D9D9]"></div>
                        <div className="absolute top-0 right-0 w-full h-[2px] bg-[#D9D9D9]"></div>
                    </div>

                    {/* Bottom Left Corner */}
                    <div className="absolute bottom-[4px] left-[4px] w-[23px] h-[23px] pointer-events-none z-10">
                        <div className="absolute bottom-0 left-0 w-[2px] h-full bg-[#D9D9D9]"></div>
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D9D9D9]"></div>
                    </div>

                    {/* Bottom Right Corner */}
                    <div className="absolute bottom-[4px] right-[4px] w-[23px] h-[23px] pointer-events-none z-10">
                        <div className="absolute bottom-0 right-0 w-[2px] h-full bg-[#D9D9D9]"></div>
                        <div className="absolute bottom-0 right-0 w-full h-[2px] bg-[#D9D9D9]"></div>
                    </div>
                </div>

                {/* Desktop Frame: visible on md and up */}
                <div ref={desktopFrameRef} className="relative hidden md:block w-full h-full" style={{ transformOrigin: 'center center' }}>
                    <svg
                        className="w-full h-full"
                        viewBox="0 0 1920 1080"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1920 1080H0V0H1920V1080ZM20 38V341.5L45 365V415L20 438.5V491L45 514.5V564.5L20 588V641L45 664.5V714.5L20 738V1042L33 1055H716L749 1030H1171L1204 1055H1882L1895 1042V738.5L1870 715V665L1895 641.5V588.5L1870 565V515L1895 491.5V439L1870 415.5V365.5L1895 342V38L1882 25H1204L1171 50H749L716 25H33L20 38Z"
                            fill="#191919"
                        />
                    </svg>
                    {/* HoneycombLoader dots on the left middle - responsive */}
                    <div ref={leftLoaderRef} className="fixed top-1/2 left-[0.5%] -translate-y-1/2 hidden md:flex flex-col items-center justify-center gap-[11vh] pointer-events-none z-[10000]">
                        <div className="loader"><span></span></div>
                        <div className="loader"><span></span></div>
                        <div className="loader"><span></span></div>
                    </div>

                    {/* HoneycombLoader dots on the right middle - responsive */}
                    <div ref={rightLoaderRef} className="fixed top-1/2 right-[0.5%] -translate-y-1/2 hidden md:flex flex-col items-center justify-center gap-[11vh] pointer-events-none z-[10000]">
                        <div className="loader"><span></span></div>
                        <div className="loader"><span></span></div>
                        <div className="loader"><span></span></div>
                    </div>

                    {/* Bottom Text */}
                    <div ref={botTextRef} className="absolute bottom-4 w-screen hidden md:flex items-center justify-center z-[10000]">
                        <p id="bottext" className="text-[#B5B5B5] text-base font-inconsolata-sans">
                            [ SYSTEM.LOG :: 2025 // ROLE::DEVELOPER ]
                        </p>
                    </div>

                    {/* Top Text */}
                    <div ref={upTextRef} className="absolute top-3 w-screen hidden md:flex items-center justify-center z-[10000]">
                        <p id="uptext" className="text-[#B5B5B5] text-base font-inconsolata-sans">
                            [ DEV.NAME :: IHAN_HANSAJA ]
                        </p>
                    </div>
                </div>
            </div>

        </>
    );
};

export default SvgFrame;
