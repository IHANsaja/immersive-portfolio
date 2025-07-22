"use client";

import React, { useRef, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

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

// --- GPU Trail Simulation Shader ---
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

// --- Display Shader ---
const TrailDisplayShader = {
    uniforms: {
        uTexture:    { value: null as THREE.Texture | null },
        uBackground: { value: null as THREE.Texture | null },
        uMouse:      { value: new THREE.Vector2() },
        uAlpha:      { value: 0.3 },
        uBlur:       { value: 0.002 },
        uDisplacementScale: { value: 0.05 },
        uTime:           { value: 0.0 },
        uShatterScale:   { value: 50.0 },
        uShatterStrength:{ value: 0.1 },
        uDragStrength:   { value: 1.5 },
        uMouseVelocity:  { value: new THREE.Vector2() },
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
      vec4 sum = vec4(0.0);
      float count = 0.0;
      for (float x = -1.0; x <= 1.0; x++) {
        for (float y = -1.0; y <= 1.0; y++) {
          sum += texture2D(uTexture, vUv + vec2(x, y) * uBlur);
          count += 1.0;
        }
      }

      vec4 trailData = sum / count;
      if (trailData.a < 0.01) discard;

      float intensity = trailData.a;
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

function GPUTrail({ backgroundTexture }: { backgroundTexture: THREE.Texture }) {
    const config = useMemo(() => ({
        resolution: 512,
        radius: 0.02,
        intensity: 0.2,
        dissipation: 0.96,
        lag: 0.05,
        alpha: 0.8,
        blur: 0.002,
        displacementScale: 0.05,
        shatterScale: 200,
        shatterStrength: 0.5,
        dragStrength: 5,
    }), []);

    const fboA = useMemo(() => makeFBO(config.resolution), [config.resolution]);
    const fboB = useMemo(() => makeFBO(config.resolution), [config.resolution]);
    const ping = useRef(true);

    const simScene  = useMemo(() => new THREE.Scene(), []);
    const simCam    = useMemo(() => new THREE.OrthographicCamera(-1,1,1,-1,0,1), []);

    // Track mouse globally
    const realMouse          = useRef(new THREE.Vector2());
    const simulatedMouse     = useRef(new THREE.Vector2());
    const prevSimulatedMouse = useRef(new THREE.Vector2());
    const velocity           = useRef(new THREE.Vector2());

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            realMouse.current.x = e.clientX / window.innerWidth;
            realMouse.current.y = 1 - e.clientY / window.innerHeight;
        };
        document.addEventListener('pointermove', onMove, { capture: true, passive: true });
        return () => document.removeEventListener('pointermove', onMove, { capture: true });
    }, []);

    const simMat = useMemo(() => {
        const mat = new THREE.ShaderMaterial({ ...TrailSimShader });
        mat.uniforms.uIntensity.value = config.intensity;
        mat.uniforms.uRadius.value    = config.radius;
        mat.uniforms.uDiss.value      = config.dissipation;
        return mat;
    }, [config]);

    useMemo(() => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), simMat);
        simScene.add(mesh);
    }, [simMat, simScene]);

    const dispMat = useMemo(() => {
        const mat = new THREE.ShaderMaterial({ ...TrailDisplayShader, transparent: true });
        mat.uniforms.uAlpha.value = config.alpha;
        mat.uniforms.uBlur.value  = config.blur;
        mat.uniforms.uDisplacementScale.value = config.displacementScale;
        mat.uniforms.uShatterScale.value = config.shatterScale;
        mat.uniforms.uShatterStrength.value = config.shatterStrength;
        mat.uniforms.uDragStrength.value = config.dragStrength;
        mat.uniforms.uBackground.value = backgroundTexture;
        return mat;
    }, [config, backgroundTexture]);

    useFrame(({ gl }, delta) => {
        prevSimulatedMouse.current.copy(simulatedMouse.current);
        simulatedMouse.current.lerp(realMouse.current, config.lag);
        velocity.current.subVectors(simulatedMouse.current, prevSimulatedMouse.current);

        const read = ping.current ? fboA : fboB;
        const write = ping.current ? fboB : fboA;
        ping.current = !ping.current;

        simMat.uniforms.uPrev.value = read.texture;
        simMat.uniforms.uMouse.value.copy(simulatedMouse.current);
        gl.setRenderTarget(write);
        gl.render(simScene, simCam);
        gl.setRenderTarget(null);

        dispMat.uniforms.uTexture.value = write.texture;
        dispMat.uniforms.uTime.value += delta;
        dispMat.uniforms.uMouseVelocity.value.copy(velocity.current);
        dispMat.uniforms.uMouse.value.copy(simulatedMouse.current);
    });

    return <mesh geometry={new THREE.PlaneGeometry(2,2)} material={dispMat} />;
}

function GPUTrailEffectWithBackground() {
    const loader = useMemo(() => new THREE.TextureLoader(), []);
    const backgroundTexture = useMemo(() => {
        const tex = loader.load('/background.jpg');
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        return tex;
    }, [loader]);

    return backgroundTexture ? <GPUTrail backgroundTexture={backgroundTexture} /> : null;
}

export default function GPUTrailCanvas() {
    return (
        <Canvas
            orthographic
            camera={{ zoom: 1, position: [0,0,1] }}
            gl={{ antialias: true, alpha: true }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9997  // send canvas behind page
            }}
        >
            <Suspense fallback={null}>
                <GPUTrailEffectWithBackground />
            </Suspense>
        </Canvas>
    );
}
