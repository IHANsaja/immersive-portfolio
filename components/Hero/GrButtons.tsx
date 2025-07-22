"use client";
import React from 'react'
import AnimatedHoverButton from "@/components/Ui/Button";
import {useGSAP} from "@gsap/react";
import gsap from "@/app/utils/gsapClient";

const GrButtons = () => {
    const githubClick = () => {
        window.open('https://github.com/IHANsaja', '_blank');
    }
    const resumeClick = () => {
        window.open('https://github.com/IHANsaja', '_blank');
    }

    useGSAP(() => {
        gsap.from('#gr-buttons', {
            duration: 2,
            y: -200,
            opacity: 0,
            ease: 'power1.in',
            stagger: {
                amount: 2,
                from: 'random',
                grid: [1, 2],
            },
            delay: 4,
        })
    }, [])

    return (
        <div id="gr-buttons" className="flex flex-row gap-8 mt-15 mr-15">
            <AnimatedHoverButton text="github" bgColor={'#3F51B5'} onClick={githubClick} />
            <AnimatedHoverButton text="resume" bgColor={'#191919'} onClick={resumeClick} />
        </div>
    )
}
export default GrButtons
