"use client"

import { Canvas } from '@react-three/fiber'
import { MeshTransmissionMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

export default function WebGLGlassPill({ isActive }: { isActive?: boolean }) {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 rounded-[inherit] overflow-hidden pointer-events-none">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 20 }}>
        <ambientLight intensity={isActive ? 1.2 : 0.8} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        
        <mesh>
          <planeGeometry args={[15, 5]} />
          <MeshTransmissionMaterial
            background={new THREE.Color(0x000000)} 
            transmission={1}
            thickness={1.5}
            roughness={0.15}
            chromaticAberration={0.04}
            anisotropy={0.2}
            distortion={0.1}
            distortionScale={0.3}
            temporalDistortion={0.05}
            ior={1.5}
            color={isActive ? "#ffffff" : "#e5e5e5"}
            transparent={true}
            opacity={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
