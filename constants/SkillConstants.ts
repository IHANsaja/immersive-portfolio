export interface Skill {
    image: string;
    color: string;
    name: string;
}

export type MarqueeColumn = Skill[];

export const SkillLogos: MarqueeColumn[] = [
    [
        { image: "/svg/nextjs.svg",     color: "#A2B1FF", name: "next js" }, // light indigo for contrast
        { image: "/svg/react.svg",      color: "#A8EFFF", name: "react js" }, // lighter cyan
        { image: "/svg/threejs.svg",    color: "#B0BEC5", name: "three js" }, // soft grey-blue
        { image: "/svg/nodejs.svg",     color: "#9BE89D", name: "node js" }, // light green
        { image: "/svg/expressjs.svg",  color: "#CCCCCC", name: "express js" }, // light grey for neutral
    ],
    [
        { image: "/svg/mysql.svg",      color: "#7DA9C4", name: "mysql" }, // lighter MySQL blue
        { image: "/svg/supabase.svg",   color: "#34B27B", name: "supabase" }, // jungle green (light)
        { image: "/svg/mongodb.svg",    color: "#88C9A1", name: "mongodb" }, // light mongo green
        { image: "/svg/firebase.svg",   color: "#FFE082", name: "firebase" }, // soft amber
        { image: "/svg/postgresql.svg", color: "#82A9D3", name: "postgresql" }, // lighter pg blue
    ],
    [
        { image: "/svg/tailwind.svg",   color: "#A0F0E0", name: "tailwind css" }, // pale teal
        { image: "/svg/framer.svg",     color: "#A3C8FF", name: "framer motion" }, // soft brand blue
        { image: "/svg/gsap.svg",       color: "#FFFCE1", name: "gsap" }, // pale yellow
        { image: "/svg/github.svg",     color: "#D0D0D0", name: "github" }, // light neutral gray
        { image: "/svg/docker.svg",     color: "#A7D8F0", name: "docker" }, // soft docker blue
    ],
    [
        { image: "/svg/n8n.svg",        color: "#F98B8B", name: "n8n" }, // soft red
        { image: "/svg/aws.svg",        color: "#8491A3", name: "aws" }, // soft steel gray
        { image: "/svg/langchain.svg",  color: "#8AB4F8", name: "langchain" }, // sky blue tech
        { image: "/svg/photoshop.svg",  color: "#6ECBFF", name: "adobe photoshop" }, // light PS blue
        { image: "/svg/illustrator.svg", color: "#FFD180", name: "adobe illustrator" }, // soft orange
    ],
    [
        { image: "/svg/python.svg",     color: "#9DB5E0", name: "python" }, // pastel blue
        { image: "/svg/typescript.svg", color: "#A5C9F0", name: "typescript" }, // soft TS blue
        { image: "/svg/java.svg",       color: "#8AB6D6", name: "java" }, // lightened java blue
        { image: "/svg/php.svg",        color: "#B9A5D8", name: "php" }, // soft PHP purple
        { image: "/svg/html.svg",       color: "#FFA07A", name: "html" }, // light salmon
    ],
];
