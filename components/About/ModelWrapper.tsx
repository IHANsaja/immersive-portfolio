"use client";

import React, { useRef, useLayoutEffect, useEffect, useState, Suspense, memo, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Model } from "@/components/About/IhanModel";
import { Environment, Html } from "@react-three/drei";
import gsap from "gsap";
import HoneycombLoader from "@/components/Ui/HoneycombLoader";
import * as THREE from "three";

const SECTION_PINNED_EVENT = 'sectionPinned';

// --- Prop interfaces ---
interface ModelWrapperProps {
    cameraPosition?: [number, number, number];
    modelPosition?: [number, number, number];
}

interface SceneContentProps {
    initialCameraPos: [number, number, number];
    initialModelPos: [number, number, number];
    sceneRef: React.RefObject<HTMLDivElement | null>;
}

// --- Memoized SceneContent Component ---
const SceneContent = memo(({ initialCameraPos, initialModelPos, sceneRef }: SceneContentProps) => {
    const { camera } = useThree();
    const modelRef = useRef<THREE.Group>(null!);

    // Set initial positions with useLayoutEffect for synchronous update before paint
    useLayoutEffect(() => {
        if (!modelRef.current || !sceneRef.current) return;
        gsap.set(camera.position, { ...camera.position, z: initialCameraPos[2] });
        gsap.set(modelRef.current.position, { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] });
        gsap.set(sceneRef.current, { opacity: 0, x: 0 });
    }, [camera, initialCameraPos, initialModelPos, sceneRef]);

    // Effect for handling GSAP animations on scroll
    useEffect(() => {
        if (!sceneRef.current || !modelRef.current) return;

        const animations = {
            // Scene visibility and position
            scene: {
                'hero-section': { xPercent: 0, opacity: 0 },
                'about-section': { xPercent: 0, opacity: 1 },
                'projects-section': { xPercent: -50, opacity: 1 },
                'skill-section': { xPercent: 25, opacity: 1 },
                'contact-section': { xPercent: -35, opacity: 1 }
            },
            // Camera zoom level
            camera: {
                'hero-section': { z: initialCameraPos[2] },
                'about-section': { z: initialCameraPos[2] },
                'projects-section': { z: 4 },
                'skill-section': { z: 2 },
                'contact-section': { z: 4 }
            },
            // Model position and orientation
            model: {
                'hero-section': { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] },
                'about-section': { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] },
                'projects-section': { x: 1, y: -1, z: -1.5 },
                'skill-section': { x: 0, y: -1.5, z: 0 },
                'contact-section': { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] }
            }
        };

        // **FIX**: Create a type from the animation keys to ensure type safety.
        type SectionId = keyof typeof animations.scene;

        const handleSectionPinned = (event: Event) => {
            // **FIX**: Cast the event detail to use the specific SectionId type.
            const { sectionId } = (event as CustomEvent<{ sectionId: SectionId }>).detail;

            // This check ensures the sectionId is valid before running animations.
            if (sectionId in animations.scene) {
                const ease = "circ.inOut";
                // Ensure x is reset to 0 when using xPercent to avoid conflicts if x was previously set
                if (sceneRef.current) gsap.to(sceneRef.current, { ...animations.scene[sectionId], x: 0, duration: 1, ease });
                gsap.to(camera.position, { ...animations.camera[sectionId], duration: 1.5, ease });
                if (modelRef.current) gsap.to(modelRef.current.position, { ...animations.model[sectionId], duration: 1.3, ease });
            }
        };

        window.addEventListener(SECTION_PINNED_EVENT, handleSectionPinned);
        return () => window.removeEventListener(SECTION_PINNED_EVENT, handleSectionPinned);
    }, [camera, sceneRef, modelRef, initialCameraPos, initialModelPos]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} />
            <Environment preset="sunset" />

            <group ref={modelRef}>
                <Suspense fallback={
                    <Html center>
                        <HoneycombLoader />
                    </Html>
                }>
                    <Model />
                </Suspense>
            </group>
        </>
    );
});
SceneContent.displayName = 'SceneContent';

// --- Default positions defined as constants to prevent re-renders ---
const DEFAULT_CAMERA_POS: [number, number, number] = [0, 0, 2];
const DEFAULT_MODEL_POS: [number, number, number] = [0, -1.5, 0];

// --- Memoized ModelWrapper Component ---
const ModelWrapper = memo(({
    cameraPosition = DEFAULT_CAMERA_POS,
    modelPosition = DEFAULT_MODEL_POS,
}: ModelWrapperProps) => {
    const sceneRef = useRef<HTMLDivElement>(null);
    // Render Canvas unconditionally to prevent event listener race conditions
    // and because we've already optimized the total number of WebGL contexts.

    const [isContextLost, setIsContextLost] = useState(false);

    // Handle WebGL context lost/restored events for resilience
    const handleCanvasCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
        const canvas = gl.domElement;

        const handleContextLost = (event: Event) => {
            event.preventDefault(); // Prevent permanent context loss
            console.warn('[ModelWrapper] WebGL context lost — preventing default.');
            setIsContextLost(true);
        };

        const handleContextRestored = () => {
            console.info('[ModelWrapper] WebGL context restored.');
            setIsContextLost(false);
        };

        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);
    }, []);

    return (
        <div
            ref={sceneRef}
            className={`fixed top-0 left-0 z-0 w-screen h-screen hidden md:block pointer-events-none ${isContextLost ? 'opacity-0 !hidden' : ''}`}
            style={{ opacity: 0 }}
        >
            <Canvas
                camera={{ fov: 35 }}
                style={{ pointerEvents: 'none' }}
                onCreated={handleCanvasCreated}
                gl={{
                    antialias: true,
                    alpha: true,
                }}
            >
                <SceneContent
                    initialCameraPos={cameraPosition}
                    initialModelPos={modelPosition}
                    sceneRef={sceneRef}
                />
            </Canvas>
        </div>
    );
});
ModelWrapper.displayName = 'ModelWrapper';

export default ModelWrapper;