"use client";

import AnimatedHoverButton from "@/components/Ui/Button";

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

    return (
        <div id="gr-buttons" className="flex flex-row gap-8 mt-15 mr-15">
            <AnimatedHoverButton text="github" bgColor={'#3F51B5'} onClick={githubClick} />
            <AnimatedHoverButton text="resume" bgColor={'#191919'} onClick={resumeClick} />
        </div>
    )
}
export default GrButtons
