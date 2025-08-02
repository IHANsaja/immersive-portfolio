export interface Skill {
    image: string;
    color: string;
    name: string;
}

export type MarqueeColumn = Skill[];

export const SkillLogos: MarqueeColumn[] = [
    [
        { image: "/svg/nextjs.svg",     color: "#000000", name: "next js" }, // light indigo for contrast
        { image: "/svg/react.svg",      color: "#55c5e3", name: "react js" }, // lighter cyan
        { image: "/svg/threejs.svg",    color: "#323330", name: "three js" }, // soft grey-blue
        { image: "/svg/nodejs.svg",     color: "#68A063", name: "node js" }, // light green
        { image: "/svg/expressjs.svg",  color: "#444444", name: "express js" }, // light grey for neutral
    ],
    [
        { image: "/svg/mysql.svg",      color: "#00758F", name: "mysql" }, // lighter MySQL blue
        { image: "/svg/supabase.svg",   color: "#34B27B", name: "supabase" }, // jungle green (light)
        { image: "/svg/mongodb.svg",    color: "#4DB33D", name: "mongodb" }, // light mongo green
        { image: "/svg/firebase.svg",   color: "#F5820D", name: "firebase" }, // soft amber
        { image: "/svg/postgresql.svg", color: "#336791", name: "postgresql" }, // lighter pg blue
    ],
    [
        { image: "/svg/tailwind.svg",   color: "#38B2AC", name: "tailwind css" }, // pale teal
        { image: "/svg/framer.svg",     color: "#0055FF", name: "framer motion" }, // soft brand blue
        { image: "/svg/gsap.svg",       color: "#79b10e", name: "gsap" }, // pale yellow
        { image: "/svg/github.svg",     color: "#000000", name: "github" }, // light neutral gray
        { image: "/svg/docker.svg",     color: "#1D63ED", name: "docker" }, // soft docker blue
    ],
    [
        { image: "/svg/n8n.svg",        color: "#EA4B71", name: "n8n" }, // soft red
        { image: "/svg/aws.svg",        color: "#FF9900", name: "aws" }, // soft steel gray
        { image: "/svg/langchain.svg",  color: "#000000", name: "langchain" }, // sky blue tech
        { image: "/svg/photoshop.svg",  color: "#001E36", name: "adobe photoshop" }, // light PS blue
        { image: "/svg/illustrator.svg", color: "#330000", name: "adobe illustrator" }, // soft orange
    ],
    [
        { image: "/svg/python.svg",     color: "#306998", name: "python" }, // pastel blue
        { image: "/svg/typescript.svg", color: "#3178C6", name: "typescript" }, // soft TS blue
        { image: "/svg/java.svg",       color: "#FF4F00", name: "java" }, // lightened java blue
        { image: "/svg/php.svg",        color: "#484C89", name: "php" }, // soft PHP purple
        { image: "/svg/html.svg",       color: "#E34F26", name: "html" }, // light salmon
    ],
];
