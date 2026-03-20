"use client";

import React, { useRef, useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { Particle } from "@/types/particle";
import { RainDrop } from "@/types/rain-drop";
import { COLORS } from "@/constants/colors";
import { LightningBolt } from "@/types/lightning-bolt";
import { Scene } from "@/types/scene";
import { SCENE_NAMES } from "@/constants/scene-names";

const inter = Inter({ subsets: ["latin"] });

// Simple mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

export default function AudioVisualizer() {
  const isMobile = useIsMobile();
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const rainCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [raindrops, setRaindrops] = useState<RainDrop[]>([]);
  const [lightningBolts, setLightningBolts] = useState<LightningBolt[]>([]);
  const [coreColorIndex, setCoreColorIndex] = useState(0);
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.Original);
  const [previousScene, setPreviousScene] = useState<Scene>(Scene.Original);
  const [shuffledScenes, setShuffledScenes] = useState<Scene[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [cursorStyle, setCursorStyle] = useState("pointer");
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSceneName, setShowSceneName] = useState(true);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [showMusicGenerator, setShowMusicGenerator] = useState(false);
  const [musicPrompt, setMusicPrompt] = useState("");
  const [musicDuration, setMusicDuration] = useState(30000); // 30 seconds default
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Use refs for values that change in the animation loop
  const colorOffsetRef = useRef(0);
  const coreColorHueRef = useRef(COLORS[0]);
  const sceneTransitionProgressRef = useRef(0);
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });
  const positionRef = useRef({ x: 0, y: 0, z: 0 });
  const perspectiveRef = useRef(1000);
  const animationStartTimeRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Function to shuffle array using Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Function to create a new shuffled scene order
  const createShuffledScenes = (): Scene[] => {
    const allScenes = Object.values(Scene).filter(
      (value) => typeof value === "number"
    ) as Scene[];
    return shuffleArray(allScenes);
  };

  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    const rainCanvas = rainCanvasRef.current;
    const waveformCanvas = waveformCanvasRef.current;
    if (!mainCanvas || !rainCanvas || !waveformCanvas) return;
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Reduce canvas resolution on mobile for better performance
      const scale = isMobile ? 0.75 : 1;
      const canvasWidth = Math.floor(width * scale);
      const canvasHeight = Math.floor(height * scale);

      mainCanvas.width = canvasWidth;
      mainCanvas.height = canvasHeight;
      rainCanvas.width = canvasWidth;
      rainCanvas.height = canvasHeight;
      waveformCanvas.width = canvasWidth;
      waveformCanvas.height = canvasHeight;

      // Scale canvas display size back to full screen
      if (isMobile) {
        mainCanvas.style.width = width + "px";
        mainCanvas.style.height = height + "px";
        rainCanvas.style.width = width + "px";
        rainCanvas.style.height = height + "px";
        waveformCanvas.style.width = width + "px";
        waveformCanvas.style.height = height + "px";
      }

      createParticles();
      createRaindrops();
    };

    const createParticles = () => {
      const newParticles: Particle[] = [];
      // Drastically reduce particles on mobile for performance
      const totalParticles = isMobile ? 300 : 2000;
      const coreParticles = Math.floor(totalParticles * 0.7);
      for (let i = 0; i < totalParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 250;
        newParticles.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: (Math.random() - 0.5) * 500,
          vx: 0,
          vy: 0,
          vz: 0,
          life: Math.random() * 0.5 + 0.5,
          frequency: 0,
          isCore: i < coreParticles,
          size: Math.random() * 2 + 1,
          trail: [],
        });
      }
      setParticles(newParticles);
    };

    const createRaindrops = () => {
      const newRaindrops: RainDrop[] = [];
      // Reduce raindrops on mobile for performance
      const totalRaindrops = isMobile ? 200 : 1000;
      for (let i = 0; i < totalRaindrops; i++) {
        newRaindrops.push({
          x: Math.random() * mainCanvas.width,
          y: Math.random() * mainCanvas.height,
          speed: Math.random() * 5 + 5,
          length: Math.random() * 10 + 10,
        });
      }
      setRaindrops(newRaindrops);
    };

    const newAudioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const newAnalyser = newAudioContext.createAnalyser();
    // Reduce FFT size on mobile for better performance
    newAnalyser.fftSize = isMobile ? 1024 : 2048;
    setAudioContext(newAudioContext);
    setAnalyser(newAnalyser);

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      newAudioContext.close();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Check API key status
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/check-api-key");
        const data = await response.json();
        setHasApiKey(data.hasApiKey);
      } catch (error) {
        console.error("Failed to check API key:", error);
        setHasApiKey(false);
      }
    };

    checkApiKey();
  }, []);

  // Store the audio source to avoid recreating it
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Mouse inactivity timer
  const mouseInactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      audioContext &&
      analyser &&
      audioRef.current &&
      !audioSourceRef.current
    ) {
      audioSourceRef.current = audioContext.createMediaElementSource(
        audioRef.current
      );
      audioSourceRef.current.connect(analyser);
      analyser.connect(audioContext.destination);
    }
  }, [audioContext, analyser]);

  useEffect(() => {
    const colorChangeInterval = setInterval(() => {
      setCoreColorIndex((prevIndex) => (prevIndex + 1) % COLORS.length);
    }, 5000);

    return () => clearInterval(colorChangeInterval);
  }, []);

  useEffect(() => {
    const transitionInterval = setInterval(() => {
      const targetHue = COLORS[coreColorIndex];
      const prevHue = coreColorHueRef.current;
      const diff = targetHue - prevHue;
      const step = diff / 30;
      coreColorHueRef.current = prevHue + step;
    }, 16);

    return () => clearInterval(transitionInterval);
  }, [coreColorIndex]);

  // Initialize shuffled scenes when audio loads
  useEffect(() => {
    if (isAudioLoaded && shuffledScenes.length === 0) {
      const newShuffledScenes = createShuffledScenes();
      setShuffledScenes(newShuffledScenes);
      setCurrentSceneIndex(0);
      setCurrentScene(newShuffledScenes[0]);
      console.log(
        "Initialized shuffled scenes:",
        newShuffledScenes.map((s) => Scene[s])
      );
    }
  }, [isAudioLoaded, shuffledScenes.length]);

  useEffect(() => {
    // Only start scene transitions after audio is loaded and scenes are shuffled
    if (!isAudioLoaded || shuffledScenes.length === 0) return;

    const sceneChangeInterval = setInterval(() => {
      setPreviousScene(currentScene);

      // Move to next scene in shuffled order
      const nextIndex = (currentSceneIndex + 1) % shuffledScenes.length;

      // If we've completed all scenes, create a new shuffle
      if (nextIndex === 0) {
        console.log(
          `All ${shuffledScenes.length} scenes played! Reshuffling...`
        );
        const newShuffledScenes = createShuffledScenes();
        setShuffledScenes(newShuffledScenes);
        setCurrentScene(newShuffledScenes[0]);
        setCurrentSceneIndex(0);
        console.log(
          "New shuffled order:",
          newShuffledScenes.map((s) => Scene[s])
        );
      } else {
        setCurrentScene(shuffledScenes[nextIndex]);
        setCurrentSceneIndex(nextIndex);
        console.log(
          `Scene ${nextIndex + 1}/${shuffledScenes.length}: ${
            Scene[shuffledScenes[nextIndex]]
          }`
        );
      }

      sceneTransitionProgressRef.current = 0;
    }, 6000);

    return () => clearInterval(sceneChangeInterval);
  }, [currentScene, currentSceneIndex, isAudioLoaded, shuffledScenes]);

  // Mouse inactivity detection
  useEffect(() => {
    const handleMouseMove = () => {
      setShowSceneName(true);

      // Clear existing timer
      if (mouseInactivityTimerRef.current) {
        clearTimeout(mouseInactivityTimerRef.current);
      }

      // Set new timer to hide scene name after 3 seconds
      mouseInactivityTimerRef.current = setTimeout(() => {
        setShowSceneName(false);
      }, 3000);
    };

    // Add mouse move listener
    window.addEventListener("mousemove", handleMouseMove);

    // Initialize timer
    handleMouseMove();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseInactivityTimerRef.current) {
        clearTimeout(mouseInactivityTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      !mainCanvasRef.current ||
      !rainCanvasRef.current ||
      !waveformCanvasRef.current ||
      !analyser
    )
      return;

    const mainCanvas = mainCanvasRef.current;
    const rainCanvas = rainCanvasRef.current;
    const waveformCanvas = waveformCanvasRef.current;
    const mainCtx = mainCanvas.getContext("2d");
    const rainCtx = rainCanvas.getContext("2d");
    const waveformCtx = waveformCanvas.getContext("2d");
    if (!mainCtx || !rainCtx || !waveformCtx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDomainArray = new Uint8Array(bufferLength);

    // Create local copies of particles, raindrops, and lightning bolts that can be modified
    // without triggering state updates
    let localParticles = [...particles];
    let localRaindrops = [...raindrops];
    let localLightningBolts: LightningBolt[] = [];

    let animationFrameId: number;

    const drawMain = () => {
      analyser.getByteFrequencyData(dataArray);
      analyser.getByteTimeDomainData(timeDomainArray);

      mainCtx.fillStyle = "rgba(0, 0, 0, 0.1)";
      mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

      const centerX = mainCanvas.width / 2;
      const centerY = mainCanvas.height / 2;

      mainCtx.save();
      mainCtx.translate(
        centerX + positionRef.current.x,
        centerY + positionRef.current.y
      );
      mainCtx.rotate(rotationRef.current.z);
      mainCtx.scale(1, Math.cos(rotationRef.current.x));

      // Update animation values using refs instead of state
      colorOffsetRef.current = (colorOffsetRef.current + 2) % 360;
      sceneTransitionProgressRef.current = Math.min(
        sceneTransitionProgressRef.current + 0.01,
        1
      );

      // Calculate time since animation started for smooth transitions
      const animationTime = animationStartTimeRef.current
        ? (Date.now() - animationStartTimeRef.current) / 1000
        : 0;
      const smoothTransition = Math.min(animationTime / 2, 1); // 2 second transition
      const fadeIn = Math.min(animationTime / 1.5, 1); // 1.5 second fade-in

      // Update rotation using ref
      rotationRef.current = {
        x: rotationRef.current.x + 0.001,
        y: rotationRef.current.y + 0.002,
        z: rotationRef.current.z + 0.003,
      };

      // Update position using ref with smooth transition
      const targetX = Math.sin(animationTime) * 100;
      const targetY = Math.cos(animationTime) * 50;
      const targetZ = Math.sin(animationTime / 2) * 200;

      positionRef.current = {
        x: targetX * smoothTransition,
        y: targetY * smoothTransition,
        z: targetZ * smoothTransition,
      };

      // Update perspective using ref with smooth transition
      const targetPerspective = 1000 + Math.sin(animationTime / 2) * 500;
      perspectiveRef.current =
        1000 + (targetPerspective - 1000) * smoothTransition;

      const volume =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      if (currentScene === Scene.Lightning) {
        if (Math.random() < 0.05) {
          const newBolt: LightningBolt = {
            startX: 0,
            startY: 0,
            endX: Math.random() * mainCanvas.width - mainCanvas.width / 2,
            endY: Math.random() * mainCanvas.height - mainCanvas.height / 2,
            segments: [],
            life: 1,
          };
          localLightningBolts.push(newBolt);
        }

        localLightningBolts = localLightningBolts
          .map((bolt) => {
            bolt.life -= 0.05;
            return bolt;
          })
          .filter((bolt) => bolt.life > 0);

        localLightningBolts.forEach((bolt) => {
          if (bolt.segments.length === 0) {
            let x = bolt.startX;
            let y = bolt.startY;
            bolt.segments.push({ x, y });
            while (Math.abs(x - bolt.endX) > 5 || Math.abs(y - bolt.endY) > 5) {
              x += (bolt.endX - x) * 0.2 + (Math.random() - 0.5) * 20;
              y += (bolt.endY - y) * 0.2 + (Math.random() - 0.5) * 20;
              bolt.segments.push({ x, y });
            }
          }

          mainCtx.strokeStyle = `rgba(255, 255, 255, ${bolt.life * fadeIn})`;
          mainCtx.lineWidth = 2;
          mainCtx.beginPath();
          mainCtx.moveTo(bolt.segments[0].x, bolt.segments[0].y);
          for (let i = 1; i < bolt.segments.length; i++) {
            mainCtx.lineTo(bolt.segments[i].x, bolt.segments[i].y);
          }
          mainCtx.stroke();
        });
      }

      localParticles.forEach((particle, index) => {
        const frequencyIndex = Math.floor(
          (index / localParticles.length) * bufferLength
        );
        const frequency = dataArray[frequencyIndex];
        particle.frequency = frequency;

        let hue: number;
        if (particle.isCore) {
          hue = coreColorHueRef.current;
        } else {
          hue = ((frequency / 255) * 360 + colorOffsetRef.current) % 360;
        }
        const saturation = 100;
        const lightness = 50 + (frequency / 255) * 30;

        const angle = Math.atan2(particle.y, particle.x);
        const distanceFromCenter = Math.sqrt(particle.x ** 2 + particle.y ** 2);
        const force = (frequency / 255) * 1.5 * (distanceFromCenter / 250);

        switch (currentScene) {
          case Scene.Original:
            particle.vx += Math.cos(angle) * force;
            particle.vy += Math.sin(angle) * force;
            break;
          case Scene.GravitationalPull:
            const gravity = 0.5 * (distanceFromCenter / 250);
            particle.vx -= Math.cos(angle) * gravity;
            particle.vy -= Math.sin(angle) * gravity;
            particle.vx += Math.cos(angle) * force;
            particle.vy += Math.sin(angle) * force;
            break;
          case Scene.ChangingPosition:
            particle.x += Math.sin(Date.now() / 1000 + index) * 2;
            particle.y += Math.cos(Date.now() / 1000 + index) * 2;
            break;
          case Scene.NewVortex:
            const vortexAngle2 = Math.atan2(particle.y, particle.x);
            const vortexRadius2 = Math.sqrt(particle.x ** 2 + particle.y ** 2);
            const vortexForce2 = 0.1;
            particle.vx =
              -Math.sin(vortexAngle2) * vortexForce2 * vortexRadius2;
            particle.vy = Math.cos(vortexAngle2) * vortexForce2 * vortexRadius2;
            break;
          case Scene.Spinning:
            const spinForce = 0.1;
            particle.vx += -particle.y * spinForce;
            particle.vy += particle.x * spinForce;
            break;
          case Scene.ChangingPerspective:
            const z = Math.sin(Date.now() / 1000 + index) * 200;
            const scale = perspectiveRef.current / (perspectiveRef.current - z);
            particle.x *= scale;
            particle.y *= scale;
            break;
          case Scene.Lightning:
            particle.x += (Math.random() - 0.5) * 10;
            particle.y += (Math.random() - 0.5) * 10;
            particle.x = Math.max(
              -mainCanvas.width / 2,
              Math.min(mainCanvas.width / 2, particle.x)
            );
            particle.y = Math.max(
              -mainCanvas.height / 2,
              Math.min(mainCanvas.height / 2, particle.y)
            );
            particle.tempColor = `rgba(255, 255, 255, ${particle.life})`;
            break;
          case Scene.FrequencyWaveform:
            const waveformY1 =
              ((dataArray[index % bufferLength] / 128.0 - 1) *
                mainCanvas.height) /
              2;
            particle.y = waveformY1;
            if (!particle.hasOwnProperty("initialX")) {
              (particle as any).initialX =
                (index / localParticles.length) * mainCanvas.width -
                mainCanvas.width / 2;
            }
            particle.x = (particle as any).initialX;
            particle.vx = 0;
            particle.vy = 0;
            break;
          case Scene.Trailing:
            particle.trail.push({
              x: particle.x,
              y: particle.y,
              z: particle.z,
            });
            // Reduce trail length on mobile for performance
            const maxTrailLength = isMobile ? 8 : 20;
            if (particle.trail.length > maxTrailLength) {
              particle.trail.shift();
            }
            break;
          case Scene.AudioWaveform:
            const waveformY2 =
              ((timeDomainArray[frequencyIndex] / 128.0 - 1) *
                mainCanvas.height) /
              4;
            particle.y = waveformY2;
            particle.x =
              (index / localParticles.length - 0.5) * mainCanvas.width;
            break;
          case Scene.Rain:
            particle.vy += 0.1;
            if (particle.y > mainCanvas.height) {
              particle.y = -10;
              particle.x =
                Math.random() * mainCanvas.width - mainCanvas.width / 2;
            }
            break;
          case Scene.TwoParticleBalls:
            const ball1Center = { x: -100, y: 0 };
            const ball2Center = { x: 100, y: 0 };
            const ballRadius = 50;

            if (index % 2 === 0) {
              const dx = particle.x - ball1Center.x;
              const dy = particle.y - ball1Center.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance > ballRadius) {
                particle.x = ball1Center.x + (dx / distance) * ballRadius;
                particle.y = ball1Center.y + (dy / distance) * ballRadius;
              }
            } else {
              const dx = particle.x - ball2Center.x;
              const dy = particle.y - ball2Center.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance > ballRadius) {
                particle.x = ball2Center.x + (dx / distance) * ballRadius;
                particle.y = ball2Center.y + (dy / distance) * ballRadius;
              }
            }
            break;
          case Scene.Supernova:
            if (!particle.hasOwnProperty("supernovaInitialized")) {
              const angle = Math.random() * Math.PI * 2;
              const distance = Math.random() * 100;
              particle.x = Math.cos(angle) * distance;
              particle.y = Math.sin(angle) * distance;
              particle.vx = particle.x * 0.05;
              particle.vy = particle.y * 0.05;
              (particle as any).supernovaInitialized = true;
            }
            particle.vx *= 1.01;
            particle.vy *= 1.01;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.005;
            break;
          case Scene.DynamicWaveform:
            const waveformY3 =
              ((dataArray[index % bufferLength] / 128.0 - 1) *
                mainCanvas.height) /
              2;
            particle.y += (waveformY3 - particle.y) * 0.1;
            particle.x += (Math.random() - 0.5) * 2;
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            break;
          case Scene.ColorExplosion:
            const colorTime = Date.now() / 1000;
            const colorHue = (colorTime * 50 + index) % 360;
            particle.tempColor = `hsla(${colorHue}, 100%, 50%, ${particle.life})`;
            particle.vx += (Math.random() - 0.5) * 0.3;
            particle.vy += (Math.random() - 0.5) * 0.3;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            break;
          case Scene.Singularity:
            const singularityX = 0;
            const singularityY = 0;
            const dxs = singularityX - particle.x;
            const dys = singularityY - particle.y;
            const distanceToSingularity = Math.sqrt(dxs * dxs + dys * dys);
            const singularityForce = 2 / (distanceToSingularity + 1);
            particle.vx += dxs * singularityForce;
            particle.vy += dys * singularityForce;

            const spiralAngle = Math.atan2(particle.y, particle.x);
            const spiralForce = 0.5;
            particle.vx += Math.cos(spiralAngle + Math.PI / 2) * spiralForce;
            particle.vy += Math.sin(spiralAngle + Math.PI / 2) * spiralForce;

            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;

            particle.tempSize = Math.max(
              0.1,
              particle.size * (1 + singularityForce * 0.1)
            );

            const singularityIntensity = Math.min(1, singularityForce);
            const hueShift = singularityIntensity * 180;
            particle.tempColor = `hsla(${hueShift}, 100%, ${
              50 + singularityIntensity * 50
            }%, ${particle.life})`;

            if (!particle.trail) particle.trail = [];
            particle.trail.unshift({
              x: particle.x,
              y: particle.y,
              z: particle.z,
            });
            // Reduce trail length on mobile for performance
            const maxSingularityTrailLength = isMobile ? 8 : 20;
            if (particle.trail.length > maxSingularityTrailLength)
              particle.trail.pop();

            if (distanceToSingularity < 2) {
              const resetAngle = Math.random() * Math.PI * 2;
              const resetRadius = 250;
              particle.x = Math.cos(resetAngle) * resetRadius;
              particle.y = Math.sin(resetAngle) * resetRadius;
              particle.vx = 0;
              particle.vy = 0;
              particle.size = Math.random() * 2 + 1;
              particle.tempSize = particle.size;
              particle.life = Math.random() * 0.5 + 0.5;
              particle.trail = [];
            }
            break;
        }
        if (currentScene !== Scene.Lightning) {
          particle.vx += (Math.random() - 0.5) * 0.3;
          particle.vy += (Math.random() - 0.5) * 0.3;
          particle.vz += (Math.random() - 0.5) * 0.3;

          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.z += particle.vz;

          particle.vx *= 0.95;
          particle.vy *= 0.95;
          particle.vz *= 0.95;
        }

        const baseSize = particle.isCore ? 1.2 : 1;
        const frequencyFactor = (frequency / 255) * 2;
        const volumeFactor = (volume / 255) * 1;
        const size =
          (baseSize + frequencyFactor + volumeFactor) *
          (currentScene === Scene.Singularity
            ? particle.tempSize || particle.size
            : particle.size);

        particle.life -= 0.01 + (frequency / 255) * 0.005;
        if (particle.life <= 0) {
          const newAngle = Math.random() * Math.PI * 2;
          const newRadius = Math.sqrt(Math.random()) * 250;
          particle.x = Math.cos(newAngle) * newRadius;
          particle.y = Math.sin(newAngle) * newRadius;
          particle.z = (Math.random() - 0.5) * 500;
          particle.life = Math.random() * 0.5 + 0.5;
          particle.vx = 0;
          particle.vy = 0;
          particle.vz = 0;
          particle.trail = [];
          delete (particle as any).supernovaInitialized;
        }
        mainCtx.beginPath();
        mainCtx.arc(particle.x, particle.y, size, 0, Math.PI * 2);

        // Apply fade-in effect to particle opacity
        const baseOpacity = particle.life;
        const fadedOpacity = baseOpacity * fadeIn;

        mainCtx.fillStyle =
          currentScene === Scene.Lightning ||
          currentScene === Scene.ColorExplosion ||
          currentScene === Scene.Singularity
            ? particle.tempColor?.replace(/[\d.]+\)$/, `${fadedOpacity})`) ||
              `hsla(${hue}, ${saturation}%, ${lightness}%, ${fadedOpacity})`
            : particle.color?.replace(/[\d.]+\)$/, `${fadedOpacity})`) ||
              `hsla(${hue}, ${saturation}%, ${lightness}%, ${fadedOpacity})`;
        mainCtx.fill();

        // Disable expensive glow effects on mobile for performance
        if (
          !isMobile &&
          currentScene !== Scene.ColorExplosion &&
          currentScene !== Scene.Singularity
        ) {
          const glowSize = size * 1.5;
          const glow = mainCtx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            glowSize
          );
          glow.addColorStop(
            0,
            `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.3 * fadeIn})`
          );
          glow.addColorStop(
            1,
            `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`
          );
          mainCtx.fillStyle = glow;
          mainCtx.fill();
        }

        if (
          (currentScene === Scene.Trailing ||
            currentScene === Scene.Singularity) &&
          particle.trail &&
          particle.trail.length > 1
        ) {
          mainCtx.beginPath();
          mainCtx.moveTo(particle.trail[0].x, particle.trail[0].y);
          for (let i = 1; i < particle.trail.length; i++) {
            mainCtx.lineTo(particle.trail[i].x, particle.trail[i].y);
          }
          mainCtx.strokeStyle =
            currentScene === Scene.Singularity
              ? particle.tempColor?.replace(
                  /[\d.]+\)$/,
                  `${particle.life * 0.3 * fadeIn})`
                ) ||
                `hsla(${hue}, ${saturation}%, ${lightness}%, ${
                  particle.life * 0.3 * fadeIn
                })`
              : `hsla(${hue}, ${saturation}%, ${lightness}%, ${
                  particle.life * 0.5 * fadeIn
                })`;
          mainCtx.stroke();
        }
      });

      mainCtx.restore();
    };

    const drawRain = () => {
      if (currentScene === Scene.Rain) {
        rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
        const animationTime = animationStartTimeRef.current
          ? (Date.now() - animationStartTimeRef.current) / 1000
          : 0;
        const fadeIn = Math.min(animationTime / 1.5, 1); // 1.5 second fade-in
        rainCtx.strokeStyle = `rgba(200, 200, 255, ${0.5 * fadeIn})`;
        rainCtx.lineWidth = 1;

        // Update local raindrops without triggering state updates
        localRaindrops.forEach((raindrop) => {
          rainCtx.beginPath();
          rainCtx.moveTo(raindrop.x, raindrop.y);
          const angle = Math.PI / 6;
          const endX = raindrop.x - Math.cos(angle) * raindrop.length;
          const endY = raindrop.y + Math.sin(angle) * raindrop.length;
          rainCtx.lineTo(endX, endY);
          rainCtx.stroke();

          raindrop.x -= raindrop.speed * Math.tan(angle);
          raindrop.y += raindrop.speed;

          if (raindrop.y > rainCanvas.height) {
            raindrop.y = -raindrop.length;
            raindrop.x = Math.random() * rainCanvas.width;
          }
          if (raindrop.x < 0) {
            raindrop.x = rainCanvas.width;
          }
        });
      } else {
        rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
      }
    };

    const drawWaveform = () => {
      if (
        currentScene === Scene.FrequencyWaveform ||
        currentScene === Scene.DynamicWaveform
      ) {
        waveformCtx.clearRect(
          0,
          0,
          waveformCanvas.width,
          waveformCanvas.height
        );
        const animationTime = animationStartTimeRef.current
          ? (Date.now() - animationStartTimeRef.current) / 1000
          : 0;
        const fadeIn = Math.min(animationTime / 1.5, 1); // 1.5 second fade-in
        waveformCtx.lineWidth = 2;
        waveformCtx.strokeStyle = `rgba(255, 255, 255, ${0.5 * fadeIn})`;
        waveformCtx.beginPath();

        const sliceWidth = waveformCanvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * waveformCanvas.height) / 2;

          if (i === 0) {
            waveformCtx.moveTo(x, y);
          } else {
            waveformCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        waveformCtx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
        waveformCtx.stroke();
      } else {
        waveformCtx.clearRect(
          0,
          0,
          waveformCanvas.width,
          waveformCanvas.height
        );
      }
    };

    const draw = () => {
      // Initialize animation start time on first draw
      if (animationStartTimeRef.current === null) {
        animationStartTimeRef.current = Date.now();
      }

      // Frame rate limiting for mobile devices (30fps instead of 60fps)
      const now = Date.now();
      const targetFrameTime = isMobile ? 33 : 16; // 30fps vs 60fps
      if (now - lastFrameTimeRef.current < targetFrameTime) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastFrameTimeRef.current = now;

      drawMain();
      drawRain();
      drawWaveform();

      // Only set state outside the animation loop for items that have changed
      if (
        previousScene === Scene.Singularity &&
        currentScene !== Scene.Singularity
      ) {
        const resizedParticles = localParticles.map((particle) => ({
          ...particle,
          size: Math.random() * 2 + 1,
        }));
        setParticles(resizedParticles);
      }

      // Update state with local copies only when necessary
      if (
        JSON.stringify(localLightningBolts) !== JSON.stringify(lightningBolts)
      ) {
        setLightningBolts(localLightningBolts);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyser, particles, coreColorIndex, currentScene]);

  const loadAudioFile = async (file: File) => {
    if (file && audioRef.current && audioContext) {
      if (file.type.startsWith("audio/")) {
        try {
          // Resume audio context if suspended (required for autoplay policy)
          if (audioContext.state === "suspended") {
            console.log("Resuming audio context...");
            await audioContext.resume();
          }

          // Ensure audio source is connected
          if (!audioSourceRef.current && analyser) {
            console.log("Creating audio source connection...");
            audioSourceRef.current = audioContext.createMediaElementSource(
              audioRef.current
            );
            audioSourceRef.current.connect(analyser);
            analyser.connect(audioContext.destination);
          }

          const objectURL = URL.createObjectURL(file);
          audioRef.current.src = objectURL;
          audioRef.current.volume = volume;
          audioRef.current.muted = isMuted;
          setCurrentAudioUrl(objectURL);

          console.log("Loading audio file:", file.name);

          // Wait for audio to be ready and then play
          await new Promise((resolve, reject) => {
            const audio = audioRef.current!;
            const onCanPlay = () => {
              console.log("Audio can play");
              audio.removeEventListener("canplay", onCanPlay);
              audio.removeEventListener("error", onError);
              resolve(void 0);
            };
            const onError = (e: Event) => {
              console.error("Audio load error:", e);
              audio.removeEventListener("canplay", onCanPlay);
              audio.removeEventListener("error", onError);
              reject(new Error("Failed to load audio"));
            };
            audio.addEventListener("canplay", onCanPlay);
            audio.addEventListener("error", onError);
          });

          console.log("Playing audio...");
          await audioRef.current.play();
          console.log("Audio playing successfully");

          setIsAudioLoaded(true);
          setCursorStyle("none");
          // Reset scene transition progress when audio starts
          sceneTransitionProgressRef.current = 0;
          // Reset animation start time for smooth transition
          animationStartTimeRef.current = null;
        } catch (error) {
          console.error("Error loading or playing audio:", error);
          alert(
            "Failed to play audio file. Please try again or check the console for details."
          );
        }
      } else {
        alert("Please select an audio file.");
      }
    } else {
      console.error("Missing dependencies:", {
        file: !!file,
        audioRef: !!audioRef.current,
        audioContext: !!audioContext,
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadAudioFile(file);
    }
  };

  const handleCanvasClick = () => {
    if (!isAudioLoaded && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      loadAudioFile(file);
    }
  };

  const generateMusic = async () => {
    if (!musicPrompt.trim()) {
      alert("Please enter a music prompt");
      return;
    }

    setIsGeneratingMusic(true);

    try {
      console.log("Generating music with prompt:", musicPrompt);

      // Call our API route instead of direct SDK
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: musicPrompt,
          musicLengthMs: musicDuration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate music");
      }

      // Get the audio blob from the response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Load the generated music into the visualizer
      if (audioRef.current && audioContext) {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        // Ensure audio source is connected
        if (!audioSourceRef.current && analyser) {
          console.log("Creating audio source connection...");
          audioSourceRef.current = audioContext.createMediaElementSource(
            audioRef.current
          );
          audioSourceRef.current.connect(analyser);
          analyser.connect(audioContext.destination);
        }

        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume;
        audioRef.current.muted = isMuted;
        setCurrentAudioUrl(audioUrl);

        await new Promise((resolve, reject) => {
          const audio = audioRef.current!;
          const onCanPlay = () => {
            audio.removeEventListener("canplay", onCanPlay);
            audio.removeEventListener("error", onError);
            resolve(void 0);
          };
          const onError = (e: Event) => {
            console.error("Generated audio load error:", e);
            audio.removeEventListener("canplay", onCanPlay);
            audio.removeEventListener("error", onError);
            reject(new Error("Failed to load generated audio"));
          };
          audio.addEventListener("canplay", onCanPlay);
          audio.addEventListener("error", onError);
        });

        await audioRef.current.play();
        setIsAudioLoaded(true);
        setCursorStyle("none");
        setShowMusicGenerator(false);
        sceneTransitionProgressRef.current = 0;
        // Reset animation start time for smooth transition
        animationStartTimeRef.current = null;

        console.log("Generated music loaded successfully");
      }
    } catch (error) {
      console.error("Error generating music:", error);
      alert(
        `Failed to generate music: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleDownload = () => {
    if (currentAudioUrl && audioRef.current) {
      const link = document.createElement("a");
      link.href = currentAudioUrl;
      link.download = "audio-visualizer-track.mp3";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black ${inter.className}`}>
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 z-5 pointer-events-none" />
      )}

      {/* Canvas container with scale effect when dialogs are visible */}
      <div
        className={`absolute inset-0 transition-transform duration-1000 ${
          !isAudioLoaded || showMusicGenerator ? "scale-[1.5]" : "scale-100"
        }`}
      >
        <canvas
          ref={rainCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ background: "transparent" }}
        />
        <canvas
          ref={waveformCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        <canvas
          ref={mainCanvasRef}
          className="absolute inset-0 w-full h-full"
          onClick={handleCanvasClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ cursor: cursorStyle }}
        />
      </div>
      <audio ref={audioRef} className="hidden" loop />
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/m4a,audio/aac,audio/flac,audio/ogg,audio/webm,.mp3,.wav,.m4a,.aac,.flac,.ogg"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Select an audio file"
      />
      {!isAudioLoaded && !showMusicGenerator && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-black/50 backdrop-blur-sm">
          <div
            className={`transition-all duration-300 ${
              isDragOver ? "scale-105" : "scale-100"
            }`}
          >
            {/* Clean, professional container */}
            <div
              className={`relative bg-black/80 backdrop-blur-xl border rounded-3xl p-12 transition-all duration-300 ${
                isDragOver
                  ? "border-white/30 shadow-2xl shadow-white/10"
                  : "border-white/10 shadow-xl shadow-black/20"
              }`}
            >
              {/* Minimal content */}
              <div className="text-center space-y-6">
                {/* Clean icon */}
                <div className="flex justify-center">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isDragOver ? "bg-white/20" : "bg-white/10"
                    }`}
                  >
                    <svg
                      className="w-8 h-8 text-white/80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-3">
                  <h1 className="text-2xl font-light text-white/90 tracking-wide">
                    {isDragOver ? "Release to load" : "Audio Visualizer"}
                  </h1>

                  <p className="text-white/60 font-light">
                    {isDragOver
                      ? "Drop your audio file"
                      : "Click to select or drag an audio file"}
                  </p>
                </div>

                {/* Format indicators */}
                {!isDragOver && (
                  <div className="flex justify-center space-x-3">
                    {["MP3", "WAV", "FLAC", "M4A"].map((format) => (
                      <span
                        key={format}
                        className="text-xs font-mono text-white/40 px-2 py-1 rounded border border-white/10"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                )}

                {/* Centered "or" divider */}
                {!isDragOver && (
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-white/40 text-sm">or</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>
                )}

                {/* Action buttons */}
                {!isDragOver && (
                  <div className="flex flex-col space-y-3 pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMusicGenerator(true);
                      }}
                      disabled={hasApiKey === false}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/80 font-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10"
                    >
                      Generate AI Music
                    </button>

                    {hasApiKey === false ? (
                      <a
                        href="https://elevenlabs.io/app/developers/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/40 text-xs hover:text-white/60 transition-colors pointer-events-auto"
                      >
                        Requires ElevenLabs API Key
                      </a>
                    ) : (
                      <a
                        href="https://elevenlabs.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/40 text-xs hover:text-white/60 transition-colors pointer-events-auto"
                      >
                        Powered by ElevenLabs
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Subtle drag indicator */}
              {isDragOver && (
                <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-white/30 pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Music Generator Modal */}
      {showMusicGenerator && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50 backdrop-blur-sm">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 shadow-xl shadow-black/20">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-2xl font-light text-white/90 mb-2">
                  Generate AI Music
                </h2>
              </div>

              {/* Prompt Input */}
              <div className="space-y-3">
                <label className="text-white/80 text-sm font-light">
                  Describe your music
                </label>
                <textarea
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  placeholder="e.g., Create an intense, fast-paced electronic track with driving synth arpeggios, punchy drums, and aggressive rhythmic textures..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder-white/40 resize-none focus:outline-none focus:border-white/30 transition-colors"
                />

                {/* Preset Prompts */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Chill lo-fi hip hop beats",
                    "Energetic rock",
                    "Upbeat pop",
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setMusicPrompt(preset)}
                      className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selector */}
              <div className="space-y-3">
                <label className="text-white/80 text-sm font-light">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "10s", value: 10000 },
                    { label: "30s", value: 30000 },
                    { label: "45s", value: 45000 },
                    { label: "1m", value: 60000 },
                    { label: "1m 30s", value: 90000 },
                    { label: "2m", value: 120000 },
                  ].map((duration) => (
                    <button
                      key={duration.value}
                      onClick={() => setMusicDuration(duration.value)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        musicDuration === duration.value
                          ? "bg-white/20 border-white/30 text-white/90"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowMusicGenerator(false)}
                  disabled={isGeneratingMusic}
                  className="flex-1 px-4 py-3 border border-white/20 rounded-xl text-white/60 font-light hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={generateMusic}
                  disabled={isGeneratingMusic || !musicPrompt.trim()}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/80 font-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px]"
                >
                  {isGeneratingMusic ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Generate"
                  )}
                </button>
              </div>

              {/* Generation Info */}
              <div className="text-center">
                <a
                  href="https://elevenlabs.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 text-xs hover:text-white/60 transition-colors"
                >
                  Powered by ElevenLabs
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`absolute top-6 left-6 z-30 transition-all duration-500 ${
          showSceneName
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="text-white/80 font-light text-lg tracking-wide">
          {SCENE_NAMES[currentScene as number]}
        </div>
      </div>

      {/* Download button */}
      {isAudioLoaded && currentAudioUrl && (
        <div
          className={`absolute bottom-6 right-6 z-30 transition-all duration-500 ${
            showSceneName
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 text-white/80 font-light text-lg tracking-wide hover:text-white/100 transition-colors cursor-pointer"
          >
            <span>Download</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
