"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

const Welcome = () => {
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const tl = useRef(gsap.timeline()).current;

    useGSAP(() => {
        const headline = headlineRef.current;
        if (!headline) return;

        // Set initial visibility to hidden
        gsap.set(headline, { opacity: 0 });

        const split = new SplitText(headline, { type: "words" });

        // Final part of your animation timeline:
        tl.to(headline, {
            opacity: 1,
            duration: 0.5,
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
            stagger: 0.3,
            onComplete: () => split.revert(),
        });

        tl.from(headline, {
            delay: 0.7,
            y: -300,
            duration: 2,
            ease: "power2.inOut",
        });

        // You can append more animations **before** the headline timeline here if needed.

    }, []);

    return (
        <div className="flex justify-center items-center h-screen w-screen overflow-hidden">
            <h1
                ref={headlineRef}
                id="welcome"
                className="
          font-neotriad-sans
          text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-[100px]
          text-[var(--foreground)]
          text-shadow-lg text-center whitespace-nowrap
          px-4 sm:px-8 z-5
        "
            >
                <span className="text-6xl">WELCOME TO </span><br />
                MY PORTFOLIO
            </h1>
        </div>
    );
};

export default Welcome;
