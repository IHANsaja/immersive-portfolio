"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MinimalGrid = () => {
    const pointsRef = useRef<THREE.Points>(null);

    // Generate a structured grid of points
    const particles = useMemo(() => {

        const rows = 40;
        const cols = 40;
        const count = rows * cols;

        const positions = new Float32Array(count * 3);
        const randoms = new Float32Array(count);

        let i = 0;
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                // Center the grid
                const u = (x / cols) * 20 - 10;
                const v = (y / rows) * 20 - 10;

                positions[i * 3] = u;
                positions[i * 3 + 1] = v;
                positions[i * 3 + 2] = 0;

                randoms[i] = Math.random();
                i++;
            }
        }

        return { positions, randoms };
    }, []);

    // Shader Material
    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector3(0, 0, 0) },
            uColor: { value: new THREE.Color("#f0dbee") },
            uPixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio : 1 }
        },
        vertexShader: `
            uniform float uTime;
            uniform vec3 uMouse;
            uniform float uPixelRatio;
            attribute float aRandom;
            
            varying float vAlpha;
            
            void main() {
                vec3 pos = position;
                
                // Subtle breathing movement
                pos.z += sin(uTime * 0.5 + pos.x * 0.5 + pos.y * 0.5) * 0.2;
                
                // Mouse Interaction (Spotlight)
                vec3 mousePos = vec3(uMouse.x * 10.0, uMouse.y * 10.0, 0.0); // Scale to world space
                float dist = distance(pos.xy, mousePos.xy);
                
                // Spotlight radius
                float radius = 3.0;
                float influence = smoothstep(radius, 0.0, dist);
                
                // Scale up dots near mouse
                float size = 2.0 + influence * 4.0;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                gl_PointSize = size * uPixelRatio;
                gl_PointSize *= (10.0 / -mvPosition.z);
                
                // Calculate alpha: very faint base + strong highlight
                vAlpha = 0.05 + influence * 0.4;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            varying float vAlpha;
            
            void main() {
                // Circular particle
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                float r = dot(cxy, cxy);
                if (r > 1.0) discard;
                
                gl_FragColor = vec4(uColor, vAlpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), []);

    useFrame(({ clock, mouse }) => {
        if (pointsRef.current) {
            shaderMaterial.uniforms.uTime.value = clock.getElapsedTime();
            // Smoothly interpolate mouse - slower lerp for "water-like" flow
            shaderMaterial.uniforms.uMouse.value.lerp(new THREE.Vector3(mouse.x, mouse.y, 0), 0.02);
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
            </bufferGeometry>
        </points>
    );
};

const PreloaderShader = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                <MinimalGrid />
            </Canvas>
        </div>
    );
};

export default PreloaderShader;
