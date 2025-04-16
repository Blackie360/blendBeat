"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, Float, OrbitControls, Text3D, useGLTF, Sparkles } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import * as THREE from "three"

// Separate the 3D components to allow for error boundaries and suspense
function Scene() {
  return (
    <>
      <color attach="background" args={["#0c0a10"]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      <Suspense fallback={null}>
        <VinylRecord position={[0, 0, 0]} rotation={[0, 0, 0]} />
        <MusicNotes count={20} />
        <Sparkles count={100} scale={10} size={1} speed={0.3} color="#8B5CF6" />

        <Text3D
          font="/fonts/Inter_Bold.json"
          position={[-2.5, 2, 0]}
          scale={0.5}
          curveSegments={32}
          bevelEnabled
          bevelSize={0.04}
          bevelThickness={0.1}
          height={0.5}
          lineHeight={0.5}
          letterSpacing={0.1}
        >
          Spotify Blend
          <meshStandardMaterial color="#8B5CF6" />
        </Text3D>
      </Suspense>

      <Environment preset="night" />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  )
}

function VinylRecord({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const [model, setModel] = useState(null)
  const groupRef = useRef()
  const { nodes } = useGLTF("/assets/3d/duck.glb") // Always call useGLTF

  useEffect(() => {
    // Safely load the model
    try {
      const loadModel = async () => {
        try {
          //const { nodes } = await useGLTF("/assets/3d/duck.glb")
          setModel(nodes.LOD3spShape)
        } catch (error) {
          console.error("Error loading 3D model:", error)
          // Fallback to a simple sphere if model fails to load
          setModel(new THREE.SphereGeometry(1, 32, 32))
        }
      }

      loadModel()
    } catch (error) {
      console.error("Error in useEffect:", error)
    }
  }, [nodes])

  useEffect(() => {
    if (!groupRef.current || !model) return

    try {
      // Apply purple material to the model
      groupRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#6D28D9"),
            metalness: 0.3,
            roughness: 0.4,
          })
        }
      })
    } catch (error) {
      console.error("Error applying material:", error)
    }
  }, [model])

  if (!model) return null

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef} position={position} rotation={rotation} scale={2}>
        {model && <primitive object={model} />}
      </group>
    </Float>
  )
}

function MusicNotes({ count = 15 }) {
  const notes = []
  const colors = ["#6D28D9", "#8B5CF6", "#A78BFA", "#C4B5FD"]

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 10
    const y = (Math.random() - 0.5) * 10 + 2
    const z = (Math.random() - 0.5) * 10 - 2
    const scale = 0.1 + Math.random() * 0.2
    const rotation = [0, Math.random() * Math.PI * 2, 0]
    const color = colors[Math.floor(Math.random() * colors.length)]

    notes.push(
      <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={2}>
        <Text3D
          font="/fonts/Inter_Bold.json"
          position={[x, y, z]}
          rotation={rotation}
          scale={scale}
          curveSegments={32}
          bevelEnabled
          bevelSize={0.04}
          bevelThickness={0.1}
          height={0.5}
          lineHeight={0.5}
          letterSpacing={0.1}
        >
          ♪
          <meshStandardMaterial color={color} />
        </Text3D>
      </Float>,
    )
  }

  return <>{notes}</>
}

// Fallback component if 3D rendering fails
function FallbackHeader() {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gradient-to-r from-purple-900 to-violet-800">
      <h1 className="text-4xl font-bold text-white">Spotify Blend</h1>
    </div>
  )
}

export default function Home() {
  const [isHovered, setIsHovered] = useState(false)
  const [canvasError, setCanvasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set loading to false after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background to-black">
      <div className="relative w-full h-screen">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          </div>
        ) : canvasError ? (
          <FallbackHeader />
        ) : (
          <ErrorBoundary fallback={<FallbackHeader />} onError={() => setCanvasError(true)}>
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
              <Scene />
            </Canvas>
          </ErrorBoundary>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
          <div className="max-w-3xl p-6 md:p-8 text-center bg-black/40 rounded-2xl backdrop-blur-md pointer-events-auto border border-purple-500/20 shadow-xl shadow-purple-900/20">
            <h1 className="mb-6 text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-violet-600 text-transparent bg-clip-text">
              Spotify Blend
            </h1>
            <p className="mb-8 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              Create collaborative playlists with friends or discover new music with random collaborators
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md mx-auto">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white shadow-lg shadow-purple-900/30 border-0 transition-all duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Link href="/dashboard" className="flex items-center justify-center">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-white border-purple-400/30 bg-purple-950/30 hover:bg-purple-900/40 hover:text-purple-200 transition-all duration-300"
              >
                <Link href="/about" className="flex items-center justify-center">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Simple error boundary component
function ErrorBoundary({ children, fallback, onError }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const errorHandler = (event) => {
      event.preventDefault()
      setHasError(true)
      if (onError) onError()
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [onError])

  if (hasError) {
    return fallback
  }

  return children
}
