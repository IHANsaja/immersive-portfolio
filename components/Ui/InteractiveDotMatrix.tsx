"use client";

import React, { useRef, useEffect, useState } from "react";

interface InteractiveDotMatrixProps {
    opacity?: number;
    spacing?: number;
    dotRadius?: number;
    influenceRadius?: number;
}

export default function InteractiveDotMatrix({
    opacity = 0.35,
    spacing = 20.0,
    dotRadius = 1.0,
    influenceRadius = 180.0,
}: InteractiveDotMatrixProps) {
    const [isMobile, setIsMobile] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl", { alpha: true, depth: false, antialias: true });
        if (!gl) {
            console.warn("WebGL not supported.");
            return;
        }

        // Vertex shader program
        const vsSource = `
            attribute vec2 aPosition;
            varying vec2 vUv;
            void main() {
                vUv = aPosition * 0.5 + 0.5;
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;

        // Fragment shader program
        const fsSource = `
            precision mediump float;
            varying vec2 vUv;
            
            uniform vec2 uResolution;
            uniform vec2 uMouse;
            uniform float uTime;
            uniform float uSpacing;
            uniform float uDotRadius;
            uniform float uRadius;
            uniform float uOpacity;

            void main() {
                // Get absolute pixel coordinate on the canvas
                vec2 pixelCoord = gl_FragCoord.xy;
                
                vec2 toMouse = pixelCoord - uMouse;
                float d = length(toMouse);
                
                // 1. MAGNETIC GRAVITY WELL DISPLACEMENT (Attraction)
                // Physically pulls the grid dot coordinates toward the cursor position
                float pullForce = exp(-d * 0.006) * 16.0;
                // Avoid dividing by zero if mouse is exactly on top of a pixel
                vec2 warpDirection = d > 0.01 ? normalize(toMouse) : vec2(0.0);
                vec2 warpedCoord = pixelCoord - warpDirection * pullForce;
                
                // Calculate grid positions using warped coordinates
                vec2 gridCoord = warpedCoord / uSpacing;
                vec2 localGrid = fract(gridCoord) - 0.5;
                float distToDotCenter = length(localGrid) * uSpacing;
                
                // 2. CYBER SONAR RIPPLE WAVE - REMOVED
                float scanGlow = 0.0;
                
                // 3. TACTICAL HUD COORDINATE CROSSHAIR - REMOVED
                float hudCrosshair = 0.0;

                // 4. MOUSE HOVER INFLUENCE
                float hoverGlow = exp(-d * 0.015) * 0.55; // Bright core glow directly under pointer
                float influence = exp(-d * 0.004);
                
                // Swell dot radius based on influence
                float dotSize = uDotRadius + (influence * 1.4);
                
                // Compute dot shape
                float dotIntensity = smoothstep(dotSize, dotSize - 0.85, distToDotCenter);

                // Colors
                vec3 restingColor = vec3(0.55, 0.60, 0.70) * 0.35; // Soft grayish resting grid dots
                vec3 activeColor = vec3(0.0, 0.95, 1.0);           // Vibrant electric cyber-cyan
                
                // Blend dot color from grey to bright cyan based on hover proximity
                vec3 finalDotColor = mix(restingColor, activeColor, influence);
                
                // Combine hover core glows
                float glowField = hoverGlow;
                
                // Final blending calculations
                float alpha = (dotIntensity * 0.8 + glowField) * uOpacity;
                vec3 finalColor = finalDotColor * dotIntensity + activeColor * glowField;

                gl_FragColor = vec4(finalColor, alpha);
            }
        `;

        // Compile shaders
        function compileShader(source: string, type: number): WebGLShader | null {
            const shader = gl!.createShader(type);
            if (!shader) return null;
            gl!.shaderSource(shader, source);
            gl!.compileShader(shader);
            if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
                console.error("Shader compile error:", gl!.getShaderInfoLog(shader));
                gl!.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) return;

        // Create shader program
        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program linking error:", gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // Set up geometry buffer (full screen quad)
        const vertices = new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0
        ]);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const aPosition = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        // Uniform locations
        const uResolution = gl.getUniformLocation(program, "uResolution");
        const uMouse = gl.getUniformLocation(program, "uMouse");
        const uTime = gl.getUniformLocation(program, "uTime");
        const uSpacing = gl.getUniformLocation(program, "uSpacing");
        const uDotRadius = gl.getUniformLocation(program, "uDotRadius");
        const uRadius = gl.getUniformLocation(program, "uRadius");
        const uOpacity = gl.getUniformLocation(program, "uOpacity");

        // Set constant uniforms
        gl.uniform1f(uSpacing, spacing);
        gl.uniform1f(uDotRadius, dotRadius);
        gl.uniform1f(uRadius, influenceRadius);
        gl.uniform1f(uOpacity, opacity);

        // Track global pointer/mouse position relative to window
        let globalMouseX = -1000;
        let globalMouseY = -1000;

        const handlePointerMove = (e: PointerEvent) => {
            globalMouseX = e.clientX;
            globalMouseY = e.clientY;
        };

        window.addEventListener("pointermove", handlePointerMove, { passive: true });

        // Resize handler
        let width = 0;
        let height = 0;

        const handleResize = () => {
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        handleResize();
        window.addEventListener("resize", handleResize, { passive: true });

        // Animation rendering loop
        let animationFrameId = 0;
        const startTime = performance.now();

        const render = () => {
            const time = (performance.now() - startTime) * 0.001;

            // Calculate local mouse position inside this specific canvas context
            const rect = canvas.getBoundingClientRect();
            const localMouseX = (globalMouseX - rect.left) * window.devicePixelRatio;
            const localMouseY = (rect.bottom - globalMouseY) * window.devicePixelRatio;

            // Clear screen (transparent buffer)
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Pass dynamic uniforms
            gl.uniform2f(uResolution, canvas.width, canvas.height);
            gl.uniform2f(uMouse, localMouseX, localMouseY);
            gl.uniform1f(uTime, time);

            // Draw full screen quad
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("resize", handleResize);
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteBuffer(positionBuffer);
        };
    }, [spacing, dotRadius, influenceRadius, opacity]);

    if (isMobile) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 0,
            }}
        />
    );
}
