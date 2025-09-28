import React, { FC, useState, useRef, useEffect } from 'react';
import { FaCode } from 'react-icons/fa';
import { FaFigma } from 'react-icons/fa';
import { animate, stagger, utils } from 'animejs';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface ProjectCardProps {
    title: string;
    videoSrc: string; // Can be video or image URL
    description: string;
    codeUrl?: string; // Optional code URL
    demoUrl?: string; // Optional demo URL
    figmaUrl?: string; // Optional Figma design URL
    audioSrc: string;
    badge?: 'ui-design' | 'code-only' | 'full-project'; // Optional project type badge
}

const ProjectCard: FC<ProjectCardProps> = ({
                                               title,
                                               videoSrc,
                                               description,
                                               codeUrl,
                                               demoUrl,
                                               figmaUrl,
                                               audioSrc,
                                               badge,
                                           }) => {
    const [initiated, setInitiated] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<ReturnType<typeof animate> | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const animateGrid = () => {
        const $sqs = containerRef.current?.querySelectorAll('.square');
        if (!$sqs || $sqs.length === 0) return;

        animationRef.current = animate(Array.from($sqs), {
            scale: [{ to: [0, 0.9] }, { to: 0 }],
            boxShadow: [
                { to: '0 0 1rem 0 currentColor' },
                { to: '0 0 0rem 0 currentColor' },
            ],
            delay: stagger(100, {
                grid: [4, 4],
                from: utils.random(4, 7),
            }),
            duration: 1000,
            easing: 'easeInOutSine',
            autoplay: true,
            loop: true,
            complete: () => {
                if (initiated) animateGrid();
            },
        });
    };

    const handleInitiate = () => {
        if (initiated) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            animationRef.current?.pause();
            animationRef.current = null;
            setInitiated(false);
        } else {
            // Check if audioSrc is available
            if (!audioSrc || audioSrc.trim() === '') {
                toast.info('There is no audio available for this project');
                return;
            }
            
            setInitiated(true);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current
                    .play()
                    .then(() => animateGrid())
                    .catch((error) => console.error('Audio playback failed:', error));

                audioRef.current.addEventListener(
                    'ended',
                    () => {
                        setInitiated(false);
                        animationRef.current?.pause();
                        animationRef.current = null;
                    },
                    { once: true }
                );
            }
        }
    };

    const handleFigmaClick = () => {
        if (figmaUrl && figmaUrl.trim() !== '') {
            window.open(figmaUrl, '_blank');
        } else {
            toast.info('There is no Figma design for this application');
        }
    };

    const handleCodeClick = () => {
        if (codeUrl && codeUrl.trim() !== '') {
            window.open(codeUrl, '_blank');
        } else {
            toast.info('There is no code repository for this application');
        }
    };

    const handleDemoClick = () => {
        if (demoUrl && demoUrl.trim() !== '') {
            window.open(demoUrl, '_blank');
        } else {
            toast.info('There is no demo available for this application');
        }
    };

    // Determine if videoSrc is a video or image
    const isVideoFile = (src: string) => {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv'];
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        
        const lowerSrc = src.toLowerCase();
        
        // Check for video extensions
        if (videoExtensions.some(ext => lowerSrc.includes(ext))) {
            return true;
        }
        
        // Check for image extensions
        if (imageExtensions.some(ext => lowerSrc.includes(ext))) {
            return false;
        }
        
        // Check for external video platforms
        if (lowerSrc.includes('youtube.com') || lowerSrc.includes('youtu.be') || 
            lowerSrc.includes('vimeo.com') || lowerSrc.includes('dailymotion.com')) {
            return true;
        }
        
        // Default to video for unknown formats
        return true;
    };

    // Determine badge type based on available URLs
    const getBadgeInfo = () => {
        if (badge) {
            return {
                type: badge,
                text: badge === 'ui-design' ? 'UI Design Only' : 
                      badge === 'code-only' ? 'Code Only' : 'Full Project',
                color: badge === 'ui-design' ? 'bg-gradient-to-r from-indigo-700 to-blue-800' : 
                       badge === 'code-only' ? 'bg-gradient-to-r from-slate-600 to-gray-700' : 'bg-gradient-to-r from-emerald-600 to-green-600',
                borderColor: badge === 'ui-design' ? 'border-indigo-500/30' : 
                           badge === 'code-only' ? 'border-slate-500/30' : 'border-emerald-500/30',
                textColor: badge === 'ui-design' ? 'text-indigo-100' : 
                          badge === 'code-only' ? 'text-slate-100' : 'text-emerald-100'
            };
        }
        
        // Auto-detect based on available URLs
        const hasCode = codeUrl && codeUrl.trim() !== '';
        const hasDemo = demoUrl && demoUrl.trim() !== '';
        const hasFigma = figmaUrl && figmaUrl.trim() !== '';
        
        if (hasFigma && !hasCode && !hasDemo) {
            return { 
                type: 'ui-design', 
                text: 'UI Design Only', 
                color: 'bg-gradient-to-r from-indigo-700 to-blue-800',
                borderColor: 'border-indigo-500/30',
                textColor: 'text-indigo-100'
            };
        } else if (hasCode && !hasFigma) {
            return { 
                type: 'code-only', 
                text: 'Code Only', 
                color: 'bg-gradient-to-r from-slate-600 to-gray-700',
                borderColor: 'border-slate-500/30',
                textColor: 'text-slate-100'
            };
        } else {
            return { 
                type: 'full-project', 
                text: 'Full Project', 
                color: 'bg-gradient-to-r from-emerald-600 to-green-600',
                borderColor: 'border-emerald-500/30',
                textColor: 'text-emerald-100'
            };
        }
    };

    const badgeInfo = getBadgeInfo();

    useEffect(() => {
        return () => {
            animationRef.current?.pause();
            animationRef.current = null;
        };
    }, []);

    return (
        <div className="project-card flex flex-col bg-background rounded-lg shadow w-full max-w-full h-auto relative">
            {audioSrc && audioSrc.trim() !== '' && (
                <audio ref={audioRef} src={audioSrc} hidden />
            )}

            {/* Badge */}
            <div className={`absolute top-1 left-2 z-10 px-2 py-1 rounded-full text-[10px] sm:text-[12px] xl:text-[10px] 2xl:text-[12px] font-medium ${badgeInfo.color} ${badgeInfo.borderColor} ${badgeInfo.textColor} border backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <span className="font-inconsalata-sans tracking-wide">{badgeInfo.text}</span>
            </div>

            {/* Header */}
            <div
                className="w-full flex justify-end items-center px-2 sm:px-3 py-2 bg-background cursor-pointer border-b border-gray-500"
                onClick={handleInitiate}
            >
                <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs xl:text-[10px] 2xl:text-xs font-andvari-sans">
                    <span className="dot"></span>
                    <p>Initiate Freya</p>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-col flex-grow justify-center items-center w-full p-2 sm:p-4 gap-3 sm:gap-4">
                {initiated ? (
                    <div
                        ref={containerRef}
                        className="grid grid-cols-4 gap-1 sm:gap-2"
                    >
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div
                                key={i}
                                className="square w-1.5 sm:w-2 h-1.5 sm:h-2 bg-foreground rounded-sm"
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Video/Image */}
                        <div className="w-full aspect-video max-w-full overflow-hidden rounded relative">
                            {isVideoFile(videoSrc) ? (
                                <div
                                    className="w-full h-full"
                                    onMouseEnter={() => videoRef.current?.play()}
                                    onMouseLeave={() => {
                                        if (videoRef.current) {
                                            videoRef.current.pause();
                                            videoRef.current.currentTime = 0;
                                        }
                                    }}
                                >
                                    <video
                                        ref={videoRef}
                                        src={videoSrc}
                                        className="w-full h-full object-cover rounded"
                                        loop
                                        muted
                                        playsInline
                                    />
                                </div>
                            ) : (
                                <Image
                                    src={videoSrc}
                                    alt={`${title} screenshot`}
                                    fill
                                    className="object-cover rounded"
                                />
                            )}
                        </div>

                        {/* Content */}
                        <div className="w-full flex flex-col justify-between gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <h3 className="font-andvari-sans font-semibold text-base sm:text-lg md:text-xl xl:text-lg 2xl:text-xl break-words text-foreground leading-tight">
                                    {title}
                                </h3>
                                <p className="text-xs sm:text-sm xl:text-xs 2xl:text-sm text-foreground font-inconsolata-sans break-words leading-relaxed line-clamp-3 sm:line-clamp-4 xl:line-clamp-3 2xl:line-clamp-4 overflow-hidden text-ellipsis">
                                    {description}
                                </p>
                            </div>

                            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full justify-start">
                                <button
                                    onClick={handleCodeClick}
                                    className="inline-flex justify-center items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm xl:text-xs 2xl:text-sm font-semibold text-background bg-foreground border border-foreground rounded transition hover:bg-foreground hover:text-background focus:outline-none focus:ring-2 focus:ring-foreground w-full xs:w-auto flex-shrink-0"
                                >
                                    <FaCode className="w-3 h-3 sm:w-4 sm:h-4 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
                                    CODE
                                </button>

                                <button
                                    onClick={handleDemoClick}
                                    className="inline-flex justify-center items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm xl:text-xs 2xl:text-sm font-semibold text-foreground border border-foreground rounded transition hover:bg-foreground hover:border-[#191919] hover:text-[#191919] w-full xs:w-auto flex-shrink-0"
                                >
                                    DEMO
                                </button>

                                <button
                                    onClick={handleFigmaClick}
                                    className="inline-flex justify-center items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm xl:text-xs 2xl:text-sm font-semibold text-foreground border border-foreground rounded transition hover:bg-foreground hover:border-[#191919] hover:text-[#191919] w-full xs:w-auto flex-shrink-0"
                                >
                                    <FaFigma className="w-3 h-3 sm:w-4 sm:h-4 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
                                    FIGMA
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;
