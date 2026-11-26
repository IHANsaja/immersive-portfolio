"use client";

import React, { useEffect, useRef } from "react";

// A procedural cloud bank drawn in a fragment shader (replaces the old clouds.png).
// The cursor parts and swirls the cloud where it passes, with a soft glow.
//
// Drawn with raw WebGL rather than another react-three-fiber canvas: it's a single
// full-canvas quad, and the hero already runs the AI sphere and the fluid hover effect.

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uAspect;     // canvas width / height
uniform vec2  uMouse;      // cursor in canvas uv (0..1, y up)
uniform float uHover;      // 0..1, eased in while the cursor is over the cloud
uniform vec2  uMouseVel;   // smoothed cursor velocity, in uv per frame

float hash1(float n) { return fract(sin(n) * 43758.5453123); }

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// "Billow" noise: folded fbm, which gives the rounded cauliflower bumps of cumulus
float billow(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 4; i++) {
        value += amp * abs(noise(p) * 2.0 - 1.0);
        p = rot * p * 2.1 + 7.3;
        amp *= 0.5;
    }
    return value;
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float smax(float a, float b, float k) { return -smin(-a, -b, k); }

// Signed distance to the cloud silhouette (negative inside), in cloud space where
// x runs 0..uAspect and y 0..1 from the bottom of the canvas.
float cloudSdf(vec2 p, float t) {
    float d = 1e3;
    float span = uAspect;

    // Large puffs along the base: the main body of the cloud
    for (int i = 0; i < 10; i++) {
        float fi = float(i);
        float u = (fi + 0.5) / 10.0 + (hash1(fi * 7.3 + 1.0) - 0.5) * 0.04;
        float taper = sin(3.14159 * clamp(u, 0.0, 1.0));   // smaller toward the two ends
        vec2 c = vec2(span * (0.05 + 0.9 * u),
                      0.26 + 0.06 * taper + 0.006 * sin(t * 0.3 + fi * 1.9));
        float r = (0.06 + 0.08 * hash1(fi * 3.1 + 5.0)) * mix(0.5, 1.0, taper)
                + 0.004 * sin(t * 0.4 + fi * 1.3);
        d = smin(d, length(p - c) - r, 0.08);
    }

    // Medium puffs stacked on top, towering highest toward the middle
    for (int i = 0; i < 16; i++) {
        float fi = float(i);
        float u = (fi + 0.5) / 16.0 + (hash1(fi * 4.7 + 2.0) - 0.5) * 0.05;
        float taper = sin(3.14159 * clamp(u, 0.0, 1.0));
        float tower = pow(taper, 1.6);
        vec2 c = vec2(span * (0.08 + 0.84 * u),
                      0.33 + 0.17 * tower * (0.4 + 0.6 * hash1(fi * 9.1 + 3.0)) + 0.008 * sin(t * 0.45 + fi * 2.3));
        float r = (0.03 + 0.055 * hash1(fi * 5.9 + 8.0)) * mix(0.5, 1.0, taper)
                + 0.003 * sin(t * 0.55 + fi);
        d = smin(d, length(p - c) - r, 0.045);
    }

    // Small puffs scattered over the crown for the cauliflower texture
    for (int i = 0; i < 22; i++) {
        float fi = float(i);
        float u = hash1(fi * 2.3 + 11.0);
        float taper = sin(3.14159 * u);
        vec2 c = vec2(span * (0.08 + 0.84 * u),
                      0.34 + 0.14 * pow(taper, 1.6) * hash1(fi * 6.1 + 4.0) + 0.006 * sin(t * 0.6 + fi * 1.7));
        float r = (0.015 + 0.025 * hash1(fi * 8.7 + 1.0)) * mix(0.6, 1.0, taper);
        d = smin(d, length(p - c) - r, 0.025);
    }

    // Two scales of billowy surface detail, churning slowly
    d += 0.032 * (billow(p * 6.0 + vec2(t * 0.025, t * 0.01)) - 0.45);
    d += 0.012 * (billow(p * 17.0 - vec2(t * 0.04, 0.0)) - 0.45);

    // Flatten the underside, like the condensation level of a real cumulus
    float base = 0.19 + 0.012 * sin(p.x * 9.0 + t * 0.2) + 0.008 * noise(vec2(p.x * 12.0, t * 0.1));
    d = smax(d, base - p.y, 0.035);
    return d;
}
void main() {
    float t = uTime;
    vec2 uv = vUv;

    // --- Cursor interaction: push the cloud away from the pointer and swirl it ---
    vec2 toMouse = (uv - uMouse) * vec2(uAspect, 1.0);
    float dist = length(toMouse);
    float influence = uHover * exp(-dist * dist / 0.012);
    vec2 pushDir = dist > 0.0001 ? toMouse / dist : vec2(0.0);
    vec2 swirl = vec2(-pushDir.y, pushDir.x);
    vec2 offset = (pushDir * 0.05 + swirl * 0.03 + uMouseVel * 2.5) * influence;

    vec2 p = vec2(uv.x * uAspect, uv.y) - offset;

    float d = cloudSdf(p, t);
    // Wispy, slightly eroded edges instead of a hard cut-out line
    float wisps = billow(p * 22.0 + vec2(t * 0.05, 0.0));
    float alpha = 1.0 - smoothstep(-0.03, 0.006 + 0.022 * wisps, d);
    alpha *= 1.0 - 0.35 * influence; // the cursor thins the cloud where it pushes through
    if (alpha < 0.002) { gl_FragColor = vec4(0.0); return; }

    // --- Shading: treat each puff as a rounded volume lit from the upper right ---
    float e = 0.014; // wide enough that the fine billows don't jitter the normal
    // Forward differences reuse d, saving two cloudSdf evaluations per pixel
    vec2 grad = vec2(cloudSdf(p + vec2(e, 0.0), t) - d, cloudSdf(p + vec2(0.0, e), t) - d);
    vec2 outward = length(grad) > 1e-5 ? normalize(grad) : vec2(0.0, 1.0);
    float depth = clamp(-d / 0.07, 0.0, 1.0);            // 0 at the edge, 1 deep inside
    vec3 normal = normalize(vec3(outward * (1.0 - depth), 0.35 + depth));
    vec3 lightDir = normalize(vec3(0.5, 0.75, 0.45));
    float diffuse = clamp(dot(normal, lightDir), 0.0, 1.0);

    // Palette following the old image: cool lavender left, pink middle, cream right
    float side = smoothstep(0.1, 0.9, uv.x);
    vec3 litCol = mix(vec3(0.82, 0.80, 0.90), vec3(0.95, 0.70, 0.78), smoothstep(0.0, 0.5, side));
    litCol = mix(litCol, vec3(1.0, 0.91, 0.85), smoothstep(0.5, 1.0, side));
    vec3 shadowCol = mix(vec3(0.46, 0.45, 0.60), vec3(0.50, 0.33, 0.48), side);

    // Lumpy light inside the puffs instead of smooth spheres, plus self-shadowing:
    // light reaching the far side has passed through more cloud.
    float bumps = billow(p * 6.0 + vec2(t * 0.03, 0.0));
    float towardLight = cloudSdf(p + lightDir.xy * 0.08, t);
    float selfShadow = smoothstep(-0.12, 0.04, towardLight);   // 1 = lit from outside
    float light = 0.18 + 0.5 * diffuse + 0.32 * selfShadow + 0.15 * (bumps - 0.45);
    vec3 col = mix(shadowCol, litCol, clamp(light, 0.0, 1.0));
    // Darker, denser underside
    col *= mix(0.7, 1.0, smoothstep(0.19, 0.34, p.y));
    // Silver lining where thin edges face the light
    float rim = pow(1.0 - depth, 3.0) * smoothstep(0.0, 0.6, dot(outward, lightDir.xy));
    col += vec3(1.0, 0.93, 0.9) * rim * 0.3;
    // Glow where the cursor touches the cloud
    col += vec3(0.95, 0.72, 0.88) * influence * 0.3;

    float opacity = alpha * 0.92;
    gl_FragColor = vec4(col * opacity, opacity); // premultiplied alpha
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("ShaderClouds: shader compile failed", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Clouds are soft, so rendering below full resolution is invisible and much cheaper
const RENDER_SCALE = 0.6;

export default function ShaderClouds({ className = "" }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
        if (!gl) return; // No WebGL: the hero simply shows no cloud

        const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        if (!vs || !fs) return;
        const program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.warn("ShaderClouds: program link failed", gl.getProgramInfoLog(program));
            return;
        }
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const aPosition = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(program, "uTime");
        const uAspect = gl.getUniformLocation(program, "uAspect");
        const uMouse = gl.getUniformLocation(program, "uMouse");
        const uHover = gl.getUniformLocation(program, "uHover");
        const uMouseVel = gl.getUniformLocation(program, "uMouseVel");

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2) * RENDER_SCALE;
            canvas.width = Math.max(1, Math.round(rect.width * dpr));
            canvas.height = Math.max(1, Math.round(rect.height * dpr));
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);

        // Pointer state: target from events, eased every frame
        const target = { x: 0.5, y: 0.3, inside: false };
        const mouse = { x: 0.5, y: 0.3, vx: 0, vy: 0, hover: 0 };

        const onPointerMove = (event: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            target.x = (event.clientX - rect.left) / rect.width;
            target.y = 1 - (event.clientY - rect.top) / rect.height;
            // Only react inside the canvas, and near the cloud (not the empty area above it)
            target.inside = target.x >= 0 && target.x <= 1 && target.y >= 0.1 && target.y <= 0.65;
        };
        const onPointerLeave = () => { target.inside = false; };
        // The AI sphere scene sits above the cloud and takes pointer events, so listen on window
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.addEventListener("pointerleave", onPointerLeave);

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let visible = true;
        const visibilityObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !frame) frame = requestAnimationFrame(render);
        });
        visibilityObserver.observe(canvas);

        const start = performance.now();
        let frame = 0;
        const render = (now: number) => {
            frame = 0;
            if (!visible) return; // resumes from the IntersectionObserver

            const prevX = mouse.x;
            const prevY = mouse.y;
            mouse.x += (target.x - mouse.x) * 0.12;
            mouse.y += (target.y - mouse.y) * 0.12;
            mouse.vx += ((mouse.x - prevX) - mouse.vx) * 0.2;
            mouse.vy += ((mouse.y - prevY) - mouse.vy) * 0.2;
            mouse.hover += ((target.inside ? 1 : 0) - mouse.hover) * 0.06;

            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform1f(uTime, reduceMotion ? 0 : (now - start) / 1000);
            gl.uniform1f(uAspect, canvas.width / canvas.height);
            gl.uniform2f(uMouse, mouse.x, mouse.y);
            gl.uniform1f(uHover, mouse.hover);
            gl.uniform2f(uMouseVel, mouse.vx, mouse.vy);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            frame = requestAnimationFrame(render);
        };
        frame = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            visibilityObserver.disconnect();
            window.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerleave", onPointerLeave);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
        };
    }, []);

    return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
