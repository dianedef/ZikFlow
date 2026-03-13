"use client"

import { Canvas } from "@react-three/fiber"
import { Environment, Stars } from "@react-three/drei"
import { Suspense, useState, useEffect } from "react"
import { Galaxy } from "@/components/galaxy"
import { GalaxyControls } from "@/components/galaxy-controls"
import { LoadingScreen } from "@/components/loading-screen"
import { ConstellationOverlay } from "@/components/constellation-overlay"
import { StarLabels } from "@/components/star-labels"
import { UIOverlay } from "@/components/ui-overlay"
import { CameraControls } from "@/components/camera-controls"
import type * as THREE from "three"

export default function GalaxyViewer() {
  const [galaxyParams, setGalaxyParams] = useState({
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 4,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: "#ff6030",
    outsideColor: "#1b3984",
  })

  const [autoRotate, setAutoRotate] = useState(false)
  const [showConstellations, setShowConstellations] = useState(false)
  const [showStarLabels, setShowStarLabels] = useState(false)
  const [qualityMode, setQualityMode] = useState<"high" | "medium" | "low">("high")
  const [cameraPosition, setCameraPosition] = useState<THREE.Vector3>()
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3>()

  const handleScreenshot = () => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const link = document.createElement("a")
      link.download = `galaxy-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleResetView = () => {
    // This will be handled by the camera controls
  }

  const handleCameraChange = (position: THREE.Vector3, target: THREE.Vector3) => {
    setCameraPosition(position)
    setCameraTarget(target)
  }

  // Adjust galaxy count based on quality
  const adjustedParams = {
    ...galaxyParams,
    count:
      qualityMode === "high"
        ? galaxyParams.count
        : qualityMode === "medium"
          ? Math.floor(galaxyParams.count * 0.6)
          : Math.floor(galaxyParams.count * 0.3),
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "r":
          handleResetView()
          break
        case "s":
          handleScreenshot()
          break
        case "f":
          handleToggleFullscreen()
          break
        case "a":
          setAutoRotate(!autoRotate)
          break
        case "c":
          setShowConstellations(!showConstellations)
          break
        case "l":
          setShowStarLabels(!showStarLabels)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [autoRotate, showConstellations, showStarLabels])

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas
        camera={{
          position: [6, 3, 6],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.1} />
          <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffffff" />

          {/* Environment */}
          <Environment preset="night" />
          <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade />

          {/* Galaxy */}
          <Galaxy {...adjustedParams} />
          <ConstellationOverlay visible={showConstellations} />
          <StarLabels visible={showStarLabels} />

          {/* Controls */}
          <CameraControls autoRotate={autoRotate} onCameraChange={handleCameraChange} />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <UIOverlay
        onResetView={handleResetView}
        onScreenshot={handleScreenshot}
        onToggleFullscreen={handleToggleFullscreen}
        cameraPosition={cameraPosition}
        cameraTarget={cameraTarget}
      />

      {/* UI Controls */}
      <GalaxyControls
        params={galaxyParams}
        onChange={setGalaxyParams}
        onAutoRotateChange={setAutoRotate}
        onConstellationsChange={setShowConstellations}
        onStarLabelsChange={setShowStarLabels}
        onQualityChange={setQualityMode}
      />

      {/* Loading Screen */}
      <Suspense fallback={<LoadingScreen />}>
        <div />
      </Suspense>

      {/* Info Panel */}
      <div className="absolute top-4 left-4 text-white bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-sm">
        <h1 className="text-xl font-bold mb-2">Milky Way Galaxy Viewer</h1>
        <p className="text-sm text-gray-300 mb-2">
          Explore our galaxy in 3D space with realistic spiral structure and star distribution.
        </p>
        <div className="text-xs text-gray-400">
          <p>• Drag to rotate view</p>
          <p>• Scroll to zoom in/out</p>
          <p>• Right-click + drag to pan</p>
        </div>
      </div>
    </div>
  )
}
