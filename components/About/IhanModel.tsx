"use client";

import React, { JSX, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import {
    SkinnedMesh,
    Bone,
    Material,
    BufferGeometry,
    Group,
    Object3DEventMap,
} from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// Custom event for section pinning
const SECTION_PINNED_EVENT = 'sectionPinned';

type GLTFResult = {
    nodes: {
        Hips: Bone;
        Neck: Bone; // It's good practice to add bones you intend to use to the type
        EyeLeft: SkinnedMesh<BufferGeometry, Material>;
        EyeRight: SkinnedMesh<BufferGeometry, Material>;
        Wolf3D_Head: SkinnedMesh<BufferGeometry, Material>;
        Wolf3D_Teeth: SkinnedMesh<BufferGeometry, Material>;
        Wolf3D_Hair: SkinnedMesh<BufferGeometry, Material>;
        Wolf3D_Outfit_Top: SkinnedMesh<BufferGeometry, Material>;
        Wolf3D_Outfit_Bottom: SkinnedMesh<BufferGeometry, Material>;
        Wolf3D_Outfit_Footwear: SkinnedMesh<BufferGeometry, Material>;
        Wolf3D_Body: SkinnedMesh<BufferGeometry, Material>;
    };
    materials: {
        Wolf3D_Eye: Material;
        Wolf3D_Skin: Material;
        Wolf3D_Teeth: Material;
        Wolf3D_Hair: Material;
        Wolf3D_Outfit_Top: Material;
        Wolf3D_Outfit_Bottom: Material;
        Wolf3D_Outfit_Footwear: Material;
        Wolf3D_Body: Material;
    };
};

export function Model(props: JSX.IntrinsicElements['group']) {

    const groupRef = useRef<Group<Object3DEventMap>>(null);
    // The 'nodes' object will be populated once the GLTF is loaded.
    const { nodes, materials } = useGLTF('/models/ihan.glb') as unknown as GLTFResult;

    // Create refs for the model gestures to be accessible in the event listener
    const gesturesRef = useRef<{
        neck: Record<string, { x: number, y: number, z: number }>;
        leftArm: Record<string, { x: number, y: number, z: number }>;
        rightArm: Record<string, { x: number, y: number, z: number }>;
        leftForeArm: Record<string, { x: number, y: number, z: number }>;
        spine: Record<string, { x: number, y: number, z: number }>;
        rightForeArm: Record<string, { x: number, y: number, z: number }>;
    }>({
        neck: {
            'hero-section': { x: 0.6, y: 0, z: 0 },
            'about-section': { x: 0.6, y: 0, z: 0 },
            'projects-section': { x: 0.6, y: 0.5, z: 0 },
            'skill-section': { x: 0.6, y: -0.5, z: 0 },
            'experience-section': { x: 0.2, y: -0.25, z: -0.05 },
            'contact-section': { x: 0, y: 0.5, z: 0 }
        },
        leftArm: {
            'hero-section': { x: 1.3, y: 0, z: 0 },
            'about-section': { x: 1.3, y: 0, z: 0 },
            'projects-section': { x: 1.3, y: 0, z: 0 },
            'skill-section': { x: 1.3, y: 0, z: 0 },
            'experience-section': { x: 0.9, y: 0.4, z: 0.35 },
            'contact-section': { x: 0.7, y: -0.2, z: 0.7 }
        },
        rightArm: {
            'hero-section': { x: 1.3, y: 0, z: 0 },
            'about-section': { x: 1.3, y: 0, z: 0 },
            'projects-section': { x: 1.3, y: 0, z: 0 },
            'skill-section': { x: 1.3, y: 0, z: 0 },
            'experience-section': { x: 0.9, y: -0.4, z: -0.35 },
            'contact-section': { x: 1.3, y: 0, z: 0 }
        },
        leftForeArm: {
            'hero-section': { x: 0, y: 0, z: 0 },
            'about-section': { x: -0.1, y: 0, z: 0.4 },
            'projects-section': { x: 1, y: -1, z: 2 },
            'skill-section': { x: 0, y: 0, z: 0 },
            'experience-section': { x: -1.3, y: -0.5, z: 0.8 },
            'contact-section': { x: -1, y: -0.4, z: 1 }
        },
        spine: {
            'hero-section': { x: 0, y: 0, z: 0 },
            'about-section': { x: 0, y: 0, z: 0 },
            'projects-section': { x: 0, y: 0, z: 0 },
            'skill-section': { x: 0, y: 0, z: 0 },
            'experience-section': { x: -0.05, y: -0.05, z: 0 },
            'contact-section': { x: 0, y: 0, z: 0 }
        },
        rightForeArm: {
            'hero-section': { x: 0, y: 0, z: 0 },
            'about-section': { x: 0, y: 0, z: 0 },
            'projects-section': { x: 0, y: 0, z: 0 },
            'skill-section': { x: 0, y: 0, z: 0 },
            'experience-section': { x: -1.3, y: 0.5, z: -0.8 },
            'contact-section': { x: 0, y: 0, z: 0 }
        }
    });

    // Set up event listener for section pinning
    useEffect(() => {
        if (!groupRef.current) return;

        const handleSectionPinned = (event: Event) => {
            if (!groupRef.current) return;
            const customEvent = event as CustomEvent;
            const { sectionId } = customEvent.detail;

            // Find the bones
            const neck = groupRef.current.getObjectByName('Neck');
            const leftArm = groupRef.current.getObjectByName('LeftArm');
            const rightArm = groupRef.current.getObjectByName('RightArm');
            const leftForeArm = groupRef.current.getObjectByName('LeftForeArm');
            const spine = groupRef.current.getObjectByName('Spine');
            const rightForeArm = groupRef.current.getObjectByName('RightForeArm');

            // Get the gesture values for this section
            const neckGesture = gesturesRef.current.neck[sectionId];
            const leftArmGesture = gesturesRef.current.leftArm[sectionId];
            const rightArmGesture = gesturesRef.current.rightArm[sectionId];
            const leftForeArmGesture = gesturesRef.current.leftForeArm[sectionId];
            const spineGesture = gesturesRef.current.spine[sectionId];
            const rightForeArmGesture = gesturesRef.current.rightForeArm[sectionId];

            // Apply the gestures
            if (neck && neckGesture) {
                gsap.to(neck.rotation, { 
                    x: neckGesture.x, 
                    y: neckGesture.y, 
                    z: neckGesture.z, 
                    duration: 1, 
                    ease: 'power2.inOut' 
                });
            }

            if (leftArm && leftArmGesture) {
                gsap.to(leftArm.rotation, { 
                    x: leftArmGesture.x, 
                    y: leftArmGesture.y, 
                    z: leftArmGesture.z, 
                    duration: 1.2, 
                    ease: 'power2.inOut' 
                });
            }

            if (rightArm && rightArmGesture) {
                gsap.to(rightArm.rotation, { 
                    x: rightArmGesture.x, 
                    y: rightArmGesture.y, 
                    z: rightArmGesture.z, 
                    duration: 1.2, 
                    ease: 'power2.inOut' 
                });
            }

            if (leftForeArm && leftForeArmGesture) {
                gsap.to(leftForeArm.rotation, { 
                    x: leftForeArmGesture.x, 
                    y: leftForeArmGesture.y, 
                    z: leftForeArmGesture.z, 
                    duration: 1.2, 
                    ease: 'power2.inOut' 
                });
            }

            if (spine && spineGesture) {
                gsap.to(spine.rotation, { 
                    x: spineGesture.x, 
                    y: spineGesture.y, 
                    z: spineGesture.z, 
                    duration: 1.4, 
                    ease: 'power2.inOut' 
                });
            }

            if (rightForeArm && rightForeArmGesture) {
                gsap.to(rightForeArm.rotation, { 
                    x: rightForeArmGesture.x, 
                    y: rightForeArmGesture.y, 
                    z: rightForeArmGesture.z, 
                    duration: 1.2, 
                    ease: 'power2.inOut' 
                });
            }
        };

        // Add event listener
        window.addEventListener(SECTION_PINNED_EVENT, handleSectionPinned);

        // Clean up
        return () => {
            window.removeEventListener(SECTION_PINNED_EVENT, handleSectionPinned);
        };
    }, []);

    // We use useGSAP for proper animation setup and cleanup in React.
    useGSAP(() => {
        // 1. Create a GSAP context. This allows us to properly manage and
        // clean up our animations when the component unmounts.
        const ctx = gsap.context(() => {
            // We don't pass a scope here, so ScrollTrigger's `trigger`
            // will correctly search the entire document.

            if (!groupRef.current) return;

            // 2. Find the neck bone. It's crucial to find it by name.
            // Skeletons are nested inside the primitive object.
            const neck = groupRef.current.getObjectByName('Neck');
            const leftArm = groupRef.current.getObjectByName('LeftArm');
            const rightArm = groupRef.current.getObjectByName('RightArm');
            const leftForeArm = groupRef.current.getObjectByName('LeftForeArm');
            const spine = groupRef.current.getObjectByName('Spine');
            const rightForeArm = groupRef.current.getObjectByName('RightForeArm');

            // Set initial states for all bones
            if (neck) {
                // Set the initial state: head looking down.
                // A positive rotation on the X-axis tilts the head forward.
                gsap.set(neck.rotation, { x: 0.6, y: 0, z: 0 });
            }

            if (leftArm && rightArm) {
                // Set the initial rotation for the arms
                gsap.set([leftArm.rotation, rightArm.rotation], { x: 1.3, y: 0, z: 0 });
            }

            if (leftForeArm) {
                // Set initial state for forearm
                gsap.set(leftForeArm.rotation, { x: 0, y: 0, z: 0 });
            }

            if (spine) {
                // Set initial state for spine
                gsap.set(spine.rotation, { x: 0, y: 0, z: 0 });
            }

            if (rightForeArm) {
                // Set initial state for right forearm
                gsap.set(rightForeArm.rotation, { x: 0, y: 0, z: 0 });
            }

            // Model gestures are now handled by the section pinning event listener
            // We're removing the scroll-based animations for model gestures to prevent
            // the model from changing gestures when scrolling slightly after a section is pinned

        });

        // 5. Cleanup function. This will be called when the component unmounts,
        // reverting all animations and ScrollTriggers created inside the context.
        return () => ctx.revert();

    }, [nodes]); // The dependency array ensures this effect runs *after* the model has loaded.

    return (
        // Ensure the ref is attached to the group
        <group {...props} dispose={null} ref={groupRef}>
            {/* The primitive object contains the skeleton, including the Neck bone */}
            <primitive object={nodes.Hips} />
            <skinnedMesh
                name="EyeLeft"
                geometry={nodes.EyeLeft.geometry}
                material={materials.Wolf3D_Eye}
                skeleton={nodes.EyeLeft.skeleton}
                morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
                morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
            />
            <skinnedMesh
                name="EyeRight"
                geometry={nodes.EyeRight.geometry}
                material={materials.Wolf3D_Eye}
                skeleton={nodes.EyeRight.skeleton}
                morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
                morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
            />
            <skinnedMesh
                name="Wolf3D_Head"
                geometry={nodes.Wolf3D_Head.geometry}
                material={materials.Wolf3D_Skin}
                skeleton={nodes.Wolf3D_Head.skeleton}
                morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
                morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
            />
            <skinnedMesh
                name="Wolf3D_Teeth"
                geometry={nodes.Wolf3D_Teeth.geometry}
                material={materials.Wolf3D_Teeth}
                skeleton={nodes.Wolf3D_Teeth.skeleton}
                morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
                morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
            />
            <skinnedMesh
                geometry={nodes.Wolf3D_Hair.geometry}
                material={materials.Wolf3D_Hair}
                skeleton={nodes.Wolf3D_Hair.skeleton}
            />
            <skinnedMesh
                geometry={nodes.Wolf3D_Outfit_Top.geometry}
                material={materials.Wolf3D_Outfit_Top}
                skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
            />
            <skinnedMesh
                geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
                material={materials.Wolf3D_Outfit_Bottom}
                skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
            />
            <skinnedMesh
                geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
                material={materials.Wolf3D_Outfit_Footwear}
                skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
            />
            <skinnedMesh
                geometry={nodes.Wolf3D_Body.geometry}
                material={materials.Wolf3D_Body}
                skeleton={nodes.Wolf3D_Body.skeleton}
            />
        </group>
    );
}

useGLTF.preload('/models/ihan.glb');
