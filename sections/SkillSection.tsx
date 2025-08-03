"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { SkillLogos, Skill } from "@/constants/SkillConstants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const allSkills: Skill[] = SkillLogos.flat();

export default function SkillSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const squareRefs = useRef<HTMLDivElement[]>([]);
    const nameRefs = useRef<HTMLDivElement[]>([]);

    // GSAP entry animation for the grid
    useGSAP(() => {
        gsap.from(".skillgrid", {
            duration: 2,
            y: 200,
            opacity: 0,
            ease: "power1.in",
            delay: 0.5,
        });
    }, []);

    useGSAP(() => {
        gsap.set(".bigTree", { opacity: 0 });
        gsap.set(".skills", { y: 100, opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".skillgrid",
                start: "top center",
                onEnter: () => {
                    tl.restart();
                },
                onEnterBack: () => {
                    tl.restart();
                },
                onLeaveBack: () => {
                    gsap.set(".bigTree", { opacity: 0 });
                    gsap.set(".skills", { y: 100, opacity: 0 });
                },
                onLeave: () => {
                    gsap.set(".bigTree", { opacity: 0 });
                    gsap.set(".skills", { y: 100, opacity: 0 });
                }
            }
        });

        tl.to(".bigTree", {
            opacity: 1,
            duration: 1.5,
            delay: 0.5,
            ease: "power2.out"
        })
            .to(".skills", {
                y:0,
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

    // Clear refs before rendering
    useEffect(() => {
        allSkills.forEach((_, i) => {
            const square = squareRefs.current[i];
            const name = nameRefs.current[i];

            if (square && name) {
                gsap.set(square, {
                    width: "6px",
                    height: "6px",
                });

                gsap.set(name, {
                    autoAlpha: 0,
                    y: 10,
                });
            }
        });
    }, []);

    return (
        <section id="skill-section" className="relative w-screen h-screen z-0">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.1%22%20cy=%220.1%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
            </div>

            <div className="bigTree absolute bottom-[-50px] left-0 w-1/2 z-0 mix-blend-soft-light">
                <Image src="/backgrounds/bigTree.png" alt="mountain background" height={1000} width={1000}/>
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
                        />

                        {/* Animated skill name */}
                        <div
                            ref={(el) => {
                                nameRefs.current[i] = el!;
                            }}
                            style={{
                                opacity: 0,
                                transform: "translateY(10px)",
                            }}
                            className="text-sm sm:text-base text-center font-inconsolata-sans z-10 pointer-events-none"
                        >
                            {skill.name}
                        </div>


                        {/* Animated top-right color square */}
                        <div
                            ref={(el) => {
                                squareRefs.current[i] = el!;
                            }}
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
