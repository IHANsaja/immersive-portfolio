import React, { FC, useState, useRef, useEffect } from 'react';
import { FaCode } from 'react-icons/fa';
import { animate, stagger, utils } from 'animejs';

interface ProjectCardProps {
    title: string;
    videoSrc: string;
    description: string;
    codeUrl: string;
    demoUrl: string;
    audioSrc: string;
}

const ProjectCard: FC<ProjectCardProps> = ({
                                               title,
                                               videoSrc,
                                               description,
                                               codeUrl,
                                               demoUrl,
                                               audioSrc,
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
            scale: [
                { to: [0, 0.9] },
                { to: 0 }
            ],
            boxShadow: [
                { to: '0 0 1rem 0 currentColor' },
                { to: '0 0 0rem 0 currentColor' }
            ],
            delay: stagger(100, {
                grid: [4, 4], // 4x4 grid
                from: utils.random(4, 7) // Random starting point
            }),
            duration: 1000,
            easing: 'easeInOutSine',
            autoplay: true,
            loop: true,
            complete: () => {
                if (initiated) animateGrid(); // Loop while audio is playing
            }
        });
    };

    const handleInitiate = () => {
        if (initiated) {
            // If already initiated, stop the audio and animation
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            animationRef.current?.pause();
            animationRef.current = null;

            setInitiated(false);
        } else {
            // If not initiated, start the process
            setInitiated(true);

            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play()
                    .then(() => animateGrid())
                    .catch(error => console.error('Audio playback failed:', error));

                // Listen for when the audio naturally ends
                audioRef.current.addEventListener('ended', () => {
                    setInitiated(false);
                    animationRef.current?.pause();
                    animationRef.current = null;
                }, { once: true });
            }
        }
    };

    useEffect(() => {
        return () => {
            animationRef.current?.pause();
            animationRef.current = null;
        };
    }, []);

    return (
        <div className="project-card flex flex-col bg-background rounded-lg shadow overflow-hidden">
            <audio ref={audioRef} src={audioSrc} hidden preload="auto" />

            {/* Header */}
            <div
                className="w-full flex justify-end items-center p-2 bg-background cursor-pointer border-b border-gray-500"
                onClick={handleInitiate}
            >
                <div className="flex items-center gap-2 text-[10px] font-andvari-sans">
                    <span className="dot"></span>
                    <p>Initiate Freya</p>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 justify-center items-center">
                {initiated ? (
                    <div ref={containerRef} className="grid grid-cols-4 gap-2 p-4 justify-center items-center">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div
                                key={i}
                                className="square w-4 h-4 bg-foreground rounded-sm"
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Video */}
                        <div
                            className="w-full aspect-video overflow-hidden"
                            onMouseEnter={() => videoRef.current?.play()}
                            onMouseLeave={() => {
                                if (videoRef.current) {
                                    videoRef.current.pause();
                                    videoRef.current.currentTime = 0; // reset if needed
                                }
                            }}
                        >
                            <video
                                ref={videoRef}
                                src={videoSrc}
                                className="w-full h-full object-cover"
                                loop
                                muted
                                playsInline
                            />
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-1 justify-between">
                            <div>
                                <h3 className="font-andvari-sans font-semibold text-[10px] break-words">{title}</h3>
                                <p className="mt-2 text-sm text-foreground font-inconsolata-sans break-words">
                                    {description}
                                </p>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => window.open(codeUrl, '_blank')}
                                    className="inline-flex cursor-pointer items-center gap-2 px-4 py-1 text-sm font-semibold text-background bg-foreground border border-foreground rounded transition hover:bg-foreground hover:text-background focus:outline-none focus:ring-2 focus:ring-foreground"
                                >
                                    <FaCode className="w-4 h-4" />
                                    CODE
                                </button>

                                <button
                                    onClick={() => window.open(demoUrl, '_blank')}
                                    className="inline-flex cursor-pointer items-center gap-2 px-4 py-1 text-sm font-semibold text-foreground border border-foreground rounded transition hover:bg-foreground hover:border-[#191919] hover:text-[#191919]"
                                >
                                    DEMO
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
