"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { Experience } from "@/constants/ExperienceConstants";

interface ExperienceCardProps {
    experience: Experience;
    index: number;
    isLeft: boolean;
}

const typeLabels: Record<Experience["type"], string> = {
    work: "EMPLOYMENT",
    freelance: "FREELANCE",
    academic: "ACADEMIC",
};

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, index, isLeft }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const accentRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (accentRef.current) {
            gsap.to(accentRef.current, {
                width: "100%",
                height: "3px",
                duration: 0.35,
                ease: "power2.out",
            });
        }
        if (cardRef.current) {
            gsap.to(cardRef.current, {
                y: -3,
                duration: 0.35,
                ease: "power2.out",
            });
        }
    };

    const handleMouseLeave = () => {
        if (accentRef.current) {
            gsap.to(accentRef.current, {
                width: "6px",
                height: "6px",
                duration: 0.35,
                ease: "power2.in",
            });
        }
        if (cardRef.current) {
            gsap.to(cardRef.current, {
                y: 0,
                duration: 0.35,
                ease: "power2.in",
            });
        }
    };

    return (
        <div
            className={`exp-card-wrapper flex items-center w-full lg:max-w-[460px] ${
                isLeft ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
        >
            {/* Connector arm — hidden on mobile */}
            <div
                className="hidden lg:block exp-connector w-10"
                style={{
                    background: isLeft
                        ? "linear-gradient(270deg, rgba(63, 81, 181, 0.5), transparent)"
                        : "linear-gradient(90deg, rgba(63, 81, 181, 0.5), transparent)",
                }}
            />

            {/* Card */}
            <div
                ref={cardRef}
                className="exp-card clip-shape flex-1 relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Accent square */}
                <div ref={accentRef} className="exp-card-accent" />

                {/* Header row — type badge + period */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className={`exp-type-indicator exp-type-${experience.type}`}>
                        {typeLabels[experience.type]}
                    </span>
                    <span className="font-andvari-sans text-[10px] text-gray-400 tracking-wider">
                        {experience.period}
                    </span>
                </div>

                {/* Role title */}
                <h3 className={`exp-role font-neotriad-sans text-base lg:text-lg text-[var(--foreground)] mb-1 ${isLeft ? "lg:text-right" : "lg:text-left"}`}>
                    {experience.role}
                </h3>

                {/* Company */}
                <p className={`exp-company font-andvari-sans text-[11px] tracking-wider text-gray-400 uppercase mb-3 ${isLeft ? "lg:text-right" : "lg:text-left"}`}>
                    {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                    // {experience.company}
                </p>

                {/* Description */}
                <p className={`font-andvari-sans text-[11px] leading-5 text-gray-300 mb-4 ${isLeft ? "lg:text-right" : "lg:text-left"}`}>
                    {experience.description}
                </p>

                {/* Tech stack badges */}
                <div className={`flex flex-wrap gap-2 ${isLeft ? "lg:justify-end" : "lg:justify-start"}`}>
                    {experience.techStack.map((tech, i) => (
                        <span key={i} className="exp-tech-badge">
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Index number — decorative */}
                <span className={`absolute bottom-3 font-inconsolata-sans text-[10px] text-gray-600 ${isLeft ? "right-5 lg:right-auto lg:left-5" : "right-5"}`}>
                    {String(index + 1).padStart(2, "0")}
                </span>
            </div>
        </div>
    );
};

export default ExperienceCard;
