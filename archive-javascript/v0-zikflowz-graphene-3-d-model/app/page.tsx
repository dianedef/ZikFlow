"use client"

import dynamic from "next/dynamic"

const GrapheneScene = dynamic(() => import("@/components/graphene-scene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-cyan-400 text-lg animate-pulse">Loading Graphene...</div>
    </div>
  ),
})

export default function Page() {
  return <GrapheneScene />
}
