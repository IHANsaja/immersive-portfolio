'use client';

import { ReactNode, useRef, useLayoutEffect, MouseEventHandler, useEffect } from 'react';
import gsap from '../../app/utils/gsapClient'; // Make sure this path is correct

interface AnimatedHoverButtonProps {
    text?: string;
    children?: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    bgColor?: string;
}

export default function AnimatedHoverButton({
                                                text,
                                                children,
                                                onClick,
                                                bgColor,
                                            }: AnimatedHoverButtonProps) {
    const label = typeof children === 'string' ? children : text ?? '';

    const textRef = useRef<HTMLSpanElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioClickRef = useRef<HTMLAudioElement | null>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {}, [textRef, canvasRef]);
        return () => {
            ctx.revert();
            if (animRef.current) {
                cancelAnimationFrame(animRef.current);
            }
        };
    }, []);

    useEffect(() => {
        audioRef.current = new Audio('/sounds/hover.mp3');
        audioRef.current.volume = 0.5;

        audioClickRef.current = new Audio('/sounds/click.mp3');
        audioClickRef.current.volume = 0.5;
    }, []);

    const stopCanvas = () => {
        if (animRef.current !== null) {
            cancelAnimationFrame(animRef.current);
            animRef.current = null;
        }
        const canvas = canvasRef.current;
        canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    };

    const startCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx2d = canvas.getContext('2d');
        if (!ctx2d) return;

        let t = 0;
        const spacing = 9;
        const radius = 1;
        const cols = Math.floor(canvas.width / spacing);
        const rows = Math.floor(canvas.height / spacing);

        const render = () => {
            if(!ctx2d) return;
            ctx2d.clearRect(0, 0, canvas.width, canvas.height);

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const delay = x * 2;
                    const phase = t - delay;
                    if (phase < 0 || phase > cols * 2) continue;
                    const opacity = Math.sin(phase * 0.1) * 0.5 + 0.5;

                    ctx2d.beginPath();
                    ctx2d.arc(
                        x * spacing + spacing / 2,
                        y * spacing + spacing / 2,
                        radius,
                        0,
                        Math.PI * 2
                    );
                    ctx2d.fillStyle = `rgba(255,255,255,${opacity * 0.5})`;
                    ctx2d.fill();
                }
            }
            t++;
            if (t < cols * 2 + rows * spacing) {
                animRef.current = requestAnimationFrame(render);
            }
        };
        render();
    };

    const hoverEnter = () => {
        stopCanvas();
        startCanvas();

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => {
                console.warn('Sound play prevented:', err);
            });
        }

        if (textRef.current) {
            gsap.to(textRef.current, {
                duration: 0.8,
                ease: 'power2.inOut',
                scrambleText: {
                    text: label,
                    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()',
                    speed: 1,
                    revealDelay: 0.2,
                },
            });
        }
    };

    const hoverLeave = () => {
        if (textRef.current) {
            gsap.to(textRef.current, {
                duration: 0.5,
                scrambleText: {
                    text: label,
                    speed: 0.5,
                },
            });
        }
        stopCanvas();
    };

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        if (audioClickRef.current) {
            audioClickRef.current.currentTime = 0;
            audioClickRef.current.play().catch(() => {});
        }
        if (onClick) onClick(e);
    };

    return (
        <div className="button-borders cursor-pointer">
            <button
                className="hover-button clip-shape"
                data-cursor="pointer"
                onMouseEnter={hoverEnter}
                onMouseLeave={hoverLeave}
                onClick={handleClick}
                style={{ backgroundColor: bgColor ?? '#0f172a' }}
            >
                <canvas
                    ref={canvasRef}
                    className="hover-canvas"
                    width={164}
                    height={67}
                />
                <span
                    ref={textRef}
                    className="hover-text w-full h-full flex justify-center items-center font-inconsolata-sans text-[var(--foreground)] tracking-widest"
                >
                    {label}
                </span>
            </button>
        </div>
    );
}