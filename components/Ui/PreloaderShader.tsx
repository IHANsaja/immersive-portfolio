"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const InteractiveSwarm = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const { viewport } = useThree();

    // Generate a dense field of particles
    const particles = useMemo(() => {
        const count = 12000;
        const positions = new Float32Array(count * 3);
        const randoms = new Float32Array(count);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Spread across a wider 2D-ish plane with slight depth
            positions[i * 3] = (Math.random() - 0.5) * 40;     // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 5;  // z

            randoms[i] = Math.random();
            sizes[i] = Math.random() * 2.0 + 1.0;
        }

        return { positions, randoms, sizes };
    }, []);

    // Highly interactive Shader Material
    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector3(0, 0, 0) },
            uPixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio : 1 }
        },
        vertexShader: `
            uniform float uTime;
            uniform vec3 uMouse;
            uniform float uPixelRatio;
            
            attribute float aRandom;
            attribute float aSize;
            
            varying float vAlpha;
            varying vec3 vColor;
            
            void main() {
                vec3 pos = position;
                vec3 originalPos = position;
                
                // Ambient slow float
                pos.x += sin(uTime * 0.3 + aRandom * 20.0) * 0.5;
                pos.y += cos(uTime * 0.4 + aRandom * 20.0) * 0.5;
                
                // Calculate distance to mouse
                float dist = distance(pos.xy, uMouse.xy);
                
                // Highly interactive vortex/repulsion effect
                float maxDist = 8.0;
                float influence = 1.0 - smoothstep(0.0, maxDist, dist);
                
                if(influence > 0.0) {
                    // Repel outwards from mouse
                    vec2 dir = normalize(pos.xy - uMouse.xy);
                    // Add a swirling vortex effect
                    vec2 swirl = vec2(-dir.y, dir.x);
                    
                    float strength = pow(influence, 2.0) * 3.0; // Explosion strength
                    
                    pos.xy += dir * strength;
                    pos.xy += swirl * (strength * 1.5);
                    pos.z += influence * 4.0; // Lift towards camera
                }
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // Dynamic sizing based on mouse proximity and depth
                float sizeBoost = influence * 8.0;
                gl_PointSize = (aSize + sizeBoost) * uPixelRatio * (20.0 / -mvPosition.z);
                
                // Dynamic alpha based on influence
                vAlpha = 0.15 + (influence * 0.85);
                
                // Color transition from slate-blue to bright cyan near the mouse
                vec3 baseColor = mix(vec3(0.1, 0.15, 0.3), vec3(0.545, 0.604, 0.937), aRandom); // Dark to Slate Blue
                vec3 activeColor = vec3(0.275, 0.627, 0.976); // Bright Cyan
                
                vColor = mix(baseColor, activeColor, influence * 1.5);
            }
        `,
        fragmentShader: `
            varying float vAlpha;
            varying vec3 vColor;
            
            void main() {
                // Soft glowing circle
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                float r = dot(cxy, cxy);
                if (r > 1.0) discard;
                
                float strength = 1.0 - r;
                strength = pow(strength, 2.0);
                
                gl_FragColor = vec4(vColor, vAlpha * strength);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), []);

    // Target mouse position for smooth interpolation
    const targetMouse = useRef(new THREE.Vector2(0, 0));

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Convert to normalized device coordinates (-1 to +1)
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Map to world coordinates based on viewport size
            targetMouse.current.set(
                (x * viewport.width) / 2,
                (y * viewport.height) / 2
            );
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [viewport]);

    useFrame(({ clock }) => {
        if (pointsRef.current) {
            shaderMaterial.uniforms.uTime.value = clock.getElapsedTime();
            
            // Fast lerp for snappy but smooth mouse interaction
            shaderMaterial.uniforms.uMouse.value.x += (targetMouse.current.x - shaderMaterial.uniforms.uMouse.value.x) * 0.15;
            shaderMaterial.uniforms.uMouse.value.y += (targetMouse.current.y - shaderMaterial.uniforms.uMouse.value.y) * 0.15;
        }
    });

    return (
        <points ref={pointsRef} material={shaderMaterial}>
            <bufferGeometry>
                {/* @ts-expect-error - BufferAttribute types are tricky in R3F */}
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.positions.length / 3}
                    array={particles.positions}
                    itemSize={3}
                />
                {/* @ts-expect-error - BufferAttribute types are tricky in R3F */}
                <bufferAttribute
                    attach="attributes-aRandom"
                    count={particles.randoms.length}
                    array={particles.randoms}
                    itemSize={1}
                />
                {/* @ts-expect-error - BufferAttribute types are tricky in R3F */}
                <bufferAttribute
                    attach="attributes-aSize"
                    count={particles.sizes.length}
                    array={particles.sizes}
                    itemSize={1}
                />
            </bufferGeometry>
        </points>
    );
};

const PreloaderShader = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-auto bg-[#070A1E]">
            <Canvas
                camera={{ position: [0, 0, 15], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                <InteractiveSwarm />
            </Canvas>
        </div>
    );
};

export default PreloaderShader;
