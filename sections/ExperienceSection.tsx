"use client";

import React, { useRef, useEffect } from "react";
import { experiences } from "@/constants/ExperienceConstants";
import ExperienceCard from "@/components/Experience/ExperienceCard";
import PoliceLights from "@/components/Ui/PoliceLights";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useMusic } from "@/components/Ui/MusicProvider";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const ExperienceSection: React.FC = () => {
    const { isPlaying } = useMusic();
    const isPlayingRef = useRef(isPlaying);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    const audioInitiateRef = useRef<HTMLAudioElement | null>(null);
    const timelineLineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        audioInitiateRef.current = new Audio("/sounds/initiating.wav");
        audioInitiateRef.current.volume = 0.05;
    }, []);

    useGSAP(() => {
        // Initial states
        gsap.set(".exp-title", { opacity: 0, y: -20 });
        gsap.set(".exp-card-wrapper", { y: 80, opacity: 0 });
        gsap.set(".exp-timeline-dot-anim", { scale: 0, opacity: 0 });
        gsap.set(".exp-decorator-top", { opacity: 0, x: -20 });
        gsap.set(".exp-decorator-bottom", { opacity: 0, x: 20 });

        // Timeline line — animate height from 0 to 100%
        if (timelineLineRef.current) {
            gsap.set(timelineLineRef.current, { scaleY: 0, transformOrigin: "top center" });
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#experience-section",
                start: "top center",
                onEnter: () => tl.restart(),
                onEnterBack: () => tl.restart(),
                onLeaveBack: () => {
                    gsap.set(".exp-title", { opacity: 0, y: -20 });
                    gsap.set(".exp-card-wrapper", { y: 80, opacity: 0 });
                    gsap.set(".exp-timeline-dot-anim", { scale: 0, opacity: 0 });
                    gsap.set(".exp-decorator-top", { opacity: 0, x: -20 });
                    gsap.set(".exp-decorator-bottom", { opacity: 0, x: 20 });
                    if (timelineLineRef.current) {
                        gsap.set(timelineLineRef.current, { scaleY: 0 });
                    }
                },
                onLeave: () => {
                    gsap.set(".exp-title", { opacity: 0, y: -20 });
                    gsap.set(".exp-card-wrapper", { y: 80, opacity: 0 });
                    gsap.set(".exp-timeline-dot-anim", { scale: 0, opacity: 0 });
                    if (timelineLineRef.current) {
                        gsap.set(timelineLineRef.current, { scaleY: 0 });
                    }
                },
            },
        });

        // Audio trigger
        if (audioInitiateRef.current) {
            tl.add(() => {
                if (isPlayingRef.current) {
                    const audio = audioInitiateRef.current!;
                    audio.currentTime = 0;
                    audio.play().catch((err) => {
                        console.warn("Sound play prevented:", err);
                    });
                    const duration = tl.duration();
                    setTimeout(() => {
                        audio.pause();
                        audio.currentTime = 0;
                    }, duration * 1000);
                }
            }, "+=0");
        }

        // Title flicker animation — consistent with Skills/Projects/Contact
        tl.to(".exp-title", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
        })
            .to(".exp-title", {
                opacity: 0.3,
                repeat: 3,
                yoyo: true,
                duration: 0.2,
                ease: "power1.inOut",
            })
            .to(".exp-title", {
                opacity: 1,
                duration: 0.2,
                ease: "power1.inOut",
            });

        // Timeline line draws in
        if (timelineLineRef.current) {
            tl.to(
                timelineLineRef.current,
                {
                    scaleY: 1,
                    duration: 1.2,
                    ease: "power2.inOut",
                },
                "-=0.3"
            );
        }

        // Dots appear with stagger
        tl.to(
            ".exp-timeline-dot-anim",
            {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                stagger: 0.15,
                ease: "back.out(2)",
            },
            "-=0.6"
        );

        // Cards stagger in
        tl.to(
            ".exp-card-wrapper",
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: {
                    amount: 0.4,
                    from: "start",
                },
                ease: "power2.out",
            },
            "-=0.3"
        );

        // Decorators
        tl.to(
            ".exp-decorator-top",
            { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
            "-=0.8"
        );
        tl.to(
            ".exp-decorator-bottom",
            { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
            "-=0.6"
        );

        // Scramble text effect on role names
        gsap.utils.toArray(".exp-role").forEach((el) => {
            const element = el as HTMLElement;
            gsap.from(element, {
                duration: 3,
                ease: "circ.inOut",
                scrambleText: {
                    text: element.innerText,
                    chars: "////////  /////// ////////",
                    speed: 0.3,
                },
                scrollTrigger: {
                    trigger: "#experience-section",
                    start: "top 60%",
                    toggleActions: "restart none restart none",
                },
                stagger: 0.3,
            });
        });

        // Scramble text effect on company names
        gsap.utils.toArray(".exp-company").forEach((el) => {
            const element = el as HTMLElement;
            gsap.from(element, {
                duration: 4,
                ease: "circ.inOut",
                scrambleText: {
                    text: element.innerText,
                    chars: "////////  /////// ////////",
                    speed: 0.2,
                },
                scrollTrigger: {
                    trigger: "#experience-section",
                    start: "top 60%",
                    toggleActions: "restart none restart none",
                },
                stagger: 0.5,
            });
        });
    }, []);

    return (
        <section
            id="experience-section"
            className="relative w-screen min-h-screen md:h-screen z-0 overflow-hidden"
        >
            {/* BACKGROUND DOT GRID — consistent with all sections */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.1%22%20cy=%220.1%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
            </div>

            {/* Title */}
            <div className="exp-title absolute top-16 left-1/2 -translate-x-1/2 md:top-24 md:left-24 md:-translate-x-0 z-10 font-neotriad-sans w-full text-center md:text-left opacity-0">
                <h2 className="text-foreground text-3xl sm:text-4xl md:text-5xl">
                    MY EXPERIENCE
                </h2>
            </div>

            {/* Top-right decorator — PoliceLights */}
            <div className="exp-decorator-top hidden md:block absolute top-24 right-24 z-10">
                <PoliceLights rectHeight={30} rectWidth={70} />
            </div>

            {/* Bottom-right decorator */}
            <div className="exp-decorator-bottom hidden md:block absolute bottom-20 left-30 z-10">
                <span className="font-inconsolata-sans text-xl text-foreground">
                    + + + +
                </span>
            </div>

            {/* Timeline Container */}
            <div 
                data-scroller-ignore
                className="exp-scroll-container absolute top-[55%] md:top-[50%] -translate-y-1/2 left-0 w-full h-[65%] md:h-[70%] px-4 md:px-16 lg:px-24 z-10 overflow-y-auto pb-20 md:pb-10"
            >
                {/* Timeline cards wrapper */}
                <div className="relative flex flex-col gap-8 md:gap-12 items-start md:items-stretch w-full py-4">
                    {/* Center timeline line — hidden on mobile, visible on desktop, scrolls with cards */}
                    <div
                        ref={timelineLineRef}
                        className="exp-timeline-line hidden md:block"
                        style={{ top: "40px", bottom: "40px" }}
                    />

                    {experiences.map((exp, i) => {
                        const isLeft = i % 2 === 0;

                        return (
                            <div
                                key={exp.id}
                                className="relative w-full flex items-center md:grid md:grid-cols-[1fr_80px_1fr_180px]"
                            >
                                {/* Timeline dot — hidden on mobile */}
                                <div className="col-start-2 col-end-3 hidden md:flex justify-center items-center relative z-20">
                                    <div className="exp-timeline-dot exp-timeline-dot-anim relative left-0 top-0 transform-none" />
                                </div>

                                {/* Mobile timeline dot */}
                                <div
                                    className="exp-timeline-dot-anim md:hidden absolute left-[20px] top-6"
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        background: "#3F51B5",
                                        border: "2px solid rgba(139, 154, 239, 0.6)",
                                        boxShadow:
                                            "0 0 12px rgba(63, 81, 181, 0.5), 0 0 30px rgba(63, 81, 181, 0.2)",
                                        zIndex: 2,
                                    }}
                                />

                                {/* Mobile left line */}
                                {i < experiences.length - 1 && (
                                    <div
                                        className="md:hidden absolute left-[24px] top-8 bottom-[-32px] w-[2px]"
                                        style={{
                                            background:
                                                "linear-gradient(180deg, rgba(63, 81, 181, 0.5), rgba(63, 81, 181, 0.15))",
                                        }}
                                    />
                                )}

                                {/* Card container — offset on mobile, aligned in grid on desktop */}
                                <div className={`w-full pl-12 md:pl-0 ${
                                    isLeft 
                                        ? "md:col-start-1 md:col-end-2 md:flex md:justify-end" 
                                        : "md:col-start-3 md:col-end-4 md:flex md:justify-start"
                                }`}>
                                    <ExperienceCard
                                        experience={exp}
                                        index={i}
                                        isLeft={isLeft}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Metadata — bottom-right corner, code-style label */}
            <div className="hidden md:block absolute bottom-10 right-16 z-10">
                <p className="font-andvari-sans text-[10px] text-gray-500 tracking-wider uppercase">
                    {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                    // career.timeline v{experiences.length}.0
                </p>
            </div>
        </section>
    );
};

export default ExperienceSection;
