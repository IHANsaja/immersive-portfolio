"use client";

import React, { useState, useEffect, useRef } from 'react';
import ProjectCard from "@/components/Projects/ProjectCard";
import ProjectDrawer from "@/components/Projects/ProjectDrawer";
import { projects, Project } from "@/constants/ProjectConstants";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMusic } from "@/components/Ui/MusicProvider";
import InteractiveDotMatrix from "@/components/Ui/InteractiveDotMatrix";

const ProjectsSection = () => {
    const { isPlaying } = useMusic();
    const isPlayingRef = useRef(isPlaying);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    const audioInitiateRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioInitiateRef.current = new Audio('/sounds/initiating.wav');
        audioInitiateRef.current.volume = 0.05;
    }, []);

    useGSAP(() => {
        gsap.set(".projects-title", { opacity: 0, y: -20 });
        gsap.set(".project-card", { y: 100, opacity: 0 });
        gsap.set(".projects", { opacity: 0, pointerEvents: 'none' });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".project-card",
                start: "top center",
                onEnter: () => { tl.restart(); },
                onEnterBack: () => { tl.restart(); },
                onLeaveBack: () => {
                    gsap.set(".project-card", { y: 100, opacity: 0 });
                    gsap.set(".projects-title", { opacity: 0, y: -20 });
                },
                onLeave: () => {
                    gsap.set(".project-card", { y: 100, opacity: 0 });
                    gsap.set(".projects-title", { opacity: 0, y: -20 });
                }
            }
        });

        if (audioInitiateRef.current) {
            tl.add(() => {
                if (isPlayingRef.current) {
                    const audio = audioInitiateRef.current!;
                    audio.currentTime = 0;
                    audio.play().catch(err => {
                        console.warn('Sound play prevented:', err);
                    });
                    const duration = tl.duration();
                    setTimeout(() => {
                        audio.pause();
                        audio.currentTime = 0;
                    }, duration * 1000);
                }
            }, "+=0");
        }

        tl.to(".projects-title", {
            opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
        })
        .to(".projects-title", {
            opacity: 0.3, repeat: 6, yoyo: true, duration: 0.1, ease: "power1.inOut"
        })
        .to(".projects-title", {
            opacity: 1, duration: 0.2, ease: "power1.inOut"
        })
        .to(".projects", {
            pointerEvents: 'auto', opacity: 1, duration: 0.5,
        }, "<")
        .to(".project-card", {
            y: 0, opacity: 1, duration: 1.5,
            stagger: { amount: 0.5, from: 'start' },
            ease: "none"
        });
    }, []);

    return (
        <section id="projects-section" className="relative w-screen h-screen z-0">
            {/* BACKGROUND DOT GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.1%22%20cy=%220.1%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
                <InteractiveDotMatrix opacity={0.35} spacing={20} dotRadius={0.8} influenceRadius={160} />
            </div>

            <div className="projects-title absolute top-16 left-1/2 -translate-x-1/2 md:top-30 md:left-30 md:-translate-x-0 xl:top-24 xl:left-24 z-10 font-neotriad-sans w-full text-center md:text-left">
                <h1 className="text-foreground text-3xl sm:text-4xl md:text-5xl xl:text-3xl 2xl:text-4xl">MY PROJECTS</h1>
            </div>

            <div
                data-scroller-ignore
                className="projects absolute right-0 md:right-20 xl:right-16 2xl:right-20 px-4 md:px-0 top-[55%] md:top-1/2 z-10 h-[65%] md:h-3/4 w-full md:w-5/6 xl:w-3/5 2xl:w-2/3 overflow-y-auto overflow-x-hidden gap-5"
                style={{ transform: 'translateY(-50%)' }}
            >
                <div className="flex flex-col gap-8 pb-20 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:auto-rows-auto md:gap-5 xl:gap-4 2xl:gap-5 md:pb-0 items-center md:items-start">
                    {projects.map((p, i) => (
                        <ProjectCard
                            key={i}
                            {...p}
                            onSelect={(proj) => setSelectedProject(proj)}
                        />
                    ))}
                </div>
            </div>

            {/* Project Detail Drawer */}
            {selectedProject && (
                <ProjectDrawer
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </section>
    );
};

export default ProjectsSection;
