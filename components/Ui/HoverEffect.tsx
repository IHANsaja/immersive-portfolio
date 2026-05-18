"use client";

import React, { useRef, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap"; // Import GSAP for the animation

// Helper: create an offscreen Frame Buffer Object (FBO)
function makeFBO(res: number) {
    return new THREE.WebGLRenderTarget(res, res, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        depthBuffer: false,
        stencilBuffer: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
    });
}

// --- GPU Trail Simulation Shader (No changes needed) ---
const TrailSimShader = {
    uniforms: {
        uPrev:      { value: null as THREE.Texture | null },
        uMouse:     { value: new THREE.Vector2() },
        uIntensity: { value: 1.0 },
        uRadius:    { value: 0.02 },
        uDiss:      { value: 0.98 },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uPrev;
    uniform vec2 uMouse;
    uniform float uIntensity;
    uniform float uRadius;
    uniform float uDiss;

    void main() {
      vec4 prev = texture2D(uPrev, vUv);
      float d = distance(vUv, uMouse);
      float add = uIntensity * exp(- (d * d) / (uRadius * uRadius));
      gl_FragColor = vec4(prev.rgb * uDiss, prev.a * uDiss + add);
    }
  `
};

// --- Display Shader (MODIFIED to accept two trail textures) ---
const TrailDisplayShader = {
    uniforms: {
        uTexture:           { value: null as THREE.Texture | null }, // Mouse trail
        uAutoTexture:       { value: null as THREE.Texture | null }, // NEW: Automatic trail
        uBackground:        { value: null as THREE.Texture | null },
        uMouse:             { value: new THREE.Vector2() },
        uAlpha:             { value: 0.3 },
        uBlur:              { value: 0.002 },
        uDisplacementScale: { value: 0.05 },
        uTime:              { value: 0.0 },
        uShatterScale:      { value: 50.0 },
        uShatterStrength:   { value: 0.1 },
        uDragStrength:      { value: 1.5 },
        uMouseVelocity:     { value: new THREE.Vector2() },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform sampler2D uAutoTexture; // NEW uniform for the automatic trail
    uniform sampler2D uBackground;
    uniform vec2 uMouse;
    uniform float uAlpha;
    uniform float uBlur;
    uniform float uDisplacementScale;
    
    uniform float uTime;
    uniform float uShatterScale;
    uniform float uShatterStrength;

    uniform float uDragStrength;
    uniform vec2 uMouseVelocity;

    vec2 random2(vec2 p) {
        return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
    }

    vec2 shatter(vec2 uv) {
        vec2 p = floor(uv);
        vec2 f = fract(uv);
        float min_dist = 1.0;
        vec2 final_offset = vec2(0.0);

        for (int j = -1; j <= 1; j++) {
            for (int i = -1; i <= 1; i++) {
                vec2 neighbor = vec2(float(i), float(j));
                vec2 point_pos = random2(p + neighbor);
                point_pos = 0.5 + 0.5 * sin(uTime * 0.5 + 6.2831 * point_pos);
                vec2 diff = neighbor + point_pos - f;
                float dist = length(diff);
                if (dist < min_dist) {
                    min_dist = dist;
                    final_offset = (point_pos - 0.5) * 0.3;
                }
            }
        }
        return final_offset;
    }

    void main() {
      // Blur the mouse trail texture
      vec4 sum = vec4(0.0);
      float count = 0.0;
      for (float x = -1.0; x <= 1.0; x++) {
        for (float y = -1.0; y <= 1.0; y++) {
          sum += texture2D(uTexture, vUv + vec2(x, y) * uBlur);
          count += 1.0;
        }
      }
      vec4 mouseTrailData = sum / count;

      // Sample the automatic trail texture
      vec4 autoTrailData = texture2D(uAutoTexture, vUv);

      // --- COMBINE TRAILS ---
      // Add the alpha values of both trails and clamp to 1.0
      float intensity = clamp(mouseTrailData.a + autoTrailData.a, 0.0, 1.0);

      if (intensity < 0.01) discard;

      vec2 dirToMouse = vUv - uMouse;
      vec2 shatterOffset = shatter(vUv * uShatterScale) * uShatterStrength;
      vec2 geometricDisplacement = ((dirToMouse * uDisplacementScale) + shatterOffset) * intensity;
      
      vec2 dragDisplacement = uMouseVelocity * uDragStrength * intensity;
      vec2 finalUv = vUv + geometricDisplacement - dragDisplacement;
      vec4 finalBgColor = texture2D(uBackground, finalUv);

      gl_FragColor = vec4(finalBgColor.rgb, finalBgColor.a * (1.0 - intensity * uAlpha));
    }
  `
};

// This new component manages BOTH trail simulations and the final display
function GPUTrailManager({ backgroundTexture }: { backgroundTexture: THREE.Texture }) {
    const config = useMemo(() => ({
        resolution: 256, // Reduced from 512 for better performance
        // Mouse trail settings
        mouseRadius: 0.02,
        mouseIntensity: 0.15, // Reduced intensity
        mouseDissipation: 0.96,
        lag: 0.05,
        // Auto trail settings
        autoRadius: 0.015,
        autoIntensity: 0.1, // Reduced intensity
        autoDissipation: 0.97,
        // Display settings
        alpha: 0.6, // Reduced alpha for less GPU load
        blur: 0.003, // Slightly increased blur to compensate for lower resolution
        displacementScale: 0.03, // Reduced displacement
        shatterScale: 150, // Reduced shatter scale
        shatterStrength: 0.3, // Reduced shatter strength
        dragStrength: 3, // Reduced drag strength
    }), []);

    // --- State for MOUSE trail ---
    const mouseFboA = useMemo(() => makeFBO(config.resolution), [config.resolution]);
    const mouseFboB = useMemo(() => makeFBO(config.resolution), [config.resolution]);
    const mousePing = useRef(true);
    const realMouse = useRef(new THREE.Vector2());
    const simulatedMouse = useRef(new THREE.Vector2());
    const prevSimulatedMouse = useRef(new THREE.Vector2());
    const velocity = useRef(new THREE.Vector2());

    // --- State for AUTO trail ---
    const autoFboA = useMemo(() => makeFBO(config.resolution), [config.resolution]);
    const autoFboB = useMemo(() => makeFBO(config.resolution), [config.resolution]);
    const autoPing = useRef(true);
    const autoTrailPoint = useRef(new THREE.Vector2()); // The point driven by GSAP

    // --- Common simulation scene and camera ---
    const simScene = useMemo(() => new THREE.Scene(), []);
    const simCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
    const simMesh = useMemo(() => new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), []);
    useMemo(() => simScene.add(simMesh), [simMesh, simScene]);

    // --- Mouse trail simulation material ---
    const mouseSimMat = useMemo(() => {
        const mat = new THREE.ShaderMaterial({ ...TrailSimShader });
        mat.uniforms.uIntensity.value = config.mouseIntensity;
        mat.uniforms.uRadius.value = config.mouseRadius;
        mat.uniforms.uDiss.value = config.mouseDissipation;
        return mat;
    }, [config]);

    // --- Auto trail simulation material ---
    const autoSimMat = useMemo(() => {
        const mat = new THREE.ShaderMaterial({ ...TrailSimShader });
        mat.uniforms.uIntensity.value = config.autoIntensity;
        mat.uniforms.uRadius.value = config.autoRadius;
        mat.uniforms.uDiss.value = config.autoDissipation;
        return mat;
    }, [config]);

    // --- Final Display Material (receives both textures) ---
    const dispMat = useMemo(() => {
        const mat = new THREE.ShaderMaterial({ ...TrailDisplayShader, transparent: true });
        mat.uniforms.uAlpha.value = config.alpha;
        mat.uniforms.uBlur.value = config.blur;
        mat.uniforms.uDisplacementScale.value = config.displacementScale;
        mat.uniforms.uShatterScale.value = config.shatterScale;
        mat.uniforms.uShatterStrength.value = config.shatterStrength;
        mat.uniforms.uDragStrength.value = config.dragStrength;
        mat.uniforms.uBackground.value = backgroundTexture;
        return mat;
    }, [config, backgroundTexture]);

    // --- Event Listeners and Animations ---

    // Mouse move listener
    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            realMouse.current.x = e.clientX / window.innerWidth;
            realMouse.current.y = 1 - e.clientY / window.innerHeight;
        };
        document.addEventListener('pointermove', onMove, { capture: true, passive: true });
        return () => document.removeEventListener('pointermove', onMove, { capture: true });
    }, []);

    // Automatic trail GSAP animation loop
    useEffect(() => {
        const autoMove = () => {
            const start = { x: Math.random(), y: Math.random() };
            let end = { x: Math.random(), y: Math.random() };

            // Ensure start and end points are not too close
            while (Math.hypot(end.x - start.x, end.y - start.y) < 0.3) {
                end = { x: Math.random(), y: Math.random() };
            }

            gsap.to(start, {
                delay: Math.random() * 1.5,
                x: end.x,
                y: end.y,
                duration: Math.random() * 2 + 1.5,
                ease: 'power2.inOut',
                onUpdate: () => {
                    // Update the ref with the current animated position
                    autoTrailPoint.current.set(start.x, start.y);
                },
                onComplete: autoMove // Loop the animation
            });
        };
        autoMove(); // Start the first animation
    }, []);


    // Frame rate limiting
    const lastFrameTime = useRef(0);
    const targetFPS = 30; // Limit to 30 FPS for better performance
    const frameInterval = 1000 / targetFPS;

    // --- Render Loop ---
    useFrame(({ gl }, delta) => {
        const now = performance.now();
        
        // Skip frame if not enough time has passed
        if (now - lastFrameTime.current < frameInterval) {
            return;
        }
        
        lastFrameTime.current = now;

        // --- 1. MOUSE TRAIL SIMULATION ---
        prevSimulatedMouse.current.copy(simulatedMouse.current);
        simulatedMouse.current.lerp(realMouse.current, config.lag);
        velocity.current.subVectors(simulatedMouse.current, prevSimulatedMouse.current);

        const mouseRead = mousePing.current ? mouseFboA : mouseFboB;
        const mouseWrite = mousePing.current ? mouseFboB : mouseFboA;
        mousePing.current = !mousePing.current;

        // Run sim for mouse
        simMesh.material = mouseSimMat;
        mouseSimMat.uniforms.uPrev.value = mouseRead.texture;
        mouseSimMat.uniforms.uMouse.value.copy(simulatedMouse.current);
        gl.setRenderTarget(mouseWrite);
        gl.render(simScene, simCam);

        // --- 2. AUTO TRAIL SIMULATION ---
        const autoRead = autoPing.current ? autoFboA : autoFboB;
        const autoWrite = autoPing.current ? autoFboB : autoFboA;
        autoPing.current = !autoPing.current;

        // Run sim for auto trail
        simMesh.material = autoSimMat;
        autoSimMat.uniforms.uPrev.value = autoRead.texture;
        autoSimMat.uniforms.uMouse.value.copy(autoTrailPoint.current);
        gl.setRenderTarget(autoWrite);
        gl.render(simScene, simCam);

        // --- 3. FINAL RENDER (to screen) ---
        gl.setRenderTarget(null);

        dispMat.uniforms.uTexture.value = mouseWrite.texture; // Pass mouse trail
        dispMat.uniforms.uAutoTexture.value = autoWrite.texture; // Pass auto trail
        dispMat.uniforms.uTime.value += delta;
        dispMat.uniforms.uMouseVelocity.value.copy(velocity.current);
        dispMat.uniforms.uMouse.value.copy(simulatedMouse.current);
    });

    return <mesh geometry={new THREE.PlaneGeometry(2, 2)} material={dispMat} />;
}

// This component now just loads the texture and renders the manager
function GPUTrailContainer() {
    const loader = useMemo(() => new THREE.TextureLoader(), []);
    const backgroundTexture = useMemo(() => {
        const tex = loader.load('/background.png');
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        return tex;
    }, [loader]);

    // Use the new manager component
    return backgroundTexture ? <GPUTrailManager backgroundTexture={backgroundTexture} /> : null;
}

// The final export component remains the same
export default function GPUTrailCanvas() {
    return (
        <Canvas
            orthographic
            camera={{ zoom: 1, position: [0, 0, 1] }}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => {
                const canvas = gl.domElement;
                canvas.addEventListener('webglcontextlost', (e) => {
                    e.preventDefault();
                    console.warn('[GPUTrailCanvas] WebGL context lost — preventing default.');
                });
                canvas.addEventListener('webglcontextrestored', () => {
                    console.info('[GPUTrailCanvas] WebGL context restored.');
                });
            }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9997
            }}
            className="hidden md:block"
        >
            <Suspense fallback={null}>
                <GPUTrailContainer />
            </Suspense>
        </Canvas>
    );
}