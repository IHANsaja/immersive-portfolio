"use client";

import React, {useEffect, useRef} from 'react'
import ProjectCard from "@/components/Projects/ProjectCard";
import { projects } from "@/constants/ProjectConstants"
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ProjectsSection = () => {
    const audioInitiateRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioInitiateRef.current = new Audio('/sounds/initiating.wav');
        audioInitiateRef.current.volume = 0.05;
    }, []);

    useGSAP(() => {
        // Initial state: hide the new section-title div
        gsap.set(".projects-title", { opacity: 0, y: -20 }); // Example: hide and move up
        gsap.set(".project-card", { y: 100, opacity: 0 });
        gsap.set(".projects", { opacity: 0, pointerEvents: 'none' });
        gsap.set(".mountain", { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".project-card",
                start: "top center",
                onEnter: () => {
                    tl.restart();
                },
                onEnterBack: () => {
                    tl.restart();
                },
                onLeaveBack: () => {
                    gsap.set(".mountain", { opacity: 0 });
                    gsap.set(".project-card", { y: 100, opacity: 0 });
                    gsap.set(".projects-title", { opacity: 0, y: -20 }); // Reset on leave
                },
                onLeave: () => {
                    gsap.set(".mountain", { opacity: 0 });
                    gsap.set(".project-card", { y: 100, opacity: 0 });
                    gsap.set(".projects-title", { opacity: 0, y: -20 }); // Reset on leave
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

        tl.to(".projects-title", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
        })
            .to(".projects-title", {
                opacity: 0.3,
                repeat: 6,
                yoyo: true,
                duration: 0.1,
                ease: "power1.inOut"
            })
            .to(".projects-title", {
                opacity: 1,
                duration: 0.2,
                ease: "power1.inOut"
            })
            .to(".mountain", {
                opacity: 1,
                duration: 1.5,
                delay: 0.5,
                ease: "power2.out"
            }, "<") // "<" starts this animation at the same time as the previous one
            .to(".projects", {
                pointerEvents: 'auto',
                opacity: 1,
                duration: 0.5,
            }, "<")
            .to(".project-card", {
                y:0,
                opacity: 1,
                duration: 1.5,
                stagger: {
                    amount: 0.5,
                    from: 'start',
                    grid: [2, 4]
                },
                ease: "none"
            });
    }, []);

    return (
        <section id="projects-section" className="relative w-screen h-screen z-0">
            {/* BACKGROUND DOT GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.1%22%20cy=%220.1%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
            </div>

            <div className="projects-title absolute top-20 left-1/2 -translate-x-1/2 md:top-30 md:left-30 md:-translate-x-0 xl:top-24 xl:left-24 z-10 font-neotriad-sans">
                <h1 className="text-foreground text-4xl md:text-5xl xl:text-3xl 2xl:text-4xl">MY PROJECTS</h1>
            </div>

            <div
                data-scroller-ignore
                className="projects absolute right-0 md:right-20 xl:right-16 2xl:right-20 px-30 py-30 md:py-0 xl:px-4 2xl:px-2 top-1/2 z-10 h-3/4 w-full md:w-2/3 xl:w-3/5 2xl:w-2/3 overflow-scroll gap-5 md:px-2"
                style={{ transform: 'translateY(calc(-50% - 30px))' }}
            >
                <div className="flex flex-col md:grid md:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 md:auto-rows-auto gap-5 xl:gap-4 2xl:gap-5">
                    {projects.map((p, i) => (
                        <ProjectCard key={i} {...p} />
                    ))}
                </div>
            </div>

            <div className="mountain absolute bottom-[-50px] right-0 w-1/2 xl:w-2/5 2xl:w-1/2 z-5 mix-blend-multiply">
                <Image src="/backgrounds/mountain.png" alt="mountain background" height={1000} width={1000} loading="lazy" />
            </div>

        </section>
    )
}
export default ProjectsSection
