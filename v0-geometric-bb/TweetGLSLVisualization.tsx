"use client"

import { useRef, useEffect, useState, useCallback } from "react"

export default function TweetGLSLVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null)
  const resolutionUniformLocationRef = useRef<WebGLUniformLocation | null>(null)
  const timeUniformLocationRef = useRef<WebGLUniformLocation | null>(null)
  const startTimeRef = useRef<number>(0)

  // Effect toggle states
  const [mosaicEnabled, setMosaicEnabled] = useState(false)
  const [invertEnabled, setInvertEnabled] = useState(false)
  const [distortEnabled, setDistortEnabled] = useState(false)
  const [colorShiftEnabled, setColorShiftEnabled] = useState(false)
  const [kaleidoscopeEnabled, setKaleidoscopeEnabled] = useState(false)
  const [vignetteEnabled, setVignetteEnabled] = useState(false)
  const [pulseEnabled, setPulseEnabled] = useState(false)
  const [glitchEnabled, setGlitchEnabled] = useState(false)
  const [bloomEnabled, setBloomEnabled] = useState(false)

  // Effect uniform locations
  const mosaicUniformLocationRef = useRef<WebGLUniformLocation | null>(null)
  const invertUniformLocationRef = useRef<WebGLUniformLocation | null>(null)
  const distortUniformLocationRef = useRef<WebGLUniformLocation | null>(null)
  const colorShiftUniformLocationRef = useRef<WebGLUniformLocation | null>(null)
  const kaleidoscopeUniformLocationRef = useRef<WebGLUniformLocation | null>(null)
  const vignetteUniformLocationRef = useRef<WebGLUniformLocation | null>(null)
  const pulseUniformLocationRef = useRef<WebGLUniformLocation | null>(null)
  const glitchUniformLocationRef = useRef<WebGLUniformLocation | null>(null)
  const bloomUniformLocationRef = useRef<WebGLUniformLocation | null>(null)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext("webgl2")
    const program = programRef.current
    const vao = vaoRef.current
    const resolutionUniformLocation = resolutionUniformLocationRef.current
    const timeUniformLocation = timeUniformLocationRef.current
    const mosaicUniformLocation = mosaicUniformLocationRef.current
    const invertUniformLocation = invertUniformLocationRef.current
    const distortUniformLocation = distortUniformLocationRef.current
    const colorShiftUniformLocation = colorShiftUniformLocationRef.current
    const kaleidoscopeUniformLocation = kaleidoscopeUniformLocationRef.current
    const vignetteUniformLocation = vignetteUniformLocationRef.current
    const pulseUniformLocation = pulseUniformLocationRef.current
    const glitchUniformLocation = glitchUniformLocationRef.current
    const bloomUniformLocation = bloomUniformLocationRef.current

    if (
      !gl ||
      !program ||
      !vao ||
      !resolutionUniformLocation ||
      !timeUniformLocation ||
      !mosaicUniformLocation ||
      !invertUniformLocation ||
      !distortUniformLocation ||
      !colorShiftUniformLocation ||
      !kaleidoscopeUniformLocation ||
      !vignetteUniformLocation ||
      !pulseUniformLocation ||
      !glitchUniformLocation ||
      !bloomUniformLocation
    )
      return

    // Update time
    const currentTime = (Date.now() - startTimeRef.current) / 1000

    // Clear the canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Set uniforms
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)
    gl.uniform1f(timeUniformLocation, currentTime)

    // Set effect uniforms
    gl.uniform1i(mosaicUniformLocation, mosaicEnabled ? 1 : 0)
    gl.uniform1i(invertUniformLocation, invertEnabled ? 1 : 0)
    gl.uniform1i(distortUniformLocation, distortEnabled ? 1 : 0)
    gl.uniform1i(colorShiftUniformLocation, colorShiftEnabled ? 1 : 0)
    gl.uniform1i(kaleidoscopeUniformLocation, kaleidoscopeEnabled ? 1 : 0)
    gl.uniform1i(vignetteUniformLocation, vignetteEnabled ? 1 : 0)
    gl.uniform1i(pulseUniformLocation, pulseEnabled ? 1 : 0)
    gl.uniform1i(glitchUniformLocation, glitchEnabled ? 1 : 0)
    gl.uniform1i(bloomUniformLocation, bloomEnabled ? 1 : 0)

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // Request next frame
    requestAnimationFrame(render)
  }, [
    mosaicEnabled,
    invertEnabled,
    distortEnabled,
    colorShiftEnabled,
    kaleidoscopeEnabled,
    vignetteEnabled,
    pulseEnabled,
    glitchEnabled,
    bloomEnabled,
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get WebGL2 context
    const gl = canvas.getContext("webgl2")
    if (!gl) {
      console.error("WebGL2 not supported")
      return
    }

    // Resize canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create shaders
    const vertexShaderSource = `#version 300 es
      in vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `

    const fragmentShaderSource = `#version 300 es
  precision highp float;
  out vec4 outColor;
  uniform vec2 u_resolution;
  uniform float u_time;
  
  // Effect uniforms
  uniform bool u_mosaicEnabled;
  uniform bool u_invertEnabled;
  uniform bool u_distortEnabled;
  uniform bool u_colorShiftEnabled;
  uniform bool u_kaleidoscopeEnabled;
  uniform bool u_vignetteEnabled;
  uniform bool u_pulseEnabled;
  uniform bool u_glitchEnabled;
  uniform bool u_bloomEnabled;

  // Rotation matrix function - Creates a 3D rotation matrix around an arbitrary axis
  mat3 rotate3D(float angle, vec3 axis) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat3(
      oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
    );
  }

  // HSV to RGB conversion function
  vec3 hsv(float h, float s, float v) {
    vec4 t = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
  }
  
  // Simple hash function for noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  // Random function for glitch effect
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  // Gaussian blur approximation for bloom effect
  vec3 blur(vec3 color, float strength) {
    return color * (1.0 + strength);
  }

  void main() {
    // Initialize variables:
    vec2 r = u_resolution;
    vec2 FC = gl_FragCoord.xy;
    float t = u_time;
    
    // Apply pulse effect if enabled
    float pulseIntensity = 1.0;
    if (u_pulseEnabled) {
      pulseIntensity = 1.0 + 0.3 * sin(u_time * 2.0);
    }
    
    // Apply glitch effect if enabled
    if (u_glitchEnabled) {
      float glitchStrength = 0.02;
      float glitchTime = floor(u_time * 10.0);
      
      // Random glitch lines
      if (random(vec2(glitchTime)) > 0.8) {
        float lineY = floor(random(vec2(glitchTime)) * r.y / 20.0) * 20.0;
        if (abs(FC.y - lineY) < 5.0) {
          FC.x += sin(FC.y * 0.1 + u_time * 20.0) * 20.0 * random(vec2(glitchTime, lineY));
        }
      }
      
      // Random color blocks
      if (random(vec2(glitchTime * 0.5)) > 0.9) {
        if (random(floor(FC / 30.0)) > 0.95) {
          FC.x += random(vec2(glitchTime * 0.2)) * 100.0 - 50.0;
        }
      }
    }
    
    // Apply mosaic effect if enabled
    if (u_mosaicEnabled) {
      float mosaicSize = 10.0 + 5.0 * sin(u_time * 0.2);
      FC = floor(FC / mosaicSize) * mosaicSize + mosaicSize * 0.5;
    }
    
    // Apply kaleidoscope effect if enabled
    if (u_kaleidoscopeEnabled) {
      vec2 center = r * 0.5;
      vec2 centered = FC - center;
      float angle = 3.14159 / 4.0; // 45 degrees
      float segments = 8.0;
      
      // Convert to polar coordinates
      float radius = length(centered);
      float theta = atan(centered.y, centered.x);
      
      // Apply kaleidoscope effect
      theta = mod(theta, 2.0 * 3.14159 / segments);
      if (mod(floor(theta / (3.14159 / segments)), 2.0) == 1.0) {
        theta = 2.0 * 3.14159 / segments - theta;
      }
      
      // Convert back to Cartesian coordinates
      centered = radius * vec2(cos(theta), sin(theta));
      FC = centered + center;
    }
    
    // Apply distortion effect if enabled
    if (u_distortEnabled) {
      t += hash(FC / r) * 2.0;
      FC.x += sin(FC.y * 0.01 + t) * 10.0;
      FC.y += cos(FC.x * 0.01 + t) * 10.0;
    }
    
    vec4 o = vec4(0, 0, 0, 1);
    
    // Main rendering loop
    for(float i=0.,g=0.,e=0.,s=0.;++i<11.;) {
      vec3 p = vec3((FC.xy-.5*r)/r.x*(5.-sin(t*.3)*2.),g+.3)*rotate3D(t*.3,vec3(1));
      
      s=1.;
      
      for(int i=0;i++<45;
          p=vec3(0,3.1,3)-abs(abs(p)*e-vec3(2,2.8,3.05)))
        s*=e=max(1.,10./dot(p,p));
      
      g-=mod(length(p.yx+p.zy),p.y)/s*.6;
      
      float hue = 0.6;
      
      // Apply color shift if enabled
      if (u_colorShiftEnabled) {
        hue = mod(hue + u_time * 0.05, 1.0);
      }
      
      // Apply pulse effect to color intensity
      vec3 color = hsv(hue, g*i-.4*p.x, s/4e3 * pulseIntensity);
      
      // Apply bloom effect if enabled
      if (u_bloomEnabled) {
        float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
        if (brightness > 0.7) {
          color = blur(color, 0.5);
        }
      }
      
      o.rgb += color;
    }
    
    // Apply invert effect if enabled
    if (u_invertEnabled) {
      o.rgb = 1.0 - o.rgb;
    }
    
    // Apply vignette effect if enabled
    if (u_vignetteEnabled) {
      vec2 uv = FC / r;
      float vignette = smoothstep(1.0, 0.0, length(uv - 0.5) * 1.5);
      o.rgb *= vignette;
    }
    
    outColor = o;
  }
`

    // Create shader program
    function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)
      if (!shader) {
        console.error("Failed to create shader")
        return null
      }
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
      if (success) {
        return shader
      }
      console.error(gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) {
      console.error("Failed to create program")
      return
    }

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!success) {
      console.error(gl.getProgramInfoLog(program))
      return
    }

    programRef.current = program

    // Set up position buffer
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    // Create a vertex array object
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    gl.enableVertexAttribArray(positionAttributeLocation)

    // Specify how to pull data out of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    // Set up the positions (a rectangle that covers the entire canvas)
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    vaoRef.current = vao

    // Get uniform locations
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution")
    const timeUniformLocation = gl.getUniformLocation(program, "u_time")

    // Get effect uniform locations
    const mosaicUniformLocation = gl.getUniformLocation(program, "u_mosaicEnabled")
    const invertUniformLocation = gl.getUniformLocation(program, "u_invertEnabled")
    const distortUniformLocation = gl.getUniformLocation(program, "u_distortEnabled")
    const colorShiftUniformLocation = gl.getUniformLocation(program, "u_colorShiftEnabled")
    const kaleidoscopeUniformLocation = gl.getUniformLocation(program, "u_kaleidoscopeEnabled")
    const vignetteUniformLocation = gl.getUniformLocation(program, "u_vignetteEnabled")
    const pulseUniformLocation = gl.getUniformLocation(program, "u_pulseEnabled")
    const glitchUniformLocation = gl.getUniformLocation(program, "u_glitchEnabled")
    const bloomUniformLocation = gl.getUniformLocation(program, "u_bloomEnabled")

    resolutionUniformLocationRef.current = resolutionUniformLocation
    timeUniformLocationRef.current = timeUniformLocation
    mosaicUniformLocationRef.current = mosaicUniformLocation
    invertUniformLocationRef.current = invertUniformLocation
    distortUniformLocationRef.current = distortUniformLocation
    colorShiftUniformLocationRef.current = colorShiftUniformLocation
    kaleidoscopeUniformLocationRef.current = kaleidoscopeUniformLocation
    vignetteUniformLocationRef.current = vignetteUniformLocation
    pulseUniformLocationRef.current = pulseUniformLocation
    glitchUniformLocationRef.current = glitchUniformLocation
    bloomUniformLocationRef.current = bloomUniformLocation

    // Use the program outside the render loop
    gl.useProgram(program)

    // Start time
    startTimeRef.current = Date.now()

    // Start rendering
    render()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (program) gl.deleteProgram(program)
      if (vertexShader) gl.deleteShader(vertexShader)
      if (fragmentShader) gl.deleteShader(fragmentShader)
      if (positionBuffer) gl.deleteBuffer(positionBuffer)
      if (vao) gl.deleteVertexArray(vao)
    }
  }, [render])

  // Group effects for UI organization
  const effectGroups = [
    {
      title: "Basic Effects",
      effects: [
        { name: "Mosaic", state: mosaicEnabled, setState: setMosaicEnabled },
        { name: "Invert", state: invertEnabled, setState: setInvertEnabled },
        { name: "Distort", state: distortEnabled, setState: setDistortEnabled },
        { name: "Color Shift", state: colorShiftEnabled, setState: setColorShiftEnabled },
      ],
    },
    {
      title: "Advanced Effects",
      effects: [
        { name: "Kaleidoscope", state: kaleidoscopeEnabled, setState: setKaleidoscopeEnabled },
        { name: "Vignette", state: vignetteEnabled, setState: setVignetteEnabled },
        { name: "Pulse", state: pulseEnabled, setState: setPulseEnabled },
        { name: "Glitch", state: glitchEnabled, setState: setGlitchEnabled },
        { name: "Bloom", state: bloomEnabled, setState: setBloomEnabled },
      ],
    },
  ]

  return (
    <div className="relative w-full h-screen">
      <canvas ref={canvasRef} className="w-full h-screen block" style={{ touchAction: "none" }} />

      {/* Effect control buttons */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col gap-4 p-4 bg-black/70 rounded-lg max-w-3xl w-full">
        {effectGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="w-full">
            <h3 className="text-white text-sm font-medium mb-2">{group.title}</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {group.effects.map((effect, effectIndex) => (
                <button
                  key={effectIndex}
                  onClick={() => effect.setState(!effect.state)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    effect.state ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {effect.name} {effect.state ? "ON" : "OFF"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <a
        href="https://x.com/YoheiNishitsuji/status/1911364146647409010"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 text-white text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
      >
        @Yohei Nishitsuji
      </a>
    </div>
  )
}
