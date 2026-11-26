"use client";
import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";

// The frame was designed on a 1920x1080 canvas. Rather than stretching that drawing to
// the window (which squashes the borders, side bumps and label tabs on other aspect
// ratios), rebuild it in real pixels for the current window, scaled uniformly by `s`.
const DESIGN_W = 1920;
const DESIGN_H = 1080;
const MIN_SCALE = 0.55;
// Longest label the tabs have to hold: "[ SYSTEM.LOG :: 2025 // ROLE::DEVELOPER ]"
const LONGEST_LABEL_CHARS = 41;
const MONO_CHAR_WIDTH_EM = 0.5; // Inconsolata

type FrameGeometry = {
    path: string;
    scale: number;
    fontSize: number;
    tabHeight: number;
    loaderX: number;
    loaderYs: number[];
};

function buildFrame(W: number, H: number): FrameGeometry {
    const s = Math.min(1, Math.max(MIN_SCALE, Math.min(W / DESIGN_W, H / DESIGN_H)));
    const fontSize = Math.max(11, Math.round(16 * s));

    const side = 20 * s;        // left/right border
    const bump = 45 * s;        // how far the side bumps reach in
    const edge = 25 * s;        // top/bottom border
    const tab = 50 * s;         // how far the label tabs reach in
    const chamfer = 13 * s;     // corner cut
    const slope = 23.5 * s;     // side bump slope height
    const bumpHalf = 25 * s;    // half of a bump's flat run
    const tabSlope = 33 * s;    // label tab slope width

    // Label tabs: at least the design width, and always wide enough for the text
    const tabFlat = Math.max(422 * s, LONGEST_LABEL_CHARS * MONO_CHAR_WIDTH_EM * fontSize + 48 * s);
    const tabL = W / 2 - tabFlat / 2;
    const tabR = W / 2 + tabFlat / 2;

    // Three bumps per side, centred vertically
    const loaderYs = [-1, 0, 1].map((i) => H / 2 + i * 150 * s);

    const p: string[] = [];
    // Outer rectangle
    p.push(`M${W} ${H}H0V0H${W}Z`);
    // Inner cut-out, clockwise from the top-left corner down the left side
    p.push(`M${side} ${edge + chamfer}`);
    for (const cy of loaderYs) {
        p.push(`V${cy - bumpHalf - slope}L${bump} ${cy - bumpHalf}V${cy + bumpHalf}L${side} ${cy + bumpHalf + slope}`);
    }
    p.push(`V${H - edge - chamfer}L${side + chamfer} ${H - edge}`);
    // Bottom edge with the label tab
    p.push(`H${tabL - tabSlope}L${tabL} ${H - tab}H${tabR}L${tabR + tabSlope} ${H - edge}`);
    p.push(`H${W - side - chamfer}L${W - side} ${H - edge - chamfer}`);
    // Right side, bottom to top
    for (const cy of [...loaderYs].reverse()) {
        p.push(`V${cy + bumpHalf + slope}L${W - bump} ${cy + bumpHalf}V${cy - bumpHalf}L${W - side} ${cy - bumpHalf - slope}`);
    }
    p.push(`V${edge + chamfer}L${W - side - chamfer} ${edge}`);
    // Top edge with the label tab
    p.push(`H${tabR + tabSlope}L${tabR} ${tab}H${tabL}L${tabL - tabSlope} ${edge}`);
    p.push(`H${side + chamfer}Z`);

    return {
        path: p.join(''),
        scale: s,
        fontSize,
        tabHeight: tab,
        // Centre each cog in its bump (the dark area is 0..bump wide) so it never
        // pokes out past the frame edge into the page.
        loaderX: bump / 2,
        loaderYs,
    };
}

const SvgFrame = () => {
    const [size, setSize] = useState({ w: DESIGN_W, h: DESIGN_H });

    useLayoutEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            // A hidden or not-yet-laid-out window can report 0x0; keep the last good size
            if (w > 0 && h > 0) setSize({ w, h });
        };
        update();
        // Observe the root element too: some viewport changes (zoom, device emulation,
        // mobile URL bars) don't fire a window resize event.
        const observer = new ResizeObserver(update);
        observer.observe(document.documentElement);
        window.addEventListener('resize', update);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', update);
        };
    }, []);

    const frame = buildFrame(size.w, size.h);

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
                        className="absolute inset-0 w-full h-full"
                        viewBox={`0 0 ${size.w} ${size.h}`}
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d={frame.path} fill="#191919" fillRule="evenodd" />
                    </svg>

                    {/* Spinning cogs, one in each side bump */}
                    {([['left', leftLoaderRef], ['right', rightLoaderRef]] as const).map(([edge, ref]) => (
                        <div key={edge} ref={ref} className="absolute inset-0 pointer-events-none">
                            {frame.loaderYs.map((y) => (
                                <div
                                    key={y}
                                    className="absolute"
                                    style={{
                                        top: y,
                                        [edge]: frame.loaderX,
                                        // 30px cog at 0.85x leaves a margin inside the 45px bump
                                        transform: `translate(${edge === 'left' ? '-50%' : '50%'}, -50%) scale(${frame.scale * 0.85})`,
                                    }}
                                >
                                    <div className="loader"><span></span></div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Bottom Text, centred in the bottom label tab */}
                    <div
                        ref={botTextRef}
                        className="absolute bottom-0 inset-x-0 flex items-center justify-center"
                        style={{ height: frame.tabHeight }}
                    >
                        <p id="bottext" className="text-[#B5B5B5] font-inconsolata-sans whitespace-nowrap leading-none" style={{ fontSize: frame.fontSize }}>
                            [ SYSTEM.LOG :: 2025 // ROLE::DEVELOPER ]
                        </p>
                    </div>

                    {/* Top Text, centred in the top label tab */}
                    <div
                        ref={upTextRef}
                        className="absolute top-0 inset-x-0 flex items-center justify-center"
                        style={{ height: frame.tabHeight }}
                    >
                        <p id="uptext" className="text-[#B5B5B5] font-inconsolata-sans whitespace-nowrap leading-none" style={{ fontSize: frame.fontSize }}>
                            [ DEV.NAME :: IHAN_HANSAJA ]
                        </p>
                    </div>
                </div>
            </div>

        </>
    );
};

export default SvgFrame;
