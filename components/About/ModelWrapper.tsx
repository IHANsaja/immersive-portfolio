"use client";

import React, { useRef, useLayoutEffect, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Model } from "@/components/About/IhanModel";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {useGSAP} from "@gsap/react";
gsap.registerPlugin(ScrollTrigger);

// Custom event for section pinning
const SECTION_PINNED_EVENT = 'sectionPinned';

interface ModelWrapperProps {
    cameraPosition?: [number, number, number];
    modelPosition?: [number, number, number];
}

interface SceneContentProps {
    initialCameraPos: [number, number, number];
    initialModelPos: [number, number, number];
    sceneRef: React.RefObject<HTMLDivElement | null>;
}

function SceneContent({ initialCameraPos, initialModelPos, sceneRef }: SceneContentProps) {
    const { camera } = useThree();

    // <-- Create a ref for your model/group
    const modelRef = useRef<THREE.Group>(null!);

    // Create refs for the animations to be accessible in the event listener
    const animationsRef = useRef<{
        scenePositions: Record<string, { x: number, opacity: number }>;
        cameraPositions: Record<string, { z: number }>;
        modelPositions: Record<string, { x: number, y: number, z: number }>;
    }>({
        scenePositions: {
            'hero-section': { x: 0, opacity: 0 },
            'about-section': { x: 0, opacity: 1 },
            'projects-section': { x: -1000, opacity: 1 },
            'skill-section': { x: 500, opacity: 1 },
            'contact-section': { x: -700, opacity: 1 }
        },
        cameraPositions: {
            'hero-section': { z: initialCameraPos[2] },
            'about-section': { z: initialCameraPos[2] },
            'projects-section': { z: 4 },
            'skill-section': { z: 2 },
            'contact-section': { z: 4 }
        },
        modelPositions: {
            'hero-section': { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] },
            'about-section': { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] },
            'projects-section': { x: 1, y: -1, z: -1.5 },
            'skill-section': { x: 0, y: -1.5, z: 0 },
            'contact-section': { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] }
        }
    });

    // Set up event listener for section pinning
    useEffect(() => {
        if (!sceneRef.current || !modelRef.current) return;

        const handleSectionPinned = (event: Event) => {
            const customEvent = event as CustomEvent;
            const { sectionId, action } = customEvent.detail;

            // Get the animation values for this section
            const scenePosition = animationsRef.current.scenePositions[sectionId];
            const cameraPosition = animationsRef.current.cameraPositions[sectionId];
            const modelPosition = animationsRef.current.modelPositions[sectionId];

            if (scenePosition && cameraPosition && modelPosition) {
                // Animate scene position
                gsap.to(sceneRef.current, { 
                    x: scenePosition.x, 
                    opacity: scenePosition.opacity, 
                    duration: 1, 
                    ease: "circ.inOut" 
                });

                // Animate camera position
                gsap.to(camera.position, { 
                    z: cameraPosition.z, 
                    duration: 1.5, 
                    ease: "circ.inOut" 
                });

                // Animate model position
                gsap.to(modelRef.current.position, { 
                    x: modelPosition.x, 
                    y: modelPosition.y, 
                    z: modelPosition.z, 
                    duration: 1.3, 
                    ease: "circ.inOut" 
                });
            }
        };

        // Add event listener
        window.addEventListener(SECTION_PINNED_EVENT, handleSectionPinned);

        // Clean up
        return () => {
            window.removeEventListener(SECTION_PINNED_EVENT, handleSectionPinned);
        };
    }, [camera, sceneRef, modelRef, initialCameraPos, initialModelPos]);

    useGSAP(() => {
        if (!sceneRef.current || !modelRef.current) return;
        const ctx = gsap.context(() => {
            // Set initial states for all animations
            gsap.set(sceneRef.current, { opacity: 0, x: 0 });
            gsap.set(camera.position, { z: initialCameraPos[2] });
            gsap.set(modelRef.current.position, { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] });

            // Create a primary timeline for better coordination
            const masterTimeline = gsap.timeline();

            // Scene container and camera animations are now handled by the section pinning event listener
            // We're removing the scroll-based animations to prevent the scene and camera
            // from changing position when scrolling slightly after a section is pinned

            // No initial fade-in animation for the scene
            // The scene opacity will be controlled by the section pinning event

            // Model position animations are now handled by the section pinning event listener
            // We're removing the scroll-based animations for model positioning to prevent
            // the model from changing position when scrolling slightly after a section is pinned


        }, [sceneRef, modelRef, camera]);

        return () => ctx.revert();
    }, [camera, sceneRef, initialCameraPos, initialModelPos]);


    useLayoutEffect(() => {
        camera.position.set(...initialCameraPos);
    }, [camera, initialCameraPos]);

    useLayoutEffect(() => {
        modelRef.current.position.set(...initialModelPos);
    }, [initialModelPos]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} />
            <Environment files="/hdr/sunset.hdr" />

            {/* <-- Wrap in a group so we can animate it */}
            <group ref={modelRef}>
                <Model />
            </group>
        </>
    );
}

export default function ModelWrapper({
                                         cameraPosition = [0, 0, 2],
                                         modelPosition = [0, -1.5, 0],
                                     }: ModelWrapperProps) {
    const sceneRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={sceneRef}
            className="fixed top-0 left-0 z-0 w-screen h-screen pointer-events-none"
            style={{ opacity: 0 }}
        >
            <Canvas camera={{ fov: 35 }} style={{ pointerEvents: 'none' }}>
                <SceneContent
                    initialCameraPos={cameraPosition}
                    initialModelPos={modelPosition}
                    sceneRef={sceneRef}
                />
            </Canvas>
        </div>
    );
}
