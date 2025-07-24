"use client";

import React, { useRef } from "react";
import ModelViewerPage from "@/components/About/ModelView";
import AnimatedHoverButton from "@/components/Ui/Button";
import AnimatedSvg from "@/components/Ui/AnimatedSvg";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const AboutSection = () => {
    const paragraphRef = useRef<HTMLParagraphElement>(null);

    useGSAP(() => {
        if (!paragraphRef.current) return;

        // LINES ANIMATION
        const split = new SplitText(paragraphRef.current, {
            type: "lines",
            linesClass: "lineChild",
        });
        const parentSplit = new SplitText(paragraphRef.current, {
            type: "lines",
            linesClass: "lineParent overflow-hidden",
        });

        gsap.from(split.lines, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
                trigger: paragraphRef.current,
                start: "top 60%",
                toggleActions: "restart none none none",
            },
            delay: 5,
        });

        // SCRAMBLE TEXT ANIMATION
        gsap.from(".scramble", {
            duration: 5,
            ease: "circ.inOut",
            stagger: 0.02,
            scrambleText: {
                text: "IHAN HANSAJA",
                chars: "////////  /////// ////////",
                speed: 0.2,
                revealDelay: 0.2,
            },
            scrollTrigger: {
                trigger: "#about-section",
                start: "top 60%",
                toggleActions: "restart none none none",
            },
        });

        gsap.from('.svgGsap', {
            duration: 4,
            opacity: 0,
            scale: 0.2,
            delay: 2,
            scrollTrigger: {
                trigger: "#about-section",
                start: "top 60%",
                toggleActions: "restart none none none",
            }
        });

        gsap.from('.buttonGsap', {
            duration: 4,
            opacity: 0,
            x: 300,
            delay: 2,
            scrollTrigger: {
                trigger: "#about-section",
                start: "top 60%",
                toggleActions: "restart none none none",
            }
        });

        return () => {
            split.revert();
            parentSplit.revert();
        };
    }, []);

    return (
        <section
            id="about-section"
            className="w-screen h-screen flex flex-row gap-40 bg-[var(--background)] text-white relative"
        >
            {/* BACKGROUND DOT GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.5%22%20cy=%220.5%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
            </div>

            {/* MIRRORED PLANETS */}
            <div className="absolute top-0 flex justify-center z-0 pointer-events-none mix-blend-plus-darker scale-y-[-1]">
                <img
                    src="/PlanetRocks.png"
                    alt="planet rocks"
                    className="max-w-[50%] h-auto"
                />
                <img
                    src="/PlanetRocks.png"
                    alt="planet rocks"
                    className="max-w-[50%] h-auto scale-x-[-1]"
                />
            </div>

            {/* LEFT SIDE: BASIC INFO & SKILLS */}
            <div className="w-1/2 flex flex-col text-left text-[var(--foreground)] leading-5 tracking-wider">
                <div className="h-1/2 mt-20 ml-10 px-12 pt-40 flex flex-row justify-start items-start gap-10 w-full">
                    {/* Basic Info */}
                    <div>
                        <p className="scramble font-andvari-sans uppercase text-[11px] mb-2">// basic info</p>
                        <p className="scramble font-andvari-sans text-[11px]">
                            name → "Ihan Hansaja"
                        </p>
                        <p className="scramble font-andvari-sans text-[11px]">
                            location → "Kotikawatta"
                        </p>
                    </div>

                    {/* Skills */}
                    <div>
                        <p className="scramble font-andvari-sans uppercase text-[11px] mb-2">// areas of expertise</p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            [" Full‑Stack Development ",
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            " Front‑End Development ",
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            " Back‑End Development ",
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            " UI/UX Design ",
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            " AI Engineering ",
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            " Machine Learning Engineering "]
                        </p>
                        <br />
                        <br />
                        <p className="scramble font-andvari-sans uppercase text-[11px] mb-2">// what i'm building</p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            [" AI‑driven Web Apps ",
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            " Immersive Websites ",
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            " AI SaaS Platforms ",
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            " Machine Learning Models "]
                        </p>
                        <br />
                        <br />
                    </div>
                </div>

                {/* LEFT SVG */}
                <div className="svgGsap h-1/2 w-full ml-30 hidden md:flex justify-start items-center">
                    <AnimatedSvg />
                </div>
            </div>

            {/* 3D MODEL */}
            <div className="absolute">
                <ModelViewerPage />
            </div>

            {/* RIGHT SIDE: INTRO & PARAGRAPH */}
            <div className="w-1/2 flex flex-col justify-center items-end gap-10 px-8 mr-20 text-right text-[var(--foreground)] leading-5 tracking-wider">
                <h1 className="scramble font-neotriad-sans text-4xl">Hey I am IHAN HANSAJA</h1>

                <p
                    ref={paragraphRef}
                    className="font-andvari-sans max-w-xl text-[11px] leading-relaxed"
                >
                    I am a Software Engineering undergraduate with a strong passion for
                    building efficient, user-centric applications.
                    I enjoy solving real-world problems through clean code, intuitive
                    design, and continuous learning. Whether it's creating
                    scalable systems or crafting interactive frontends, I thrive in
                    collaborative environments that push my technical and creative
                    boundaries.
                </p>
                <div className="buttonGsap">
                    <AnimatedHoverButton bgColor={"#3F51B5"} text="PROJECTS" />
                </div>

            </div>
        </section>
    );
};

export default AboutSection;
