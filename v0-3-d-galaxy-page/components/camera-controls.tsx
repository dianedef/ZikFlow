"use client"

import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls as DreiOrbitControls } from "@react-three/drei"
import type * as THREE from "three"

interface CameraControlsProps {
  autoRotate: boolean
  onCameraChange?: (position: THREE.Vector3, target: THREE.Vector3) => void
}

export function CameraControls({ autoRotate, onCameraChange }: CameraControlsProps) {
  const controlsRef = useRef<any>()
  const { camera } = useThree()

  useFrame(() => {
    if (controlsRef.current && onCameraChange) {
      onCameraChange(camera.position, controlsRef.current.target)
    }
  })

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={50}
      autoRotate={autoRotate}
      autoRotateSpeed={0.3}
      enableDamping={true}
      dampingFactor={0.05}
    />
  )
}
