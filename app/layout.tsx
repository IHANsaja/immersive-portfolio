import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ToasterProvider from "@/components/Ui/ToasterProvider";
import PreloaderWrapper from "@/components/Ui/PreloaderWrpper";
import { MusicProvider } from "@/components/Ui/MusicProvider"; // 1. Import the wrapper

const InconsolataSans = Inconsolata({
    variable: "--font-inconsolata-sans",
    subsets: ["latin"],
});

const NeotriadSans = localFont({
    variable: "--font-neotriad-sans",
    src: "../public/fonts/Neotriad.otf",
    display: 'swap',
});

const AndvariSans = localFont({
    variable: '--font-andvari-sans',
    src: '../public/fonts/andvari.ttf',
    display: 'swap',
});

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#000000',
};

export const metadata: Metadata = {
    title: "Ihan Hansaja - Full Stack Developer & AI Engineer | Portfolio",
    description: "Ihan Hansaja is a Software Engineering undergraduate specializing in Full-Stack Development, AI Engineering, and Machine Learning. Explore my portfolio featuring AI-driven web applications, immersive websites, and innovative projects built with React, Next.js, Three.js, and modern technologies.",
    keywords: [
        // Main target keywords
        "Ihan Hansaja",
        "developer portfolio",
        "full stack developer portfolio",
        "AI Engineer",
        "Machine Learning Engineer",
        "Software Engineer",
        "React Developer",
        "Next.js Developer",
        "Three.js Developer",
        "Web Developer",
        "Frontend Developer",
        "Backend Developer",
        "UI/UX Designer",
        
        // Typos and variations
        "Ihan",
        "Hansaja",
        "ihanhansaja",
        "ihan hansja",
        "ihaan hansaja",
        "ihan hasaja",
        "ihan hansa",
        "ethan hansaja",
        "ihan hansaje",
        "fullstack developer portfolio",
        "full stack dev portfolio",
        "ihan hansaja developer",
        "Ihan Hansaja Portfolio",
        
        // Specific niche keywords
        "Sri Lanka Developer",
        "Sri Lankan Software Engineer",
        "Machine Learning Portfolio",
        "AI Engineer Portfolio",
        "AI-driven Web Apps",
        "Immersive Websites",
        
        // Technologies
        "TypeScript",
        "Node.js",
        "Python",
        "Java",
        "MongoDB",
        "MySQL",
        "Supabase",
        "Firebase",
        "AWS",
        "Docker"
    ],
    authors: [{ name: "Ihan Hansaja" }],
    creator: "Ihan Hansaja",
    publisher: "Ihan Hansaja",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://immersive-portfolio.vercel.app'), // Your Vercel deployment URL
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: "Ihan Hansaja - Full Stack Developer & AI Engineer",
        description: "Software Engineering undergraduate specializing in Full-Stack Development, AI Engineering, and Machine Learning. Explore innovative projects and cutting-edge web applications.",
        url: 'https://immersive-portfolio.vercel.app', // Your Vercel deployment URL
        siteName: 'Ihan Hansaja Portfolio',
        images: [
            {
                url: '/og-image.jpg', // You'll need to create this image
                width: 1200,
                height: 630,
                alt: 'Ihan Hansaja - Full Stack Developer & AI Engineer',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Ihan Hansaja - Full Stack Developer & AI Engineer",
        description: "Software Engineering undergraduate specializing in Full-Stack Development, AI Engineering, and Machine Learning.",
        images: ['/og-image.jpg'], // You'll need to create this image
        creator: '@ihanhansaja', // Replace with your actual Twitter handle
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code', // Add your Google Search Console verification code
        yandex: 'your-yandex-verification-code', // Add if needed
        yahoo: 'your-yahoo-verification-code', // Add if needed
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person",
                "@id": "https://immersive-portfolio.vercel.app/#person",
                "name": "Ihan Hansaja",
                "jobTitle": "Full Stack Developer & AI Engineer",
                "description": "Software Engineering undergraduate specializing in Full-Stack Development, AI Engineering, and Machine Learning.",
                "url": "https://immersive-portfolio.vercel.app",
                "image": "https://immersive-portfolio.vercel.app/og-image.jpg",
                "sameAs": [
                    "https://github.com/IHANsaja",
                    "https://linkedin.com/in/ihanhansaja",
                    "https://twitter.com/ihanhansaja"
                ],
                "alumniOf": {
                    "@type": "EducationalOrganization",
                    "name": "CINEC Campus",
                    "description": "Software Engineering"
                },
                "knowsAbout": [
                    "Full Stack Development",
                    "AI Engineering",
                    "Machine Learning",
                    "React",
                    "Next.js",
                    "Three.js",
                    "TypeScript",
                    "Node.js",
                    "Python",
                    "Java",
                    "MongoDB",
                    "MySQL",
                    "Supabase",
                    "Firebase",
                    "AWS",
                    "Docker",
                    "UI/UX Design"
                ],
                "hasOccupation": {
                    "@type": "Occupation",
                    "name": "Software Engineer",
                    "description": "Full Stack Developer specializing in AI-driven web applications and immersive websites."
                },
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Kotikawatta",
                    "addressCountry": "Sri Lanka"
                }
            },
            {
                "@type": "WebSite",
                "@id": "https://immersive-portfolio.vercel.app/#website",
                "url": "https://immersive-portfolio.vercel.app",
                "name": "Ihan Hansaja - Portfolio",
                "description": "The personal portfolio of Ihan Hansaja, Full Stack Developer and AI Engineer.",
                "publisher": {
                    "@id": "https://immersive-portfolio.vercel.app/#person"
                },
                "inLanguage": "en-US"
            }
        ]
    };

    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
                <meta name="google-site-verification" content="crIO90yWHga2Fbh5XrcWR2BvcBs3n5Hsfnme0BI-Htg" />
            </head>
            <body
                className={`${InconsolataSans.variable} ${NeotriadSans.variable} ${AndvariSans.variable} antialiased bg-background`} // Added bg-background for seamless transition
            >
                <ToasterProvider />
                {/* 2. Wrap the children with the PreloaderWrapper */}
                <MusicProvider>
                    <PreloaderWrapper>
                        {children}
                    </PreloaderWrapper>
                </MusicProvider>
            </body>
        </html>
    );
}