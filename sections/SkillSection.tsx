"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { SkillLogos, Skill } from "@/constants/SkillConstants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger"; // <-- Import ScrollTrigger

gsap.registerPlugin(ScrollTrigger); // <-- Register the plugin

const allSkills: Skill[] = SkillLogos.flat();

export default function SkillSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const squareRefs = useRef<HTMLDivElement[]>([]);
    const nameRefs = useRef<HTMLDivElement[]>([]);
    const audioInitiateRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioInitiateRef.current = new Audio('/sounds/initiating.wav');
        audioInitiateRef.current.volume = 0.05;
    }, []);

    useGSAP(() => {
        // Corrected logic: Combine all GSAP setup into a single hook
        // Set initial states for all elements
        gsap.set(".bigTree", { opacity: 0 });
        gsap.set(".skills", { y: 100, opacity: 0 });
        gsap.set(".skills-title", { opacity: 0, y: -20 });

        // Initialize the state of the hover elements (name and square)
        allSkills.forEach((_, i) => {
            gsap.set(squareRefs.current[i], {
                width: "6px",
                height: "6px",
            });
            gsap.set(nameRefs.current[i], {
                autoAlpha: 0,
                y: 10,
            });
        });

        // Create the main animation timeline with a scroll trigger
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#skill-section", // <-- Use the section ID as a reliable trigger
                start: "top center",
                onEnter: () => tl.restart(),
                onEnterBack: () => tl.restart(),
                onLeaveBack: () => {
                    gsap.set(".bigTree", { opacity: 0 });
                    gsap.set(".skills", { y: 100, opacity: 0 });
                    gsap.set(".skills-title", { opacity: 0, y: -20 });
                },
                onLeave: () => {
                    gsap.set(".bigTree", { opacity: 0 });
                    gsap.set(".skills", { y: 100, opacity: 0 });
                    gsap.set(".skills-title", { opacity: 0, y: -20 });
                }
            }
        });

        if (audioInitiateRef.current) {
            tl.add(() => {
                const audio = audioInitiateRef.current!;
                audio.currentTime = 0;
                audio.play().catch(err => {
                    console.warn('Sound play prevented:', err);
                });

                // Schedule audio stop at the end of timeline
                const duration = tl.duration(); // Get total timeline duration
                setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }, duration * 1000); // Convert seconds to ms
            }, "+=0");
        }

        tl.to(".skills-title", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
        })
            .to(".skills-title", {
                opacity: 0.3,
                repeat: 3,
                yoyo: true,
                duration: 0.2,
                ease: "power1.inOut"
            })
            .to(".skills-title", {
                opacity: 1,
                duration: 0.2,
                ease: "power1.inOut"
            })
            .to(".bigTree", {
                opacity: 1,
                duration: 1.5,
                delay: 0.5,
                ease: "power2.out"
            }, "<")
            .to(".skills", {
                y: 0,
                opacity: 1,
                duration: 1.5,
                stagger: {
                    amount: 0.5,
                    from: 'start',
                    grid: [5, 5]
                },
                ease: "none"
            });
    }, []);

    return (
        <section id="skill-section" className="relative w-screen h-screen z-0">
            {/* BACKGROUND DOT GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.1%22%20cy=%220.1%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
            </div>

            <div className="skills-title absolute top-10 right-1/2 translate-x-1/2 md:top-30 md:right-30 md:translate-x-0 z-10 font-neotriad-sans">
                <h1 className="text-foreground text-4xl md:text-5xl">MY SKILLS</h1>
            </div>

            <div className="bigTree absolute bottom-[-50px] left-0 w-1/2 z-0 mix-blend-soft-light">
                <Image src="/backgrounds/bigTree.png" alt="big tree background" height={1000} width={1000} loading="lazy" />
            </div>

            <div
                ref={containerRef}
                className="skillgrid absolute w-full md:w-1/2 h-3/4 px-8 md:left-20 top-1/2 -translate-y-1/2 grid grid-cols-4 md:grid-cols-5 gap-6 z-1"
            >
                {allSkills.map((skill, i) => (
                    <div
                        key={i}
                        className="skills flex flex-col items-center justify-center gap-2 relative z-10 bg-background border border-gray-500 rounded-sm transition-all duration-300"
                        onMouseEnter={() => {
                            const square = squareRefs.current[i];
                            const name = nameRefs.current[i];

                            if (square) {
                                gsap.to(square, {
                                    width: "100%",
                                    height: "100%",
                                    duration: 0.3,
                                });
                            }
                            if (name) {
                                gsap.to(name, {
                                    autoAlpha: 1,
                                    y: 0,
                                    duration: 0.4,
                                    ease: "power2.out",
                                });
                            }
                        }}
                        onMouseLeave={() => {
                            const square = squareRefs.current[i];
                            const name = nameRefs.current[i];

                            if (square) {
                                gsap.to(square, {
                                    width: "4px",
                                    height: "4px",
                                    duration: 0.3,
                                });
                            }
                            if (name) {
                                gsap.to(name, {
                                    autoAlpha: 0,
                                    y: 10,
                                    duration: 0.4,
                                    ease: "power2.in",
                                });
                            }
                        }}
                    >
                        <Image
                            src={skill.image}
                            alt={`logo-${skill.name}`}
                            width={50}
                            height={50}
                            className="w-8 h-8 sm:w-[50px] sm:h-[50px] transition-all duration-300 z-10"
                            priority
                        />

                        <div
                            ref={(el) => { nameRefs.current[i] = el!; }}
                            className="text-sm sm:text-base text-center font-inconsolata-sans z-10 pointer-events-none"
                        >
                            {skill.name}
                        </div>

                        <div
                            ref={(el) => { squareRefs.current[i] = el!; }}
                            className="absolute top-0 right-0 z-5"
                            style={{
                                backgroundColor: skill.color,
                                width: "6px",
                                height: "6px",
                            }}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}