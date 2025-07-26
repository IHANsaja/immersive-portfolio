"use client";

import React, { useRef, useLayoutEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Model } from "@/components/About/IhanModel";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {useGSAP} from "@gsap/react";
gsap.registerPlugin(ScrollTrigger);

interface ModelWrapperProps {
    cameraPosition?: [number, number, number];
    modelPosition?: [number, number, number];
}

interface SceneContentProps {
    initialCameraPos: [number, number, number];
    initialModelPos: [number, number, number];
    sceneRef: React.RefObject<HTMLDivElement>;
}

function SceneContent({ initialCameraPos, initialModelPos, sceneRef }: SceneContentProps) {
    const { camera } = useThree();

    // <-- Create a ref for your model/group
    const modelRef = useRef<THREE.Group>(null!);

    useGSAP(() => {
        if (!sceneRef.current || !modelRef.current) return;
        const ctx = gsap.context(() => {
            // Set initial states for all animations
            gsap.set(sceneRef.current, { opacity: 0, x: 0 });
            gsap.set(camera.position, { z: initialCameraPos[2] });
            gsap.set(modelRef.current.position, { x: initialModelPos[0], y: initialModelPos[1], z: initialModelPos[2] });

            // Create a primary timeline for better coordination
            const masterTimeline = gsap.timeline();

            // Scene container animations
            masterTimeline.add(
                gsap.timeline({
                    scrollTrigger: {
                        trigger: "#about-section",
                        start: "20% top",
                        end: "40% bottom",
                        scrub: 0.5,
                    }
                }).to(sceneRef.current, { opacity: 1, duration: 1, ease: "power2.inOut" })
            );

            masterTimeline.add(
                gsap.timeline({
                    scrollTrigger: {
                        trigger: "#projects-section",
                        start: "40% top",
                        end: "60% bottom",
                        scrub: 0.5,
                    }
                }).to(sceneRef.current, { x: -1000, duration: 1.2, ease: "power3.inOut" })
            );

            masterTimeline.add(
                gsap.timeline({
                    scrollTrigger: {
                        trigger: "#skill-section",
                        start: "60% top",
                        end: "80% bottom",
                        scrub: 0.5,
                    }
                }).to(sceneRef.current, { x: 500, duration: 1.2, ease: "power3.inOut" })
            );

            masterTimeline.add(
                gsap.timeline({
                    scrollTrigger: {
                        trigger: "#contact-section",
                        start: "80% top",
                        end: "100% bottom",
                        scrub: 0.5,
                    }
                }).to(sceneRef.current, { x: 0, duration: 1.2, ease: "power3.inOut" })
            );

            // Camera animations
            const cameraTimeline = gsap.timeline();

            cameraTimeline.add(
                gsap.timeline({
                    scrollTrigger: {
                        trigger: "#projects-section",
                        start: "40% top",
                        end: "60% bottom",
                        scrub: 0.7,
                    }
                }).to(camera.position, { z: 4, duration: 1.5, ease: "power2.inOut" })
            );

            cameraTimeline.add(
                gsap.timeline({
                    scrollTrigger: {
                        trigger: "#skill-section",
                        start: "60% top",
                        end: "80% bottom",
                        scrub: 0.7,
                    }
                }).to(camera.position, { z: 2, duration: 1.5, ease: "power2.inOut" })
            );

            cameraTimeline.add(
                gsap.timeline({
                    scrollTrigger: {
                        trigger: "#contact-section",
                        start: "80% top",
                        end: "100% bottom",
                        scrub: 0.7,
                    }
                }).to(camera.position, { z: 1.5, duration: 1.5, ease: "power2.inOut" })
            );

            // Model position animations
            const modelTimeline = gsap.timeline();

            modelTimeline.add(
                gsap.timeline({
                    scrollTrigger: {
                        trigger: "#projects-section",
                        start: "40% top",
                        end: "60% bottom",
                        scrub: 0.6,
                    }
                }).to(modelRef.current.position, { x: 1, z: -1.5, y: -1, duration: 1.3, ease: "power3.inOut" })
            );

            modelTimeline.add(
                gsap.timeline({
                    scrollTrigger: {
                        trigger: "#skill-section",
                        start: "60% top",
                        end: "80% bottom",
                        scrub: 0.6,
                    }
                }).to(modelRef.current.position, { x: 0, y: -1.5, z: 0, duration: 1.3, ease: "power3.inOut" })
            );

            modelTimeline.add(
                gsap.timeline({
                    scrollTrigger: {
                        trigger: "#contact-section",
                        start: "80% top",
                        end: "100% bottom",
                        scrub: 0.6,
                    }
                }).to(modelRef.current.position, { 
                    x: initialModelPos[0], 
                    y: initialModelPos[1], 
                    z: initialModelPos[2], 
                    duration: 1.3, 
                    ease: "power3.inOut" 
                })
            );


        }, [sceneRef, modelRef, camera]);

        return () => ctx.revert();
    }, [camera, sceneRef]);


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
            <Environment files="/hdr/venice_sunset.hdr" />

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
            className="fixed top-0 left-0 z-10 w-screen h-screen pointer-events-none"
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
