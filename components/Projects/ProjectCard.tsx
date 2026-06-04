"use client";

import React, { FC, useRef } from 'react';
import Image from 'next/image';
import { Project } from '@/constants/ProjectConstants';

interface ProjectCardProps extends Project {
    onSelect: (project: Project) => void;
}

const ProjectCard: FC<ProjectCardProps> = (props) => {
    const { title, videoSrc, description, badge, codeUrl, figmaUrl, onSelect } = props;
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const isVideo = (src: string) => {
        return ['.mp4', '.webm', '.ogg', '.mov'].some(ext => src.toLowerCase().includes(ext));
    };

    const getBadgeInfo = () => {
        if (badge) {
            return {
                text: badge === 'ui-design' ? 'UI DESIGN' : badge === 'code-only' ? 'CODE ONLY' : 'FULL PROJECT',
                color: badge === 'ui-design' ? 'badge-design' : badge === 'code-only' ? 'badge-code' : 'badge-full',
            };
        }
        const hasCode = codeUrl && codeUrl.trim() !== '';
        const hasFigma = figmaUrl && figmaUrl.trim() !== '';
        if (hasFigma && !hasCode) return { text: 'UI DESIGN', color: 'badge-design' };
        if (hasCode && !hasFigma) return { text: 'CODE ONLY', color: 'badge-code' };
        return { text: 'FULL PROJECT', color: 'badge-full' };
    };

    const badgeInfo = getBadgeInfo();

    // Map projects to immersive realistic dates and metrics inspired by the user's reference design
    const getCardMetadata = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("freya")) {
            return { dateNum: "07", dateMonth: "Jul", stat: "14 Commits" };
        } else if (t.includes("serendib")) {
            return { dateNum: "12", dateMonth: "Oct", stat: "28 Screens" };
        } else if (t.includes("quill") || t.includes("raven")) {
            return { dateNum: "19", dateMonth: "Dec", stat: "42 Files" };
        } else if (t.includes("navigator") || t.includes("cinec")) {
            if (t.includes("navigator")) {
                return { dateNum: "04", dateMonth: "Feb", stat: "18 Builds" };
            } else {
                return { dateNum: "25", dateMonth: "Sep", stat: "12-Col Grid" };
            }
        } else if (t.includes("padaya") || t.includes("adam")) {
            return { dateNum: "15", dateMonth: "Mar", stat: "3.2M Polys" };
        } else if (t.includes("zenofy")) {
            return { dateNum: "22", dateMonth: "Apr", stat: "12 Pages" };
        } else if (t.includes("heritage")) {
            return { dateNum: "09", dateMonth: "May", stat: "4.6 MB" };
        } else if (t.includes("ecovibe")) {
            return { dateNum: "14", dateMonth: "Jun", stat: "85 Comps" };
        } else if (t.includes("bus")) {
            return { dateNum: "18", dateMonth: "Aug", stat: "64 Screens" };
        }
        return { dateNum: "01", dateMonth: "Jan", stat: "Active" };
    };

    const meta = getCardMetadata(title);

    // Map badge text to custom classes for bottom-right highlight colors
    const getBadgeStyleClass = (text: string) => {
        if (text === 'FULL PROJECT') return 'badge-full-style';
        if (text === 'CODE ONLY') return 'badge-code-style';
        return 'badge-design-style';
    };

    return (
        <>
            {/* Inline SVG Clip Path Definition (Object Bounding Box scales dynamically with card scale/size) */}
            <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
                <defs>
                    <clipPath id="folder-tab-clip" clipPathUnits="objectBoundingBox">
                        <path d="M 0,1 L 0,0.34 Q 0,0.30 0.05,0.30 L 0.38,0.30 Q 0.42,0.30 0.46,0.34 L 0.52,0.42 Q 0.56,0.46 0.60,0.46 L 0.95,0.46 Q 1,0.46 1,0.50 L 1,1 Z" />
                    </clipPath>
                </defs>
            </svg>

            <div
                className="project-card group"
                onClick={() => onSelect(props as Project)}
                onMouseEnter={() => videoRef.current?.play().catch(() => { })}
                onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}
            >
                {/* 1. TOP MEDIA VIEW */}
                <div className="project-card-media">
                    {isVideo(videoSrc) ? (
                        <video ref={videoRef} src={videoSrc} className="project-card-video" loop muted playsInline />
                    ) : (
                        <Image src={videoSrc} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    )}
                    <div className="project-card-shimmer" />
                </div>

                {/* 2. OVERLAID STATS ON THE TOP-RIGHT AREA */}
                <div className="project-card-top-header">
                    <span className="project-card-top-badge">{meta.stat}</span>
                    <span className="project-card-top-tag">{badgeInfo.text === 'UI DESIGN' ? 'Figma Assets' : 'GitHub Status'}</span>
                </div>

                {/* 3. FOLDER TAB DARK BODY */}
                <div className="project-card-folder-body">
                    {/* Title & Description inside the Tab */}
                    <div className="project-card-tab-info">
                        <h3 className="project-card-tab-title">{title}</h3>
                        <p className="project-card-tab-subtitle">{description}</p>
                    </div>

                    {/* Bottom Info Row (Date + Status Badge) */}
                    <div className="project-card-bottom-row">
                        <div className="project-card-date">
                            <span className="date-number">{meta.dateNum}</span>
                            <span className="date-month">{meta.dateMonth}</span>
                        </div>
                        <div className={`project-card-stats ${getBadgeStyleClass(badgeInfo.text)}`}>
                            <span>{badgeInfo.text}</span>
                        </div>
                    </div>
                </div>

                {/* Cyberpunk Glow border */}
                <div className="project-card-glow" />
            </div>
        </>
    );
};

export default ProjectCard;
