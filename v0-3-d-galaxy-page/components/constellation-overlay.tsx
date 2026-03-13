"use client"

import { useRef } from "react"
import * as THREE from "three"

const constellations = [
  {
    name: "Orion",
    stars: [
      [-2, 1, -8],
      [-1, 2, -8],
      [0, 1, -8],
      [1, 0, -8],
      [2, -1, -8],
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 3],
    ],
  },
  {
    name: "Big Dipper",
    stars: [
      [-5, 2, -6],
      [-4, 3, -6],
      [-2, 3, -6],
      [-1, 2, -6],
      [0, 1, -6],
      [1, 2, -6],
      [2, 3, -6],
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  },
]

interface ConstellationOverlayProps {
  visible: boolean
}

export function ConstellationOverlay({ visible }: ConstellationOverlayProps) {
  const groupRef = useRef<THREE.Group>(null)

  if (!visible) return null

  return (
    <group ref={groupRef}>
      {constellations.map((constellation, idx) => (
        <group key={constellation.name}>
          {/* Stars */}
          {constellation.stars.map((pos, starIdx) => (
            <mesh key={`${constellation.name}-star-${starIdx}`} position={pos as [number, number, number]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}

          {/* Constellation lines */}
          {constellation.connections.map((connection, lineIdx) => {
            const start = constellation.stars[connection[0]]
            const end = constellation.stars[connection[1]]
            const points = [
              new THREE.Vector3(...(start as [number, number, number])),
              new THREE.Vector3(...(end as [number, number, number])),
            ]

            return (
              <line key={`${constellation.name}-line-${lineIdx}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([...start, ...end] as number[])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#4a90e2" transparent opacity={0.6} />
              </line>
            )
          })}
        </group>
      ))}
    </group>
  )
}
