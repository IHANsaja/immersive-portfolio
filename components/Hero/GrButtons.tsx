"use client";
import React from 'react'
import AnimatedHoverButton from "@/components/Ui/Button";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

const GrButtons = () => {
    const githubClick = () => {
        window.open('https://github.com/IHANsaja', '_blank');
    }
    const resumeClick = () => {
        const link = document.createElement('a');
        link.href = '/resume/Ihan_Hansaja_Resume.pdf'; // relative path to file in /public
        link.download = 'Ihan_Hansaja_Resume.pdf'; // filename when downloaded
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
