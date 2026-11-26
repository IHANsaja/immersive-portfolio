"use client";

import React, { useState, useEffect, useRef } from 'react';
import ProjectCard from "@/components/Projects/ProjectCard";
import ProjectDrawer from "@/components/Projects/ProjectDrawer";
import { projects, Project } from "@/constants/ProjectConstants";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMusic } from "@/components/Ui/MusicProvider";


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
                trigger: "#projects-section",
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
        <section id="projects-section" className="relative w-screen min-h-screen lg:h-screen z-0 py-20 md:py-28 lg:py-0 overflow-x-hidden">
            {/* BACKGROUND DOT GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.1%22%20cy=%220.1%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
            </div>

            <div className="projects-title relative lg:absolute lg:top-24 lg:left-16 xl:left-24 z-10 font-neotriad-sans w-full lg:w-auto text-center lg:text-left mb-10 md:mb-14 lg:mb-0">
                <h1 className="text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-4xl 2xl:text-5xl">MY PROJECTS</h1>
            </div>

            <div
                data-scroller-ignore
                className="projects relative lg:absolute lg:right-12 xl:right-16 2xl:right-20 lg:top-[55%] lg:-translate-y-1/2 z-10 w-full lg:w-[58%] xl:w-3/5 2xl:w-2/3 lg:h-[70%] px-5 sm:px-10 md:px-16 lg:px-0 lg:overflow-y-auto overflow-x-hidden"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-5 xl:gap-4 2xl:gap-5 pb-24 lg:pb-4 justify-items-center items-start max-w-md sm:max-w-none mx-auto">
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
