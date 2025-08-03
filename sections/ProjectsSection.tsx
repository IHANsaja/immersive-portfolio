"use client";

import React from 'react'
import ProjectCard from "@/components/Projects/ProjectCard";
import { projects } from "@/constants/ProjectConstants"
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ProjectsSection = () => {

    useGSAP(() => {
        gsap.set(".mountain", { opacity: 0 });
        gsap.set(".projectCards", { y: 100, opacity: 0 });
        gsap.set(".projects", { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".projectCards",
                start: "top center",
                onEnter: () => {
                    tl.restart();
                },
                onEnterBack: () => {
                    tl.restart();
                },
                onLeaveBack: () => {
                    gsap.set(".mountain", { opacity: 0 });
                    gsap.set(".projectCards", { y: 100, opacity: 0 });
                },
                onLeave: () => {
                    gsap.set(".mountain", { opacity: 0 });
                    gsap.set(".projectCards", { y: 100, opacity: 0 });
                }
            }
        });

        tl.to(".mountain", {
            opacity: 1,
            duration: 1.5,
            delay: 0.5,
            ease: "power2.out"
        })
            .to(".projects", {
                opacity: 1,
                duration: 0.5,
            })
            .to(".projectCards", {
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

            <div
                data-scroller-ignore
                className="projects absolute right-0 md:right-20 px-30 py-30 md:py-0 top-1/2 z-10 h-3/4 w-full md:w-2/3 overflow-scroll gap-5 md:px-2"
                style={{ transform: 'translateY(calc(-50% - 30px))' }}
            >
                <div className="flex flex-col md:grid md:grid-cols-4 md:auto-rows-auto gap-5">
                    {projects.map((p, i) => (
                        <ProjectCard key={i} {...p} />
                    ))}
                </div>
            </div>

            <div className="mountain absolute bottom-[-50px] right-0 w-1/2 z-5 mix-blend-multiply">
                <Image src="/backgrounds/mountain.png" alt="mountain background" height={1000} width={1000}/>
            </div>

        </section>
    )
}
export default ProjectsSection
