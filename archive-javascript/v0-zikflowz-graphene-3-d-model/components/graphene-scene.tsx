"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { type InstancedMesh, type LineSegments, Vector3, Matrix4, Quaternion, NoToneMapping } from "three"

function GrapheneLattice() {
  const atomsRef = useRef<InstancedMesh>(null)
  const glowRef = useRef<InstancedMesh>(null)
  const bondsRef = useRef<LineSegments>(null)

  // Generate graphene lattice
  const { atomPositions, bondPositions, bondCount } = useMemo(() => {
    const bondLength = 1.5
    const sqrt3 = Math.sqrt(3)
    const a1 = [bondLength * sqrt3, 0]
    const a2 = [(bondLength * sqrt3) / 2, bondLength * 1.5]
    const gridSize = 8

    const atoms: Vector3[] = []

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const cellX = i * a1[0] + j * a2[0]
        const cellZ = i * a1[1] + j * a2[1]
        atoms.push(new Vector3(cellX, 0, cellZ))
        atoms.push(new Vector3(cellX, 0, cellZ + bondLength))
      }
    }

    // Find bonds
    const bondPairs: number[] = []
    const tolerance = 0.1

    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const dist = atoms[i].distanceTo(atoms[j])
        if (Math.abs(dist - bondLength) < tolerance) {
          bondPairs.push(atoms[i].x, atoms[i].y, atoms[i].z, atoms[j].x, atoms[j].y, atoms[j].z)
        }
      }
    }

    return {
      atomPositions: atoms,
      bondPositions: new Float32Array(bondPairs),
      bondCount: bondPairs.length / 6,
    }
  }, [])

  // Store original positions
  const originalPositions = useMemo(() => atomPositions.map((p) => p.clone()), [atomPositions])
  const originalBonds = useMemo(() => bondPositions.slice(), [bondPositions])

  // Initialize instanced meshes
  useMemo(() => {
    if (!atomsRef.current || !glowRef.current) return

    const matrix = new Matrix4()
    atomPositions.forEach((pos, i) => {
      matrix.setPosition(pos)
      atomsRef.current!.setMatrixAt(i, matrix)
      glowRef.current!.setMatrixAt(i, matrix)
    })
    atomsRef.current.instanceMatrix.needsUpdate = true
    glowRef.current.instanceMatrix.needsUpdate = true
  }, [atomPositions])

  // Animation loop
  useFrame(({ clock }) => {
    if (!atomsRef.current || !glowRef.current || !bondsRef.current) return

    const time = clock.elapsedTime
    const matrix = new Matrix4()
    const position = new Vector3()
    const quaternion = new Quaternion()
    const scale = new Vector3()

    // Animate atoms with phonon wave
    originalPositions.forEach((pos, i) => {
      const dist = Math.sqrt(pos.x ** 2 + pos.z ** 2)
      const yOffset = Math.sin(dist * 0.3 - time * 2) * 0.5

      position.set(pos.x, yOffset, pos.z)

      // Atom core
      matrix.setPosition(position)
      atomsRef.current!.setMatrixAt(i, matrix)

      // Pulsing glow
      const glowScale = 1 + Math.sin(time * 3 + i * 0.1) * 0.2
      scale.setScalar(glowScale)
      matrix.compose(position, quaternion, scale)
      glowRef.current!.setMatrixAt(i, matrix)
    })

    atomsRef.current.instanceMatrix.needsUpdate = true
    glowRef.current.instanceMatrix.needsUpdate = true

    // Animate bonds
    const bondAttr = bondsRef.current.geometry.getAttribute("position")
    const arr = bondAttr.array as Float32Array

    for (let i = 0; i < bondCount; i++) {
      const idx = i * 6
      const dist1 = Math.sqrt(originalBonds[idx] ** 2 + originalBonds[idx + 2] ** 2)
      const dist2 = Math.sqrt(originalBonds[idx + 3] ** 2 + originalBonds[idx + 5] ** 2)

      arr[idx + 1] = Math.sin(dist1 * 0.3 - time * 2) * 0.5
      arr[idx + 4] = Math.sin(dist2 * 0.3 - time * 2) * 0.5
    }

    bondAttr.needsUpdate = true
  })

  return (
    <group>
      {/* Atom cores - InstancedMesh for performance */}
      <instancedMesh ref={atomsRef} args={[undefined, undefined, atomPositions.length]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color="#00ffff" toneMapped={false} />
      </instancedMesh>

      {/* Atom glow - InstancedMesh */}
      <instancedMesh ref={glowRef} args={[undefined, undefined, atomPositions.length]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} toneMapped={false} />
      </instancedMesh>

      {/* Bonds - LineSegments */}
      <lineSegments ref={bondsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={bondPositions.length / 3}
            array={bondPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff00ff" transparent opacity={0.9} toneMapped={false} />
      </lineSegments>
    </group>
  )
}

function GPUInfo({ onGPUInfo }: { onGPUInfo: (info: string) => void }) {
  const { gl } = useThree()

  useEffect(() => {
    const debugInfo = gl.getContext().getExtension("WEBGL_debug_renderer_info")
    if (debugInfo) {
      const renderer = gl.getContext().getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      onGPUInfo(renderer)
    } else {
      onGPUInfo("WebGL 2.0")
    }
  }, [gl, onGPUInfo])

  return null
}

export default function GrapheneScene() {
  const [gpuInfo, setGpuInfo] = useState<string>("")
  const [showInfo, setShowInfo] = useState(true)

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 20, 25], fov: 60 }} gl={{ antialias: true, toneMapping: NoToneMapping }}>
        <color attach="background" args={["#000000"]} />
        <GrapheneLattice />
        <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.5} />
        <GPUInfo onGPUInfo={setGpuInfo} />
      </Canvas>

      <div
        className={`absolute bottom-4 left-4 transition-all duration-300 ${showInfo ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-lg p-4 max-w-xs">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-white font-medium text-sm tracking-wide">Graphene</h2>
          </div>

          {/* Data grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono">
            <span className="text-white/40">Formula</span>
            <span className="text-cyan-400">C</span>

            <span className="text-white/40">Structure</span>
            <span className="text-white/70">Hexagonal 2D</span>

            <span className="text-white/40">Bond length</span>
            <span className="text-white/70">1.42 Å</span>

            <span className="text-white/40">Atoms</span>
            <span className="text-white/70">2 per unit cell</span>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-3" />

          {/* Source link */}
          <a
            href="https://www.science.org/doi/10.1126/science.1102896"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-white/50 hover:text-cyan-400 transition-colors group"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>Novoselov et al., Science 2004</span>
          </a>
        </div>
      </div>

      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-white/60 text-xs font-mono">
            {gpuInfo ? gpuInfo.split("/")[0]?.trim() || "GPU" : "WebGL"}
          </span>
        </div>
      </div>

      <button
        onClick={() => setShowInfo(!showInfo)}
        className="absolute top-4 right-4 backdrop-blur-md bg-black/40 border border-white/10 rounded-full p-2 text-white/50 hover:text-white hover:border-white/30 transition-all"
        aria-label={showInfo ? "Hide info" : "Show info"}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {showInfo ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          )}
        </svg>
      </button>

      <div className="absolute bottom-4 right-4 text-white/30 text-xs font-mono">drag to rotate • scroll to zoom</div>
    </div>
  )
}
