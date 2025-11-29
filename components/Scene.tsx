import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { generateParticles } from './MathGenerators';
import { ShapeType, ColorTheme } from '../types';

interface SceneProps {
  currentShape: ShapeType;
  theme: ColorTheme;
  zoom: number;
  setParticleCount: (n: number) => void;
  particleCount: number;
}

const PARTICLE_COUNT = 20000;

// Custom Shader Material for sparkling points
const SparkleMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uSize: { value: 3.5 }, // Base size
  },
  vertexShader: `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uSize;
    attribute float aRandom;
    // attribute vec3 color; // REMOVED: Automatically injected by Three.js when vertexColors=true
    
    varying float vAlpha;
    varying vec3 vColor;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = uSize * uPixelRatio * (30.0 / -mvPosition.z);
      
      // Twinkle effect based on time and random attribute
      float twinkle = sin(uTime * 2.0 + aRandom * 10.0);
      vAlpha = 0.5 + 0.5 * twinkle;
      vColor = color; // Uses the automatically injected attribute
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    varying vec3 vColor;
    
    void main() {
      // Circular particle
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      
      // Soft edge but sharp enough
      float glow = 1.0 - (r * 2.0);
      glow = pow(glow, 1.5); 
      
      gl_FragColor = vec4(vColor, vAlpha * glow);
    }
  `
};

const Particles = ({ currentShape, theme, setParticleCount }: { currentShape: ShapeType, theme: ColorTheme, setParticleCount: (n: number) => void }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Buffers
  const [positions, setPositions] = useState<Float32Array | null>(null);
  const [targetPositions, setTargetPositions] = useState<Float32Array | null>(null);
  
  // Initialize random attributes once
  const randoms = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) arr[i] = Math.random();
    return arr;
  }, []);

  // Generate colors based on theme
  const colors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    const c1 = new THREE.Color(theme.primary);
    const c2 = new THREE.Color(theme.secondary);
    const tempColor = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Create a rich color distribution
        const r = Math.random();
        if (r < 0.4) {
            tempColor.copy(c1);
            // Slight hue shift for variety
            tempColor.offsetHSL(Math.random() * 0.05 - 0.025, 0, 0);
        } else if (r < 0.8) {
            tempColor.copy(c2);
            tempColor.offsetHSL(Math.random() * 0.05 - 0.025, 0, 0);
        } else {
            // Mix or brightness variation
            tempColor.lerpColors(c1, c2, Math.random());
            tempColor.offsetHSL(0, 0, 0.1); // Slightly brighter
        }
        
        arr[i * 3] = tempColor.r;
        arr[i * 3 + 1] = tempColor.g;
        arr[i * 3 + 2] = tempColor.b;
    }
    return arr;
  }, [theme]);

  // Initialize geometries
  useEffect(() => {
    const initialPos = generateParticles(currentShape, PARTICLE_COUNT);
    setPositions(initialPos);
    setTargetPositions(initialPos); // Initially target is same as current
    setParticleCount(PARTICLE_COUNT);
  }, []);

  // Handle Shape Change
  useEffect(() => {
    const newTarget = generateParticles(currentShape, PARTICLE_COUNT);
    setTargetPositions(newTarget);
  }, [currentShape]);

  // Animation Loop
  useFrame((state) => {
    if (!pointsRef.current || !positions || !targetPositions) return;

    const time = state.clock.getElapsedTime();
    
    // Update shader uniforms
    if (shaderRef.current) {
        shaderRef.current.uniforms.uTime.value = time;
        shaderRef.current.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    }

    // Lerp positions on CPU
    const geometry = pointsRef.current.geometry;
    const currentAttr = geometry.attributes.position as THREE.BufferAttribute;
    const posArray = currentAttr.array as Float32Array;
    
    let needsUpdate = false;
    const lerpFactor = 0.05; // Transition speed

    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        const diff = targetPositions[i] - posArray[i];
        if (Math.abs(diff) > 0.001) {
            posArray[i] += diff * lerpFactor;
            needsUpdate = true;
        }
    }

    // Rotate the whole system slowly for dynamic feel
    pointsRef.current.rotation.y = time * 0.05;
    pointsRef.current.rotation.z = time * 0.01;

    if (needsUpdate) {
        currentAttr.needsUpdate = true;
    }
  });

  if (!positions) return null;

  return (
    // Add key to force re-render when theme changes ensuring colors update
    <points ref={pointsRef} key={theme.name}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions} // Initial positions
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={PARTICLE_COUNT}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[SparkleMaterial]}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={true}
      />
    </points>
  );
};

const Scene: React.FC<SceneProps> = ({ currentShape, theme, zoom, setParticleCount }) => {
  return (
    <div className="w-full h-full absolute top-0 left-0 bg-black">
      <Canvas
        gl={{ 
            antialias: false, 
            powerPreference: "high-performance",
            alpha: false 
        }}
        dpr={[1, 2]} // Handle pixel ratio
      >
        <color attach="background" args={[theme.bg]} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 60 - zoom * 0.5]} fov={50} />
        
        <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            enableZoom={true} 
            autoRotate={false}
            maxDistance={150}
            minDistance={10}
        />

        <Particles 
            currentShape={currentShape} 
            theme={theme} 
            setParticleCount={setParticleCount} 
        />

        <EffectComposer enableNormalPass={false}>
            {/* Glow effect */}
            <Bloom 
                luminanceThreshold={0.15} 
                mipmapBlur 
                intensity={2.0} 
                radius={0.8}
            />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default Scene;