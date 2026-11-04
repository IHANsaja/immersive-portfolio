"use client";

import React, { useRef, useLayoutEffect, useEffect, Suspense, memo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Model } from "@/components/About/IhanModel";
import { Environment, Html } from "@react-three/drei";
import gsap from "gsap";
import HoneycombLoader from "@/components/Ui/HoneycombLoader";
import * as THREE from "three";
import { SECTION_PINNED_EVENT, getCurrentSection } from "@/utils/sectionEvents";

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
        gsap.set(camera.position, { ...camera.position, z: initialCameraPos[2] });
        gsap.set(modelRef.current.position, { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] });
        gsap.set(sceneRef.current, { opacity: 0, x: 0, xPercent: 0 });
    }, [camera, initialCameraPos, initialModelPos, sceneRef]);

    // Effect for handling GSAP animations on scroll
    useEffect(() => {
        if (!sceneRef.current || !modelRef.current) return;

        const animations = {
            // Scene visibility and horizontal placement. xPercent is relative to the
            // full-viewport canvas, so the model's screen position (50% + xPercent)
            // is the same on every screen width instead of drifting off-screen.
            scene: {
                'hero-section': { xPercent: 0, opacity: 0 },
                'about-section': { xPercent: 0, opacity: 1 },
                'projects-section': { xPercent: -33, opacity: 1 },
                'skill-section': { xPercent: 30, opacity: 1 },
                'experience-section': { xPercent: 28, opacity: 1 },
                'contact-section': { xPercent: -35, opacity: 1 }
            },
            // Camera zoom level
            camera: {
                'hero-section': { z: initialCameraPos[2] },
                'about-section': { z: initialCameraPos[2] },
                'projects-section': { z: 4 },
                'skill-section': { z: 2 },
                'experience-section': { z: 3 },
                'contact-section': { z: 4 }
            },
            // Model depth/height. Horizontal placement lives in `scene` above; a world-space
            // x offset here would shift by a different screen fraction per aspect ratio.
            model: {
                'hero-section': { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] },
                'about-section': { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] },
                'projects-section': { x: 0, y: -1, z: -1.5 },
                'skill-section': { x: 0, y: -1.5, z: 0 },
                'experience-section': { x: 0, y: -1.2, z: -0.5 },
                'contact-section': { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] }
            }
        };

        type SectionId = keyof typeof animations.scene;

        const applySection = (sectionId: string, immediate = false) => {
            if (!(sectionId in animations.scene)) return;
            const id = sectionId as SectionId;
            // overwrite: "auto" kills any in-flight tween on the same properties, so fast
            // scrolling through several sections can't leave an older tween running that
            // drags the model back toward a previous section's position.
            const common = { ease: "circ.inOut", overwrite: "auto" as const };
            gsap.to(sceneRef.current, { ...animations.scene[id], ...common, duration: immediate ? 0 : 1 });
            gsap.to(camera.position, { ...animations.camera[id], ...common, duration: immediate ? 0 : 1.5 });
            gsap.to(modelRef.current.position, { ...animations.model[id], ...common, duration: immediate ? 0 : 1.3 });
        };

        const handleSectionPinned = (event: Event) => {
            applySection((event as CustomEvent<{ sectionId: string }>).detail.sectionId);
        };

        // Catch up if a section was entered before this scene mounted
        const current = getCurrentSection();
        if (current) applySection(current, true);

        window.addEventListener(SECTION_PINNED_EVENT, handleSectionPinned);
        return () => window.removeEventListener(SECTION_PINNED_EVENT, handleSectionPinned);
    }, [camera, sceneRef, modelRef, initialCameraPos, initialModelPos]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} />
            <Environment files="/hdr/sunset.hdr" />

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

    return (
        <div
            ref={sceneRef}
            className="fixed top-0 left-0 z-0 w-screen h-screen hidden min-[800px]:block pointer-events-none"
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
});
ModelWrapper.displayName = 'ModelWrapper';

export default ModelWrapper;