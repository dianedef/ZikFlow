"use client"

import { Html } from "@react-three/drei"

const namedStars = [
  { name: "Sirius", position: [-3, 0, -5], type: "A1V", magnitude: -1.46 },
  { name: "Betelgeuse", position: [4, 2, -7], type: "M1-2 Ia-ab", magnitude: 0.42 },
  { name: "Rigel", position: [3, -1, -8], type: "B8 Ia", magnitude: 0.13 },
  { name: "Vega", position: [-1, 4, -4], type: "A0 Va", magnitude: 0.03 },
  { name: "Altair", position: [2, 1, -3], type: "A7 V", magnitude: 0.77 },
]

interface StarLabelsProps {
  visible: boolean
}

export function StarLabels({ visible }: StarLabelsProps) {
  if (!visible) return null

  return (
    <>
      {namedStars.map((star) => (
        <group key={star.name}>
          {/* Star */}
          <mesh position={star.position as [number, number, number]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#ffff88" />
          </mesh>

          {/* Label */}
          <Html
            position={star.position as [number, number, number]}
            style={{
              color: "white",
              fontSize: "12px",
              fontFamily: "monospace",
              background: "rgba(0,0,0,0.7)",
              padding: "2px 6px",
              borderRadius: "4px",
              border: "1px solid rgba(255,255,255,0.3)",
              pointerEvents: "none",
              transform: "translate(-50%, -120%)",
            }}
          >
            <div>
              <div className="font-semibold">{star.name}</div>
              <div className="text-xs text-gray-300">
                {star.type} | mag {star.magnitude}
              </div>
            </div>
          </Html>
        </group>
      ))}
    </>
  )
}
