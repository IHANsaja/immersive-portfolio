"use client";

import React, { FC, useState, useRef, useEffect, useCallback } from 'react';
import { Project } from '@/constants/ProjectConstants';
import { FaCode, FaFigma } from 'react-icons/fa';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const AIGlobe = dynamic(() => import('./AIGlobe'), { ssr: false });

interface ProjectDrawerProps {
    project: Project;
    onClose: () => void;
}

const ProjectDrawer: FC<ProjectDrawerProps> = ({ project, onClose }) => {
    const [initiated, setInitiated] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const drawerRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Dynamic GitHub Stats States
    const [gitStats, setGitStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        if (project.codeUrl && project.codeUrl.includes('github.com')) {
            setLoadingStats(true);
            const match = project.codeUrl.match(/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/);
            if (match) {
                const repoKey = `${match[1]}/${match[2]}`.replace(/[",']/g, '');
                fetch('/data/github-stats.json')
                    .then(res => res.json())
                    .then(data => {
                        if (data && data[repoKey]) {
                            setGitStats(data[repoKey]);
                        } else {
                            setGitStats(null);
                        }
                    })
                    .catch(err => {
                        console.error('Failed to load GitHub analytics:', err);
                        setGitStats(null);
                    })
                    .finally(() => setLoadingStats(false));
            } else {
                setLoadingStats(false);
                setGitStats(null);
            }
        } else {
            setGitStats(null);
        }
    }, [project.codeUrl]);

    // Animate in on mount
    useEffect(() => {
        if (backdropRef.current) {
            gsap.fromTo(backdropRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.4, ease: 'power2.out' }
            );
        }
        if (drawerRef.current) {
            gsap.fromTo(drawerRef.current,
                { x: '100%', opacity: 0 },
                { x: '0%', opacity: 1, duration: 0.5, ease: 'power3.out' }
            );
        }
        if (contentRef.current) {
            const children = Array.from(contentRef.current.children);
            gsap.fromTo(children,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, delay: 0.25, ease: 'power2.out' }
            );
        }
    }, []);

    const animateOut = useCallback((cb: () => void) => {
        const tl = gsap.timeline({ onComplete: cb });
        if (drawerRef.current) {
            tl.to(drawerRef.current, { x: '100%', opacity: 0, duration: 0.4, ease: 'power3.in' }, 0);
        }
        if (backdropRef.current) {
            tl.to(backdropRef.current, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 0.05);
        }
    }, []);

    const handleClose = useCallback(() => {
        if (initiated && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setInitiated(false);
        animateOut(onClose);
    }, [initiated, animateOut, onClose]);

    // ESC key to close
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleClose]);

    const handleInitiate = () => {
        if (initiated) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setInitiated(false);
        } else {
            if (!project.audioSrc || project.audioSrc.trim() === '') {
                toast.info('There is no audio available for this project');
                return;
            }
            setInitiated(true);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(err => console.error('Audio failed:', err));
                audioRef.current.addEventListener('ended', () => {
                    setInitiated(false);
                }, { once: true });
            }
        }
    };

    const openUrl = (url: string | undefined, label: string) => {
        if (url && url.trim() !== '') {
            window.open(url, '_blank');
        } else {
            toast.info(`There is no ${label} available for this application`);
        }
    };

    const badgeText = project.badge === 'ui-design' ? 'UI DESIGN' :
        project.badge === 'code-only' ? 'CODE ONLY' : 'FULL PROJECT';
    const badgeClass = project.badge === 'ui-design' ? 'badge-design' :
        project.badge === 'code-only' ? 'badge-code' : 'badge-full';

    const isVideo = (src: string) => {
        return ['.mp4', '.webm', '.ogg', '.mov'].some(ext => src.toLowerCase().includes(ext));
    };

    return (
        <div className="drawer-root">
            {/* Backdrop */}
            <div ref={backdropRef} className="drawer-backdrop" onClick={handleClose} />

            {/* Drawer Panel (Full Screen Inset) */}
            <div ref={drawerRef} className="drawer-panel">
                {project.audioSrc && project.audioSrc.trim() !== '' && (
                    <audio ref={audioRef} src={project.audioSrc} hidden />
                )}

                {/* Header */}
                <div className="drawer-header">
                    <div className={`project-card-badge ${badgeClass}`}>
                        <span>{badgeText}</span>
                    </div>
                    <button className="drawer-close" onClick={handleClose} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="drawer-scroll">
                    <div ref={contentRef} className="drawer-body">
                        {/* 1. PROJECT HEADER INFO */}
                        <div className="drawer-info">
                            <h2 className="drawer-title">{project.title}</h2>
                            <p className="drawer-description">{project.detailDescription}</p>
                        </div>

                        {/* 2. PREVIEW IMAGE/VIDEO */}
                        <div className="drawer-preview">
                            {project.videoSrc && project.videoSrc.trim() !== '' ? (
                                isVideo(project.videoSrc) ? (
                                    <video 
                                        src={project.videoSrc} 
                                        autoPlay 
                                        loop 
                                        muted 
                                        playsInline 
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                ) : (
                                    <Image 
                                        src={project.videoSrc} 
                                        alt={project.title} 
                                        fill 
                                        sizes="(max-width: 1024px) 100vw, 50vw" 
                                        className="object-cover rounded-md" 
                                    />
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-md">
                                    <span className="text-white/20 font-mono text-sm">NO PREVIEW AVAILABLE</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D18]/80 to-transparent pointer-events-none rounded-md" />
                        </div>

                        {/* 3. ACTION BUTTONS */}
                        <div className="drawer-actions">
                            <button className="drawer-action-btn" onClick={() => openUrl(project.codeUrl, 'code repository')}>
                                <FaCode className="w-4 h-4" />
                                <span>CODE</span>
                            </button>
                            <button className="drawer-action-btn" onClick={() => openUrl(project.demoUrl, 'demo')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                <span>DEMO</span>
                            </button>
                            <button className="drawer-action-btn" onClick={() => openUrl(project.figmaUrl, 'Figma design')}>
                                <FaFigma className="w-4 h-4" />
                                <span>FIGMA</span>
                            </button>
                        </div>

                        {/* 4. TELEMETRY / ANALYTICS */}
                        {project.codeUrl && project.codeUrl.includes('github.com') ? (
                            <div className="drawer-analytics">
                                <h3 className="analytics-hud-header">
                                    <span className="blink-dot"></span>
                                    <span>SYSTEM TELEMETRY // GITHUB METRICS</span>
                                </h3>
                                
                                {loadingStats ? (
                                    <div className="stats-loader">
                                        <span className="loader"><span></span></span>
                                        <span className="loading-text">DECRYPTING METRICS...</span>
                                    </div>
                                ) : gitStats && gitStats.success ? (
                                    <div className="stats-wrapper animate-fade-in">
                                        {/* Grid stats */}
                                        <div className="stats-grid">
                                            <div className="stat-card">
                                                <span className="stat-label">STARS</span>
                                                <span className="stat-value text-cyan-400 font-andvari-sans">{gitStats.stars}</span>
                                                <div className="stat-card-glow-bg"></div>
                                            </div>
                                            <div className="stat-card">
                                                <span className="stat-label">FORKS</span>
                                                <span className="stat-value text-indigo-400 font-andvari-sans">{gitStats.forks}</span>
                                                <div className="stat-card-glow-bg"></div>
                                            </div>
                                            <div className="stat-card">
                                                <span className="stat-label">COMMITS</span>
                                                <span className="stat-value text-violet-400 font-andvari-sans">{gitStats.commitsCount}</span>
                                                <div className="stat-card-glow-bg"></div>
                                            </div>
                                            <div className="stat-card">
                                                <span className="stat-label">SIZE</span>
                                                <span className="stat-value text-emerald-400 font-andvari-sans text-[11px] tracking-tight">
                                                    {gitStats.size >= 1024 
                                                        ? `${(gitStats.size / 1024).toFixed(1)}MB` 
                                                        : `${gitStats.size}KB`}
                                                </span>
                                                <div className="stat-card-glow-bg"></div>
                                            </div>
                                        </div>

                                        {/* Language Breakdown */}
                                        {gitStats.languages && gitStats.languages.length > 0 && (
                                            <div className="tech-stack-panel">
                                                <div className="tech-stack-header">
                                                    <span className="tech-label">PROJECT COMPOSITION</span>
                                                    <span className="tech-status">ANALYSED</span>
                                                </div>
                                                
                                                {/* Stacked Bar Chart */}
                                                <div className="stacked-bar">
                                                    {gitStats.languages.map((lang: any, idx: number) => {
                                                        const colors = ['#8B9AEF', '#7C4DFF', '#00E5FF', '#3F51B5', '#FF007F'];
                                                        const color = colors[idx % colors.length];
                                                        return (
                                                            <div
                                                                key={lang.name}
                                                                className="bar-segment"
                                                                style={{
                                                                    width: `${lang.percentage}%`,
                                                                    backgroundColor: color,
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </div>

                                                {/* Legend Grid */}
                                                <div className="legend-grid">
                                                    {gitStats.languages.slice(0, 4).map((lang: any, idx: number) => {
                                                        const colors = ['#8B9AEF', '#7C4DFF', '#00E5FF', '#3F51B5', '#FF007F'];
                                                        const color = colors[idx % colors.length];
                                                        return (
                                                            <div key={lang.name} className="legend-item">
                                                                <span className="legend-dot" style={{ backgroundColor: color }}></span>
                                                                <span className="legend-name">{lang.name}</span>
                                                                <span className="legend-percentage">{lang.percentage}%</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="telemetry-footer font-inconsolata-sans">
                                            <span>METRIC STATUS: ENCRYPTED // SECURE</span>
                                            <span>PUSHED: {new Date(gitStats.pushedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="stats-offline-hud">
                                        <span className="text-rose-400 font-mono uppercase tracking-widest text-[10px]">TELEMETRY OFFLINE</span>
                                        <span className="text-[11px] text-foreground/40 font-mono">Unable to parse cache logs</span>
                                    </div>
                                )}
                            </div>
                        ) : project.figmaUrl && project.figmaUrl.trim() !== '' ? (
                            <div className="drawer-analytics">
                                <h3 className="analytics-hud-header">
                                    <span className="blink-dot-orange"></span>
                                    <span>INTERFACE LOGS // DESIGN METRICS</span>
                                </h3>
                                
                                <div className="stats-wrapper animate-fade-in">
                                    {/* Figma Design Grid */}
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <span className="stat-label">SCREENS</span>
                                            <span className="stat-value text-cyan-400 font-andvari-sans">
                                                {project.title.includes('EcoVibe') ? 24 : project.title.includes('Bus') ? 18 : 12}
                                            </span>
                                            <div className="stat-card-glow-bg-orange"></div>
                                        </div>
                                        <div className="stat-card">
                                            <span className="stat-label">COMPONENTS</span>
                                            <span className="stat-value text-indigo-400 font-andvari-sans">
                                                {project.title.includes('EcoVibe') ? 85 : project.title.includes('Bus') ? 64 : 42}
                                            </span>
                                            <div className="stat-card-glow-bg-orange"></div>
                                        </div>
                                        <div className="stat-card">
                                            <span className="stat-label">FLOWS</span>
                                            <span className="stat-value text-violet-400 font-andvari-sans">
                                                {project.title.includes('EcoVibe') ? 3 : project.title.includes('Bus') ? 2 : 1}
                                            </span>
                                            <div className="stat-card-glow-bg-orange"></div>
                                        </div>
                                        <div className="stat-card">
                                            <span className="stat-label">GRID MODEL</span>
                                            <span className="stat-value text-emerald-400 font-andvari-sans text-[11px] tracking-tight">
                                                {project.title.includes('ME') ? '12-COL' : '8PX GRID'}
                                            </span>
                                            <div className="stat-card-glow-bg-orange"></div>
                                        </div>
                                    </div>

                                    {/* Design Stack Breakdown */}
                                    <div className="tech-stack-panel">
                                        <div className="tech-stack-header">
                                            <span className="tech-label">DESIGN COMPOSITION</span>
                                            <span className="tech-status-orange">COMPILED</span>
                                        </div>
                                        
                                        {/* Stacked Bar */}
                                        <div className="stacked-bar">
                                            <div className="bar-segment" style={{ width: project.title.includes('EcoVibe') ? '85%' : project.title.includes('Bus') ? '90%' : '95%', backgroundColor: '#F24E1E' }} />
                                            <div className="bar-segment" style={{ width: project.title.includes('EcoVibe') ? '15%' : project.title.includes('Bus') ? '10%' : '5%', backgroundColor: '#FFC700' }} />
                                        </div>

                                        {/* Legend */}
                                        <div className="legend-grid">
                                            <div className="legend-item">
                                                <span className="legend-dot" style={{ backgroundColor: '#F24E1E' }}></span>
                                                <span className="legend-name">Figma Layout</span>
                                                <span className="legend-percentage">{project.title.includes('EcoVibe') ? '85%' : project.title.includes('Bus') ? '90%' : '95%'}</span>
                                            </div>
                                            <div className="legend-item">
                                                <span className="legend-dot" style={{ backgroundColor: '#FFC700' }}></span>
                                                <span className="legend-name">{project.title.includes('EcoVibe') ? 'Spline 3D' : project.title.includes('Bus') ? 'Photoshop' : 'Illustrator'}</span>
                                                <span className="legend-percentage">{project.title.includes('EcoVibe') ? '15%' : project.title.includes('Bus') ? '10%' : '5%'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="telemetry-footer font-inconsolata-sans">
                                        <span>SPECIFICATION STANDARDS: VERIFIED</span>
                                        <span>WORKSPACE: ONLINE</span>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* 5. GLOBE SECTION */}
                        <div className="drawer-globe-section">
                            <div className="drawer-globe-wrap">
                                <AIGlobe audioRef={audioRef} isActive={initiated} />
                                {/* Status indicator */}
                                <div className={`globe-status ${initiated ? 'active' : ''}`}>
                                    <span className="globe-status-dot" />
                                    <span className="font-inconsolata-sans text-xs tracking-widest uppercase">
                                        {initiated ? 'Freya Speaking' : 'Freya Standby'}
                                    </span>
                                </div>
                            </div>

                            {/* Initiate Freya Button */}
                            <button className="initiate-freya-btn mx-auto mt-2" onClick={handleInitiate}>
                                <span className="dot" />
                                <span className="font-andvari-sans tracking-wider">
                                    {initiated ? 'Stop Freya' : 'Initiate Freya'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDrawer;
