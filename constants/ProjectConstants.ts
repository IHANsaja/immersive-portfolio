export interface Project {
    title: string;
    videoSrc: string; // Can be video or image URL
    description: string;
    detailDescription: string; // Full description for the popup drawer
    codeUrl?: string; // Optional code URL
    demoUrl?: string; // Optional demo URL
    figmaUrl?: string; // Optional Figma design URL
    audioSrc: string; // ✨ Changed from speakText to audioSrc
    badge?: 'ui-design' | 'code-only' | 'full-project'; // Optional project type badge
}

export const projects: Project[] = [
    {
        title: "Freya 3.0 - AI Voice Assistant",
        videoSrc: "/videos/Freya.mp4", // Local video file
        description: "AI voice assistant designed to simplify your daily tasks and engage in casual conversations.",
        detailDescription: "Freya is an AI-powered voice assistant built to simplify daily tasks and engage in natural, casual conversations. Leveraging advanced natural language processing and speech recognition, Freya understands context, responds intelligently, and learns your preferences over time. From setting reminders to answering complex questions, Freya is your personal AI companion that makes life easier through the power of voice.",
        codeUrl: "https://github.com/IHANsaja/freyav3",
        demoUrl: "",
        figmaUrl: "", // Replace with actual Figma URL
        audioSrc: "/voices/ProjectFreya.mp3", // ✨ Path to your custom audio file
    },
    {
        title: "AI-driven Serendib WMS",
        videoSrc: "/videos/Serendib.mp4", // Assuming this video is in your public folder
        description: "Serendib WMS helps businesses manage their warehouses efficiently in real-time.",
        detailDescription: "Serendib WMS is an AI-driven Warehouse Management System designed to help businesses manage their inventory and warehouse operations with unprecedented efficiency. Featuring real-time stock tracking, intelligent order routing, predictive restocking alerts, and comprehensive analytics dashboards, the system transforms chaotic warehouses into streamlined, data-driven operations. Built with modern web technologies and backed by machine learning algorithms for demand forecasting.",
        codeUrl: "https://github.com/IHANsaja/Serendib-Warehouse-Management-System",
        demoUrl: "",
        figmaUrl: "https://www.figma.com/design/UC9Jg0csr3ixsco1bkCT21/Serendib?node-id=0-1&t=efcJsAbHIsHftDim-1", // Replace with actual Figma URL
        audioSrc: "/voices/ProjectSerendib.mp3", // ✨ Path to your custom audio file
        badge: "full-project", // Has both code and design
    },
    {
        title: "Raven's Quill Bookstore",
        videoSrc: "/videos/Raven.mp4", // Assuming this video is in your public folder
        description: "Ravensquill Bookstore is a online bookstore that makes it easy for users to buy books from their home.",
        detailDescription: "Ravensquill Bookstore is a fully-featured online bookstore platform that brings the joy of book shopping to your fingertips. Users can browse an extensive catalog, read detailed reviews, manage wishlists, and complete purchases seamlessly. The platform features intelligent book recommendations, genre-based filtering, author spotlights, and a clean reading-focused UI that makes discovering your next favorite book an effortless experience.",
        codeUrl: "https://github.com/IHANsaja/Ravensquill-Bookstore",
        demoUrl: "https://github.com/IHANsaja/Ravensquill-Bookstore",
        figmaUrl: "",
        audioSrc: "/voices/ProjectRaven.mp3", // ✨ Path to your custom audio file
        badge: "code-only", // Only has code, no design
    },
    {
        title: "CINEC Campus Navigator",
        videoSrc: "/videos/Navigator.mp4", // Assuming this video is in your public folder
        description: "A modern web app I developed to make it easier for students to find their way around the campus.",
        detailDescription: "CINEC Campus Navigator is a modern, interactive web application designed to help students, staff, and visitors navigate the CINEC campus with ease. Featuring an interactive campus map with building labels, indoor navigation support, real-time location awareness, and step-by-step directions, this app eliminates the confusion of finding classrooms, labs, and facilities across the sprawling campus grounds.",
        codeUrl: "https://github.com/IHANsaja/CINEC-Campus-Navigator",
        demoUrl: "https://github.com/IHANsaja/CINEC-Campus-Navigator",
        figmaUrl: "", // Replace with actual Figma URL
        audioSrc: "/voices/ProjectCinec.mp3", // ✨ Path to your custom audio file
    },
    {
        title: "Sri Padaya Website",
        videoSrc: "/videos/Sripadaya.mp4", // Assuming this video is in your public folder
        description: "A 3D interactive guide built to help travelers explore Adam's peak",
        detailDescription: "Sri Padaya Website is a stunning 3D interactive guide that takes travelers on a virtual journey to Adam's Peak (Sri Pada), one of Sri Lanka's most sacred and breathtaking pilgrimage sites. Built with Three.js and immersive web technologies, the experience features 3D terrain rendering, interactive waypoints along the trail, historical and cultural information, weather data integration, and practical climbing tips — all wrapped in a visually captivating interface.",
        codeUrl: "https://github.com/IHANsaja/sri-padaya-website",
        demoUrl: "https://ihansaja.github.io/sri-padaya-website/",
        figmaUrl: "", // Replace with actual Figma URL
        audioSrc: "/voices/ProjectAdam.mp3", // ✨ Path to your custom audio file
    },
    {
        title: "Zenofy E-Commerce Website",
        videoSrc: "/images/zenofy.jpg", // External image URL
        description: "A modern e-commerce website for a business that specializes in projectors and accessories.",
        detailDescription: "Zenofy is a modern, sleek e-commerce platform built for a business specializing in projectors and audio-visual accessories. The website features a refined product catalog with advanced filtering, detailed product pages with comparison tools, a seamless checkout experience, and an admin dashboard for inventory management. The design prioritizes a premium, tech-forward aesthetic that matches the high-quality products being sold.",
        codeUrl: "https://github.com/IHANsaja/zenofy-website",
        demoUrl: "",
        figmaUrl: "https://www.figma.com/design/fDjkJc9GviqSmVuzkiTbYz/Zenofy-Web-App?node-id=0-1&t=dQcPMZo46l27aVGN-1",
        audioSrc: "/voices/ProjectZenofy.mp3", // ✨ Path to your custom audio file
        badge: "full-project", // Has both code and design
    },
    {
        title: "HeritageLink Website",
        videoSrc: "/videos/Heritage.mp4", // Assuming this video is in your public folder
        description: "To protect and promote Sri Lanka's rich cultural heritage through a modern digital experience",
        detailDescription: "HeritageLink is a digital platform dedicated to protecting and promoting Sri Lanka's rich cultural heritage through a modern, accessible web experience. The website showcases historical sites, traditional arts, cultural events, and heritage preservation initiatives with interactive maps, rich media galleries, detailed articles, and community engagement features. It bridges the gap between ancient traditions and modern technology to keep Sri Lanka's heritage alive for future generations.",
        codeUrl: "https://github.com/IHANsaja/HeritageLink",
        demoUrl: "https://github.com/IHANsaja/HeritageLink",
        figmaUrl: "https://www.figma.com/design/vZuJm07ln2Vb8DbHQ0LWWF/HeritageLink?node-id=0-1&t=SlCOnK6vtoKMiRvv-1", // Replace with actual Figma URL
        audioSrc: "/voices/ProjectHeritage.mp3", // ✨ Path to your custom audio file
    },
    {
        title: "EcoVibe Mobile App",
        videoSrc: "/images/ecovibe.jpg", // External image URL
        description: "A modern mobile app designed to help users reduce their carbon footprint and live a more sustainable lifestyle.",
        detailDescription: "EcoVibe is a beautifully designed mobile application that empowers users to reduce their carbon footprint and adopt a more sustainable lifestyle. The app features daily eco-challenges, carbon footprint tracking, sustainable product recommendations, community leaderboards, and educational content about environmental conservation. The UI design focuses on organic, nature-inspired aesthetics with intuitive navigation that makes going green feel rewarding and achievable.",
        codeUrl: "",
        demoUrl: "",
        figmaUrl: "https://www.figma.com/design/PGzfaFxNWv8EFwbd9i3ZGc/greenUrbanCity-mobile-app?node-id=0-1&t=XZi9vefiJbSlsNlm-1", // Replace with actual Figma URL
        audioSrc: "", // ✨ Path to your custom audio file
        badge: "ui-design"
    },
    {
        title: "CINEC Website",
        videoSrc: "/images/fome.jpg", // External image URL
        description: "Marine Engineering Faculty website designed to help users learn about the faculty and its programs.",
        detailDescription: "The CINEC Marine Engineering Faculty website is a comprehensive digital presence designed to inform prospective students, current enrollees, and industry partners about the faculty's programs, research initiatives, and maritime engineering expertise. The website features program overviews, faculty profiles, research publications, event calendars, and student testimonials, all presented through a modern, professionally designed interface that reflects the prestige of the institution.",
        codeUrl: "",
        demoUrl: "",
        figmaUrl: "https://www.figma.com/design/DPTzzMA69YzRNJvWUR6Uvt/FOME?node-id=0-1&t=ngzucepFrxyodoBd-1", // Replace with actual Figma URL
        audioSrc: "", // ✨ Path to your custom audio file
        badge: "ui-design"
    }
];