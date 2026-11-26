export interface Experience {
    id: string;
    role: string;
    company: string;
    period: string;
    description: string;
    techStack: string[];
    type: 'work' | 'freelance' | 'academic';
}

export const experiences: Experience[] = [
    {
        id: 'exp-2',
        role: 'Associate Software Engineer',
        company: 'Blicq',
        period: '2026 Aug — Present',
        description:
            'Building cross-platform products at Blicq: Flutter mobile apps, NestJS and Next.js services on PostgreSQL with Prisma, deployed on AWS, alongside interactive 3D and map experiences with Blender, Unity, Mapbox and Firebase.',
        techStack: ['Flutter', 'NestJS', 'Next.js', 'PostgreSQL', 'Prisma', 'AWS', 'Blender', 'Unity', 'Mapbox', 'Firebase'],
        type: 'work',
    },
    {
        id: 'exp-1',
        role: 'Full-Stack Developer',
        company: 'SLT Mobitel',
        period: '2025 Oct — 2026 Apr',
        description:
            'Worked on the Smart Employee project at SLT-MOBITEL, developing full-stack features with React, Node.js, Express.js, and MySQL, deploying applications via Nginx, and supporting production systems.',
        techStack: ['React', 'Express.js', 'MySQL', 'Node.js', 'TypeScript', 'NginX', 'AWS', 'Git', 'Postman'],
        type: 'work',
    }
];
