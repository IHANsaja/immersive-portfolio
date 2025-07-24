"use client";

import React, { JSX, useRef } from 'react';
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

            if (neck) {
                // 3. Set the initial state: head looking down.
                // A positive rotation on the X-axis tilts the head forward.
                gsap.set(neck.rotation, { x: 1.5 });

                // 4. Create the scroll-based animation.
                gsap.to(neck.rotation, {
                    x: 0.6, // Animate to the neutral rotation.
                    ease: 'power1.inOut',
                    scrollTrigger: {
                        // ⚠️ IMPORTANT: This selector MUST match an element in your HTML/JSX.
                        trigger: '#about-section',
                        start: 'top bottom', // When the trigger's top hits the viewport's bottom
                        end: 'top top',   // When the trigger's top hits the viewport's top
                        scrub: true,      // Smoothly link animation to scroll progress
                    },
                });
            } else {
                // Helpful for debugging if the bone name is wrong
                console.warn("GSAP animation failed: 'Neck' bone not found in the model.");
            }

            // --- NEW: HAND/ARM ANIMATION ---
            // 1. Find the arm bones by name. Check your console log for exact names.
            // Common names are 'LeftArm', 'RightArm', 'LeftHand', etc.
            const leftArm = groupRef.current.getObjectByName('LeftArm');
            const rightArm = groupRef.current.getObjectByName('RightArm');

            // 2. Animate the arms if they are found.
            if (leftArm && rightArm) {
                // Set the initial rotation for the arms (e.g., slightly down and back).
                gsap.set([leftArm.rotation, rightArm.rotation], {
                    x: 1.8, // Rotated forward/down
                });

                // Create a scroll-based animation to raise the arms.
                gsap.to([leftArm.rotation, rightArm.rotation], {
                    x: 1.3, // Raise arms up
                    ease: 'power1.inOut',
                    scrollTrigger: {
                        trigger: '#about-section',
                        start: 'top bottom',
                        end: 'top top',
                        scrub: true,
                    },
                });
            } else {
                console.warn("GSAP animation failed: 'LeftArm' or 'RightArm' bones not found.");
            }
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
