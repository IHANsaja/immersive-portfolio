"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

interface ScrambledTextBlockProps {
    lines: string[];
}

export default function ScrambledTextBlock({ lines }: ScrambledTextBlockProps) {
    const scrambleRefs = useRef<(HTMLSpanElement | null)[]>([]); // Scoped to the block

    const handleHover = () => {
        scrambleRefs.current.forEach((el, i) => {
            if (el) {
                gsap.to(el, {
                    duration: 1.2,
                    delay: i * 0.1,
                    scrambleText: {
                        text: el.innerText,
                        chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()",
                        speed: 1,
                        revealDelay: 0.2,
                    },
                });
            }
        });
    };

    return (
        <p
            onMouseEnter={handleHover}
            className="text-xl font-inconsolata-sans text-center text-[14px] leading-relaxed hidden md:block"
        >
            {lines.map((line, i) => (
                <span
                    key={i}
                    ref={(el) => {
                        scrambleRefs.current[i] = el;
                    }}
                    className="block font-bold"
                >
                  {line}
                </span>
            ))}
        </p>
    );
}
