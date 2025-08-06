import GPUFluidCanvas from "@/components/Ui/HoverEffect";
import Image from "next/image";
import Spline from "@splinetool/react-spline";
import GrButtons from "@/components/Hero/GrButtons";
import Welcome from "@/components/Hero/Welcome";
import React, {useRef} from "react";
import { motion } from "framer-motion";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {SplitText} from "gsap/SplitText";

const HeroSection = () => {
    const headlineRef = useRef(null);
    const tl = useRef(gsap.timeline()).current;

    useGSAP(() => {
        const headline = headlineRef.current;
        if (!headline) return;

        document.fonts.ready.then(() => {
            gsap.set(headline, { opacity: 0 });
            const split = new SplitText(headline, { type: "words" });

            tl.to(headline, {
                opacity: 1,
                duration: 0.5,
            })
                .from(split.words, {
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
                })
                .from(headline, {
                    y: -300,
                    duration: 2,
                    ease: "power2.inOut",
                }, "+=0.2")
                .from("#gr-buttons", {
                    duration: 1,
                    y: -200,
                    opacity: 0,
                    ease: "power1.in",
                    stagger: {
                        amount: 2,
                        from: "random",
                        grid: [1, 2],
                    },
                }, "+=0.5")
        });
    }, []);

    return (
        <section id="hero-section" className="relative w-screen h-screen z-1">
            <GPUFluidCanvas />

            <div
                id="background-container"
                className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            >
                <Image
                    src="/background.jpg"
                    alt="sci-fi background"
                    fill
                    style={{ objectFit: "cover" }}
                    className="pointer-events-none mix-blend-plus-darker md:mix-blend-normal"
                    id="background-image"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/webp;base64,..."
                />
            </div>

            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.5%22%20cy=%220.5%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay pointer-events-none" />
            </div>

            <div id="scene" className="absolute inset-0 z-[9998]">
                <Spline
                    scene="https://prod.spline.design/1z1FrReDGZG28VHJ/scene.splinecode"
                    className="w-full h-full"
                />
            </div>

            <div className="absolute top-0 left-0 w-screen flex justify-end gap-8 items-center z-[10000]">
                <GrButtons />
            </div>

            <Welcome headlineRef={headlineRef} />

            <div className="absolute bottom-[-50px] md:bottom-[-300px] left-0 w-screen z-[9998] pointer-events-none overflow-visible flex justify-center">
                <motion.div
                    animate={{
                        y: [0, -10, 0], // gentle up and down
                        x: [0, 5, 0],   // slight horizontal drift
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="w-full max-w-[90vw]"
                >
                    <Image
                        src="/backgrounds/clouds.png"
                        alt="clouds"
                        width={1920}
                        height={200}
                        className="w-full h-auto object-contain opacity-85"
                        priority
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
