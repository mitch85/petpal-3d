import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { MeshBasicMaterial, type Group } from 'three'
import type { ToyId } from '../game/types'
import { runtime } from '../pets/runtime'
import { colors } from '../ui/tokens'
import { toon } from './materials'
import { Mesh } from './primitives'

/** 3D model of a toy; origin sits on the floor. */
export function ToyModel({ kind }: { kind: ToyId }) {
  switch (kind) {
    case 'ball':
      return (
        <group position={[0, 0.14, 0]}>
          <Mesh s={0.14} mat={toon(colors.pink)}>
            <sphereGeometry args={[1, 20, 14]} />
          </Mesh>
          <mesh scale={[0.145, 0.03, 0.145]} material={toon('#ffffff')}>
            <sphereGeometry args={[1, 20, 8]} />
          </mesh>
        </group>
      )
    case 'frisbee':
      return (
        <group position={[0, 0.04, 0]}>
          <Mesh mat={toon(colors.sky)}>
            <cylinderGeometry args={[0.22, 0.2, 0.05, 28]} />
          </Mesh>
          <Mesh p={[0, 0.03, 0]} r={[Math.PI / 2, 0, 0]} mat={toon('#FFFFFF')} outline={false}>
            <torusGeometry args={[0.13, 0.02, 8, 24]} />
          </Mesh>
        </group>
      )
    case 'mouse':
      return (
        <group position={[0, 0.08, 0]}>
          <Mesh s={[0.09, 0.08, 0.15]} mat={toon('#B9B3C9')}>
            <sphereGeometry args={[1, 16, 12]} />
          </Mesh>
          {[-1, 1].map((s) => (
            <Mesh key={s} p={[s * 0.06, 0.07, 0.07]} s={[0.045, 0.045, 0.015]} mat={toon('#FFB3C7')}>
              <sphereGeometry args={[1, 10, 8]} />
            </Mesh>
          ))}
          <Mesh p={[0, -0.01, 0.15]} s={0.018} mat={toon(colors.pink)} outline={false}>
            <sphereGeometry args={[1, 8, 6]} />
          </Mesh>
          <Mesh p={[0, 0, -0.2]} r={[Math.PI / 2 - 0.3, 0, 0]} mat={toon('#FFB3C7')} outline={false}>
            <cylinderGeometry args={[0.008, 0.012, 0.14, 6]} />
          </Mesh>
          {/* wind-up key */}
          <group position={[0, 0.1, -0.03]}>
            <Mesh mat={toon(colors.sunny)}>
              <cylinderGeometry args={[0.012, 0.012, 0.06, 6]} />
            </Mesh>
            <Mesh p={[0, 0.04, 0]} r={[0, 0, Math.PI / 2]} s={[0.04, 0.02, 0.012]} mat={toon(colors.sunny)}>
              <sphereGeometry args={[1, 10, 8]} />
            </Mesh>
          </group>
        </group>
      )
    case 'yarn':
      return (
        <group position={[0, 0.15, 0]}>
          <Mesh s={0.15} mat={toon(colors.coral)}>
            <sphereGeometry args={[1, 20, 14]} />
          </Mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[i * 0.9, i * 0.6, 0.3]} material={toon('#FF9C8A')}>
              <torusGeometry args={[0.15, 0.012, 6, 28]} />
            </mesh>
          ))}
        </group>
      )
    case 'laser':
      return <LaserDot />
  }
}

const laserCore = new MeshBasicMaterial({ color: '#FFE3E8' })
const laserRing = new MeshBasicMaterial({ color: '#FF2E55' })
const laserGlow = new MeshBasicMaterial({ color: '#FF4D6D', transparent: true, opacity: 0.35, depthWrite: false })

function LaserDot() {
  const g = useRef<Group>(null)
  useFrame(({ clock }) => g.current?.scale.setScalar(1 + Math.sin(clock.elapsedTime * 20) * 0.12))
  return (
    <group ref={g}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, 0]} material={laserCore}><circleGeometry args={[0.045, 16]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.021, 0]} material={laserRing}><circleGeometry args={[0.09, 20]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={laserGlow}><circleGeometry args={[0.24, 24]} /></mesh>
    </group>
  )
}

/** The toy currently in play, driven by the pet brain through `runtime.toy`. */
export function ActiveToy() {
  const g = useRef<Group>(null)
  const inner = useRef<Group>(null)
  const [kind, setKind] = useState<ToyId | null>(null)
  const r = kind === 'ball' ? 0.14 : kind === 'yarn' ? 0.15 : 0
  useFrame(() => {
    const t = runtime.toy
    if (t.kind !== kind) setKind(t.kind)
    if (!g.current || !inner.current) return
    g.current.visible = t.visible && t.kind !== null
    g.current.position.copy(t.pos)
    g.current.rotation.y = t.yaw
    inner.current.rotation.x = t.roll
  })
  return (
    <group ref={g} visible={false}>
      {/* roll around the toy's own centre */}
      <group position={[0, r, 0]}>
        <group ref={inner}>
          <group position={[0, -r, 0]}>{kind && <ToyModel kind={kind} />}</group>
        </group>
      </group>
    </group>
  )
}
