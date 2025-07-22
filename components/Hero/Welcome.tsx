"use client";
import React, { useEffect } from "react";
import gsap from "../../app/utils/gsapClient";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

const Welcome = () => {

    const tl = gsap.timeline();

    useGSAP(() => {
        const timeout = setTimeout(() => {
            const headline = document.getElementById("welcome");
            if (!headline) return;

            const split = new SplitText(headline, {
                type: "words", // split by words
            });

            tl.from(split.words, {
                duration: 1.5,
                ease: "power2.inOut",
                scrambleText: {
                    text: "IHAN",
                    chars: "@#$%^&*()",
                    speed: 0.2,
                    revealDelay: 0.2,
                },
                stagger: 0.3, // Delay between each word
                onComplete: () => {
                    split.revert();
                },
            });
            tl.from('#welcome', {
                y: -300,
                duration: 5,
                delay: 0.5,
                ease: 'power2.inOut',
                stagger:{
                    amount: 0.2,
                    from: 'center',
                    grid: [1, 1],
                },
            })
        }, 300);

        return () => clearTimeout(timeout);
    }, [])

    useEffect(() => {

    }, []);

    return (
        <div className="flex justify-center items-center h-screen w-screen overflow-hidden">
            <h1
                id="welcome"
                className="
          font-neotriad-sans
          text-4xl           /* mobile base */
          sm:text-5xl        /* small ≥640px */
          md:text-6xl        /* medium ≥768px */
          lg:text-8xl        /* large ≥1024px */
          xl:text-[100px]    /* xl ≥1280px */
          text-[var(--foreground)]
          text-shadow-lg
          text-center
          whitespace-nowrap
          px-4               /* small horizontal padding */
          sm:px-8           /* a bit more at ≥640px */
          z-5
        "
            >
                <span className="text-6xl">WELCOME TO </span><br/>
                MY PORTFOLIO
            </h1>
        </div>
    );
};

export default Welcome;
