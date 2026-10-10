import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, N8AO, SMAA, Vignette } from '@react-three/postprocessing'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Pet } from '../pets/Pet'
import { CameraRig } from './CameraRig'
import { CAMERA } from './layout'
import { Lighting } from './Lighting'
import { Particles } from './Particles'
import { BowlFood, Poops } from './Props'
import { ActiveToy } from './Toys'
import { Garden } from './Garden'
import { useGame } from '../store/gameStore'
import { Room } from './Room'

type Quality = 'high' | 'low'

function Effects({ quality }: { quality: Quality }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {quality === 'high' ? <N8AO halfRes aoRadius={0.6} intensity={1.6} distanceFalloff={0.6} color="#3D2C4E" /> : <></>}
      <Bloom mipmapBlur intensity={0.35} luminanceThreshold={0.92} luminanceSmoothing={0.15} radius={0.6} />
      <Vignette offset={0.32} darkness={0.42} />
      <SMAA />
    </EffectComposer>
  )
}

/** Reports readiness after a few rendered frames (shaders compiled). */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  useFrame(() => {
    if (++frames.current === 3) onReady()
  })
  return null
}

/** House or garden – only one location is mounted at a time. */
function Place() {
  const location = useGame((s) => s.location)
  if (location === 'garden') return <Garden />
  return (
    <>
      <Room />
      <BowlFood />
      <Poops />
    </>
  )
}

export function GameScene({ onReady }: { onReady: () => void }) {
  const [quality, setQuality] = useState<Quality>(() => (matchMedia('(pointer: coarse)').matches ? 'low' : 'high'))
  const [dpr, setDpr] = useState(1.5)

  return (
    <Canvas
      shadows="soft"
      flat
      dpr={dpr}
      camera={{ position: CAMERA.position.toArray(), fov: 38, near: 0.1, far: 60 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <PerformanceMonitor
        onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))}
        onDecline={() => {
          setDpr(1)
          setQuality('low')
        }}
      />
      <Lighting />
      <Place />
      <ActiveToy />
      <Pet />
      <Particles />
      <CameraRig />
      <Effects quality={quality} />
      <ReadySignal onReady={onReady} />
    </Canvas>
  )
}
