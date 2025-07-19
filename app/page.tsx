"use client"
import React from 'react';
import SvgFrame from "@/components/Hero/frame";
import GPUFluidCanvas from "@/components/Ui/hoverEffect";
import Image from "next/image";
import GRbuttons from "@/components/Hero/GRbuttons";
import InteractiveMenu from "@/components/Hero/interactiveMenu";
import Welcome from "@/components/Hero/welcome";
import Spline from "@splinetool/react-spline";
import gsap from "@/app/utils/gsapClient";
import { useGSAP } from "@gsap/react";

const Home = () => {

    const tl = gsap.timeline();
    useGSAP(() => {
        tl.from(Image, {
            duration: 2,
            scrollTrigger: {
                trigger: "Image",
                opacity: 0,
            }
        })
    }, [])

    return (
        <main>
            <SvgFrame />
            <section id="hero" className="panel relative w-screen h-screen overflow-hidden">
                <GPUFluidCanvas />

                <Image
                    src="/background.jpg"
                    alt="sci-fi background"
                    layout="fill"
                    objectFit="cover"
                    className="z-0 mix-blend-plus-darker md:mix-blend-normal"
                />

                <div className="absolute top-0 left-0 w-screen flex flex-row gap-8 justify-end items-center z-[10000]">
                    <GRbuttons />
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000]">
                    <InteractiveMenu />
                </div>

                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute inset-0
                                  bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.5%22%20cy=%220.5%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')]
                                  opacity-30
                                  mix-blend-overlay
                                  pointer-events-none"
                    />
                </div>

                <Welcome />


                <div id="scene" className="absolute h-screen w-screen inset-0 z-[9999]">
                    <Spline
                        scene="https://prod.spline.design/1z1FrReDGZG28VHJ/scene.splinecode"
                        className="w-full h-full"
                    />
                </div>
            </section>
            <section className="panel w-screen h-screen bg-black text-white relative">
                <div className="absolute inset-0 flex flex-col justify-center items-center gap-10 px-8 text-center">
                    <h1

                        className="font-neotriad-sans text-4xl"
                    >
                        Hey I am IHAN HANSAJA
                    </h1>
                    <p

                        className="font-inconsolata-sans max-w-xl text-lg"
                    >
                        I am a software engineering undergraduate who likes to build AI-driven web applications, immersive websites, and AI SaaS platforms.
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Home;