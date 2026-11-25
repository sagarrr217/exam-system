import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ShieldCheck, GraduationCap, ShieldAlert, RotateCcw } from 'lucide-react';
import { Badge } from './ui/Badge';
import { cn } from './ui/cn';

export interface ProctorVault3DProps {
  mode?: 'landing' | 'student' | 'admin';
  onModeChange?: (mode: 'landing' | 'student' | 'admin') => void;
  onSelectRole?: (role: 'STUDENT' | 'ADMIN') => void;
  className?: string;
}

export const ProctorVault3D: React.FC<ProctorVault3DProps> = ({
  mode = 'landing',
  onModeChange,
  onSelectRole,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const [webglReady, setWebglReady] = useState(true);
  const [fpsReady, setFpsReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglReady(false);
      return;
    }

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 300);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 6.1);

    // Royal Cobalt + Teal + Ice White lighting rig
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.9);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4.5, 5.5, 6);
    scene.add(keyLight);

    const cobaltLight = new THREE.PointLight(0x3b82f6, 5.0, 18);
    cobaltLight.position.set(-3.2, -2.0, 4.0);
    scene.add(cobaltLight);

    const tealLight = new THREE.PointLight(0x14b8a6, 4.5, 16);
    tealLight.position.set(3.4, 2.4, -2.0);
    scene.add(tealLight);

    const vaultGroup = new THREE.Group();
    scene.add(vaultGroup);

    // 1. Central Crystalline Core (Icosahedron)
    const coreGeom = new THREE.IcosahedronGeometry(1.12, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#2563EB'),
      emissive: new THREE.Color('#1D4ED8'),
      emissiveIntensity: 0.45,
      roughness: 0.16,
      metalness: 0.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.94,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    vaultGroup.add(coreMesh);

    // 2. Precision Lattice Cage around the core
    const wireGeom = new THREE.IcosahedronGeometry(1.42, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#93C5FD'),
      wireframe: true,
      transparent: true,
      opacity: 0.34,
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    vaultGroup.add(wireMesh);

    // 3. Inner Shader Halo (matched precision mediump float in both shaders!)
    const haloGeom = new THREE.SphereGeometry(1.66, 40, 40);
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#3B82F6') },
      },
      vertexShader: `
        precision mediump float;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform float uTime;
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float rim = pow(1.0 - abs(vNormal.z), 2.8);
          float pulse = 0.72 + 0.28 * sin(uTime * 1.9 + vPosition.y * 2.5);
          gl_FragColor = vec4(uColor, rim * 0.42 * pulse);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    vaultGroup.add(haloMesh);

    // 4. Orbital Integrity Rings
    const ring1Geom = new THREE.TorusGeometry(2.05, 0.026, 16, 110);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#14B8A6'),
      emissive: new THREE.Color('#0F766E'),
      emissiveIntensity: 0.55,
      metalness: 0.65,
      roughness: 0.25,
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI * 0.36;
    ring1.rotation.y = Math.PI * 0.14;
    vaultGroup.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(2.42, 0.018, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#60A5FA'),
      emissive: new THREE.Color('#2563EB'),
      emissiveIntensity: 0.4,
      metalness: 0.6,
      roughness: 0.3,
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = -Math.PI * 0.28;
    ring2.rotation.z = Math.PI * 0.24;
    vaultGroup.add(ring2);

    // 5. Verified Telemetry Nodes (Student / Proctoring satellites)
    const nodeGeom = new THREE.OctahedronGeometry(0.14, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#10B981'),
      emissive: new THREE.Color('#059669'),
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.5,
    });
    const satellites: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(nodeGeom, nodeMat);
      satellites.push(mesh);
      vaultGroup.add(mesh);
    }

    // 6. Subtle Particle Constellation
    const particleCount = 110;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 2.6 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    // Interactive pointer rotation
    let dragging = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotX = 0.14;
    let targetRotY = 0;

    const canvas = renderer.domElement;
    canvas.style.touchAction = 'pan-y';
    canvas.style.cursor = 'grab';

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      targetRotY += dx * 0.008;
      targetRotX = Math.max(-0.9, Math.min(0.9, targetRotX + dy * 0.008));
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerUp = () => {
      dragging = false;
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // ResizeObserver for clean container resizing
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = Math.max(container.clientWidth, 280);
      const h = Math.max(container.clientHeight, 260);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const currentMode = modeRef.current;

      // Adapt palette smoothly to selected mode
      if (currentMode === 'student') {
        coreMat.color.lerp(new THREE.Color('#0F766E'), 0.05);
        coreMat.emissive.lerp(new THREE.Color('#14B8A6'), 0.05);
        haloMat.uniforms.uColor.value.lerp(new THREE.Color('#14B8A6'), 0.05);
      } else if (currentMode === 'admin') {
        coreMat.color.lerp(new THREE.Color('#1D4ED8'), 0.05);
        coreMat.emissive.lerp(new THREE.Color('#3B82F6'), 0.05);
        haloMat.uniforms.uColor.value.lerp(new THREE.Color('#3B82F6'), 0.05);
      } else {
        coreMat.color.lerp(new THREE.Color('#2563EB'), 0.05);
        coreMat.emissive.lerp(new THREE.Color('#1D4ED8'), 0.05);
        haloMat.uniforms.uColor.value.lerp(new THREE.Color('#3B82F6'), 0.05);
      }

      haloMat.uniforms.uTime.value = prefersReduced ? 0 : t;

      if (!prefersReduced) {
        if (!dragging) {
          targetRotY += 0.0032;
        }
        coreMesh.rotation.y = t * 0.25;
        coreMesh.rotation.x = Math.sin(t * 0.4) * 0.12;
        wireMesh.rotation.y = -t * 0.16;
        ring1.rotation.z = t * 0.28;
        ring2.rotation.y = -t * 0.22;
        particles.rotation.y = t * 0.05;

        satellites.forEach((sat, idx) => {
          const angle = t * 0.55 + (idx * Math.PI * 2) / satellites.length;
          const radius = 2.05;
          sat.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle * 1.5) * 0.55,
            Math.sin(angle) * radius
          );
          sat.rotation.y = t * 0.9 + idx;
        });
      }

      vaultGroup.rotation.y += (targetRotY - vaultGroup.rotation.y) * 0.08;
      vaultGroup.rotation.x += (targetRotX - vaultGroup.rotation.x) * 0.08;

      renderer?.render(scene, camera);
    };

    animate();
    setFpsReady(true);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      coreGeom.dispose();
      coreMat.dispose();
      wireGeom.dispose();
      wireMat.dispose();
      haloGeom.dispose();
      haloMat.dispose();
      ring1Geom.dispose();
      ring1Mat.dispose();
      ring2Geom.dispose();
      ring2Mat.dispose();
      nodeGeom.dispose();
      nodeMat.dispose();
      pGeom.dispose();
      pMat.dispose();
      renderer?.dispose();
    };
  }, []);

  const modeLabel =
    mode === 'student'
      ? 'Student Isolation Shield Active'
      : mode === 'admin'
      ? 'Admin Telemetry & AI Authoring Core'
      : 'Cryptographic Integrity Vault';

  return (
    <div
      className={cn(
        'ui-card overflow-hidden bg-[#0B1222] text-slate-100 border-slate-800 flex flex-col justify-between',
        className
      )}
    >
      {/* Top Status Strip — clean flexbox bar, never overlaps canvas */}
      <div className="px-5 py-3.5 border-b border-slate-800/90 flex items-center justify-between gap-3 bg-slate-900/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
          <span className="text-xs font-mono font-semibold text-slate-200 truncate">
            {modeLabel}
          </span>
        </div>
        <span className="text-xs font-mono text-slate-300 shrink-0 hidden sm:inline">
          Drag to inspect
        </span>
      </div>

      {/* 3D WebGL Viewport */}
      <div className="relative h-[300px] sm:h-[340px] w-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18)_0%,rgba(11,18,34,0.98)_72%)]">
        {webglReady ? (
          <div ref={containerRef} className="w-full h-full" aria-label="Interactive 3D security vault" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <ShieldCheck className="w-16 h-16 text-blue-400 mb-3" />
            <p className="text-base font-semibold text-white">ExamSecure Integrity Core</p>
            <p className="text-sm text-slate-300 mt-1 max-w-xs">
              Real-time focus telemetry, strict RBAC, and instant auto-grading active.
            </p>
          </div>
        )}

        {!fpsReady && webglReady && (
          <div className="sr-only">Initializing 3D proctoring core</div>
        )}
      </div>

      {/* Bottom Interactive Mode & Role Switcher Bar */}
      <div className="px-4 py-3 border-t border-slate-800/90 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onModeChange?.('landing')}
            className={cn(
              'min-h-[44px] px-3 rounded-[10px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-blue-400',
              mode === 'landing'
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            )}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Core
          </button>
          <button
            type="button"
            onClick={() => {
              onModeChange?.('student');
              onSelectRole?.('STUDENT');
            }}
            className={cn(
              'min-h-[44px] px-3 rounded-[10px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-teal-400',
              mode === 'student'
                ? 'bg-teal-600 text-white hover:bg-teal-500'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            )}
          >
            <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
            Student
          </button>
          <button
            type="button"
            onClick={() => {
              onModeChange?.('admin');
              onSelectRole?.('ADMIN');
            }}
            className={cn(
              'min-h-[44px] px-3 rounded-[10px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-blue-400',
              mode === 'admin'
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            Admin
          </button>
        </div>

        <Badge variant="success" className="border-emerald-700/60 bg-emerald-950/80 text-emerald-300">
          TLS + RBAC Verified
        </Badge>
      </div>
    </div>
  );
};
