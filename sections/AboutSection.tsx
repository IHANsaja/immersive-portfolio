"use client";

import React, { useRef } from "react";
import ModelViewerPage from "@/components/About/ModelView";
import AnimatedHoverButton from "@/components/Ui/Button";
import AnimatedSvg from "@/components/Ui/AnimatedSvg";
import PoliceLights from "@/components/Ui/PoliceLights";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import Menu from "@/components/Hero/Menu";

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
            className="w-screen h-screen flex flex-row gap-40 bg-[var(--background)] text-[#f0dbee] relative"
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
                        <PoliceLights rectHeight={30} rectWidth={70} />
                        <br />
                        {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                        <p className="scramble font-andvari-sans uppercase text-[11px] mb-2">// basic info</p>
                        <p className="scramble font-andvari-sans text-[11px]">
                            name → &quot;Ihan Hansaja&quot;
                        </p>
                        <p className="scramble font-andvari-sans text-[11px]">
                            location → &quot;Kotikawatta&quot;
                        </p>
                        <br />
                        <br />
                        <br />
                        <br />
                        <p className="font-andvari-sans text-[11px]">
                            &lt;meta charset=&quot;UTF-8&quot;&gt;
                        </p>
                        <br />
                        <br />
                        <p className="font-inconsolata-sans-sans w-full text-2xl">+ + + +</p>
                    </div>

                    {/* Skills */}
                    <div>
                        {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                        <p className="scramble font-andvari-sans uppercase text-[11px] mb-2">// areas of expertise</p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            [&quot; Full‑Stack Development &quot;,
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            &quot; Front‑End Development &quot;,
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            &quot; Back‑End Development &quot;,
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            &quot; UI/UX Design &quot;,
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            &quot; AI Engineering &quot;,
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            &quot; Machine Learning Engineering &quot;]
                        </p>
                        <br />
                        <br />
                        {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                        <p className="scramble font-andvari-sans uppercase text-[11px] mb-2">// what i&apos;m building</p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            [&quot; AI‑driven Web Apps &quot;,
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            &quot; Immersive Websites &quot;,
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            &quot; AI SaaS Platforms &quot;,
                        </p>
                        <p className="scramble font-andvari-sans uppercase text-[11px]">
                            &quot; Machine Learning Models &quot;]
                        </p>
                        <br />
                        <br />
                    </div>
                </div>

                    {/* LEFT SVG */}
                <div className="h-1/2 w-full ml-30 hidden md:flex flex-col justify-center items-start">
                    <div className="svgGsap">
                        <AnimatedSvg />
                    </div>
                    <div className="font-inconsalata-sans w-full text-2xl flex justify-center items-center">
                        + + + +
                    </div>
                </div>
            </div>

            {/* 3D MODEL */}
            <div className="absolute">
                <ModelViewerPage />
            </div>

            {/* RIGHT SIDE: INTRO & PARAGRAPH */}
            <div className="w-1/2 flex flex-col px-8 mr-20  text-[var(--foreground)] leading-5 tracking-wider">
                <div className="w-full h-1/3 ml-20 flex justify-start items-center text-2xl font-inconsolata-sans">
                    + + + +
                </div>
                <div className="w-full h-2/3 text-right flex flex-col justify-start items-end gap-10">
                    <h1 className="scramble font-neotriad-sans text-4xl">Hey I am IHAN HANSAJA</h1>

                    <p
                        ref={paragraphRef}
                        className="font-andvari-sans max-w-xl text-[11px] leading-relaxed"
                    >
                        I am a Software Engineering undergraduate with a strong passion for
                        building efficient, user-centric applications.
                        I enjoy solving real-world problems through clean code, intuitive
                        design, and continuous learning. Whether it&apos;s creating
                        scalable systems or crafting interactive frontends, I thrive in
                        collaborative environments that push my technical and creative
                        boundaries.
                    </p>
                    <div className="buttonGsap">
                        <AnimatedHoverButton bgColor={"#3F51B5"} text="PROJECTS" />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AboutSection;
