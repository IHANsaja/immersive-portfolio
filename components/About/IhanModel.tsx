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

    console.log(nodes);

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
                gsap.set(neck.rotation, { x: 0.6, y: 0, z: 0 });

                // 4. Create a timeline for neck animations for better coordination
                const neckTimeline = gsap.timeline();

                // About section - head looking down
                neckTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#about-section',
                            start: 'top bottom',
                            end: 'top top',
                            scrub: 0.8, // Add higher smoothing factor for neck rotation
                        }
                    }).to(neck.rotation, { x: 0.6, y: 0, z: 0, duration: 1, ease: 'power2.inOut' })
                );

                // Projects section - head turning right
                neckTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#projects-section',
                            start: 'top center',
                            end: 'top top',
                            scrub: 0.8, // Add higher smoothing factor for neck rotation
                        }
                    }).to(neck.rotation, { x: 0.6, y: 0.5, z: 0, duration: 1, ease: 'power2.inOut' })
                );

                // Skills section - head turning left
                neckTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#skill-section',
                            start: 'top center',
                            end: 'top top',
                            scrub: 0.8, // Add higher smoothing factor for neck rotation
                        }
                    }).to(neck.rotation, { x: 0.6, y: -0.5, z: 0, duration: 1, ease: 'power2.inOut' })
                );

                // Contact section - head looking forward
                neckTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#contact-section',
                            start: 'top center',
                            end: 'top top',
                            scrub: 0.8, // Add higher smoothing factor for neck rotation
                        }
                    }).to(neck.rotation, { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut' })
                );
            } else {
                // Helpful for debugging if the bone name is wrong
                console.warn("GSAP animation failed: 'Neck' bone not found in the model.");
            }

            // --- HAND/ARM ANIMATION ---
            // 1. Find the arm bones by name
            const leftArm = groupRef.current.getObjectByName('LeftArm');
            const rightArm = groupRef.current.getObjectByName('RightArm');

            // 2. Animate the arms if they are found.
            if (leftArm && rightArm) {
                // Set the initial rotation for the arms
                gsap.set([leftArm.rotation, rightArm.rotation], { x: 1.3, y: 0, z: 0 });

                // Create a timeline for both arms
                const armsTimeline = gsap.timeline();

                armsTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#about-section',
                            start: 'top bottom',
                            end: 'top top',
                            scrub: 0.7, // Add smoothing factor for arm rotation
                        }
                    }).to([leftArm.rotation, rightArm.rotation], { x: 1.3, y: 0, z: 0, duration: 1.2, ease: 'power2.inOut' })
                );
            } else {
                console.warn("GSAP animation failed: 'LeftArm' or 'RightArm' bones not found.");
            }

            if (leftArm) {
                // Create a timeline for left arm animations
                const leftArmTimeline = gsap.timeline();

                // About section
                leftArmTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#about-section',
                            start: 'top bottom',
                            end: 'top top',
                            scrub: 0.7, // Add smoothing factor for arm rotation
                        }
                    }).to(leftArm.rotation, { x: 1.3, y: 0, z: 0, duration: 1.2, ease: 'power2.inOut' })
                );

                // Skill section
                leftArmTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#skill-section',
                            start: 'top bottom',
                            end: 'top top',
                            scrub: 0.7, // Add smoothing factor for arm rotation
                        }
                    }).to(leftArm.rotation, { x: 1.3, y: 0, z: 0, duration: 1.2, ease: 'power2.inOut' })
                );

                // Contact section
                leftArmTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#contact-section',
                            start: 'top bottom',
                            end: 'top top',
                            scrub: 0.7, // Add smoothing factor for arm rotation
                        }
                    }).to(leftArm.rotation, { x: 0.7, y: -0.2, z: 0.7, duration: 1.2, ease: 'power2.inOut' })
                );
            }

            const leftForeArm = groupRef.current.getObjectByName('LeftForeArm');

            if (leftForeArm) {
                // Set initial state
                gsap.set(leftForeArm.rotation, { x: 0, y: 0, z: 0 });

                // Create a timeline for left forearm animations
                const leftForeArmTimeline = gsap.timeline();

                // About section
                leftForeArmTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#about-section',
                            start: 'top center',
                            end: 'bottom bottom',
                            scrub: 0.7, // Add smoothing factor for forearm rotation
                        }
                    }).to(leftForeArm.rotation, { x: -0.1, y: 0, z: 0.4, duration: 1.2, ease: 'power2.inOut' })
                );

                // Projects section
                leftForeArmTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#projects-section',
                            start: 'top center',
                            end: 'bottom bottom',
                            scrub: 0.7, // Add smoothing factor for forearm rotation
                        }
                    }).to(leftForeArm.rotation, { x: 1, y: -1, z: 2, duration: 1.2, ease: 'power2.inOut' })
                );

                // Skill section
                leftForeArmTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#skill-section',
                            start: 'top center',
                            end: 'bottom bottom',
                            scrub: 0.7, // Add smoothing factor for forearm rotation
                        }
                    }).to(leftForeArm.rotation, { x: 0, y: 0, z: 0, duration: 1.2, ease: 'power2.inOut' })
                );

                // Contact section
                leftForeArmTimeline.add(
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: '#contact-section',
                            start: 'top center',
                            end: 'bottom bottom',
                            scrub: 0.7, // Add smoothing factor for forearm rotation
                        }
                    }).to(leftForeArm.rotation, { x: -0.8, y: -0.6, z: 1.3, duration: 1.2, ease: 'power2.inOut' })
                );
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
