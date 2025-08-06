export interface Project {
    title: string;
    videoSrc: string;
    description: string;
    codeUrl: string;
    demoUrl: string;
    audioSrc: string; // ✨ Changed from speakText to audioSrc
}

export const projects: Project[] = [
    {
        title: "Freya - AI Voice Assistant",
        videoSrc: "/videos/Freya.mp4", // Assuming this video is in your public folder
        description: "AI voice assistant designed to simplify your daily tasks and engage in casual conversations.",
        codeUrl: "https://github.com/IHANsaja/Freya-TheVoiceAssistant",
        demoUrl: "https://github.com/IHANsaja/Freya-TheVoiceAssistant",
        audioSrc: "/voices/ProjectFreya.mp3", // ✨ Path to your custom audio file
    },
    {
        title: "AI-driven Serendib WMS",
        videoSrc: "/videos/Serendib.mp4", // Assuming this video is in your public folder
        description: "Serendib WMS helps businesses manage their warehouses efficiently in real-time.",
        codeUrl: "https://github.com/IHANsaja/Serendib-Warehouse-Management-System",
        demoUrl: "https://github.com/IHANsaja/Serendib-Warehouse-Management-System",
        audioSrc: "/voices/ProjectSerendib.mp3", // ✨ Path to your custom audio file
    },
    {
        title: "Raven's Quill Bookstore",
        videoSrc: "/videos/Raven.mp4", // Assuming this video is in your public folder
        description: "Ravensquill Bookstore is a online bookstore that makes it easy for users to buy books from their home.",
        codeUrl: "https://github.com/IHANsaja/Ravensquill-Bookstore",
        demoUrl: "https://github.com/IHANsaja/Ravensquill-Bookstore",
        audioSrc: "/voices/ProjectRaven.mp3", // ✨ Path to your custom audio file
    },
    {
        title: "CINEC Campus Navigator",
        videoSrc: "/videos/Navigator.mp4", // Assuming this video is in your public folder
        description: "A modern web app I developed to make it easier for students to find their way around the campus.",
        codeUrl: "https://github.com/IHANsaja/CINEC-Campus-Navigator",
        demoUrl: "https://github.com/IHANsaja/CINEC-Campus-Navigator",
        audioSrc: "/voices/ProjectCinec.mp3", // ✨ Path to your custom audio file
    },
    {
        title: "Sri Padaya Website",
        videoSrc: "/videos/Sripadaya.mp4", // Assuming this video is in your public folder
        description: "A 3D interactive guide built to help travelers explore Adam's peak",
        codeUrl: "https://github.com/IHANsaja/sri-padaya-website",
        demoUrl: "https://ihansaja.github.io/sri-padaya-website/",
        audioSrc: "/voices/ProjectAdam.mp3", // ✨ Path to your custom audio file
    },
    {
        title: "Zenofy E-Commerce Website",
        videoSrc: "/videos/Freya.mp4", // Assuming this video is in your public folder
        description: "A modern e-commerce website for a business that specializes in projectors and accessories.",
        codeUrl: "https://github.com/IHANsaja/zenofy-website",
        demoUrl: "https://github.com/IHANsaja/zenofy-website",
        audioSrc: "/voices/ProjectZenofy.mp3", // ✨ Path to your custom audio file
    },
    {
        title: "HeritageLink Website",
        videoSrc: "/videos/Heritage.mp4", // Assuming this video is in your public folder
        description: "To protect and promote Sri Lanka’s rich cultural heritage through a modern digital experience",
        codeUrl: "https://github.com/IHANsaja/HeritageLink",
        demoUrl: "https://github.com/IHANsaja/HeritageLink",
        audioSrc: "/voices/ProjectHeritage.mp3", // ✨ Path to your custom audio file
    },
];