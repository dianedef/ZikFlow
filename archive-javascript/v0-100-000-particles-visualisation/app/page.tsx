"use client"

import { useEffect, useRef, useState } from "react"

const PARTICLE_COUNTS = [10000, 100000, 500000] as const

export default function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const deviceRef = useRef<GPUDevice | null>(null)
  const contextRef = useRef<GPUCanvasContext | null>(null)
  const pipelinesRef = useRef<{
    compute: GPUComputePipeline | null
    render: GPURenderPipeline | null
  }>({ compute: null, render: null })
  const buffersRef = useRef<{
    particles: GPUBuffer | null
    audioData: GPUBuffer | null
    uniforms: GPUBuffer | null
  }>({ particles: null, audioData: null, uniforms: null })
  const bindGroupsRef = useRef<{
    compute: GPUBindGroup | null
    render: GPUBindGroup | null
  }>({ compute: null, render: null })

  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string>("")
  const [particleCount, setParticleCount] = useState<number>(PARTICLE_COUNTS[1])
  const [supportsWebGPU, setSupportsWebGPU] = useState<boolean | null>(null)

  useEffect(() => {
    const checkWebGPU = async () => {
      if (!navigator.gpu) {
        setSupportsWebGPU(false)
        setError("WebGPU is not supported in this browser. Use Chrome 113+")
        return
      }
      setSupportsWebGPU(true)
    }
    checkWebGPU()
  }, [])

  const initWebGPU = async () => {
    if (!navigator.gpu) {
      throw new Error("WebGPU is not supported")
    }

    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      throw new Error("Could not get GPU adapter")
    }

    const device = await adapter.requestDevice()
    deviceRef.current = device

    const canvas = canvasRef.current
    if (!canvas) throw new Error("Canvas not found")

    const context = canvas.getContext("webgpu")
    if (!context) throw new Error("WebGPU context not created")

    contextRef.current = context

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
      device,
      format: presentationFormat,
      alphaMode: "premultiplied",
    })

    const computeShaderCode = `
      struct Particle {
        position: vec2f,
        velocity: vec2f,
        angle: f32,
        radius: f32,
        baseRadius: f32,
        size: f32,
        hue: f32,
        life: f32,
      }

      struct AudioData {
        bass: f32,
        mid: f32,
        treble: f32,
        time: f32,
      }

      struct Uniforms {
        resolution: vec2f,
        particleCount: f32,
        _pad: f32,
      }

      @group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
      @group(0) @binding(1) var<uniform> audioData: AudioData;
      @group(0) @binding(2) var<uniform> uniforms: Uniforms;

      fn hash(p: vec2f) -> f32 {
        let p3 = fract(vec3f(p.x, p.y, p.x) * 0.1031);
        let dotResult = dot(p3, vec3f(p3.y, p3.z, p3.x) + 33.33);
        return fract((p3.x + p3.y) * dotResult);
      }
      
      fn hash2(p: vec2f) -> vec2f {
        return vec2f(hash(p), hash(p + vec2f(127.1, 311.7)));
      }

      fn noise(p: vec2f) -> f32 {
        let i = floor(p);
        let f = fract(p);
        let u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2f(0.0, 0.0)), hash(i + vec2f(1.0, 0.0)), u.x),
          mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), u.x),
          u.y
        );
      }

      fn fbm(p: vec2f) -> f32 {
        var value = 0.0;
        var amplitude = 0.5;
        var pos = p;
        for (var i = 0; i < 4; i++) {
          value += amplitude * noise(pos);
          pos *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      fn randomRespawn(index: u32, time: f32, resolution: vec2f) -> vec2f {
        let seed = vec2f(f32(index) * 0.001 + time, f32(index) * 0.002 - time);
        return vec2f(hash(seed) * resolution.x, hash(seed + vec2f(42.0, 17.0)) * resolution.y);
      }
      
      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) global_id: vec3u) {
        let index = global_id.x;
        if (index >= u32(uniforms.particleCount)) {
          return;
        }

        var particle = particles[index];
        
        let time = audioData.time * 0.1;
        let scale = 0.002;
        
        // Simple flow field angle from noise
        let noiseVal = fbm(particle.position * scale + vec2f(time, 0.0));
        let angle = noiseVal * 6.28318 * 2.0;
        
        // Audio response
        let bass = audioData.bass;
        let mid = audioData.mid;
        let treble = audioData.treble;
        let energy = bass * 0.6 + mid * 0.3 + treble * 0.1;
        
        // Flow direction from angle
        let flowDir = vec2f(cos(angle), sin(angle));
        let flowStrength = 0.5 + energy * 2.0;
        
        // Apply force
        particle.velocity += flowDir * flowStrength * 0.1;
        
        // Damping
        particle.velocity *= 0.96;
        
        // Speed limit
        let maxSpeed = 3.0 + energy * 2.0;
        let speed = length(particle.velocity);
        if (speed > maxSpeed) {
          particle.velocity = normalize(particle.velocity) * maxSpeed;
        }
        
        particle.position += particle.velocity;
        
        // Wrap around edges
        if (particle.position.x < 0.0) {
          particle.position.x = uniforms.resolution.x;
        } else if (particle.position.x > uniforms.resolution.x) {
          particle.position.x = 0.0;
        }
        if (particle.position.y < 0.0) {
          particle.position.y = uniforms.resolution.y;
        } else if (particle.position.y > uniforms.resolution.y) {
          particle.position.y = 0.0;
        }
        
        let respawnChance = hash(vec2f(f32(index), audioData.time * 100.0));
        if (respawnChance < 0.001) {
          particle.position = randomRespawn(index, audioData.time, uniforms.resolution);
          particle.velocity = vec2f(0.0, 0.0);
          particle.life = 0.0;
        }
        
        // Size reacts to audio
        particle.size = 1.0 + bass * 2.0;
        
        particle.hue = fract(noiseVal + f32(index) * 0.0001 + time * 0.05);
        
        // Life fade in
        particle.life = min(particle.life + 0.02, 1.0);
        
        particles[index] = particle;
      }
    `

    const renderShaderCode = `
      struct Particle {
        position: vec2f,
        velocity: vec2f,
        angle: f32,
        radius: f32,
        baseRadius: f32,
        size: f32,
        hue: f32,
        life: f32,
      }

      struct Uniforms {
        resolution: vec2f,
        particleCount: f32,
        _pad: f32,
      }

      @group(0) @binding(0) var<storage, read> particles: array<Particle>;
      @group(0) @binding(1) var<uniform> uniforms: Uniforms;

      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
      }

      fn hslToRgb(h: f32, s: f32, l: f32) -> vec3f {
        let c = (1.0 - abs(2.0 * l - 1.0)) * s;
        let x = c * (1.0 - abs((h * 6.0) % 2.0 - 1.0));
        let m = l - c / 2.0;
        
        var rgb = vec3f(0.0);
        if (h < 0.166667) {
          rgb = vec3f(c, x, 0.0);
        } else if (h < 0.333333) {
          rgb = vec3f(x, c, 0.0);
        } else if (h < 0.5) {
          rgb = vec3f(0.0, c, x);
        } else if (h < 0.666667) {
          rgb = vec3f(0.0, x, c);
        } else if (h < 0.833333) {
          rgb = vec3f(x, 0.0, c);
        } else {
          rgb = vec3f(c, 0.0, x);
        }
        
        return rgb + vec3f(m);
      }

      @vertex
      fn vertexMain(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> VertexOutput {
        let particle = particles[instanceIndex];
        
        var positions = array<vec2f, 6>(
          vec2f(-1.0, -1.0),
          vec2f(1.0, -1.0),
          vec2f(-1.0, 1.0),
          vec2f(-1.0, 1.0),
          vec2f(1.0, -1.0),
          vec2f(1.0, 1.0)
        );
        
        let quadPos = positions[vertexIndex];
        let worldPos = particle.position + quadPos * particle.size * 1.5;
        
        let ndc = (worldPos / uniforms.resolution) * 2.0 - 1.0;
        let ndcFlipped = vec2f(ndc.x, -ndc.y);
        
        var output: VertexOutput;
        output.position = vec4f(ndcFlipped, 0.0, 1.0);
        output.uv = quadPos;
        
        // More saturated, vibrant colors
        let saturation = 0.9;
        let lightness = 0.55;
        let rgb = hslToRgb(particle.hue, saturation, lightness);
        output.color = vec4f(rgb * particle.life, particle.life);
        
        return output;
      }

      @fragment
      fn fragmentMain(@location(0) color: vec4f, @location(1) uv: vec2f) -> @location(0) vec4f {
        let dist = length(uv);
        let alpha = 1.0 - smoothstep(0.0, 1.0, dist);
        let glow = exp(-dist * 2.0);
        
        return vec4f(color.rgb * (glow + 0.3), alpha * color.a * 0.8);
      }
    `

    const computeShaderModule = device.createShaderModule({
      code: computeShaderCode,
    })

    const renderShaderModule = device.createShaderModule({
      code: renderShaderCode,
    })

    const computePipeline = device.createComputePipeline({
      layout: "auto",
      compute: {
        module: computeShaderModule,
        entryPoint: "main",
      },
    })

    const renderPipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: renderShaderModule,
        entryPoint: "vertexMain",
      },
      fragment: {
        module: renderShaderModule,
        entryPoint: "fragmentMain",
        targets: [
          {
            format: presentationFormat,
            blend: {
              color: {
                srcFactor: "src-alpha",
                dstFactor: "one",
                operation: "add",
              },
              alpha: {
                srcFactor: "one",
                dstFactor: "one",
                operation: "add",
              },
            },
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
    })

    pipelinesRef.current = {
      compute: computePipeline,
      render: renderPipeline,
    }
  }

  const initParticles = (count: number) => {
    const device = deviceRef.current
    if (!device) return

    if (buffersRef.current.particles) {
      buffersRef.current.particles.destroy()
    }
    if (buffersRef.current.audioData) {
      buffersRef.current.audioData.destroy()
    }
    if (buffersRef.current.uniforms) {
      buffersRef.current.uniforms.destroy()
    }

    const particleData = new Float32Array(count * 10)
    const canvas = canvasRef.current
    const width = canvas?.width || 1920
    const height = canvas?.height || 1080

    for (let i = 0; i < count; i++) {
      const offset = i * 10
      particleData[offset + 0] = Math.random() * width
      particleData[offset + 1] = Math.random() * height
      particleData[offset + 2] = (Math.random() - 0.5) * 2
      particleData[offset + 3] = (Math.random() - 0.5) * 2
      particleData[offset + 4] = Math.random() * Math.PI * 2
      particleData[offset + 5] = 0
      particleData[offset + 6] = 0
      particleData[offset + 7] = 1 + Math.random() * 2
      particleData[offset + 8] = Math.random()
      particleData[offset + 9] = Math.random()
    }

    const particleBuffer = device.createBuffer({
      size: particleData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })

    new Float32Array(particleBuffer.getMappedRange()).set(particleData)
    particleBuffer.unmap()

    const audioBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const uniformsData = new Float32Array([width, height, count, 0])

    const uniformsBuffer = device.createBuffer({
      size: uniformsData.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })

    new Float32Array(uniformsBuffer.getMappedRange()).set(uniformsData)
    uniformsBuffer.unmap()

    buffersRef.current = {
      particles: particleBuffer,
      audioData: audioBuffer,
      uniforms: uniformsBuffer,
    }

    const computePipeline = pipelinesRef.current.compute
    const renderPipeline = pipelinesRef.current.render

    if (computePipeline && renderPipeline) {
      const computeBindGroup = device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: particleBuffer } },
          { binding: 1, resource: { buffer: audioBuffer } },
          { binding: 2, resource: { buffer: uniformsBuffer } },
        ],
      })

      const renderBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: particleBuffer } },
          { binding: 1, resource: { buffer: uniformsBuffer } },
        ],
      })

      bindGroupsRef.current = {
        compute: computeBindGroup,
        render: renderBindGroup,
      }
    }
  }

  const startAudio = async () => {
    try {
      setError("")

      await initWebGPU()
      initParticles(particleCount)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.85

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      dataArrayRef.current = dataArray

      setIsActive(true)
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const stopAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setIsActive(false)
  }

  const changeParticleCount = (count: number) => {
    setParticleCount(count)
    if (isActive && deviceRef.current) {
      initParticles(count)
    }
  }

  useEffect(() => {
    if (!isActive) return

    const device = deviceRef.current
    const context = contextRef.current
    const computePipeline = pipelinesRef.current.compute
    const renderPipeline = pipelinesRef.current.render
    const buffers = buffersRef.current
    const bindGroups = bindGroupsRef.current

    if (
      !device ||
      !context ||
      !computePipeline ||
      !renderPipeline ||
      !buffers.particles ||
      !buffers.audioData ||
      !buffers.uniforms ||
      !bindGroups.compute ||
      !bindGroups.render
    ) {
      return
    }

    const animate = () => {
      const analyser = analyserRef.current
      const dataArray = dataArrayRef.current

      if (!analyser || !dataArray) return

      analyser.getByteFrequencyData(dataArray)

      const bassEnd = Math.floor(dataArray.length * 0.15)
      const midEnd = Math.floor(dataArray.length * 0.4)

      let bassSum = 0
      let midSum = 0
      let trebleSum = 0
      let bassCount = 0
      let midCount = 0
      let trebleCount = 0

      for (let i = 0; i < bassEnd; i++) {
        const weight = 1.0 + (i / bassEnd) * 2.0
        bassSum += dataArray[i] * weight
        bassCount += weight
      }
      for (let i = bassEnd; i < midEnd; i++) {
        midSum += dataArray[i]
        midCount++
      }
      for (let i = midEnd; i < dataArray.length; i++) {
        trebleSum += dataArray[i]
        trebleCount++
      }

      const bass = bassSum / bassCount / 255
      const mid = midSum / midCount / 255
      const treble = trebleSum / trebleCount / 255

      const audioData = new Float32Array([bass, mid, treble, performance.now() / 1000])
      device.queue.writeBuffer(buffersRef.current.audioData!, 0, audioData)

      const commandEncoder = device.createCommandEncoder()

      const computePass = commandEncoder.beginComputePass()
      computePass.setPipeline(computePipeline)
      computePass.setBindGroup(0, bindGroupsRef.current.compute!)
      const workgroupCount = Math.ceil(particleCount / 64)
      computePass.dispatchWorkgroups(workgroupCount)
      computePass.end()

      const textureView = context.getCurrentTexture().createView()
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 0.02, g: 0.02, b: 0.05, a: 1 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      })

      renderPass.setPipeline(renderPipeline)
      renderPass.setBindGroup(0, bindGroupsRef.current.render!)
      renderPass.draw(6, particleCount)
      renderPass.end()

      device.queue.submit([commandEncoder.finish()])

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, particleCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      if (buffersRef.current.uniforms && deviceRef.current) {
        const uniformsData = new Float32Array([canvas.width, canvas.height, particleCount, 0])
        deviceRef.current.queue.writeBuffer(buffersRef.current.uniforms, 0, uniformsData)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [particleCount])

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute top-6 right-6 z-10 text-right">
        <div className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-light">WebGPU Audio Visualizer</div>
        <div className="text-white/10 text-[9px] tracking-[0.2em] uppercase mt-1">Flow Field Algorithm</div>
      </div>

      <div className="absolute bottom-8 right-8 z-10 flex flex-col items-end gap-5">
        {/* Particle count selector */}
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-[10px] tracking-[0.25em] uppercase font-light">Particles</span>
          <div className="flex">
            {PARTICLE_COUNTS.map((count, i) => (
              <button
                key={count}
                onClick={() => changeParticleCount(count)}
                className={`
                  px-5 py-2.5 text-xs font-light tracking-wider transition-all duration-300
                  border border-white/10
                  ${
                    particleCount === count
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white/50 hover:text-white hover:border-white/30"
                  }
                  ${i === 0 ? "rounded-l-md" : ""}
                  ${i === PARTICLE_COUNTS.length - 1 ? "rounded-r-md" : ""}
                  ${i !== 0 ? "-ml-px" : ""}
                `}
              >
                {count >= 1000 ? `${count / 1000}K` : count}
              </button>
            ))}
          </div>
        </div>

        {/* Start/Stop button */}
        <button
          onClick={isActive ? stopAudio : startAudio}
          disabled={supportsWebGPU === false}
          className={`
            px-10 py-3.5 text-xs font-light tracking-[0.3em] uppercase transition-all duration-300 rounded-md
            ${
              isActive
                ? "bg-transparent text-white/60 border border-white/20 hover:border-red-500/50 hover:text-red-400"
                : "bg-white text-black hover:bg-white/90"
            }
            disabled:opacity-20 disabled:cursor-not-allowed
          `}
        >
          {isActive ? "Stop" : "Start Microphone"}
        </button>

        {error && <div className="text-red-400/80 text-[10px] tracking-wide max-w-xs text-right">{error}</div>}
      </div>

      {/* Subtle tech info - bottom left */}
      {isActive && (
        <div className="absolute bottom-6 left-6 z-10">
          <div className="text-white/15 text-[9px] tracking-[0.2em] uppercase font-light">
            {particleCount.toLocaleString()} particles
          </div>
        </div>
      )}
    </div>
  )
}
