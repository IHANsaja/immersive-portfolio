export interface Project {
    title: string;
    videoSrc: string;
    description: string;
    detailDescription: string;
    codeUrl?: string;
    demoUrl?: string;
    figmaUrl?: string;
    audioSrc: string;
    badge?: 'ui-design' | 'code-only' | 'full-project';
}

export const projects: Project[] = [
    {
        title: "Freya 3.0 - AI Voice Assistant",
        videoSrc: "/videos/Freya.mp4",
        description: "AI voice assistant designed to simplify your daily tasks and engage in casual conversations.",
        detailDescription: "Freya is an AI-powered voice assistant built to simplify daily tasks and engage in natural, casual conversations. Leveraging advanced natural language processing and speech recognition, Freya understands context, responds intelligently, and learns your preferences over time. From setting reminders to answering complex questions, Freya is your personal AI companion that makes life easier through the power of voice.",
        codeUrl: "https://github.com/IHANsaja/freyav3",
        demoUrl: "",
        figmaUrl: "",
        audioSrc: "/voices/ProjectFreya.mp3",
    },
    {
        title: "Outbreak",
        videoSrc: "/images/outbreak.jpg",
        description: "Outbreak-AI is an advanced nationwide flood forecasting and disaster management platform",
        detailDescription: "Outbreak-AI is an advanced nationwide flood forecasting and disaster management platform developed to strengthen disaster preparedness across Sri Lanka. The system combines automated data collection, artificial intelligence, and real-time visualization to help authorities and communities respond more effectively to flood threats.",
        codeUrl: "https://github.com/IHANsaja/outbreak",
        demoUrl: "",
        figmaUrl: "",
        audioSrc: "/voices/ProjectOutbreak.mp3",
    },
    {
        title: "Image Gang - Immersive Website",
        videoSrc: "/images/imagegang.jpg",
        description: "An Immersive Portfolio built for a UK based customer through Fiverr.",
        detailDescription: "This is an Immersive Portfolio built for a UK based customer through Fiverr. It features a unique and engaging interface that showcases their work in a way that is both beautiful and functional. The website is built with modern web technologies and features a responsive design that works on all devices. It also includes a variety of interactive elements that make the website both fun and engaging to use.",
        codeUrl: "",
        demoUrl: "https://isabelleugc-website.vercel.app/",
        figmaUrl: "",
        audioSrc: "/voices/ProjectImageGang.mp3",
    },
    {
        title: "Battlezik",
        videoSrc: "/images/battlezik.jpg",
        description: "Battlezik is a modern esports SaaS platform created to help competitive gaming clans",
        detailDescription: "Battlezik is a modern esports SaaS platform created to help competitive gaming clans organize, compete, and grow within a professional digital environment. The platform provides tools for tournament hosting, scrim scheduling, team management, and match coordination, all within a seamless user experience.",
        codeUrl: "",
        demoUrl: "https://battlezik.com/",
        figmaUrl: "",
        audioSrc: "/voices/ProjectBattlezik.mp3",
        badge: "full-project",
    },
    {
        title: "Next Step Company Website",
        videoSrc: "/images/nextstep.jpg",
        description: "Battlezik is a modern esports SaaS platform created to help competitive gaming clans",
        detailDescription: "Battlezik is a modern esports SaaS platform created to help competitive gaming clans organize, compete, and grow within a professional digital environment. The platform provides tools for tournament hosting, scrim scheduling, team management, and match coordination, all within a seamless user experience.",
        codeUrl: "",
        demoUrl: "https://www.nextstepcareer.lk/",
        figmaUrl: "",
        audioSrc: "/voices/ProjectNS.mp3",
        badge: "full-project",
    },
    {
        title: "AI-driven Serendib WMS",
        videoSrc: "/images/Serendib.jpg",
        description: "Serendib WMS helps businesses manage their warehouses efficiently in real-time.",
        detailDescription: "Serendib WMS is an AI-driven Warehouse Management System designed to help businesses manage their inventory and warehouse operations with unprecedented efficiency. Featuring real-time stock tracking, intelligent order routing, predictive restocking alerts, and comprehensive analytics dashboards, the system transforms chaotic warehouses into streamlined, data-driven operations. Built with modern web technologies and backed by machine learning algorithms for demand forecasting.",
        codeUrl: "https://github.com/IHANsaja/Serendib-Warehouse-Management-System",
        demoUrl: "",
        figmaUrl: "https://www.figma.com/design/UC9Jg0csr3ixsco1bkCT21/Serendib?node-id=0-1&t=efcJsAbHIsHftDim-1", // Replace with actual Figma URL
        audioSrc: "/voices/ProjectSerendib.mp3",
        badge: "full-project",
    },
    {
        title: "Zenofy E-Commerce Website",
        videoSrc: "/images/zenofy.jpg",
        description: "A modern e-commerce website for a business that specializes in projectors and accessories.",
        detailDescription: "Zenofy is a modern, sleek e-commerce platform built for a business specializing in projectors and audio-visual accessories. The website features a refined product catalog with advanced filtering, detailed product pages with comparison tools, a seamless checkout experience, and an admin dashboard for inventory management. The design prioritizes a premium, tech-forward aesthetic that matches the high-quality products being sold.",
        codeUrl: "https://github.com/IHANsaja/zenofy-website",
        demoUrl: "",
        figmaUrl: "https://www.figma.com/design/fDjkJc9GviqSmVuzkiTbYz/Zenofy-Web-App?node-id=0-1&t=dQcPMZo46l27aVGN-1",
        audioSrc: "/voices/ProjectZenofy.mp3",
        badge: "full-project",
    },
    {
        title: "HeritageLink Website",
        videoSrc: "/images/heritagelink.jpg",
        description: "To protect and promote Sri Lanka's rich cultural heritage through a modern digital experience",
        detailDescription: "HeritageLink is a digital platform dedicated to protecting and promoting Sri Lanka's rich cultural heritage through a modern, accessible web experience. The website showcases historical sites, traditional arts, cultural events, and heritage preservation initiatives with interactive maps, rich media galleries, detailed articles, and community engagement features. It bridges the gap between ancient traditions and modern technology to keep Sri Lanka's heritage alive for future generations.",
        codeUrl: "https://github.com/IHANsaja/HeritageLink",
        demoUrl: "https://github.com/IHANsaja/HeritageLink",
        figmaUrl: "https://www.figma.com/design/vZuJm07ln2Vb8DbHQ0LWWF/HeritageLink?node-id=0-1&t=SlCOnK6vtoKMiRvv-1", // Replace with actual Figma URL
        audioSrc: "/voices/ProjectHeritage.mp3",
    },
    {
        title: "EcoVibe Mobile App",
        videoSrc: "/images/ecovibe.jpg",
        description: "A modern mobile app designed to help users reduce their carbon footprint and live a more sustainable lifestyle.",
        detailDescription: "EcoVibe is a beautifully designed mobile application that empowers users to reduce their carbon footprint and adopt a more sustainable lifestyle. The app features daily eco-challenges, carbon footprint tracking, sustainable product recommendations, community leaderboards, and educational content about environmental conservation. The UI design focuses on organic, nature-inspired aesthetics with intuitive navigation that makes going green feel rewarding and achievable.",
        codeUrl: "",
        demoUrl: "",
        figmaUrl: "https://www.figma.com/design/PGzfaFxNWv8EFwbd9i3ZGc/greenUrbanCity-mobile-app?node-id=0-1&t=XZi9vefiJbSlsNlm-1", // Replace with actual Figma URL
        audioSrc: "/voices/ProjectEcovibe.mp3",
        badge: "ui-design"
    }
];