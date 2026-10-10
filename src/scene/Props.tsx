import { Html, Outlines } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, type ReactNode } from 'react'
import { MathUtils, MeshBasicMaterial, type Group, type Mesh } from 'three'
import { sfx } from '../assets/sfx'
import type { FoodId } from '../game/types'
import { emit, runtime } from '../pets/runtime'
import { useGame } from '../store/gameStore'
import { colors } from '../ui/tokens'
import { toon } from './materials'
import { SPOTS } from './layout'

const OL = 2.2
type V3 = [number, number, number]

function M({ children, p, r, s, c }: { children: ReactNode; p?: V3; r?: V3; s?: V3 | number; c: string }) {
  return (
    <mesh position={p} rotation={r} scale={s} material={toon(c)} castShadow>
      {children}
      <Outlines thickness={OL} color={colors.ink} />
    </mesh>
  )
}

/** Small 3D food models, one per FoodId. */
export function FoodModel({ id }: { id: FoodId }) {
  switch (id) {
    case 'fish':
      return (
        <group rotation={[0, 0.4, 0]}>
          <M s={[0.1, 0.07, 0.2]} c="#7CC4FF"><sphereGeometry args={[1, 20, 14]} /></M>
          <M p={[0, 0, -0.22]} r={[Math.PI / 2, 0, 0]} s={[0.08, 0.08, 0.02]} c="#5BA8F0"><coneGeometry args={[1, 1, 3]} /></M>
        </group>
      )
    case 'chicken':
      return (
        <group rotation={[0, 0, 0.3]}>
          <M s={[0.14, 0.11, 0.11]} c="#E7924A"><sphereGeometry args={[1, 20, 14]} /></M>
          <M p={[0.16, -0.04, 0]} r={[0, 0, 1.3]} s={[0.03, 0.08, 0.03]} c="#FFF3DC"><capsuleGeometry args={[1, 1, 4, 8]} /></M>
        </group>
      )
    case 'carrot':
      return (
        <group rotation={[Math.PI / 2.3, 0, 0.4]}>
          <M s={[0.06, 0.28, 0.06]} c="#FF8A3D"><coneGeometry args={[1, 1, 16]} /></M>
          <M p={[0, -0.16, 0]} s={[0.04, 0.08, 0.04]} c="#3FCB98"><coneGeometry args={[1, 1, 8]} /></M>
        </group>
      )
    case 'bone':
      return (
        <group rotation={[0, 0.5, 0]}>
          <M r={[0, 0, Math.PI / 2]} s={[0.035, 0.12, 0.035]} c="#FFF3DC"><capsuleGeometry args={[1, 1, 4, 10]} /></M>
          {[-1, 1].map((x) => [-1, 1].map((z) => <M key={`${x}${z}`} p={[x * 0.12, 0, z * 0.035]} s={0.045} c="#FFF3DC"><sphereGeometry args={[1, 12, 10]} /></M>))}
        </group>
      )
    case 'chili':
      return (
        <group rotation={[0.3, 0, 1.2]}>
          <M s={[0.05, 0.16, 0.05]} c="#FF5A5F"><capsuleGeometry args={[1, 1, 4, 10]} /></M>
          <M p={[0, 0.17, 0]} s={[0.02, 0.05, 0.02]} c="#3FCB98"><cylinderGeometry args={[1, 1, 1, 6]} /></M>
        </group>
      )
    case 'apple':
      return (
        <group>
          <M s={0.12} c="#FF6B6B"><sphereGeometry args={[1, 20, 14]} /></M>
          <M p={[0.03, 0.14, 0]} r={[0, 0, -0.5]} s={[0.05, 0.02, 0.03]} c="#3FCB98"><sphereGeometry args={[1, 10, 8]} /></M>
        </group>
      )
    case 'cookie':
      return (
        <M r={[0.2, 0, 0]} c="#E9A35E"><cylinderGeometry args={[0.13, 0.13, 0.04, 20]} /></M>
      )
  }
}

/** Food in the bowl, shrinking as the pet eats it. */
export function BowlFood() {
  const g = useRef<Group>(null)
  const [id, setId] = useState<FoodId | null>(null)
  useFrame((_, dt) => {
    if (runtime.food.id !== id) setId(runtime.food.id)
    if (!g.current) return
    const target = runtime.food.id ? 1 - runtime.food.progress * 0.85 : 0
    const s = MathUtils.damp(g.current.scale.x, target, 10, dt)
    g.current.scale.setScalar(s)
    g.current.visible = s > 0.02
  })
  return (
    <group position={[SPOTS.bowl.x, 0.2, SPOTS.bowl.z]}>
      <group ref={g} scale={0}>
        {id && <FoodModel id={id} />}
      </group>
    </group>
  )
}

/** Cartoon poop – friendly swirl with a smile, tap to clean. */
function PoopItem({ id, x, z }: { id: number; x: number; z: number }) {
  const g = useRef<Group>(null)
  const born = useRef(-1)
  const [hover, setHover] = useState(false)
  const ring = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (!g.current) return
    if (born.current < 0) born.current = clock.elapsedTime
    const age = clock.elapsedTime - born.current
    const pop = Math.min(1, age * 3)
    const bounce = pop < 1 ? Math.sin(pop * Math.PI) * 0.3 : 0
    g.current.scale.setScalar((0.6 + 0.4 * pop + bounce) * (hover ? 1.6 : 1.45))
    g.current.rotation.y = Math.sin(clock.elapsedTime * 2 + id) * 0.15
    if (ring.current) {
      const k = (clock.elapsedTime * 0.8) % 1
      ring.current.scale.setScalar(0.18 + k * 0.22)
      ;(ring.current.material as MeshBasicMaterial).opacity = 0.55 * (1 - k)
    }
  })
  const brown = '#A8754F'
  return (
    <group
      ref={g}
      position={[x, 0, z]}
      onPointerDown={(e) => {
        e.stopPropagation()
        emit('sparkle', g.current!.position.clone().setY(0.3), 6)
        emit('puff', g.current!.position.clone().setY(0.2), 4)
        sfx.sparkle()
        useGame.getState().cleanPoop(id)
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <M p={[0, 0.07, 0]} s={[0.2, 0.08, 0.2]} c={brown}><sphereGeometry args={[1, 18, 12]} /></M>
      <M p={[0, 0.16, 0]} s={[0.14, 0.07, 0.14]} c={brown}><sphereGeometry args={[1, 18, 12]} /></M>
      <M p={[0, 0.24, 0]} s={[0.07, 0.08, 0.07]} r={[0, 0, 0.3]} c={brown}><coneGeometry args={[1, 1, 14]} /></M>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.05, 0.17, 0.12]} scale={[0.018, 0.024, 0.01]} material={toon(colors.ink)}><sphereGeometry args={[1, 8, 6]} /></mesh>
      ))}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color={colors.sunny} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}

export function Poops() {
  const poops = useGame((s) => s.poops)
  return (
    <>
      {poops.map((p) => (
        <PoopItem key={p.id} {...p} />
      ))}
    </>
  )
}

/** Floating thought/speech bubble above the pet's head. */
export function EmoteBubble({ icon, id, thought }: { icon: ReactNode | null; id: string; thought?: boolean }) {
  const g = useRef<Group>(null)
  const anchor = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (!g.current) return
    g.current.position.set(runtime.petHead.x, runtime.petHead.y + 0.62 + Math.sin(clock.elapsedTime * 2.4) * 0.04, runtime.petHead.z)
  })
  return (
    <group ref={g}>
      <mesh ref={anchor} visible={false} />
      {icon && (
        <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div key={id} style={{ animation: 'pop-in 420ms var(--ease-spring) both' }} className="relative">
            <div className="glass flex h-16 w-16 items-center justify-center rounded-full" style={{ boxShadow: '0 8px 24px -8px rgb(61 44 78 / .45)' }}>
              {icon}
            </div>
            {thought ? (
              <>
                <div className="glass absolute -bottom-2 left-2 h-4 w-4 rounded-full" />
                <div className="glass absolute -bottom-5 left-0 h-2.5 w-2.5 rounded-full" />
              </>
            ) : (
              <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#FFFBF6]" />
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
