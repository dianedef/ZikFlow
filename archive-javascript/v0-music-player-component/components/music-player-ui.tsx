"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Repeat, Star, Music2, MoreHorizontal } from "lucide-react"
import { motion } from "motion/react"

const playlist = [
  {
    id: 1,
    title: "Die With a Smile",
    artist: "Lady Gaga & Bruno Mars",
    duration: "3:38",
    cover: "/diewithasmile.jpeg",
  },
  {
    id: 2,
    title: "The Fate of Ophelia",
    artist: "Fall Out Boy",
    duration: "3:45",
    cover: "/fateofophelia.jpg",
  },
  {
    id: 3,
    title: "Espresso",
    artist: "Sabrina Carpenter",
    duration: "2:55",
    cover: "/espresso.jpeg",
  },
  {
    id: 4,
    title: "Beautiful Things",
    artist: "Benson Boone",
    duration: "3:18",
    cover: "/beautifulthings.jpg",
  },
  {
    id: 5,
    title: "Loose Controls",
    artist: "Teddy Swims",
    duration: "2:42",
    cover: "/loosecontrols.jpg",
  },
  {
    id: 6,
    title: "Good Luck Babe",
    artist: "Chappell Roan",
    duration: "3:25",
    cover: "/goodluckbabe.jpeg",
  },
]

export default function MusicPlayerUI() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(25)
  const [isDragging, setIsDragging] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const barProgressRef = useRef<HTMLDivElement>(null)

  const currentTime = "1:01"
  const remainingTime = "-1:35"

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!modalRef.current) return
      const rect = modalRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setMousePos({ x, y })

      // Update filter turbulence based on mouse position
      const filter = document.querySelector("#glass-distortion feDisplacementMap")
      if (filter) {
        const scaleX = (x / rect.width) * 100
        const scaleY = (y / rect.height) * 100
        filter.setAttribute("scale", String(Math.min(scaleX, scaleY) + 20))
      }
    }

    const handleMouseLeave = () => {
      const filter = document.querySelector("#glass-distortion feDisplacementMap")
      if (filter) {
        filter.setAttribute("scale", "77")
      }
    }

    const modal = modalRef.current
    if (modal) {
      modal.addEventListener("mousemove", handleMouseMove)
      modal.addEventListener("mouseleave", handleMouseLeave)
      return () => {
        modal.removeEventListener("mousemove", handleMouseMove)
        modal.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  const updateProgressFromRef = (ref: React.RefObject<HTMLDivElement | null>, clientX: number) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = (x / rect.width) * 100
    setProgress(Math.max(0, Math.min(100, percentage)))
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    updateProgressFromRef(progressRef, e.clientX)
  }

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    updateProgressFromRef(progressRef, e.clientX)
  }

  const handleBarProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    updateProgressFromRef(barProgressRef, e.clientX)
  }

  const handleBarProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    updateProgressFromRef(barProgressRef, e.clientX)
  }

  return (
    <>
      {/* SVG Filter for Glass Distortion */}
      <svg style={{ display: "none" }}>
        <filter id="glass-distortion">
          <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
        </filter>
      </svg>

      <motion.div
        ref={modalRef}
        className="glass-card relative w-full max-w-4xl h-[500px] rounded-3xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 0.6,
        }}
      >
        {/* Glass Filter Layer */}
        <div className="glass-filter" />

        {/* Glass Distortion Overlay */}
        <div className="glass-distortion-overlay" />

        {/* Glass Overlay */}
        <div className="glass-overlay" />

        {/* Glass Specular */}
        <div
          className="glass-specular"
          style={{
            background: `radial-gradient(
              circle at ${mousePos.x}px ${mousePos.y}px,
              rgba(255,255,255,0.15) 0%,
              rgba(255,255,255,0.05) 30%,
              rgba(255,255,255,0) 60%
            )`,
          }}
        />

        {/* Content */}
        <div className="glass-content relative z-[4] p-8 h-full flex flex-col">
          {/* MusicBox Logo */}
          <div className="flex items-center gap-2 mb-6">
            <Music2 className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white font-sans">MusicBox</span>
          </div>

          {/* Main Content */}
          <div className="flex gap-8 flex-1 overflow-hidden">
            {/* Left Side - Album Art and Controls */}
            <div className="flex flex-col justify-between w-[320px]">
              {/* Album Art */}
              <motion.div
                className="bg-black/40 rounded-2xl p-3 backdrop-blur-sm w-[290px] mx-auto"
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 12,
                  delay: 0.2,
                }}
              >
                <motion.img
                  src="/music-1.jpg"
                  alt="Album Art"
                  className="w-full aspect-square object-cover rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                />
              </motion.div>

              {/* Player Controls */}
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mt-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.3,
                }}
              >
                {/* Song Info */}
                <div className="text-white mb-3">
                  <h3 className="font-semibold text-sm">Die With a Smile - Lady Gaga & Bruno Mars</h3>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-white text-xs font-medium">{currentTime}</span>
                  <div
                    ref={progressRef}
                    className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer relative group"
                    onClick={handleProgressClick}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseMove={handleProgressDrag}
                    onMouseLeave={() => setIsDragging(false)}
                  >
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
                    />
                  </div>
                  <span className="text-white text-xs font-medium">{remainingTime}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <motion.button
                    className="text-white"
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Star className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    className="text-white"
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <SkipBack className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-white text-black rounded-full p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 0.3 }}>
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </motion.div>
                  </motion.button>
                  <motion.button
                    className="text-white"
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <SkipForward className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    className="text-white"
                    whileHover={{ scale: 1.1, rotate: -15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Repeat className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Playlist */}
            <motion.div
              className="flex-1 overflow-hidden"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.4,
              }}
            >
              <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="space-y-2">
                  {playlist.map((song, index) => (
                    <motion.div
                      key={song.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        delay: 0.5 + index * 0.1,
                      }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.img
                        src={song.cover || "/placeholder.svg"}
                        alt={song.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm truncate">{song.title}</h4>
                        <p className="text-white/70 text-xs truncate">{song.artist}</p>
                      </div>
                      <span className="text-white/70 text-sm font-medium">{song.duration}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Floating Music Bar - bottom left */}
        <motion.div
          className="absolute bottom-6 left-8 z-[4] w-[320px] rounded-2xl bg-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/20"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.6,
          }}
          whileHover={{ scale: 1.02 }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.02) 100%)",
              boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.35)",
            }}
          />
          <div className="relative z-[1] p-2">
            <div className="text-white text-xs font-medium text-center mb-2 truncate">Lunch Break - Seedhe Maut </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/90 text-xs font-medium">{currentTime}</span>
              <div
                ref={barProgressRef}
                className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer relative group"
                onClick={handleBarProgressClick}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseMove={handleBarProgressDrag}
                onMouseLeave={() => setIsDragging(false)}
              >
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
                />
              </div>
              <span className="text-white/90 text-xs font-medium">{remainingTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <motion.button
                className="text-white"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Star className="w-4 h-4" />
              </motion.button>
              <motion.button
                className="text-white"
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <SkipBack className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white text-black rounded-full p-1.5 shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 0.3 }}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </motion.div>
              </motion.button>
              <motion.button
                className="text-white"
                whileHover={{ scale: 1.1, x: 2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <SkipForward className="w-4 h-4" />
              </motion.button>
              <motion.button
                className="text-white"
                whileHover={{ scale: 1.1, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}
