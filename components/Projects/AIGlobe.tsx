"use client";

import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Shared audio data store (mutable, read by useFrame) ─────────────
const audioStore = {
  data: new Float32Array(64),
  isActive: false,
  volume: 0,
  bass: 0,
  mid: 0,
  treble: 0,
};

// ─── Simplex 3D noise GLSL ──────────────────────────────────────────
const noise3D = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// ─── Vertex Shader ───────────────────────────────────────────────────
const vertexShader = /* glsl */ `
${noise3D}

uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;
uniform float uBassImpact;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDisplacement;
varying float vElevation;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vWorldPos = worldPos;

  // Breathing: slow, organic undulation
  float breath = sin(uTime * 1.5) * 0.5 + 0.5;
  float breathAmp = uAmplitude * (0.7 + breath * 0.6);

  // Layered noise
  float n1 = snoise(position * uFrequency + uTime * uSpeed) * breathAmp;
  float n2 = snoise(position * uFrequency * 2.3 + uTime * uSpeed * 1.7) * breathAmp * 0.4;
  float n3 = snoise(position * uFrequency * 5.0 + uTime * uSpeed * 0.5) * breathAmp * 0.15;

  // Bass-driven spiky deformation for talking
  float bassSpike = snoise(position * 3.0 + uTime * 2.0) * uBassImpact;

  float displacement = n1 + n2 + n3 + bassSpike;
  vDisplacement = displacement;
  vElevation = length(position) + displacement;

  vec3 newPosition = position + normal * displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

// ─── Fragment Shader ─────────────────────────────────────────────────
const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uGlowIntensity;
uniform float uColorShift;
uniform float uPulseIntensity;
uniform vec3 uBaseColor;
uniform vec3 uRimColor;
uniform vec3 uActiveColor;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDisplacement;
varying float vElevation;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);

  // Dynamic core color
  vec3 coreColor = mix(uBaseColor, uActiveColor, uColorShift);

  // Multi-layered breathing pulse
  float pulse1 = sin(uTime * 1.8) * 0.12 + 0.88;
  float pulse2 = sin(uTime * 3.1 + 1.5) * 0.06 + 0.94;
  float pulse = pulse1 * pulse2 * uPulseIntensity;

  // Inner energy veins
  float veins = abs(sin(vDisplacement * 15.0 + uTime * 2.0)) * 0.3;
  vec3 veinColor = vec3(0.4, 0.5, 1.0) * veins * (0.5 + uColorShift * 1.5);

  // Core
  vec3 color = coreColor * pulse;

  // Displacement-driven highlights
  float dispHighlight = smoothstep(0.0, 0.3, abs(vDisplacement));
  color += vec3(0.2, 0.35, 0.9) * dispHighlight * 0.8;

  // Veins
  color += veinColor;

  // Rim glow
  color += uRimColor * fresnel * uGlowIntensity;

  // Hot spots during talking
  float hotspot = smoothstep(0.15, 0.35, abs(vDisplacement)) * uColorShift;
  color += vec3(0.6, 0.3, 1.0) * hotspot * 0.5;

  // Iridescence
  float iri = sin(fresnel * 8.0 + uTime * 1.5) * 0.06;
  color += vec3(iri, iri * 0.3, -iri * 0.5);

  // Alpha: translucent center, opaque rim, brighter when active
  float alpha = 0.5 + fresnel * 0.5 + uColorShift * 0.15;

  gl_FragColor = vec4(color, alpha);
}
`;

// ─── Globe Mesh (reads from audioStore directly) ─────────────────────
const GlobeMesh: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAmplitude: { value: 0.2 },
    uFrequency: { value: 1.8 },
    uSpeed: { value: 0.5 },
    uBassImpact: { value: 0.0 },
    uGlowIntensity: { value: 1.5 },
    uColorShift: { value: 0.0 },
    uPulseIntensity: { value: 1.0 },
    uBaseColor: { value: new THREE.Color('#12124a') },
    uRimColor: { value: new THREE.Color('#8B9AEF') },
    uActiveColor: { value: new THREE.Color('#7C4DFF') },
  }), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    const u = mat.uniforms;

    u.uTime.value += delta;

    // Organic rotation
    meshRef.current.rotation.y += delta * 0.12;
    meshRef.current.rotation.x = Math.sin(u.uTime.value * 0.25) * 0.08;
    meshRef.current.rotation.z = Math.cos(u.uTime.value * 0.18) * 0.04;

    if (audioStore.isActive) {
      const { bass, mid, treble, volume } = audioStore;

      // Smooth toward audio-reactive targets
      const s = 0.15;
      u.uAmplitude.value += ((0.15 + volume * 0.8) - u.uAmplitude.value) * s;
      u.uFrequency.value += ((1.8 + treble * 4.0) - u.uFrequency.value) * s;
      u.uBassImpact.value += ((bass * 0.6) - u.uBassImpact.value) * s;
      u.uGlowIntensity.value += ((1.5 + volume * 3.5) - u.uGlowIntensity.value) * s;
      u.uColorShift.value += ((Math.min(volume * 2.5, 1.0)) - u.uColorShift.value) * s;
      u.uSpeed.value += (1.2 - u.uSpeed.value) * s;
      u.uPulseIntensity.value += ((1.0 + mid * 0.8) - u.uPulseIntensity.value) * s;
    } else {
      // Breathing idle
      const s = 0.04;
      u.uAmplitude.value += (0.2 - u.uAmplitude.value) * s;
      u.uFrequency.value += (1.8 - u.uFrequency.value) * s;
      u.uBassImpact.value += (0.0 - u.uBassImpact.value) * s;
      u.uGlowIntensity.value += (1.5 - u.uGlowIntensity.value) * s;
      u.uColorShift.value += (0.0 - u.uColorShift.value) * s;
      u.uSpeed.value += (0.5 - u.uSpeed.value) * s;
      u.uPulseIntensity.value += (1.0 - u.uPulseIntensity.value) * s;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.3, 80]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
};

// ─── Particle Halo ───────────────────────────────────────────────────
const ParticleHalo: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.7 + Math.random() * 0.6;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.06;
    pointsRef.current.rotation.x += delta * 0.03;

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    const targetOpacity = audioStore.isActive ? 0.9 : 0.35;
    const targetSize = audioStore.isActive ? 0.03 + audioStore.volume * 0.04 : 0.02;
    mat.opacity += (targetOpacity - mat.opacity) * 0.08;
    mat.size += (targetSize - mat.size) * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#8B9AEF"
        size={0.02}
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// ─── Inner Glow Sphere ───────────────────────────────────────────────
const InnerGlow: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    const t = performance.now() * 0.001;
    const breathe = Math.sin(t * 1.5) * 0.15 + 0.35;
    const active = audioStore.isActive ? audioStore.volume * 0.4 : 0;
    mat.opacity += ((breathe + active) - mat.opacity) * 0.1;

    const scale = 0.92 + Math.sin(t * 2.0) * 0.03 + (audioStore.isActive ? audioStore.bass * 0.1 : 0);
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.25, 32, 32]} />
      <meshBasicMaterial
        color="#3F51B5"
        transparent
        opacity={0.3}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// ─── Main AIGlobe Component ──────────────────────────────────────────
interface AIGlobeProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isActive: boolean;
}

const AIGlobe: React.FC<AIGlobeProps> = ({ audioRef, isActive }) => {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animFrameRef = useRef<number>(0);

  // Update shared store
  useEffect(() => {
    audioStore.isActive = isActive;
  }, [isActive]);

  // Setup Web Audio API analyser
  const setupAnalyser = useCallback(() => {
    if (!audioRef.current) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (!sourceRef.current) {
        sourceRef.current = ctx.createMediaElementSource(audioRef.current);
      }

      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.75;
      }

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);

      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    } catch (err) {
      console.warn('Audio setup failed:', err);
    }
  }, [audioRef]);

  // Animation loop for audio data
  useEffect(() => {
    if (!isActive) {
      audioStore.bass = 0;
      audioStore.mid = 0;
      audioStore.treble = 0;
      audioStore.volume = 0;
      return;
    }

    setupAnalyser();

    const update = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
        const len = dataArrayRef.current.length;

        // Normalize byte data (0-255) to 0-1
        let bass = 0, mid = 0, treble = 0;
        const bassEnd = Math.floor(len * 0.15);
        const midEnd = Math.floor(len * 0.5);

        for (let i = 0; i < bassEnd; i++) bass += dataArrayRef.current[i];
        for (let i = bassEnd; i < midEnd; i++) mid += dataArrayRef.current[i];
        for (let i = midEnd; i < len; i++) treble += dataArrayRef.current[i];

        bass = bass / (bassEnd * 255);
        mid = mid / ((midEnd - bassEnd) * 255);
        treble = treble / ((len - midEnd) * 255);

        audioStore.bass = bass;
        audioStore.mid = mid;
        audioStore.treble = treble;
        audioStore.volume = (bass * 0.5 + mid * 0.35 + treble * 0.15);
      }
      animFrameRef.current = requestAnimationFrame(update);
    };

    update();

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive, setupAnalyser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      audioStore.isActive = false;
    };
  }, []);

  return (
    <div className="globe-container" style={{ width: '100%', height: '160px' }}>
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('[AIGlobe] WebGL context lost — preventing default.');
          });
          canvas.addEventListener('webglcontextrestored', () => {
            console.info('[AIGlobe] WebGL context restored.');
          });
        }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[3, 3, 4]} intensity={0.6} color="#8B9AEF" />
        <pointLight position={[-3, -2, -4]} intensity={0.4} color="#3F51B5" />
        <pointLight position={[0, 4, 0]} intensity={0.2} color="#7C4DFF" />
        <InnerGlow />
        <GlobeMesh />
        <ParticleHalo />
      </Canvas>
    </div>
  );
};

export default AIGlobe;
