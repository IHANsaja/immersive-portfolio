import React from 'react'
import ProjectCard from "@/components/Projects/ProjectCard";
import { projects } from "@/constants/ProjectConstants"

const ProjectsSection = () => {

    return (
        <section id="projects-section" className="relative w-screen h-screen">
            {/* BACKGROUND DOT GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.1%22%20cy=%220.1%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
            </div>

            <div className="h-3/4 w-2/3 grid grid-cols-4 grid-rows-2 gap-5 absolute right-20 top-1/2 -translate-y-1/2">
                {projects.map((p, i) => (
                    <ProjectCard key={i} {...p} />
                ))}
            </div>

        </section>
    )
}
export default ProjectsSection
