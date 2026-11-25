import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

export type ProctorSceneMode = 'sentinel' | 'ai' | 'lockdown';

interface ProctorVault3DProps {
  mode: ProctorSceneMode;
  className?: string;
}

const MODE_COLORS: Record<ProctorSceneMode, { primary: string; secondary: string; ringSpeed: number }> = {
  sentinel: { primary: '#22D3EE', secondary: '#FF5A36', ringSpeed: 1.0 },
  ai: { primary: '#FF5A36', secondary: '#F59E0B', ringSpeed: 1.45 },
  lockdown: { primary: '#10B981', secondary: '#22D3EE', ringSpeed: 0.65 },
};

export const ProctorVault3D: React.FC<ProctorVault3DProps> = ({ mode, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<ProctorSceneMode>(mode);
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);

  const [webglAvailable, setWebglAvailable] = useState(true);
  const [contextLost, setContextLost] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect WebGL support upfront
    let testCanvas: HTMLCanvasElement | null = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglAvailable(false);
      testCanvas = null;
      return;
    }
    testCanvas = null;

    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.75);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglAvailable(false);
      return;
    }

    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth || 480, container.clientHeight || 480);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      (container.clientWidth || 480) / (container.clientHeight || 480),
      0.1,
      100
    );
    camera.position.set(0, 0.25, 6.2);

    // Master Pivot Group for Look-At IK & Scroll Physics
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. Custom GLSL Fresnel + Interference Lattice Core Shader (mediump safe)
    const shaderUniforms = {
      uTime: { value: 0 },
      uPrimary: { value: new THREE.Color(MODE_COLORS[modeRef.current].primary) },
      uSecondary: { value: new THREE.Color(MODE_COLORS[modeRef.current].secondary) },
      uDarkBg: { value: themeRef.current === 'dark' ? 1.0 : 0.0 },
    };

    const coreGeometry = new THREE.IcosahedronGeometry(1.18, 2);
    const coreShaderMaterial = new THREE.ShaderMaterial({
      uniforms: shaderUniforms,
      transparent: true,
      vertexShader: `
        precision mediump float;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vLocalPos;
        uniform float uTime;

        void main() {
          vLocalPos = position;
          float wave = sin(position.y * 4.2 + uTime * 1.6) * cos(position.x * 3.8 - uTime * 1.1) * 0.038;
          vec3 displaced = position + normal * wave;
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        precision mediump float;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vLocalPos;
        uniform float uTime;
        uniform vec3 uPrimary;
        uniform vec3 uSecondary;
        uniform float uDarkBg;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.35);

          float scan = sin(vLocalPos.y * 16.0 - uTime * 3.0) * 0.5 + 0.5;
          float grid = smoothstep(0.88, 0.98, scan);

          vec3 baseDark = mix(vec3(0.05, 0.07, 0.11), uPrimary, 0.18);
          vec3 baseLight = mix(vec3(0.12, 0.13, 0.16), uPrimary, 0.22);
          vec3 baseColor = mix(baseLight, baseDark, uDarkBg);

          vec3 rimColor = mix(uPrimary, uSecondary, sin(uTime * 0.8 + vLocalPos.x * 2.0) * 0.5 + 0.5);
          vec3 finalColor = baseColor + rimColor * fresnel * 1.25 + uPrimary * grid * 0.22;

          float alpha = mix(0.76, 0.96, fresnel);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });

    const coreMesh = new THREE.Mesh(coreGeometry, coreShaderMaterial);
    masterGroup.add(coreMesh);

    // 2. Precision Geodesic Cage Wireframe
    const cageGeo = new THREE.IcosahedronGeometry(1.48, 1);
    const cageEdges = new THREE.EdgesGeometry(cageGeo);
    const cageMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(MODE_COLORS[modeRef.current].primary),
      transparent: true,
      opacity: 0.42,
    });
    const cageLines = new THREE.LineSegments(cageEdges, cageMat);
    masterGroup.add(cageLines);

    // 3. Three Gyroscopic Telemetry Rings
    const ring1Geo = new THREE.TorusGeometry(1.92, 0.016, 12, 96);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(MODE_COLORS[modeRef.current].primary),
      transparent: true,
      opacity: 0.72,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    masterGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.24, 0.013, 12, 96);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(MODE_COLORS[modeRef.current].secondary),
      transparent: true,
      opacity: 0.58,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 5;
    masterGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(2.55, 0.01, 10, 96);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#8E93A0'),
      transparent: true,
      opacity: 0.35,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI / 2.2;
    masterGroup.add(ring3);

    // 4. Instanced Orbital Telemetry Nodes (1 Draw Call)
    const nodeCount = 32;
    const nodeGeo = new THREE.OctahedronGeometry(0.052, 0);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(MODE_COLORS[modeRef.current].secondary),
      transparent: true,
      opacity: 0.88,
    });
    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    const dummy = new THREE.Object3D();
    const orbitData = Array.from({ length: nodeCount }, (_, i) => {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 2.0 + (i % 3) * 0.28;
      const yOffset = ((i % 5) - 2) * 0.16;
      const speed = 0.22 + (i % 4) * 0.08;
      return { angle, radius, yOffset, speed };
    });
    masterGroup.add(instancedNodes);

    // Pointer Look-At IK & Scroll Targets
    let targetPointerX = 0;
    let targetPointerY = 0;
    let currentPointerX = 0;
    let currentPointerY = 0;
    let currentRingSpeed = MODE_COLORS[modeRef.current].ringSpeed;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetPointerX = THREE.MathUtils.clamp(nx, -1.2, 1.2);
      targetPointerY = THREE.MathUtils.clamp(ny, -1.2, 1.2);
    };

    const handlePointerLeave = () => {
      targetPointerX = 0;
      targetPointerY = 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave);

    // ResizeObserver for crisp layout scaling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(1, entry.contentRect.width);
        const h = Math.max(1, entry.contentRect.height);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // WebGL Context Loss Safeguards
    const domCanvas = renderer.domElement;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    domCanvas.addEventListener('webglcontextlost', onContextLost);
    domCanvas.addEventListener('webglcontextrestored', onContextRestored);

    // Animation Loop with Damped Blending
    const clock = new THREE.Clock();
    let rafId = 0;
    let firstFrameDone = false;

    const targetPrimary = new THREE.Color();
    const targetSecondary = new THREE.Color();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      const activeSpec = MODE_COLORS[modeRef.current];
      targetPrimary.set(activeSpec.primary);
      targetSecondary.set(activeSpec.secondary);

      // Smooth color & speed state transitions
      shaderUniforms.uTime.value = elapsed;
      shaderUniforms.uPrimary.value.lerp(targetPrimary, dt * 4.0);
      shaderUniforms.uSecondary.value.lerp(targetSecondary, dt * 4.0);
      shaderUniforms.uDarkBg.value = THREE.MathUtils.lerp(
        shaderUniforms.uDarkBg.value,
        themeRef.current === 'dark' ? 1.0 : 0.0,
        dt * 6.0
      );

      cageMat.color.lerp(targetPrimary, dt * 4.0);
      ring1Mat.color.lerp(targetPrimary, dt * 4.0);
      ring2Mat.color.lerp(targetSecondary, dt * 4.0);
      nodeMat.color.lerp(targetSecondary, dt * 4.0);

      currentRingSpeed = THREE.MathUtils.lerp(currentRingSpeed, activeSpec.ringSpeed, dt * 3.5);

      // Damped pointer look-at IK
      currentPointerX = THREE.MathUtils.lerp(currentPointerX, targetPointerX, dt * 4.5);
      currentPointerY = THREE.MathUtils.lerp(currentPointerY, targetPointerY, dt * 4.5);

      const scrollFactor = Math.min(window.scrollY / 900, 1);

      masterGroup.rotation.y = currentPointerX * 0.38 + elapsed * 0.12;
      masterGroup.rotation.x = -currentPointerY * 0.25 + scrollFactor * 0.35;

      coreMesh.rotation.y += dt * 0.24 * currentRingSpeed;
      coreMesh.rotation.z += dt * 0.1 * currentRingSpeed;

      cageLines.rotation.y -= dt * 0.16 * currentRingSpeed;
      cageLines.rotation.x += dt * 0.08 * currentRingSpeed;

      ring1.rotation.z += dt * 0.42 * currentRingSpeed;
      ring1.rotation.y += dt * 0.15 * currentRingSpeed;

      ring2.rotation.z -= dt * 0.35 * currentRingSpeed;
      ring2.rotation.x += dt * 0.12 * currentRingSpeed;

      ring3.rotation.z += dt * 0.18 * currentRingSpeed;

      // Update instanced orbital nodes
      for (let i = 0; i < nodeCount; i++) {
        const o = orbitData[i];
        const theta = o.angle + elapsed * o.speed * currentRingSpeed;
        dummy.position.set(
          Math.cos(theta) * o.radius,
          o.yOffset + Math.sin(theta * 2.0 + i) * 0.18,
          Math.sin(theta) * o.radius
        );
        const s = 0.75 + 0.35 * Math.sin(elapsed * 2.5 + i);
        dummy.scale.setScalar(s);
        dummy.rotation.y = theta;
        dummy.updateMatrix();
        instancedNodes.setMatrixAt(i, dummy.matrix);
      }
      instancedNodes.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (!firstFrameDone) {
        firstFrameDone = true;
        setIsReady(true);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      domCanvas.removeEventListener('webglcontextlost', onContextLost);
      domCanvas.removeEventListener('webglcontextrestored', onContextRestored);

      // Strict Three.js resource disposal
      coreGeometry.dispose();
      coreShaderMaterial.dispose();
      cageGeo.dispose();
      cageEdges.dispose();
      cageMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglAvailable || contextLost) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] ${className}`}
      >
        <svg viewBox="0 0 320 320" className="w-72 h-72 opacity-90" aria-label="3D Proctor Architecture Schematic">
          <circle cx="160" cy="160" r="118" stroke="currentColor" className="text-[var(--border-strong)]" strokeDasharray="4 6" fill="none" />
          <circle cx="160" cy="160" r="88" stroke="#FF5A36" strokeWidth="1.5" fill="none" opacity="0.65" />
          <polygon points="160,62 245,111 245,209 160,258 75,209 75,111" stroke="#22D3EE" strokeWidth="1.5" fill="rgba(34,211,238,0.06)" />
          <circle cx="160" cy="160" r="24" fill="#FF5A36" opacity="0.22" />
          <circle cx="160" cy="160" r="8" fill="#22D3EE" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-signal)] border-t-transparent animate-spin" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
            Initializing 3D Core...
          </span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
