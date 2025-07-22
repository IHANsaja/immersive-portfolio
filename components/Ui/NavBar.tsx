'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Layers, Users, BarChart2, Briefcase, X } from 'lucide-react';
import Image from "next/image";

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y, 'L', x, y, 'Z'].join(' ');
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    angle: number;
}

interface SpaceshipNavProps {
    showPopup: boolean;
    onClose: () => void;
}

const SLICE_DEGREE = 60;
const navItems: NavItem[] = [
    { id: 'vision', label: 'Vision', icon: Eye, angle: 30 },
    { id: 'portfolio', label: 'Portfolio', icon: Layers, angle: 90 },
    { id: 'people', label: 'People', icon: Users, angle: 150 },
    { id: 'insights', label: 'Insights', icon: BarChart2, angle: 210 },
    { id: 'careers', label: 'Careers', icon: Briefcase, angle: 270 },
    { id: 'about', label: 'About Us', icon: FileText, angle: 330 },
];

const SpaceshipNav: React.FC<SpaceshipNavProps> = ({ showPopup, onClose }) => {
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [joystickAngle, setJoystickAngle] = useState(0);
    const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 });
    const [containerSize, setContainerSize] = useState(0);
    const joystickRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
    const clickAudioRef = useRef<HTMLAudioElement | null>(null);
    const appearAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (hoverAudioRef.current) hoverAudioRef.current.volume = 0.5;
        if (clickAudioRef.current) clickAudioRef.current.volume = 0.5;
        if (appearAudioRef.current) appearAudioRef.current.volume = 0.5;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (showPopup) {
            window.addEventListener('keydown', handleKeyDown);
            playSound(appearAudioRef);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showPopup, onClose]);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize(containerRef.current.offsetWidth);
            }
        };
        if (showPopup) {
            updateSize();
            window.addEventListener('resize', updateSize);
        }
        return () => window.removeEventListener('resize', updateSize);
    }, [showPopup]);

    const playSound = useCallback((audioRef: React.RefObject<HTMLAudioElement | null>) => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
    }, []);

    const handleMouseEnter = useCallback((itemId: string) => {
        setActiveItem(itemId);
        playSound(hoverAudioRef);
    }, [playSound]);

    const handleClick = useCallback((itemId: string) => {
        console.log(`Navigating to ${itemId}`);
        playSound(clickAudioRef);
    }, [playSound]);

    const getJoystickAngle = useCallback((e: MouseEvent | TouchEvent) => {
        if (!joystickRef.current) return 0;
        const joystickRect = joystickRef.current.getBoundingClientRect();
        const joystickCenter = { x: joystickRect.left + joystickRect.width / 2, y: joystickRect.top + joystickRect.height / 2 };
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const angleRad = Math.atan2(clientY - joystickCenter.y, clientX - joystickCenter.x);
        return (angleRad * 180) / Math.PI + 90;
    }, []);

    const getClosestItem = useCallback((angle: number): NavItem | null => {
        const normalizedAngle = (angle + 360) % 360;
        let closestItem: NavItem | null = null;
        let minDiff = Infinity;

        navItems.forEach(item => {
            let diff = Math.abs(normalizedAngle - item.angle);
            if (diff > 180) diff = 360 - diff;
            if (diff < minDiff && diff < SLICE_DEGREE / 2) {
                minDiff = diff;
                closestItem = item;
            }
        });

        return closestItem;
    }, []);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragEnd = useCallback(() => {
        if (isDragging) {
            const closestItem = getClosestItem(joystickAngle);
            if (closestItem) {
                setActiveItem(closestItem.id);
                handleClick(closestItem.id);
            }
            setIsDragging(false);
            setJoystickOffset({ x: 0, y: 0 });
        }
    }, [isDragging, joystickAngle, getClosestItem, handleClick]);

    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging || !joystickRef.current) return;
        const angle = getJoystickAngle(e);
        setJoystickAngle(angle);
        const DRAG_DISTANCE = containerSize > 400 ? 12 : 8;
        const angleRad = (angle - 90) * Math.PI / 180;
        setJoystickOffset({
            x: DRAG_DISTANCE * Math.cos(angleRad),
            y: DRAG_DISTANCE * Math.sin(angleRad)
        });
        const closestItem = getClosestItem(angle);
        if (closestItem && activeItem !== closestItem.id) {
            setActiveItem(closestItem.id);
            playSound(hoverAudioRef);
        }
    }, [isDragging, getJoystickAngle, activeItem, getClosestItem, containerSize, playSound]);

    useEffect(() => {
        if (showPopup) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDragMove);
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [showPopup, handleDragMove, handleDragEnd]);

    const handleClose = () => {
        playSound(clickAudioRef);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    return (
        <div className="fixed w-screen h-screen inset-0 flex items-center justify-center pointer-events-none z-[9999]">
            <audio ref={appearAudioRef} src="/sounds/appear.mp3" preload="auto" />
            <audio ref={hoverAudioRef} src="/sounds/hover.mp3" preload="auto" />
            <audio ref={clickAudioRef} src="/sounds/click.mp3" preload="auto" />

            <AnimatePresence>
                {showPopup && (
                    <>
                        <motion.div
                            key="backdrop"
                            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm pointer-events-auto"
                            onClick={onClose}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.div
                            ref={containerRef}
                            key="nav-panel"
                            initial={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
                            transition={{ duration: 0.8, ease: [0.075, 0.82, 0.165, 1] }}
                            className="relative z-50 w-full h-full max-w-[90vw] max-h-[90vw] sm:max-w-[500px] sm:max-h-[500px] aspect-square pointer-events-auto"
                        >
                            <motion.button
                                onClick={handleClose}
                                onMouseEnter={() => playSound(hoverAudioRef)}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[60] text-gray-400 hover:text-white transition-colors cursor-pointer"
                                aria-label="Close navigation"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }}
                                exit={{ opacity: 0, scale: 0.5 }}
                            >
                                <X size={28} />
                            </motion.button>
                            <div className="absolute inset-0 w-full h-full bg-black rounded-full bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:16px_16px]" />
                            <motion.div className="relative w-full h-full rounded-full bg-[#191919] backdrop-blur-sm border border-gray-700/50 shadow-[0_0_80px_rgba(0,180,255,0.2)]">
                                {containerSize > 0 && (
                                    <svg className="absolute inset-0 w-full h-full">
                                        <g transform={`translate(${containerSize / 2}, ${containerSize / 2})`}>
                                            {navItems.map(item => {
                                                const isActive = activeItem === item.id;
                                                return (
                                                    <motion.path
                                                        key={item.id}
                                                        d={describeArc(0, 0, containerSize / 2, item.angle - SLICE_DEGREE / 2, item.angle + SLICE_DEGREE / 2)}
                                                        onMouseEnter={() => handleMouseEnter(item.id)}
                                                        onMouseLeave={() => setActiveItem(null)}
                                                        onClick={() => handleClick(item.id)}
                                                        className="cursor-pointer"
                                                        initial={{ fill: 'rgba(255, 255, 255, 0)' }}
                                                        animate={{ fill: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0)' }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                );
                                            })}
                                        </g>
                                    </svg>
                                )}
                                {[...Array(navItems.length)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute top-1/2 left-1/2 w-1/2 h-px bg-gray-700/50 origin-left"
                                        style={{ transform: `rotate(${i * SLICE_DEGREE - 90}deg)` }}
                                    />
                                ))}
                                {navItems.map(item => {
                                    const radius = containerSize * 0.35;
                                    const itemSize = containerSize * 0.2;
                                    const angleRad = (item.angle - 90) * (Math.PI / 180);
                                    const x = (containerSize / 2) + (radius * Math.cos(angleRad)) - (itemSize / 2);
                                    const y = (containerSize / 2) + (radius * Math.sin(angleRad)) - (itemSize / 2);
                                    const isActive = activeItem === item.id;

                                    const Icon = item.icon;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            className="absolute flex flex-col items-center justify-center text-center pointer-events-none"
                                            style={{ left: x, top: y, width: itemSize, height: itemSize }}
                                            animate={{ scale: isActive ? 1.1 : 1, color: isActive ? '#fff' : '#9ca3af' }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Icon className="w-[30%] h-[30%] mb-1" />
                                            <span className="text-[10px] sm:text-xs md:text-sm tracking-wider">{item.label}</span>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                            <div
                                ref={joystickRef}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32%] h-[32%]"
                                onMouseDown={handleDragStart}
                                onTouchStart={handleDragStart}
                            >
                                <motion.div className="relative w-full h-full rounded-full bg-[#202020] border-2 border-gray-600 flex items-center justify-center cursor-grab" whileTap={{ scale: 0.95, cursor: 'grabbing' }}>
                                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
                                    <motion.div
                                        className="w-[62.5%] h-[62.5%] rounded-full bg-[#121212] shadow-inner flex items-center justify-center"
                                        animate={{ rotate: isDragging ? joystickAngle : 0, x: joystickOffset.x, y: joystickOffset.y }}
                                        transition={{ ease: "easeOut", duration: isDragging ? 0.1 : 0.4 }}
                                    >
                                        <Image src="/logo.png" alt="Ihan logo" width={50} height={50} />
                                    </motion.div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpaceshipNav;
