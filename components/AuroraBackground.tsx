"use client";

import { useEffect, useRef } from "react";

/**
 * The flowing peach background (Direction B).
 *
 * A single full-screen WebGL quad running a hand-written noise shader in the
 * site's own three peach tones — no library. It sits behind everything and is
 * purely decorative: if WebGL is missing or anything throws, the canvas is
 * removed and the static gradient on `body` shows through unchanged.
 *
 * Battery/CPU care: renders at ~55% resolution, capped near 30fps, frozen on
 * touch devices and under prefers-reduced-motion, and paused whenever the tab
 * is hidden.
 */

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform vec3 tone1, tone2, tone3;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.58;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.05;
    a *= 0.48;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 q = uv * vec2(resolution.x / resolution.y, 1.0) * 1.15;
  float s = time * 0.045;
  float warp = fbm(q * 1.15 + vec2(s * 0.7, -s * 0.45));
  float n = fbm(q + vec2(s, s * 0.6) + warp * 0.75);
  n = clamp(n * 0.9 + 0.5, 0.0, 1.0);
  vec3 col = mix(tone1, tone2, smoothstep(0.18, 0.72, n));
  col = mix(col, tone3, smoothstep(0.70, 1.04, n));
  // A touch of dither so wide flat areas don't band.
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.015;
  gl_FragColor = vec4(col, 1.0);
}`;

// The site's peach ramp: #f8d9c1 → #fef6ed, lifted toward terracotta at the peaks.
const TONE_1 = [0.973, 0.851, 0.757];
const TONE_2 = [0.996, 0.965, 0.93];
const TONE_3 = [0.925, 0.667, 0.533];

const RENDER_SCALE = 0.55;
const FRAME_INTERVAL = 1000 / 30;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Anything unexpected: drop the canvas and keep the static gradient.
    const bail = () => {
      canvas.style.display = "none";
    };

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = (canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      }) ?? canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    } catch {
      gl = null;
    }
    if (!gl) {
      bail();
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      bail();
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      bail();
      return;
    }
    gl.useProgram(program);

    // One oversized triangle covers the screen with no index buffer.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "resolution");
    const timeLocation = gl.getUniformLocation(program, "time");
    gl.uniform3fv(gl.getUniformLocation(program, "tone1"), TONE_1);
    gl.uniform3fv(gl.getUniformLocation(program, "tone2"), TONE_2);
    gl.uniform3fv(gl.getUniformLocation(program, "tone3"), TONE_3);

    const context = gl;
    const resize = () => {
      const width = Math.max(1, Math.round(window.innerWidth * RENDER_SCALE));
      const height = Math.max(1, Math.round(window.innerHeight * RENDER_SCALE));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        context.viewport(0, 0, width, height);
      }
      context.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };

    // Hold still where motion would be unwelcome or costly.
    const frozen =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(hover: none)").matches;

    let raf = 0;
    let lastDraw = 0;
    const started = performance.now();

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - lastDraw < FRAME_INTERVAL) return;
      lastDraw = now;
      resize();
      context.uniform1f(timeLocation, (now - started) / 1000);
      context.drawArrays(context.TRIANGLES, 0, 3);
    };

    const drawOnce = () => {
      resize();
      context.uniform1f(timeLocation, 14);
      context.drawArrays(context.TRIANGLES, 0, 3);
    };

    const start = () => {
      if (frozen) {
        drawOnce();
        return;
      }
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    const onResize = () => {
      if (frozen) drawOnce();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      context.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className="aurora-bg" aria-hidden="true" />;
}
