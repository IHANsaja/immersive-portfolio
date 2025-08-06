import React from 'react';
import ContactForm from '@/components/Contact/ContactForm';
import Link from 'next/link';
import Image from 'next/image';
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

const ContactSection: React.FC = () => {
    useGSAP(() => {
        gsap.set(".sideTree", { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".contact-form",
                start: "top center",
                onEnter: () => {
                    tl.restart();
                },
                onEnterBack: () => {
                    tl.restart();
                },
                onLeaveBack: () => {
                    gsap.set(".sideTree", { opacity: 0 });
                },
            }
        });

        tl.to(".contact-title", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
        })
            .to(".contact-title", {
                opacity: 0.3,
                repeat: 6,
                yoyo: true,
                duration: 0.1,
                ease: "power1.inOut"
            })
            .to(".contact-title", {
                opacity: 1,
                duration: 0.2,
                ease: "power1.inOut"
            })
            .to(".sideTree", {
                opacity: 1,
                duration: 1.5,
                delay: 0.5,
                ease: "power2.out"
            })
    })
    return (
        <section id="contact-section" className="relative w-screen h-screen z-0">
            {/* BACKGROUND DOT GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.1%22%20cy=%220.1%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
            </div>

            <h1 className="contact-title hidden md:block absolute top-30 left-1/2 -translate-x-1/2 mt-4 font-neotriad-sans z-10 text-4xl">Contact Me.</h1>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 h-auto sm:w-1/2 sm:h-1/2 z-10">
                <ContactForm />
            </div>

            <div className="absolute bottom-5 right-1/2 translate-x-1/2 md:right-20 md:translate-x-0 md:bottom-10 flex flex-row gap-6 z-15 mb-50 md:mb-8 md:pr-4">
                {[
                    { href: 'mailto:ihanhansaja5@gmail.com', src: '/svg/gmail.svg', alt: 'gmail' },
                    { href: 'https://wa.me/94718995192', src: '/svg/whatsapp.svg', alt: 'whatsapp' },
                    { href: 'https://www.linkedin.com/in/ihan-hansaja-548b45244/', src: '/svg/linkedin.svg', alt: 'linkedin' },
                    { href: 'tel:+94760685132', src: '/svg/phone.svg', alt: 'phone' },
                ].map(({ href, src, alt }, idx) => (
                    <Link href={href} key={idx} target="_blank" className="group pointer-events-auto">
                        <div className="p-3 rounded-full border-2 border-white bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 shadow-lg group-hover:shadow-xl hover:scale-110">
                            <Image src={src} alt={alt} height={36} width={36} className="transition-transform duration-300 group-hover:rotate-12" loading="lazy" />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="sideTree absolute bottom-[-50px] right-0 w-1/2 z-5 mix-blend-multiply -scale-x-100">
                <Image src="/backgrounds/sideTree.png" alt="mountain background" height={1000} width={1000} loading="lazy"/>
            </div>
        </section>
    );
};

export default ContactSection;