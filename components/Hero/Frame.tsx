"use client";
import React from 'react';
import gsap from '../../app/utils/gsapClient';
import { useGSAP } from "@gsap/react";

const SvgFrame = () => {

    const tl = gsap.timeline();

    useGSAP(() => {
        tl.to('#uptext, #bottext', {
            duration: 4,
            ease: 'power1.in',
            scrambleText: {
                text: "INITIATING UI...",
                chars: "|||||||||||||||",
                speed: 1,
            }
        });
        tl.to('#uptext', {
            duration: 2,
            scrambleText: {
                text: "[ DEV.NAME :: IHAN_HANSAJA ]",
                chars: "//////////////",
                speed: 0.2,
                rightToLeft: false,
            },
            delay: 5,
        });
        tl.to('#bottext', {
            duration: 2,
            scrambleText: {
                text: "[ SYSTEM.LOG :: 2025 // ROLE::DEVELOPER ]",
                chars: "//////////////",
                speed: 0.2,
                rightToLeft: false,
            },
            delay: 5,
        });
        tl.from('#uptext', {
            duration: 2,
            scrambleText: {
                text: "[ DEV.NAME :: IHAN_HANSAJA ]",
                chars: "//////////////",
                speed: 0.2,
                rightToLeft: true,
                revealDelay: 0.3,
            },
            delay: 5,
            repeat: -1,
            repeatDelay: 10,
        });
        tl.from('#bottext', {
            duration: 2,
            scrambleText: {
                text: "[ SYSTEM.LOG :: 2025 // ROLE::DEVELOPER ]",
                chars: "//////////////",
                speed: 0.2,
                rightToLeft: true,
                revealDelay: 0.3,
            },
            repeat: -1,
            repeatDelay: 10,
        })
    }, [])

    return (
        <>
            {/* Full-screen fixed wrapper */}
            <div className="fixed inset-0 w-screen h-screen pointer-events-none z-[10000]">
                {/* Mobile Frame: visible on small screens */}
                <div className="relative w-full h-full md:hidden">
                    <svg
                        className="w-full h-full"
                        viewBox="0 0 440 956"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                    >
                        <path d="M441 0V956H0V0H441ZM10 10V946H431V10H10Z" fill="#191919" />
                        <path d="M27 4V6H6V27H4V4H27Z" fill="#D9D9D9" />
                        <path d="M27 952V950H6V929H4V952H27Z" fill="#D9D9D9" />
                        <path d="M414 952V950H435V929H437V952H414Z" fill="#D9D9D9" />
                        <path d="M414 4V6H435V27H437V4H414Z" fill="#D9D9D9" />
                    </svg>
                </div>

                {/* Desktop Frame: visible on md and up */}
                <div className="relative hidden md:block w-full h-full">
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
                    {/* Loader dots on the left middle - responsive */}
                    <div className="fixed top-1/2 left-[0.5%] -translate-y-1/2 hidden md:flex flex-col items-center justify-center gap-[11vh] pointer-events-none z-[10000]">
                        <div className="loader"><span></span></div>
                        <div className="loader"><span></span></div>
                        <div className="loader"><span></span></div>
                    </div>

                    {/* Loader dots on the right middle - responsive */}
                    <div className="fixed top-1/2 right-[0.5%] -translate-y-1/2 hidden md:flex flex-col items-center justify-center gap-[11vh] pointer-events-none z-[10000]">
                        <div className="loader"><span></span></div>
                        <div className="loader"><span></span></div>
                        <div className="loader"><span></span></div>
                    </div>

                    {/* Bottom Text */}
                    <div className="absolute bottom-4 w-screen hidden md:flex items-center justify-center z-[10000]">
                        <p id="bottext" className="text-[#B5B5B5] text-base font-inconsolata-sans">
                            [ SYSTEM.LOG :: 2025 // ROLE::DEVELOPER ]
                        </p>
                    </div>

                    {/* Top Text */}
                    <div className="absolute top-3 w-screen hidden md:flex items-center justify-center z-[10000]">
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
