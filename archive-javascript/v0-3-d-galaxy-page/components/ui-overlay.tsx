"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Camera, Search, Maximize, RotateCcw, MapPin, Keyboard } from "lucide-react"
import type * as THREE from "three"

interface UIOverlayProps {
  onResetView: () => void
  onScreenshot: () => void
  onToggleFullscreen: () => void
  cameraPosition?: THREE.Vector3
  cameraTarget?: THREE.Vector3
}

export function UIOverlay({
  onResetView,
  onScreenshot,
  onToggleFullscreen,
  cameraPosition,
  cameraTarget,
}: UIOverlayProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showMinimap, setShowMinimap] = useState(false)

  const distance = cameraPosition ? cameraPosition.length() : 0
  const lightYearDistance = (distance * 1000).toFixed(0)

  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {/* Info Panel */}
        <Card className="bg-black/80 backdrop-blur-sm border-gray-700 max-w-sm">
          <CardContent className="p-4">
            <h1 className="text-xl font-bold text-white mb-2">Milky Way Galaxy Viewer</h1>
            <p className="text-sm text-gray-300 mb-2">
              Explore our galaxy in 3D space with realistic spiral structure and star distribution.
            </p>
            <div className="text-xs text-gray-400">
              <p>• Drag to rotate view</p>
              <p>• Scroll to zoom in/out</p>
              <p>• Right-click + drag to pan</p>
            </div>
          </CardContent>
        </Card>

        {/* Search and Tools */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search stars, systems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-black/80 backdrop-blur-sm border-gray-700 text-white"
            />
          </div>

          <Button
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            variant="secondary"
            size="icon"
            className="bg-black/80 backdrop-blur-sm border-gray-700"
          >
            <Keyboard className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <Button
          onClick={onResetView}
          variant="secondary"
          size="sm"
          className="bg-black/80 backdrop-blur-sm border-gray-700 text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset View
        </Button>

        <Button
          onClick={onScreenshot}
          variant="secondary"
          size="sm"
          className="bg-black/80 backdrop-blur-sm border-gray-700 text-white"
        >
          <Camera className="w-4 h-4 mr-2" />
          Screenshot
        </Button>

        <Button
          onClick={onToggleFullscreen}
          variant="secondary"
          size="sm"
          className="bg-black/80 backdrop-blur-sm border-gray-700 text-white"
        >
          <Maximize className="w-4 h-4 mr-2" />
          Fullscreen
        </Button>

        <Button
          onClick={() => setShowMinimap(!showMinimap)}
          variant="secondary"
          size="sm"
          className="bg-black/80 backdrop-blur-sm border-gray-700 text-white"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Minimap
        </Button>
      </div>

      {/* Distance Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Card className="bg-black/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-2 px-4">
            <div className="text-center text-white text-sm">
              Distance: <span className="font-mono">{lightYearDistance}</span> light years
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-black/90 backdrop-blur-sm border-gray-700 max-w-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-semibold">Keyboard Shortcuts</h3>
                <Button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400"
                >
                  ×
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <kbd className="bg-gray-700 px-1 rounded">R</kbd> Reset View
                </div>
                <div>
                  <kbd className="bg-gray-700 px-1 rounded">S</kbd> Screenshot
                </div>
                <div>
                  <kbd className="bg-gray-700 px-1 rounded">F</kbd> Fullscreen
                </div>
                <div>
                  <kbd className="bg-gray-700 px-1 rounded">A</kbd> Auto-rotate
                </div>
                <div>
                  <kbd className="bg-gray-700 px-1 rounded">C</kbd> Constellations
                </div>
                <div>
                  <kbd className="bg-gray-700 px-1 rounded">L</kbd> Star Labels
                </div>
                <div>
                  <kbd className="bg-gray-700 px-1 rounded">M</kbd> Minimap
                </div>
                <div>
                  <kbd className="bg-gray-700 px-1 rounded">?</kbd> This help
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Minimap */}
      {showMinimap && (
        <div className="absolute top-4 right-80 w-48 h-48">
          <Card className="bg-black/80 backdrop-blur-sm border-gray-700 h-full">
            <CardContent className="p-2 h-full">
              <div className="text-white text-xs mb-1">Galaxy Overview</div>
              <div className="relative w-full h-full bg-gray-900 rounded border border-gray-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full"></div>
                <div className="absolute inset-4 border border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-8 border border-blue-500/10 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
