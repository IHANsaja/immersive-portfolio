"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// The hero's "AI sphere" character, rebuilt in three.js from the original Spline scene
// (https://prod.spline.design/1z1FrReDGZG28VHJ). Sizes, camera, timings and behaviours
// are taken from that scene's data so the result matches it:
//
//   - Orthographic camera in pixel units (zoom 1.851), offset like Spline's camera.
//   - "Group 2": the blue ball (r=100) and a wobbly translucent shell (r=125).
//   - The face: two rounded eye bars that look at the cursor (Spline LookAt) and blink.
//   - Two particle emitters on the ball's surface, one pulled by an attractor, one by a
//     vortex.
//   - Interactions: the whole sphere follows the cursor horizontally (Spline Follow),
//     the eyes track it, pressing and holding the ball squeezes it to 70% (Spline
//     MousePress), and everything eases back when the pointer leaves.
//   - Breakpoints: 75% scale below 1024px wide, 50% below 600px (Spline Resize).

// ── Scene constants (from the Spline scene) ───────────────────────────────────
const ZOOM = 1.851;
const CAMERA_POS: [number, number, number] = [-10.31, 8.774, 1000];
const BALL_RADIUS = 100;
const SHELL_RADIUS = 124.86;
const EYE_W = 15;
const EYE_H = 35;
const EYE_Y = 9;
const EYE_Z = 106.5;
const EYES_X: [number, number] = [-19.76, 21.55];
const LOOK_DISTANCE = 500;      // cursor plane distance used for the eyes' look-at
const PRESS_SCALE = 0.7;
const BLINK_SCALE_Y = 0.264;
const BLINK_PERIOD = 5.4;       // 0.2s close + 0.2s open + 5s open hold
const PARTICLES_PER_EMITTER = 1000; // 500/s with a 2s life
const PARTICLE_RATE = 500;
const PARTICLE_LIFE = 2;
const PARTICLE_COLORS = [new THREE.Color(0.2, 0.438, 1), new THREE.Color(0.068, 1, 0.609)];

function breakpointScale(width: number) {
    if (width < 600) return 0.5;
    if (width < 1024) return 0.75;
    return 1;
}

// Frame-rate independent exponential approach
const damp = (current: number, target: number, rate: number, dt: number) =>
    current + (target - current) * (1 - Math.exp(-rate * dt));

// ── Shared pointer state, written by DOM events and read every frame ──────────
type PointerState = { x: number; y: number; inside: boolean; pressed: boolean };

// ── Shaders ───────────────────────────────────────────────────────────────────
const BALL_VERTEX = `
varying vec3 vViewNormal;
void main() {
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Layer stack from the Spline material: a blue depth gradient, a teal fresnel rim, a
// rotating reflection (matcap) and soft phong lighting, approximated in one pass.
const BALL_FRAGMENT = `
precision highp float;
varying vec3 vViewNormal;
uniform float uTime;
uniform float uExcite;   // 0..1 while the sphere is held

vec2 rotate2(vec2 v, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

void main() {
    vec3 n = normalize(vViewNormal);
    float facing = clamp(n.z, 0.0, 1.0);
    float rim = 1.0 - facing;

    vec3 royal = vec3(0.16, 0.17, 0.74);
    vec3 indigo = vec3(0.13, 0.13, 0.55);
    vec3 cyan = vec3(0.15, 0.62, 0.96);
    vec3 teal = vec3(0.16, 0.88, 0.76);

    // Depth gradient: deep royal blue facing the viewer, brighter blue toward the edge
    vec3 col = mix(royal, cyan, smoothstep(0.35, 1.0, rim) * 0.55);

    // The ball spins slowly (8s per turn in Spline); the lighter side turns with it
    vec2 spun = rotate2(n.xy, uTime * 6.2832 / 8.0);
    col = mix(col, cyan, smoothstep(0.15, 0.95, dot(spun, normalize(vec2(-1.0, 0.35)))) * 0.45);
    col = mix(col, indigo, smoothstep(0.3, 0.95, dot(spun, normalize(vec2(-0.6, -1.0)))) * 0.5);

    // Rotating reflection band (the matcap layer turns once every 5s)
    vec2 refl = rotate2(n.xy, uTime * 6.2832 / 5.0);
    float band = smoothstep(0.25, 0.0, abs(refl.y * 0.9 + refl.x * 0.35 - 0.35)) * facing;
    col += vec3(0.08, 0.16, 0.30) * band * 0.35;
    float blot = smoothstep(0.55, 0.15, length(refl - vec2(-0.45, -0.15))) * facing;
    col = mix(col, indigo * 0.85, blot * 0.45);

    // Fresnel rim in teal, strongest on the lower right
    float fresnel = clamp(0.1 + 2.0 * pow(rim, 2.2), 0.0, 1.0);
    float side = 0.55 + 0.45 * dot(n.xy, normalize(vec2(1.0, -0.9)));
    col = mix(col, teal, fresnel * clamp(side, 0.0, 1.0) * 0.9);

    // Soft lighting from the upper left
    float light = 0.8 + 0.2 * dot(n, normalize(vec3(-0.4, 0.5, 0.75)));
    col *= light;

    // Held: the rim glows brighter and the whole ball lights up a little
    col = mix(col, teal, fresnel * uExcite * 0.35);
    col *= 1.0 + 0.14 * uExcite;

    gl_FragColor = vec4(col, 1.0);
}
`;

const SHELL_VERTEX = `
uniform float uTime;
uniform float uExcite;   // 0..1 while the sphere is held
varying float vFacing;

// 3D value noise
float hash3(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash3(i + vec3(0,0,0)), hash3(i + vec3(1,0,0)), f.x),
                   mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x),
                   mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}

void main() {
    // Noise displacement along the normal (Spline: noise, scale 10, intensity 15),
    // flowing over time so the outline wobbles
    vec3 p = position * 0.016 + vec3(0.0, uTime * 0.35, uTime * 0.2);
    float n = noise3(p) * 0.65 + noise3(p * 2.1 + 7.0) * 0.35;
    vec3 displaced = position * (1.0 + 0.06 * uExcite)
                   + normal * (n - 0.5) * 2.0 * 15.0 * (1.0 + 1.2 * uExcite);
    vec3 viewNormal = normalize(normalMatrix * normal);
    vFacing = clamp(viewNormal.z, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

const SHELL_FRAGMENT = `
precision highp float;
varying float vFacing;
void main() {
    // White at ~10% opacity, a touch denser toward the edge like a soap film
    float alpha = 0.1 + 0.06 * (1.0 - vFacing);
    gl_FragColor = vec4(vec3(0.92, 0.94, 1.0), alpha);
}
`;

const PARTICLE_VERTEX = `
attribute float aLife;   // 1 at birth -> 0 at death
attribute vec3 aColor;
attribute float aScale;
varying float vLife;
varying vec3 vColor;
uniform float uPixelSize;
void main() {
    vLife = aLife;
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uPixelSize * aScale * aLife; // size fades out with life
}
`;

const PARTICLE_FRAGMENT = `
precision highp float;
varying float vLife;
varying vec3 vColor;
void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(vColor, soft * vLife); // fades out with life
}
`;

// ── Particles ─────────────────────────────────────────────────────────────────
type ForceType = "attractor" | "vortex";

// Cheap divergence-free-ish swirl field standing in for Spline's curl noise
function curl(x: number, y: number, z: number, t: number, out: THREE.Vector3) {
    const s = 0.02;
    out.set(
        Math.sin((y + t * 20) * s) + Math.cos((z - t * 13) * s * 1.3),
        Math.sin((z + t * 17) * s * 1.1) + Math.cos((x + t * 11) * s),
        Math.sin((x - t * 15) * s * 0.9) + Math.cos((y + t * 19) * s * 1.2),
    );
    return out;
}

function ParticleEmitter({ force, seed, excite }: { force: ForceType; seed: number; excite: { value: number } }) {
    const pointsRef = useRef<THREE.Points>(null);
    const count = PARTICLES_PER_EMITTER;

    const state = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const life = new Float32Array(count);       // remaining life in seconds (<=0 = dead)
        const lifeAttr = new Float32Array(count);   // normalised for the shader
        const colors = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        let rng = seed * 9973 + 1;
        const random = () => {
            rng = (rng * 16807) % 2147483647;
            return (rng - 1) / 2147483646;
        };
        return { positions, velocities, life, lifeAttr, colors, scales, random, cursor: 0, spawnDebt: 0 };
    }, [count, seed]);

    const geometry = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(state.positions, 3).setUsage(THREE.DynamicDrawUsage));
        g.setAttribute("aLife", new THREE.BufferAttribute(state.lifeAttr, 1).setUsage(THREE.DynamicDrawUsage));
        g.setAttribute("aColor", new THREE.BufferAttribute(state.colors, 3).setUsage(THREE.DynamicDrawUsage));
        g.setAttribute("aScale", new THREE.BufferAttribute(state.scales, 1).setUsage(THREE.DynamicDrawUsage));
        // Particles drift around the ball; keep them from being culled
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), BALL_RADIUS * 3);
        return g;
    }, [state]);

    const material = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: PARTICLE_VERTEX,
        fragmentShader: PARTICLE_FRAGMENT,
        uniforms: { uPixelSize: { value: 6.5 } },
        transparent: true,
        depthWrite: false,
    }), []);

    useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

    const tmp = useMemo(() => new THREE.Vector3(), []);

    useFrame(({ clock }, rawDt) => {
        const dt = Math.min(rawDt, 1 / 20);
        const t = clock.elapsedTime;
        const { positions: p, velocities: v, life, lifeAttr, colors, scales, random } = state;

        // Spawn: points on the ball surface, moving out along the normal at speed 10
        state.spawnDebt += PARTICLE_RATE * dt;
        while (state.spawnDebt >= 1) {
            state.spawnDebt -= 1;
            const i = state.cursor;
            state.cursor = (state.cursor + 1) % count;
            const u = random() * 2 - 1;
            const theta = random() * Math.PI * 2;
            const r = Math.sqrt(1 - u * u);
            const nx = r * Math.cos(theta), ny = r * Math.sin(theta), nz = u;
            // Just outside the surface, so the ball's own depth doesn't hide them
            const spawnR = BALL_RADIUS * 1.02;
            p[i * 3] = nx * spawnR; p[i * 3 + 1] = ny * spawnR; p[i * 3 + 2] = nz * spawnR;
            // Held: particles shoot out much faster
            const speed = 10 + 70 * excite.value;
            v[i * 3] = nx * speed; v[i * 3 + 1] = ny * speed; v[i * 3 + 2] = nz * speed;
            life[i] = PARTICLE_LIFE * (0.75 + 0.25 * random());
            const c = PARTICLE_COLORS[random() < 0.5 ? 0 : 1];
            colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
            scales[i] = 0.8 + 0.4 * random(); // randomScale 0.2
        }

        // Integrate: curl-noise drift + the emitter's force field, with damping
        const dampFactor = Math.pow(0.95, dt * 60);
        for (let i = 0; i < count; i++) {
            if (life[i] <= 0) { lifeAttr[i] = 0; continue; }
            life[i] -= dt;
            const ix = i * 3;
            const x = p[ix], y = p[ix + 1], z = p[ix + 2];
            curl(x, y, z, t, tmp);
            let ax = tmp.x * 1.282 * 20, ay = tmp.y * 1.282 * 20, az = tmp.z * 1.282 * 20;
            const len = Math.hypot(x, y, z) || 1;
            if (force === "attractor") {
                // Pull back toward the ball once particles drift past its surface
                // Held: the attractor lets go, so the particles burst into a cloud
                const pull = Math.max(0, len - BALL_RADIUS * 1.03) * 0.5 * 2.2 * (1 - 0.85 * excite.value);
                ax -= (x / len) * pull; ay -= (y / len) * pull; az -= (z / len) * pull;
            } else {
                // Swirl around the view axis
                const rxy = Math.hypot(x, y) || 1;
                const swirl = 0.5 * 60 * (1 + 2.5 * excite.value); // held: spin faster
                ax += (-y / rxy) * swirl; ay += (x / rxy) * swirl;
                const pull = Math.max(0, len - BALL_RADIUS * 1.05) * 0.6;
                ax -= (x / len) * pull; ay -= (y / len) * pull; az -= (z / len) * pull;
            }
            ay -= 1; // gravity 1
            v[ix] = (v[ix] + ax * dt) * dampFactor;
            v[ix + 1] = (v[ix + 1] + ay * dt) * dampFactor;
            v[ix + 2] = (v[ix + 2] + az * dt) * dampFactor;
            p[ix] = x + v[ix] * dt; p[ix + 1] = y + v[ix + 1] * dt; p[ix + 2] = z + v[ix + 2] * dt;
            lifeAttr[i] = Math.max(0, life[i] / PARTICLE_LIFE);
        }

        const g = pointsRef.current?.geometry;
        if (g) {
            g.attributes.position.needsUpdate = true;
            g.attributes.aLife.needsUpdate = true;
            g.attributes.aColor.needsUpdate = true;
            g.attributes.aScale.needsUpdate = true;
        }
    });

    return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} renderOrder={2} />;
}

// ── Eye geometry: a rounded bar ───────────────────────────────────────────────
function useEyeGeometry() {
    return useMemo(() => {
        const r = 5.5;
        const w = EYE_W, h = EYE_H;
        const s = new THREE.Shape();
        s.moveTo(-w / 2 + r, -h / 2);
        s.lineTo(w / 2 - r, -h / 2);
        s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
        s.lineTo(w / 2, h / 2 - r);
        s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
        s.lineTo(-w / 2 + r, h / 2);
        s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
        s.lineTo(-w / 2, -h / 2 + r);
        s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
        return new THREE.ShapeGeometry(s, 12);
    }, []);
}

// ── The character ─────────────────────────────────────────────────────────────
function SphereCharacter({ pointer, viewportWidth }: { pointer: React.RefObject<PointerState>; viewportWidth: number }) {
    const rootRef = useRef<THREE.Group>(null);
    const ballGroupRef = useRef<THREE.Group>(null);
    const lookRef = useRef<THREE.Group>(null);
    const blinkRef = useRef<THREE.Group>(null);
    const eyeGeometry = useEyeGeometry();
    const bubbleRef = useRef<HTMLDivElement>(null);
    // 0..1, eases in while the sphere is held; shared with the particle emitters
    const excite = useMemo(() => ({ value: 0 }), []);
    const shellTime = useRef(0);

    const ballMaterial = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: BALL_VERTEX,
        fragmentShader: BALL_FRAGMENT,
        uniforms: { uTime: { value: 0 }, uExcite: { value: 0 } },
    }), []);
    const shellMaterial = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: SHELL_VERTEX,
        fragmentShader: SHELL_FRAGMENT,
        uniforms: { uTime: { value: 0 }, uExcite: { value: 0 } },
        transparent: true,
        depthWrite: false,
    }), []);
    const eyeMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(0.9, 0.9, 0.93) }), []);

    useEffect(() => () => {
        ballMaterial.dispose(); shellMaterial.dispose(); eyeMaterial.dispose(); eyeGeometry.dispose();
    }, [ballMaterial, shellMaterial, eyeMaterial, eyeGeometry]);

    const motion = useRef({ scale: breakpointScale(viewportWidth), press: 1, lookX: 0, lookY: 0 });

    useFrame(({ clock }, rawDt) => {
        const dt = Math.min(rawDt, 1 / 20);
        const t = clock.elapsedTime;
        const root = rootRef.current, ball = ballGroupRef.current, look = lookRef.current, blink = blinkRef.current;
        if (!root || !ball || !look || !blink) return;
        const ptr = pointer.current;
        const m = motion.current;

        // Hold excitement eases in quickly and fades out a little slower
        excite.value = damp(excite.value, ptr.pressed ? 1 : 0, ptr.pressed ? 6 : 3, dt);
        const ex = excite.value;

        ballMaterial.uniforms.uTime.value = t;
        ballMaterial.uniforms.uExcite.value = ex;
        // The halo churns up to 3.5x faster while held (accumulated so it never jumps)
        shellTime.current += dt * (1 + 2.5 * ex);
        shellMaterial.uniforms.uTime.value = shellTime.current;
        shellMaterial.uniforms.uExcite.value = ex;

        // Breakpoint scale (Spline transitions it over ~1s)
        m.scale = damp(m.scale, breakpointScale(viewportWidth), 4, dt);
        root.scale.setScalar(m.scale);

        // Follow: slide horizontally toward the cursor, back to centre when it leaves
        const followTarget = ptr.inside ? ptr.x : 0;
        root.position.x = damp(root.position.x, followTarget, 2.2, dt);

        // Press and hold: squeeze to 70% quickly, ease back on release
        m.press = damp(m.press, ptr.pressed ? PRESS_SCALE : 1, ptr.pressed ? 9 : 4.5, dt);
        // Held: jelly squash-and-stretch on top of the squeeze, plus a little shake
        const jelly = Math.sin(t * 16) * 0.07 * ex;
        ball.scale.set(m.press * (1 + jelly), m.press * (1 - jelly), m.press);
        ball.rotation.z = Math.sin(t * 11) * 0.09 * ex;
        ball.position.x = Math.sin(t * 37) * 2.2 * ex;

        // Look-at: turn the face toward the cursor; ease back to centre when it leaves
        const dx = (ptr.x - root.position.x) / m.scale;
        const dy = (ptr.y - root.position.y) / m.scale;
        const targetX = ptr.inside ? THREE.MathUtils.clamp(-Math.atan2(dy, LOOK_DISTANCE), -0.6, 0.6) : 0;
        const targetY = ptr.inside ? THREE.MathUtils.clamp(Math.atan2(dx, LOOK_DISTANCE), -0.6, 0.6) : 0;
        const lookRate = ptr.inside ? 10 : 5;
        m.lookX = damp(m.lookX, targetX, lookRate, dt);
        m.lookY = damp(m.lookY, targetY, lookRate, dt);
        look.rotation.set(m.lookX, m.lookY, 0);

        // Blink: close 0.2s, open 0.2s, then hold open for 5s
        const phase = t % BLINK_PERIOD;
        const ease = (x: number) => x * x * (3 - 2 * x);
        let eyeScale = 1;
        if (phase < 0.2) eyeScale = 1 - (1 - BLINK_SCALE_Y) * ease(phase / 0.2);
        else if (phase < 0.4) eyeScale = BLINK_SCALE_Y + (1 - BLINK_SCALE_Y) * ease((phase - 0.2) / 0.2);
        // Held: happy squint (eyes narrow and widen a touch)
        blink.scale.y = Math.min(eyeScale, 1 - 0.55 * ex);
        blink.scale.x = 1 + 0.12 * ex;

        // Speech bubble reacts to being held (class toggle, no React re-render)
        bubbleRef.current?.classList.toggle("is-held", ptr.pressed);
    });

    const onPressStart = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        pointer.current.pressed = true;
    };

    return (
        <group ref={rootRef}>
            {/* Group 2: the ball and its shell; this is what squeezes on press */}
            <group ref={ballGroupRef}>
                <mesh material={ballMaterial} onPointerDown={onPressStart} renderOrder={0}>
                    <sphereGeometry args={[BALL_RADIUS, 64, 64]} />
                </mesh>
                <mesh material={shellMaterial} renderOrder={3}>
                    <sphereGeometry args={[SHELL_RADIUS, 64, 64]} />
                </mesh>
            </group>

            {/* Face: rotates about the ball's centre so the eyes slide toward the cursor */}
            <group ref={lookRef}>
                <group ref={blinkRef} position={[(EYES_X[0] + EYES_X[1]) / 2, EYE_Y, EYE_Z]}>
                    {EYES_X.map((x) => (
                        <mesh
                            key={x}
                            geometry={eyeGeometry}
                            material={eyeMaterial}
                            position={[x - (EYES_X[0] + EYES_X[1]) / 2, 0, 0]}
                            renderOrder={1}
                        />
                    ))}
                </group>
            </group>

            <ParticleEmitter force="attractor" seed={1} excite={excite} />
            <ParticleEmitter force="vortex" seed={2} excite={excite} />

            {/* Speech bubble, anchored to the sphere's upper right so it follows it */}
            <Html position={[66, 92, 130]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
                <div ref={bubbleRef} className="sphere-bubble" aria-hidden="true">
                    <div className="sphere-bubble__inner">
                        <span className="sphere-bubble__text sphere-bubble__text--idle">Hold me!</span>
                        <span className="sphere-bubble__text sphere-bubble__text--held">Wheee!</span>
                    </div>
                </div>
            </Html>
        </group>
    );
}

// ── Canvas wrapper with pointer handling ──────────────────────────────────────
export default function AISphere({ className = "" }: { className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pointer = useRef<PointerState>({ x: 0, y: 0, inside: false, pressed: false });
    const [viewportWidth, setViewportWidth] = useState(1440);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const toWorld = (clientX: number, clientY: number) => {
            const rect = el.getBoundingClientRect();
            pointer.current.x = (clientX - rect.left - rect.width / 2) / ZOOM + CAMERA_POS[0];
            pointer.current.y = -(clientY - rect.top - rect.height / 2) / ZOOM + CAMERA_POS[1];
        };
        const onMove = (e: PointerEvent) => {
            toWorld(e.clientX, e.clientY);
            pointer.current.inside = true;
        };
        const onLeave = () => {
            pointer.current.inside = false;
            pointer.current.pressed = false;
        };
        const onUp = () => { pointer.current.pressed = false; };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerdown", onMove);
        el.addEventListener("pointerleave", onLeave);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        window.addEventListener("blur", onLeave);

        const resize = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
        resize.observe(el);
        // Stop rendering while the hero is scrolled out of view
        const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        io.observe(el);

        return () => {
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerdown", onMove);
            el.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            window.removeEventListener("blur", onLeave);
            resize.disconnect();
            io.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className={className}>
            <Canvas
                orthographic
                flat
                frameloop={visible ? "always" : "never"}
                dpr={[1, 2]}
                // Explicit rotation stops R3F from aiming the offset camera at the origin
                camera={{ zoom: ZOOM, position: CAMERA_POS, rotation: [0, 0, 0], near: 1, far: 3000 }}
                gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
                // Let vertical page scrolling through on touch screens
                style={{ touchAction: "pan-y" }}
            >
                <SphereCharacter pointer={pointer} viewportWidth={viewportWidth} />
            </Canvas>
        </div>
    );
}
