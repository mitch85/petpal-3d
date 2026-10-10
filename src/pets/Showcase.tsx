import { Outlines } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { MathUtils, Vector3, type Group } from 'three'
import { sfx } from '../assets/sfx'
import { PETS } from '../game/pets.config'
import type { SpeciesId } from '../game/types'
import { toon } from '../scene/materials'
import { Particles } from '../scene/Particles'
import { colors } from '../ui/tokens'
import { PlaceholderPet } from './PlaceholderPet'
import { createPose, dampPose, neutral } from './pose'
import { emit } from './runtime'

/** A menu pet: idles, turns on a pedestal and reacts when tapped. */
function ShowcasePet({ id, position, spin, seed = 0 }: { id: SpeciesId; position: [number, number, number]; spin?: boolean; seed?: number }) {
  const species = PETS[id]
  const target = useMemo(() => createPose(), [])
  const pose = useMemo(() => createPose(), [])
  const g = useRef<Group>(null)
  const react = useRef({ until: -1, start: 0 })
  const tapped = useRef(false)

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + seed * 1.7
    neutral(target)
    target.headYaw = Math.sin(t * 0.6) * 0.35
    target.headTilt = Math.sin(t * 0.45) * 0.12
    target.lookX = Math.sin(t * 0.6) * 0.7
    target.tailAmp = 0.45
    target.tailSpeed = species.happyFx === 'wag' ? 9 : 4
    target.blush = 1
    if (Math.sin(t * 0.33) > 0.85) target.eyes = 'happy'
    const r = react.current
    if (tapped.current) {
      tapped.current = false
      r.start = clock.elapsedTime
      r.until = clock.elapsedTime + 0.7
    }
    if (clock.elapsedTime < r.until) {
      const k = (clock.elapsedTime - r.start) / (r.until - r.start)
      target.hop = Math.sin(k * Math.PI) * 0.5
      target.squash = 1 + Math.sin(k * Math.PI * 2) * 0.12
      target.eyes = 'happy'
      target.mouth = 'open'
      target.wing = 1
      target.tailSpeed = 20
      target.tailAmp = 0.8
    }
    dampPose(pose, target, Math.min(dt, 0.05), 10)
    if (g.current) {
      g.current.rotation.y = spin ? MathUtils.damp(g.current.rotation.y, Math.sin(t * 0.5) * 0.4, 2, dt) : Math.sin(t * 0.5) * 0.25
    }
  })

  const onTap = () => {
    tapped.current = true
    sfx.boing()
    setTimeout(() => sfx.happy(), 200)
    const head = new Vector3(position[0], position[1] + 1.2, position[2])
    const fx = species.happyFx
    emit(fx === 'sparks' ? 'spark' : fx === 'wag' ? 'note' : 'heart', head, fx === 'sparks' ? 10 : 4)
  }

  return (
    <group position={position}>
      <group
        ref={g}
        onPointerDown={(e) => {
          e.stopPropagation()
          onTap()
        }}
      >
        <PlaceholderPet look={species.look} pose={pose} />
      </group>
    </group>
  )
}

function Pedestal({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, -0.12, 0]} material={toon('#FFFFFF')} receiveShadow>
        <cylinderGeometry args={[0.85, 0.95, 0.24, 48]} />
        <Outlines thickness={2.4} color={colors.ink} />
      </mesh>
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon('#FFE1D2')} receiveShadow>
        <circleGeometry args={[0.72, 48]} />
      </mesh>
    </group>
  )
}

const LINEUP: { id: SpeciesId; p: [number, number, number] }[] = [
  { id: 'rabbit', p: [-1.75, 0, -1.2] },
  { id: 'dog', p: [-0.95, 0, -0.15] },
  { id: 'cat', p: [0, 0, 0.7] },
  { id: 'dragon', p: [0.95, 0, -0.15] },
  { id: 'penguin', p: [1.75, 0, -1.2] },
]

/** Keeps the stage framed on any aspect ratio (narrow phones included). */
function Framing({ y, width, base }: { y: number; width: number; base: [number, number, number] }) {
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / s.size.height)
  useLayoutEffect(() => {
    const dir = new Vector3(...base).normalize()
    const fit = width / (2 * Math.tan(MathUtils.degToRad(20)) * Math.min(aspect, 1.6))
    camera.position.copy(dir.multiplyScalar(Math.max(new Vector3(...base).length(), fit)))
    camera.lookAt(0, y, 0)
  }, [camera, aspect, y, width, base])
  return null
}

const LINEUP_CAM: [number, number, number] = [0, 2.2, 6.2]
const SINGLE_CAM: [number, number, number] = [0, 1.4, 3.8]

/** 3D stage for the start screen (all pets) or the selection screen (one pet). */
export function ShowcaseCanvas({ mode, selected }: { mode: 'lineup' | 'single'; selected?: SpeciesId }) {
  const [shown, setShown] = useState(false)
  return (
    <Canvas
      onCreated={() => setTimeout(() => setShown(true), 120)}
      shadows
      flat
      dpr={[1, 2]} camera={{ position: mode === 'lineup' ? LINEUP_CAM : SINGLE_CAM, fov: 40 }} style={{ position: 'absolute', inset: 0, opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(24px)', transition: 'opacity 700ms ease, transform 900ms var(--ease-spring)' }}
    >
      {mode === 'lineup' ? <Framing y={0.2} width={4.6} base={LINEUP_CAM} /> : <Framing y={0.3} width={2.9} base={SINGLE_CAM} />}
      <hemisphereLight intensity={1.6} color="#ffffff" groundColor="#FFD2B0" />
      <directionalLight position={[3, 6, 4]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} shadow-radius={5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.15} />
      </mesh>
      <group position={[0, mode === 'lineup' ? -0.3 : -0.35, 0]}>
        {mode === 'lineup' ? (
          LINEUP.map((l, i) => (
            <group key={l.id}>
              <Pedestal position={[l.p[0], l.p[1], l.p[2]]} scale={0.62} />
              <ShowcasePet id={l.id} position={l.p} seed={i} />
            </group>
          ))
        ) : (
          <>
            <Pedestal position={[0, 0, 0]} />
            {selected && <ShowcasePet key={selected} id={selected} position={[0, 0, 0]} spin />}
          </>
        )}
      </group>
      <Particles />
    </Canvas>
  )
}
