import React from 'react'
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

const AboutSection = () => {

    useGSAP(() => {
        gsap.to('#about-section', {


        })
    })

    return (
        <section
            id="about-section"
            className="w-screen h-screen bg-[var(--background)] text-white relative"
        >
            <div className="absolute top-0 w-full flex justify-center z-[0] pointer-events-none mix-blend-plus-darker scale-y-[-1]">
                <img src="/PlanetRocks.png" alt="planet rocks" className="max-w-[50%] h-auto" />
                <img src="/PlanetRocks.png" alt="planet rocks" className="max-w-[50%] h-auto scale-x-[-1]" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-10 px-8 text-center text-[var(--foreground)]">
                <h1 className="font-neotriad-sans text-4xl">
                    Hey I am IHAN HANSAJA
                </h1>
                <p className="font-inconsolata-sans max-w-xl text-lg">
                    I am a software engineering undergraduate who likes to build AI-driven web applications,
                    immersive websites, and AI SaaS platforms.
                </p>
            </div>
        </section>
    )
}
export default AboutSection
