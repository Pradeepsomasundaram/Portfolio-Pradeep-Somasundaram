import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { IconType } from 'react-icons';
import {
  SiPython,
  SiTensorflow,
  SiPytorch,
  SiAmazonwebservices,
  SiReact,
  SiDocker,
  SiPostgresql,
  SiApachespark,
} from 'react-icons/si';

interface ToolNode {
  Icon: IconType;
  label: string;
  color: string;
  position: [number, number, number];
}

const tools: ToolNode[] = [
  { Icon: SiPython, label: 'Python', color: '#C9A227', position: [3.4, 1.1, 0] },
  { Icon: SiTensorflow, label: 'TensorFlow', color: '#0EA57A', position: [1.7, -2.3, 1.6] },
  { Icon: SiPytorch, label: 'PyTorch', color: '#E8C874', position: [-2.7, 1.7, -1] },
  { Icon: SiAmazonwebservices, label: 'AWS', color: '#C9A227', position: [-3.1, -1, 1.3] },
  { Icon: SiReact, label: 'React', color: '#0EA57A', position: [0.4, 2.7, -1.7] },
  { Icon: SiDocker, label: 'Docker', color: '#E8C874', position: [2.5, -0.4, -2.5] },
  { Icon: SiPostgresql, label: 'PostgreSQL', color: '#0EA57A', position: [-1.1, -2.7, -1.1] },
  { Icon: SiApachespark, label: 'Spark', color: '#C9A227', position: [-2.3, 0.1, 2.7] },
];

function IconBadge({ tool }: { tool: ToolNode }) {
  const [hovered, setHovered] = useState(false);
  const { Icon } = tool;
  return (
    <Html position={tool.position} center distanceFactor={8} zIndexRange={[10, 0]}>
      <div
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className="flex flex-col items-center gap-1.5 select-none cursor-default"
        style={{ transform: hovered ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s' }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${tool.color}, rgba(255,255,255,0.15))`,
            boxShadow: `0 0 20px ${tool.color}80`,
          }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap"
          style={{ opacity: hovered ? 1 : 0.75, color: tool.color, background: 'rgba(5,5,5,0.55)' }}
        >
          {tool.label}
        </span>
      </div>
    </Html>
  );
}

function Ribbon({ reducedMotion }: { reducedMotion: boolean }) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const pulse2Ref = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  const curve = useMemo(() => {
    const points = tools.map((t) => new THREE.Vector3(...t.position));
    return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);
  }, []);

  const tubeGeometry = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.035, 8, true), [curve]);
  const glowGeometry = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.09, 8, true), [curve]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    progress.current = (progress.current + delta * 0.06) % 1;
    const p1 = curve.getPointAt(progress.current);
    const p2 = curve.getPointAt((progress.current + 0.5) % 1);
    pulseRef.current?.position.set(p1.x, p1.y, p1.z);
    pulse2Ref.current?.position.set(p2.x, p2.y, p2.z);
  });

  return (
    <group>
      <mesh geometry={glowGeometry}>
        <meshBasicMaterial color="#C9A227" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color="#E8C874" transparent opacity={0.55} />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh ref={pulse2Ref}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#0EA57A" />
      </mesh>
    </group>
  );
}

function Hub({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.y += delta * 0.3;
    ref.current.rotation.x += delta * 0.1;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.55, 1]} />
      <meshStandardMaterial
        color="#C9A227"
        emissive="#C9A227"
        emissiveIntensity={0.6}
        wireframe
      />
    </mesh>
  );
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.045;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} color="#C9A227" intensity={25} distance={12} />
      <pointLight position={[4, 4, 4]} color="#0EA57A" intensity={8} distance={15} />
      <group ref={groupRef}>
        <Hub reducedMotion={reducedMotion} />
        <Ribbon reducedMotion={reducedMotion} />
        {tools.map((tool) => (
          <IconBadge key={tool.label} tool={tool} />
        ))}
      </group>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(Math.PI * 2) / 3}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * A real 3D scene — Pradeep's core tools as floating platforms threaded by
 * a glowing ribbon around a rotating "AI core" hub. This is the site's one
 * true WebGL moment (everything else is CSS/SVG), reserved for the single
 * effect that genuinely needs it.
 */
export const ToolUniverse = () => {
  const [supported, setSupported] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setSupported(hasWebGL());
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (!supported) return null;

  return (
    <div className="relative h-[480px] md:h-[560px] w-full cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene reducedMotion={reducedMotion} />
      </Canvas>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-mono text-gray-400 pointer-events-none">
        drag to look around
      </div>
    </div>
  );
};
