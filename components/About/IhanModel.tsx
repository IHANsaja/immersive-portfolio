"use client";

import React, { JSX, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import {
    SkinnedMesh,
    Bone,
    Material,
    BufferGeometry,
    Group,
    Object3D,
    Object3DEventMap,
    Euler,
    Quaternion,
} from 'three';
import gsap from 'gsap';
import { SECTION_PINNED_EVENT, getCurrentSection } from '@/utils/sectionEvents';


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

type Vec3 = [number, number, number];
type SectionId =
    | 'hero-section'
    | 'about-section'
    | 'projects-section'
    | 'skill-section'
    | 'experience-section'
    | 'contact-section';

// Bone rotations (radians, local Euler XYZ). The rig faces the camera, so the
// character's Right* bones are on the viewer's left. On the arms, lowering x raises
// the arm out to the side; the forearm bends with negative x, in a direction set by
// the upper arm's y twist (0 = up/out, about +-pi = down/in toward the body).
const NEUTRAL_POSE: Record<string, Vec3> = {
    Spine: [0, 0, 0],
    Neck: [0.6, 0, 0],
    LeftArm: [1.3, 0, 0],
    RightArm: [1.3, 0, 0],
    LeftForeArm: [0, 0, 0],
    RightForeArm: [0, 0, 0],
};

function curledFingers(side: 'Left' | 'Right', base: number, tip: number): Record<string, Vec3> {
    const pose: Record<string, Vec3> = {};
    for (const finger of ['Index', 'Middle', 'Ring', 'Pinky']) {
        pose[`${side}Hand${finger}1`] = [base, 0, 0];
        pose[`${side}Hand${finger}2`] = [base, 0, 0];
        pose[`${side}Hand${finger}3`] = [tip, 0, 0];
    }
    return pose;
}

// Only what differs from NEUTRAL_POSE (or, for hands and fingers, the rig's rest pose)
const POSES: Record<SectionId, Record<string, Vec3>> = {
    'hero-section': {},
    'about-section': {
        LeftForeArm: [-0.1, 0, 0.4],
    },
    'projects-section': {
        Neck: [0.6, 0.5, 0],
        LeftForeArm: [1, -1, 2],
    },
    'skill-section': {
        Neck: [0.6, -0.5, 0],
    },
    // Model stands on the right of the timeline: a confident thumbs-up beside the
    // career cards. Elbow by the side, forearm held out in front below the chest, fist
    // closed with the thumb up and the knuckles toward the viewer. Solved from bone
    // positions (thumb vertical, fist facing the camera), bending the elbow only on
    // its hinge so the skinned sleeve follows cleanly.
    'experience-section': {
        // The camera sits below head height in this section, so a level head reads as
        // looking up; tilting down ~7deg points the face straight at the viewer.
        Neck: [0.25, 0, 0],
        RightArm: [-0.043, -1.128, -1.253],  // elbow out from the body, fist off to the side
        RightForeArm: [-1.002, 1.7, 0],      // y twist turns the fist to face the viewer
        RightHand: [0, 0, -0.9],
        ...curledFingers('Right', 1.5, 1.1),  // closed fist
        RightHandThumb1: [0.2, 0, -0.3],      // thumb straight up
        RightHandThumb2: [0, 0, 0],
        RightHandThumb3: [0, 0, 0],
        LeftForeArm: [-0.15, 0, 0],          // other arm relaxed at the side
    },
    // Model stands on the left of the form: a friendly wave with an open palm toward
    // the visitor, other arm relaxed. The waving motion is the idle loop below.
    'contact-section': {
        Neck: [0.1, 0.2, 0.05],
        RightArm: [0.5, 0, 0],
        RightForeArm: [-2.4, 1.3, 0],      // y twist: palm to the viewer, thumb toward the head
        RightHand: [0, 0, 0.2],
        ...curledFingers('Right', 0.05, 0.05),
        RightHandIndex1: [0.05, 0, 0.12],   // fan the fingers slightly
        RightHandPinky1: [0.05, 0, -0.15],
        LeftForeArm: [-0.15, 0, 0],
    },
};

// Looping motion layered on a section's pose once it has settled
const IDLE_LOOPS: Partial<Record<SectionId, { bone: string; to: Partial<Record<'x' | 'y' | 'z', number>>; duration: number }>> = {
    // Swing the raised forearm side to side on its elbow hinge
    'contact-section': { bone: 'RightForeArm', to: { x: -1.95 }, duration: 0.5 },
};

const MANAGED_BONES = Array.from(new Set([
    ...Object.keys(NEUTRAL_POSE),
    ...Object.values(POSES).flatMap((pose) => Object.keys(pose)),
]));

const boneDuration = (name: string) =>
    name === 'Neck' ? 1 : name === 'Spine' ? 1.4 : name.includes('Hand') ? 0.8 : 1.2;

export function Model(props: JSX.IntrinsicElements['group']) {

    const groupRef = useRef<Group<Object3DEventMap>>(null);
    // The 'nodes' object will be populated once the GLTF is loaded.
    const { nodes, materials } = useGLTF('/models/ihan.glb') as unknown as GLTFResult;

    // Pose the skeleton for whichever section is pinned, and run that section's idle loop
    useEffect(() => {
        const group = groupRef.current;
        if (!group) return;

        const bones = new Map<string, Object3D>();
        for (const name of MANAGED_BONES) {
            const bone = group.getObjectByName(name);
            if (!bone) continue;
            // Remember the rig's own rest rotation (fingers, hands) once per bone, so
            // bones a pose doesn't mention can be returned to it.
            if (!bone.userData.restRotation) {
                bone.userData.restRotation = [bone.rotation.x, bone.rotation.y, bone.rotation.z];
            }
            bones.set(name, bone);
        }

        let idleTween: gsap.core.Tween | null = null;
        const poseTweens = new Map<string, gsap.core.Tween>();

        const applyGesture = (sectionId: string, immediate = false) => {
            if (!(sectionId in POSES)) return;
            const pose = POSES[sectionId as SectionId];

            idleTween?.kill();
            idleTween = null;

            for (const [name, bone] of bones) {
                const [x, y, z] = pose[name] ?? NEUTRAL_POSE[name] ?? (bone.userData.restRotation as Vec3);
                const target = new Quaternion().setFromEuler(new Euler(x, y, z));
                // Stop a previous section's tween on this bone, otherwise fast
                // scrolling leaves several tweens fighting over it.
                poseTweens.get(name)?.kill();
                if (immediate) {
                    bone.quaternion.copy(target);
                    continue;
                }
                // Slerp rather than tweening Euler angles: poses like the crossed arms
                // are far apart in Euler terms, and interpolating those components
                // swings the arms through the body on the way.
                const start = bone.quaternion.clone();
                const progress = { t: 0 };
                poseTweens.set(name, gsap.to(progress, {
                    t: 1,
                    duration: boneDuration(name),
                    ease: 'power2.inOut',
                    onUpdate: () => { bone.quaternion.slerpQuaternions(start, target, progress.t); },
                }));
            }

            const idle = IDLE_LOOPS[sectionId as SectionId];
            const idleBone = idle && bones.get(idle.bone);
            if (idle && idleBone) {
                idleTween = gsap.to(idleBone.rotation, {
                    ...idle.to,
                    duration: idle.duration,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1,
                    // Start once the pose has settled
                    delay: immediate ? 0 : boneDuration(idle.bone),
                });
            }
        };

        const handleSectionPinned = (event: Event) => {
            applyGesture((event as CustomEvent<{ sectionId: string }>).detail.sectionId);
        };

        // Start in the hero pose, then catch up if a section was entered before the
        // model finished loading
        applyGesture('hero-section', true);
        const current = getCurrentSection();
        if (current) applyGesture(current, true);

        window.addEventListener(SECTION_PINNED_EVENT, handleSectionPinned);
        return () => {
            window.removeEventListener(SECTION_PINNED_EVENT, handleSectionPinned);
            idleTween?.kill();
            poseTweens.forEach((tween) => tween.kill());
        };
    }, [nodes]);

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
