"use client";

import React, { useRef, useEffect } from "react";
import AnimatedHoverButton from "@/components/Ui/Button";
import AnimatedSvg from "@/components/Ui/AnimatedSvg";
import PoliceLights from "@/components/Ui/PoliceLights";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import { useMediaQuery } from "usehooks-ts";
import ScrambledTextBlock from "@/components/About/EducationCard";

const AboutSection = () => {
    const paragraphRef = useRef<HTMLParagraphElement>(null);
    const line1 = useRef<HTMLSpanElement>(null);
    const line2 = useRef<HTMLSpanElement>(null);
    const line3 = useRef<HTMLSpanElement>(null);
    const line4 = useRef<HTMLSpanElement>(null);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const audioRef = useRef<HTMLAudioElement | null>(null);

// Load the audio once
    useEffect(() => {
        audioRef.current = new Audio("/sounds/initiating.wav");
        audioRef.current.volume = 0.05;
    }, []);

        const hoverEnter = () => {
            const lines = [line1, line2, line3, line4];

            lines.forEach((ref, i) => {
                if (ref.current) {
                    gsap.to(ref.current, {
                        duration: 1.2,
                        delay: i * 0.1, // stagger effect
                        scrambleText: {
                            text: ref.current.innerText,
                            chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()",
                            speed: 1,
                            revealDelay: 0.2,
                        },
                    });
                }
            });
        };

    useGSAP(() => {
        if (!paragraphRef.current) return;

        // declare here so cleanup can see them
        let split: SplitText | null = null;
        let parentSplit: SplitText | null = null;

        document.fonts.ready.then(() => {
            split = new SplitText(paragraphRef.current!, {
                type: "lines",
                linesClass: "lineChild",
            });
            parentSplit = new SplitText(paragraphRef.current!, {
                type: "lines",
                linesClass: "lineParent overflow-hidden",
            });

            // animate your split lines once fonts are ready
            gsap.from(split.lines, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                stagger: 0.1,
                scrollTrigger: {
                    trigger: paragraphRef.current,
                    start: "top 60%",
                    toggleActions: "restart none restart none",
                },
                delay: 5,
            });
        }); // ← properly close the .then callback here

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
                toggleActions: "restart none restart none",
                onEnter: () => {
                    const audio = audioRef.current;
                    if (audio) {
                        audio.currentTime = 0;
                        audio.play().catch((err) => {
                            console.warn("Audio playback failed:", err);
                        });
                        setTimeout(() => {
                            audio.pause();
                            audio.currentTime = 0;
                        }, 6000);
                    }
                },
            },
        });

        gsap.utils.toArray(".scrambleBI").forEach((el) => {
            const element = el as HTMLElement;
            gsap.from(element, {
                duration: 5,
                ease: "circ.inOut",
                scrambleText: {
                    text: element.innerText,
                    chars: "////////  /////// ////////",
                    speed: 0.3,
                },
                scrollTrigger: {
                    trigger: "#about-section",
                    start: "top 60%",
                    toggleActions: "restart none restart none",
                },
                stagger: 0.5,
            });
        });

        gsap.from('.eduCard', {
            opacity: 0,
            duration: 1,
            delay: 4,
            y: 100,
            scrollTrigger: {
                trigger: "#about-section",
                start: "top 60%",
                toggleActions: "restart none restart none",
            },
            stagger: 0.5,
        });

        gsap.from('.svgGsap', {
            duration: 4,
            opacity: 0,
            scale: 0.2,
            delay: 2,
            scrollTrigger: {
                trigger: "#about-section",
                start: "top 60%",
                toggleActions: "restart none restart none",
            }
        });

        gsap.from('.buttonGsap', {
            delay: 4,
            duration: 1,
            scaleX: 0,
            ease: "power2.in",
            scrollTrigger: {
                trigger: "#about-section",
                start: "top 60%",
                toggleActions: "restart none restart none",
            }
        });

        return () => {
            split?.revert();
            parentSplit?.revert();
        };
    }, []);

    return (
        <section
            id="about-section"
            className="w-screen h-screen flex flex-col md:flex-row md:gap-30 bg-[var(--background)] text-[#f0dbee] relative z-0"
        >
            {/* BACKGROUND DOT GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.1%22%20cy=%220.1%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
            </div>

            {isMobile && (
                <h1 className="block md:hidden font-neotriad-sans text-2xl text-center pt-5">
                    About Me.
                </h1>
            )}


            {/* LEFT SIDE: BASIC INFO & SKILLS */}
            <div className="w-full h-full md:w-1/2 flex flex-col text-left text-[var(--foreground)] leading-5 tracking-wider">
                <div className="md:h-1/2 md:mt-20 md:ml-10 px-12 pt-20 md:pt-40 flex flex-row justify-start items-start gap-10 w-full">
                    {/* Basic Info */}
                    <div>
                        <PoliceLights rectHeight={30} rectWidth={70} />
                        <br />
                        {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px] mb-2">// basic info</p>
                        <p className="scrambleBI font-andvari-sans text-[9px] md:text-[11px]">
                            name → &quot;Ihan Hansaja&quot;
                        </p>
                        <p className="scrambleBI font-andvari-sans text-[9px] md:text-[11px]">
                            location → &quot;Kotikawatta&quot;
                        </p>
                        <br />
                        <br />
                        <br />
                        <br />
                        <p className="font-andvari-sans text-[9px] md:text-[11px]">
                            &lt;meta charset=&quot;UTF-8&quot;&gt;
                        </p>
                        <br />
                        <br />
                        <p className="font-inconsolata-sans-sans w-full rext-sm md:text-2xl">+ + + +</p>
                    </div>

                    {/* Skills */}
                    <div>
                        {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px] mb-2">// areas of expertise</p>
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px]">
                            [&quot; Full‑Stack Development &quot;,
                        </p>
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px]">
                            &quot; Front‑End Development &quot;,
                        </p>
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px]">
                            &quot; Back‑End Development &quot;,
                        </p>
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px]">
                            &quot; UI/UX Design &quot;,
                        </p>
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px]">
                            &quot; AI Engineering &quot;,
                        </p>
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px]">
                            &quot; Machine Learning Engineering &quot;]
                        </p>
                        <br />
                        <br />
                        {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px] mb-2">// what i&apos;m building</p>
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px]">
                            [&quot; AI‑driven Web Apps &quot;,
                        </p>
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px]">
                            &quot; Immersive Websites &quot;,
                        </p>
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px]">
                            &quot; AI SaaS Platforms &quot;,
                        </p>
                        <p className="scrambleBI font-andvari-sans uppercase text-[9px] md:text-[11px]">
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
                    <div className="font-inconsalata-sans w-full text-sm md:text-2xl flex justify-center items-center">
                        + + + +
                    </div>
                </div>
            </div>



            {/* RIGHT SIDE: INTRO & PARAGRAPH */}
            <div className="w-full h-full md:w-1/2 flex flex-col px-8 mr-20 text-[var(--foreground)] leading-5 tracking-wider">

                <div className="w-full h-3/5 text-center md:text-right flex flex-col justify-start items-center md:items-end gap-4 md:gap-10">
                    <div className="w-full ml-20 md:mt-20 flex justify-start items-start text-sm md:text-2xl font-inconsolata-sans">
                        + + + +
                    </div>
                    <h2 className="scramble font-neotriad-sans text-xl md:text-4xl">Hey I am <strong>IHAN HANSAJA</strong></h2>

                    <p
                        ref={paragraphRef}
                        className="font-andvari-sans max-w-xl text-[9px] md:text-[11px] leading-6 text-center md:text-right"
                    >
                        I am a <strong>Software Engineering undergraduate</strong> with a strong passion for
                        building efficient, user-centric applications. As a <strong>Full Stack Developer</strong> and <strong>AI Engineer</strong>,
                        I specialize in creating <strong>AI-driven web applications</strong> and <strong>immersive websites</strong>.
                        I enjoy solving real-world problems through clean code, intuitive
                        design, and continuous learning. Whether it&apos;s creating
                        scalable systems or crafting interactive frontends, I thrive in
                        collaborative environments that push my technical and creative
                        boundaries.
                    </p>
                    <div className="buttonGsap hidden md:block">
                        <AnimatedHoverButton bgColor={"#3F51B5"} text="PROJECTS" />
                    </div>
                </div>
                <div className="w-full h-2/5 flex flex-col items-center md:items-end gap-10 text-2xl font-inconsolata-sans z-10">
                    <h3 className="scramble font-neotriad-sans text-xl md:text-4xl">Education</h3>
                    <div className="flex flex-row justify-start items-center gap-10">
                        <div className="h-full hidden md:flex justify-center items-start mr-10">
                            <PoliceLights rectHeight={30} rectWidth={70} />
                        </div>
                        <div
                            onMouseEnter={hoverEnter}
                            className="eduCard h-40 w-25 md:h-70 md:w-50 flex flex-col items-center gap-5 border border-gray-500 rounded-sm p-2 md:p-6 bg-background opacity-100">
                            <Image
                                src="/DSlogo.png"
                                alt="DS senanayake college school logo"
                                height={70}
                                width={70}
                                className="relative z-10"
                                loading="lazy"
                            />
                            <ScrambledTextBlock
                                lines={[
                                    "2012 - 2021",
                                    "D S Senanayake",
                                    "Ordinary Level",
                                    "Advanced Level",
                                ]}
                            />
                            <span className="text-center font-inconsolata-sans text-sm">RES: 9A / 1C 2S</span>
                        </div>
                        <div
                            onMouseEnter={hoverEnter}
                            className="eduCard h-40 w-25 md:h-70 md:w-50 flex flex-col items-center gap-5 border border-gray-500 rounded-sm p-2 md:p-6 bg-background opacity-100">
                            <Image
                                src="/cinecLogo.png"
                                alt="DS senanayake college school logo"
                                height={70}
                                width={70}
                                className="relative z-10"
                                loading="lazy"
                            />
                            <ScrambledTextBlock
                                lines={[
                                    "2021 - Present",
                                    "CINEC Campus",
                                    "Software",
                                    "Engineering",
                                ]}
                            />
                            <span className="text-center font-inconsolata-sans text-sm">GPA: above 3.80</span>
                        </div>
                    </div>


                </div>
            </div>
        </section>
    );
};

export default AboutSection;
