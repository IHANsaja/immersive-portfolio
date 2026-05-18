import React from 'react';
import ContactForm from '@/components/Contact/ContactForm';
import Link from 'next/link';
import Image from 'next/image';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";


const ContactSection: React.FC = () => {
    useGSAP(() => {
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
    })
    return (
        <section id="contact-section" className="relative w-screen h-screen z-0">
            {/* BACKGROUND DOT GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.1%22%20cy=%220.1%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
            </div>

            <h1 className="contact-title hidden md:block absolute top-20 md:top-24 lg:top-30 left-1/2 -translate-x-1/2 mt-4 font-neotriad-sans z-10 text-2xl md:text-4xl lg:text-6xl text-center whitespace-nowrap">Contact Me.</h1>

            <div className="absolute top-[48%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[80%] md:w-[70%] lg:w-[60%] h-[70vh] md:h-auto md:aspect-[2/1] z-10 max-h-[80vh]">
                <ContactForm />
            </div>

            <div className="absolute bottom-24 right-1/2 translate-x-1/2 md:right-10 lg:right-20 md:translate-x-0 md:bottom-8 lg:bottom-10 flex flex-row gap-4 md:gap-6 z-20 md:pr-4">
                {[
                    { href: 'mailto:ihanhansaja5@gmail.com', src: '/svg/gmail.svg', alt: 'gmail' },
                    { href: 'https://wa.me/94718995192', src: '/svg/whatsapp.svg', alt: 'whatsapp' },
                    { href: 'https://www.linkedin.com/in/ihan-hansaja-548b45244/', src: '/svg/linkedin.svg', alt: 'linkedin' },
                    { href: 'tel:+94760685132', src: '/svg/phone.svg', alt: 'phone' },
                ].map(({ href, src, alt }, idx) => (
                    <Link href={href} key={idx} target="_blank" className="group pointer-events-auto">
                        <div className="p-2 md:p-3 rounded-full border-2 border-white bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 shadow-lg group-hover:shadow-xl hover:scale-110">
                            <div className="relative w-6 h-6 md:w-9 md:h-9">
                                <Image
                                    src={src}
                                    alt={alt}
                                    fill
                                    className="object-contain transition-transform duration-300 group-hover:rotate-12"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ContactSection;