'use client'
import React, { MouseEventHandler, useEffect, useRef } from 'react';
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from 'gsap/ScrollTrigger';
import emailjs from "emailjs-com";
import {toast} from "react-toastify";

gsap.registerPlugin(ScrollTrigger);

const MobileForm = () => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const audioHoverRef = useRef<HTMLAudioElement | null>(null);
    const audioClickRef = useRef<HTMLAudioElement | null>(null);
    const audioAppearRef = useRef<HTMLAudioElement | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        audioHoverRef.current = new Audio('/sounds/hover.mp3');
        audioHoverRef.current.volume = 0.5;

        audioClickRef.current = new Audio('/sounds/click.mp3');
        audioClickRef.current.volume = 0.5;

        audioAppearRef.current = new Audio('/sounds/appear.mp3');
        audioAppearRef.current.volume = 0.5;
    }, []);

    // Initial rotation animation
    useGSAP(() => {
        gsap.from('.circrot', {
            duration: 2,
            rotate: 360,
            ease: 'power2.inOut',
            delay: 4,
            yoyo: true,
            stagger: {
                amount: 0.7,
                from: 'random',
                grid: [1, 4]
            },
            repeat: -1
        });

        gsap.to('.scrambleContact', {
            duration: 2,
            delay: 4,
            repeat: -1,
            repeatDelay: 5,
            opacity: 1,
            scrambleText: {
                text: "|||||||||||||||||||",
                chars: "///////////////////////",
                speed: 0.2,
                revealDelay: 0.2,
            },
        });
    }, []);

    // Main animation timeline with .contactme included
    useGSAP(() => {
        gsap.set(".contact-border", { opacity: 0 });
        gsap.set(".appearlines", { clipPath: "circle(0% at 50% 50%)" });
        gsap.set(".Cform", { clipPath: "circle(0% at 50% 50%)" });
        gsap.set(".sclines", { scaleX: 0 });
        gsap.set(".circle", { scale: 0 });
        gsap.set(".contactme", { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".appearlines",
                start: "top center",
                onEnter: () => tl.restart(),
                onLeaveBack: () => {
                    gsap.set(".contact-border", { opacity: 0 });
                    gsap.set(".appearlines", { clipPath: "circle(0% at 50% 50%)" });
                    gsap.set(".Cform", { clipPath: "circle(0% at 50% 50%)" });
                    gsap.set(".sclines", { scaleX: 0 });
                    gsap.set(".circle", { scale: 0 });
                    gsap.set(".contactme", { opacity: 0 });
                },
            }
        });

        if (audioAppearRef.current) {
            tl.add(() => {
                audioAppearRef.current!.currentTime = 0;
                audioAppearRef.current!.play().catch(err => {
                    console.warn('Sound play prevented:', err);
                });
            }, "+=0");
        }

        tl.to(".appearlines", {
            clipPath: "circle(100% at 50% 50%)",
            duration: 1.5,
            delay: 2,
            ease: "power2.out"
        })
            .to(".contact-border", {
                opacity: 1,
                duration: 0.2,
                repeat: 4,
                yoyo: true,
                ease: "none"
            })
            .to(".contact-border", {
                opacity: 1,
                duration: 1,
                ease: "power2.out"
            })
            .to(".sclines", {
                scaleX: 1,
                duration: 1,
                ease: "power2.out"
            })
            .to(".circle", {
                scale: 1,
                duration: 1,
                ease: "power1.in",
                stagger: {
                    amount: 0.5,
                    from: 'center',
                    grid: [1, 5]
                }
            })
            .to(".Cform", {
                clipPath: "circle(100% at 50% 50%)",
                duration: 1.5,
                ease: "power2.out"
            })
            .to(".contactme", {
                opacity: 1,
                duration: 1,
                ease: "power2.out"
            });
    }, []);

    // Hover sound and glow
    useGSAP(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const enter = () => {
            if (audioHoverRef.current) {
                audioHoverRef.current.currentTime = 0;
                audioHoverRef.current.play().catch(err => {
                    console.warn('Sound play prevented:', err);
                });
            }

            gsap.to(wrapper.querySelectorAll('.circle'), {
                scale: 1.2,
                filter: "drop-shadow(0 0 10px #46a0f9)",
                duration: 0.3,
                ease: "power2.out",
                stagger: 0.1
            });
        };

        const leave = () => {
            gsap.to(wrapper.querySelectorAll('.circle'), {
                scale: 1,
                filter: "drop-shadow(0 0 0px transparent)",
                duration: 0.3,
                ease: "power2.inOut",
                stagger: 0.1
            });
        };

        wrapper.addEventListener('mouseenter', enter);
        wrapper.addEventListener('mouseleave', leave);

        return () => {
            wrapper.removeEventListener('mouseenter', enter);
            wrapper.removeEventListener('mouseleave', leave);
        };
    }, []);

    const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
        if (audioClickRef.current) {
            audioClickRef.current.currentTime = 0;
            audioClickRef.current.play().catch(() => {});
        } else {
            console.warn('Audio not found');
        }
        e.currentTarget.blur();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const message = formData.get("message") as string;

        // Optional: basic validation
        if (!name || !email || !message) {
            toast.error("Please fill in all fields.");
            return;
        }

        emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
            {
                name,
                email,
                message
            },
            process.env.NEXT_PUBLIC_EMAILJS_USER_ID!
        )
            .then(() => {
                toast.success("Message sent successfully!");
                formRef.current?.reset();
            })
            .catch((error) => {
                console.error(error);
                toast.error("Something went wrong. Please try again later.");
            });
    };

    return (
        <div className="contact-form w-full h-full min-h-[100vh] bg-transparent flex flex-col relative">
            <h1 className="contactme absolute top-0 left-1/2 -translate-x-1/2 mt-4 font-neotriad-sans z-10 text-2xl">Contact Me.</h1>
            <div className="absolute inset-0 flex justify-center items-center z-5">
                <Image
                    src="/svg/border.svg"
                    alt="scifi contact form border"
                    fill
                    className="contact-border z-0"
                />
                <Image
                    src="/svg/appearlines.svg"
                    alt="scifi contact form appear lines"
                    fill
                    className="appearlines p-16"
                />
                <div ref={wrapperRef} onClick={handleClick} className="relative w-[300px] h-[300px]">
                    {['circ1', 'circ2', 'circ3', 'circ4', 'circ5'].map((src, idx) => (
                        <div key={idx} className={`circle ${idx < 4 ? 'circrot' : ''} absolute inset-0 scale-0 p-${idx + 1}`}>
                            <Image
                                src={`/svg/${src}.svg`}
                                alt={`scifi contact form ${src}`}
                                fill
                                style={{ objectFit: 'contain' }}
                                className={`p-${20 - idx * 5}`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="Cform absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="relative w-[1000px] h-screen pointer-events-none">
                    <div className="flex flex-col justify-center items-center gap-5 pt-20">
                        <input type="text" placeholder="Name" name="name" className="futuristic-input pointer-events-auto z-10" />
                        <input type="email" placeholder="Email" name="email" className="futuristic-input pointer-events-auto z-10" />
                        <textarea placeholder="Message" name="message" className="resize-none futuristic-input pointer-events-auto z-10" />
                        <button type="submit" className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full futuristic-button pointer-events-auto z-20">SEND</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MobileForm;
