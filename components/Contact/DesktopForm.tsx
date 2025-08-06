import React, {MouseEventHandler, useEffect, useRef} from 'react'
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import emailjs from 'emailjs-com';
import {toast} from "react-toastify";

const DesktopForm = () => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const audioHoverRef = useRef<HTMLAudioElement | null>(null);
    const audioClickRef = useRef<HTMLAudioElement | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const audioInitiateRef = useRef<HTMLAudioElement | null>(null);
    const audioSuccessRef = useRef<HTMLAudioElement | null>(null);
    const audioErrorRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioHoverRef.current = new Audio('/sounds/hover.mp3');
        audioHoverRef.current.volume = 0.5;

        audioClickRef.current = new Audio('/sounds/click.mp3');
        audioClickRef.current.volume = 0.5;

        audioInitiateRef.current = new Audio('/sounds/initiating.wav');
        audioInitiateRef.current.volume = 0.05;

        audioSuccessRef.current = new Audio('/sounds/confirm.wav');
        audioSuccessRef.current.volume = 0.1;

        audioErrorRef.current = new Audio('/sounds/reject.wav');
        audioErrorRef.current.volume = 0.1;
    }, []);

    // Initial rotation animation for circles
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

    // Border and clip-path appear animations
    useGSAP(() => {
        gsap.set(".contact-border", { opacity: 0 });
        gsap.set(".appearlines", { clipPath: "circle(0% at 50% 50%)" });
        gsap.set(".Cform", { clipPath: "circle(0% at 50% 50%)" });
        gsap.set(".sclines", { scaleX: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".appearlines",
                start: "top center",
                onEnter: () => {
                    tl.restart();
                },
                onLeaveBack: () => {
                    gsap.set(".contact-border", { opacity: 0 });
                    gsap.set(".appearlines", { clipPath: "circle(0% at 50% 50%)" });
                    gsap.set(".Cform", { clipPath: "circle(0% at 50% 50%)" });
                    gsap.set(".sclines", { scaleX: 0 });
                    gsap.set(".circle", { scale: 0 });
                },
            }
        });

        if (audioInitiateRef.current) {
            tl.add(() => {
                const audio = audioInitiateRef.current!;
                audio.currentTime = 0;
                audio.play().catch(err => {
                    console.warn('Sound play prevented:', err);
                });

                // Schedule audio stop at the end of timeline
                const duration = tl.duration(); // Get total timeline duration
                setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }, duration * 1000); // Convert seconds to ms
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
                delay: 2,
                ease: "power2.out"
            })
    }, []);

    // Hover scale and glow effect
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
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
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
            if (audioErrorRef.current) {
                audioErrorRef.current.currentTime = 0;
                audioErrorRef.current.play().catch(err => {
                    console.warn('Sound play prevented:', err);
                });
            }
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
                if (audioSuccessRef.current) {
                    audioSuccessRef.current.currentTime = 0;
                    audioSuccessRef.current.play().catch(err => {
                        console.warn('Sound play prevented:', err);
                    });
                }
                formRef.current?.reset();
            })
            .catch((error) => {
                console.error(error);
                toast.error("Something went wrong. Please try again later.");
                if (audioErrorRef.current) {
                    audioErrorRef.current.currentTime = 0;
                    audioErrorRef.current.play().catch(err => {
                        console.warn('Sound play prevented:', err);
                    });
                }
            });
    };


    return (
        <div className="contact-form w-full h-full bg-background relative">
            <div className="absolute inset-0 flex justify-center items-center z-5">
                {/* Static border image */}
                <Image
                    src="/svg/border.svg"
                    alt="scifi contact form border"
                    fill
                    className="contact-border z-0"
                    priority
                />

                {/* Appear-lines clip-path animation */}
                <Image
                    src="/svg/appearlines.svg"
                    alt="scifi contact form appear lines"
                    fill
                    className="appearlines p-16"
                    priority
                />

                {/* Overlapping circles with manual padding */}
                <div ref={wrapperRef} onClick={handleClick} className="relative w-[300px] h-[300px]">
                    <div className="circle circrot absolute inset-0 scale-0 p-1">
                        <Image
                            src="/svg/circ1.svg"
                            alt="scifi contact form circ1"
                            fill
                            style={{ objectFit: 'contain' }}
                            className="p-20"
                            priority
                        />
                    </div>
                    <div className="circle circrot absolute inset-0 scale-0 p-2">
                        <Image
                            src="/svg/circ2.svg"
                            alt="scifi contact form circ2"
                            fill
                            style={{ objectFit: 'contain' }}
                            className="p-15"
                            priority
                        />
                    </div>
                    <div className="circle circrot absolute inset-0 scale-0 p-3">
                        <Image
                            src="/svg/circ3.svg"
                            alt="scifi contact form circ3"
                            fill
                            style={{ objectFit: 'contain' }}
                            className="p-12"
                            priority
                        />
                    </div>
                    <div className="circle circrot absolute inset-0 scale-0 p-4">
                        <Image
                            src="/svg/circ4.svg"
                            alt="scifi contact form circ4"
                            fill
                            style={{ objectFit: 'contain' }}
                            className="p-8"
                            priority
                        />
                    </div>
                    <div className="circle absolute inset-0 scale-0 p-5">
                        <Image
                            src="/svg/circ5.svg"
                            alt="scifi contact form circ5"
                            fill
                            style={{ objectFit: 'contain' }}
                            className="p-0"
                            priority
                        />
                    </div>
                </div>
            </div>

            <div className="w-full h-full relative z-4 pointer-events-none">
                <div className="absolute top-1/2 -translate-y-1/2 -left-16 rotate-90 font-inconsolata-sans pointer-events-none">
                    <p className="scrambleContact sclines opacity-0">|||||||||||||||||||</p>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-0 pt-2 font-inconsolata-sans pointer-events-none">
                    <p className="scrambleContact sclines opacity-0">|||||||||||||||||||</p>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-16 rotate-90 font-inconsolata-sans pointer-events-none">
                    <p className="scrambleContact sclines opacity-0">|||||||||||||||||||</p>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 pb-2 font-inconsolata-sans pointer-events-none">
                    <p className="scrambleContact sclines opacity-0">|||||||||||||||||||</p>
                </div>
            </div>

            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="Cform absolute inset-0 flex items-center justify-center z-[9999] pointer-events-none">
                <div className="relative w-[1000px] h-[500px] pointer-events-none">
                    {/* Name Field */}
                    <input
                        type="text"
                        placeholder="Name"
                        name="name"
                        className="absolute top-[10%] left-[42%] w-[160px] h-[36px] futuristic-input pointer-events-auto bg-background"
                    />
                    {/* Email Field */}
                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        className="absolute top-[47%] left-[10%] w-[200px] h-[36px] futuristic-input pointer-events-auto bg-background"
                    />
                    {/* Message Field */}
                    <textarea
                        placeholder="Message"
                        name="message"
                        className="absolute top-[42%] right-[10%] w-[200px] h-[80px] resize-none futuristic-input pointer-events-auto bg-background"
                    />
                    {/* Send Button */}
                    <button
                        type="submit"
                        className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full futuristic-button pointer-events-auto"
                    >
                        SEND
                    </button>
                </div>
            </form>
        </div>
    )
}
export default DesktopForm
