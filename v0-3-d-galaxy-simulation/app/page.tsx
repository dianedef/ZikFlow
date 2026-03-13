"use client"

import { Canvas } from "@react-three/fiber"
import { Galaxy } from "@/components/galaxy"
import { Suspense } from "react"
import { Loader } from "@/components/loader"

export default function Page() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 50, 100], fov: 60 }} gl={{ antialias: true, alpha: false }}>
        <Suspense fallback={null}>
          <Galaxy />
        </Suspense>
      </Canvas>
      <Loader />
      <div className="absolute top-4 left-4 text-white font-mono text-sm bg-black/50 p-4 rounded-lg backdrop-blur-sm">
        <h1 className="text-xl font-bold mb-2">🌌 Explorador Galáctico</h1>
        <p className="text-xs opacity-80">Clique em qualquer estrela para explorar seu sistema planetário</p>
        <p className="text-xs opacity-60 mt-1">Use o mouse para rotacionar a visão</p>
      </div>
    </div>
  )
}
