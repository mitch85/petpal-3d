import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { type Group } from 'three'
import { colors } from '../ui/tokens'
import { GARDEN_SPOTS } from './layout'
import { toon } from './materials'
import { Box, Mesh, type V3 } from './primitives'
import { Plant } from './Plant'
import { grassTexture } from './textures'

const SIZE = 11
const CX = -0.3
const CZ = -0.3
const HOUSE_Z = -4.45

/** The garden: a second location bought in the shop. */
export function Garden() {
  const grass = useMemo(() => grassTexture(), [])
  useEffect(() => () => grass.dispose(), [grass])
  return (
    <group>
      {/* island */}
      <Box p={[CX, -0.3, CZ]} s={[SIZE, 0.6, SIZE]} mat={toon('#B98358')} r={0.12} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0.003, CZ]} receiveShadow material={toon('#ffffff', { map: grass })}>
        <planeGeometry args={[SIZE - 0.1, SIZE - 0.1]} />
      </mesh>

      <HouseFacade />
      <Fence />
      <Path />
      <Tree p={[-4.0, 0, -2.4]} />
      <Pond />
      <Bench p={[3.0, 0, 2.0]} />
      <FlowerBed p={[-2.9, 0, -3.75]} />
      <FlowerBed p={[1.6, 0, -3.75]} />
      <FlowerBed p={[-4.6, 0, 1.4]} rot={Math.PI / 2} />
      <Bush p={[4.3, 0, -3.6]} s={0.9} />
      <Bush p={[-4.7, 0, 3.6]} s={1.1} />
      <Plant p={[0.65, 0, -3.95]} scale={0.7} />
      <WateringCan p={[2.7, 0, -3.6]} />
      <Butterflies />
    </group>
  )
}

function HouseFacade() {
  const wall = toon('#FFE1CC')
  return (
    <group position={[CX, 0, HOUSE_Z]}>
      <Box p={[0, 1.4, -0.15]} s={[SIZE, 2.8, 0.3]} mat={wall} r={0.06} />
      <Box p={[0, 2.88, 0.05]} s={[SIZE + 0.3, 0.18, 0.7]} mat={toon('#F28B74')} r={0.06} />
      {/* door with awning */}
      <group position={[-0.5, 0, 0.02]}>
        <Box p={[0, 1.0, 0]} s={[1.1, 2.0, 0.12]} mat={toon('#7FB8F2')} r={0.12} />
        <Box p={[0, 1.0, 0.04]} s={[0.8, 1.7, 0.06]} mat={toon('#9ACBFA')} r={0.1} outline={false} />
        <Mesh p={[0.38, 0.95, 0.12]} s={0.05} mat={toon(colors.sunny)}>
          <sphereGeometry args={[1, 10, 8]} />
        </Mesh>
        <Box p={[0, 2.18, 0.3]} s={[1.5, 0.08, 0.6]} rot={[0.25, 0, 0]} mat={toon(colors.coral)} r={0.03} />
        <Box p={[0, 0.04, 0.5]} s={[1.2, 0.08, 0.6]} mat={toon('#E7C9A8')} r={0.03} />
      </group>
      {[-3.1, 2.2].map((x) => (
        <group key={x} position={[x, 1.55, 0.03]}>
          <Box p={[0, 0, 0]} s={[1.3, 1.0, 0.1]} mat={toon(colors.paper)} r={0.05} />
          <mesh position={[0, 0, 0.06]} material={toon('#9FD6FF')}>
            <planeGeometry args={[1.1, 0.8]} />
          </mesh>
          <Box p={[0, 0, 0.08]} s={[0.05, 0.8, 0.03]} mat={toon(colors.paper)} r={0.01} outline={false} />
          {/* flower box */}
          <Box p={[0, -0.6, 0.18]} s={[1.3, 0.22, 0.3]} mat={toon('#C98F62')} r={0.04} />
          {[-0.45, -0.15, 0.15, 0.45].map((fx, i) => (
            <Mesh key={fx} p={[fx, -0.42, 0.2]} s={0.1} mat={toon([colors.pink, colors.sunny, colors.lavender, colors.coral][i])}>
              <sphereGeometry args={[1, 10, 8]} />
            </Mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Fence() {
  const white = toon('#FFFFFF')
  const x = CX - SIZE / 2 + 0.2
  const pickets = useMemo(() => Array.from({ length: 21 }, (_, i) => CZ - SIZE / 2 + 0.6 + i * 0.5), [])
  return (
    <group>
      {pickets.map((z) => (
        <group key={z} position={[x, 0, z]}>
          <Box p={[0, 0.42, 0]} s={[0.07, 0.84, 0.22]} mat={white} r={0.03} />
          <Mesh p={[0, 0.9, 0]} r={[Math.PI / 2, 0, Math.PI / 4]} s={[0.11, 0.11, 0.035]} mat={white} outline={false}>
            <boxGeometry />
          </Mesh>
        </group>
      ))}
      {[0.3, 0.65].map((y) => (
        <Box key={y} p={[x + 0.06, y, CZ + 0.15]} s={[0.05, 0.08, SIZE - 1.2]} mat={white} r={0.02} />
      ))}
    </group>
  )
}

function Path() {
  const stones: V3[] = [
    [-0.8, 0.02, -3.6],
    [-0.55, 0.02, -2.8],
    [-0.85, 0.02, -2.0],
    [-0.5, 0.02, -1.2],
    [-0.2, 0.02, -0.4],
  ]
  return (
    <>
      {stones.map((p, i) => (
        <Mesh key={i} p={p} s={[0.38, 0.04, 0.3]} r={[0, i * 0.7, 0]} mat={toon('#E6DED6')}>
          <cylinderGeometry args={[1, 1, 1, 9]} />
        </Mesh>
      ))}
    </>
  )
}

function Tree({ p }: { p: V3 }) {
  const g = useRef<Group>(null)
  useFrame(({ clock }) => g.current && (g.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.02))
  return (
    <group position={p}>
      <Mesh p={[0, 1.0, 0]} mat={toon('#A0704E')}>
        <cylinderGeometry args={[0.18, 0.28, 2.0, 12]} />
      </Mesh>
      <group ref={g} position={[0, 2.0, 0]}>
        {[
          [0, 0.5, 0, 1.0],
          [0.65, 0.15, 0.2, 0.75],
          [-0.6, 0.2, -0.1, 0.8],
          [0.1, 1.1, -0.1, 0.7],
        ].map(([x, y, z, s], i) => (
          <Mesh key={i} p={[x, y, z]} s={s} mat={toon(i % 2 ? '#5CBF83' : '#6FD397')}>
            <icosahedronGeometry args={[1, 1]} />
          </Mesh>
        ))}
        {[
          [0.6, 0.0, 0.85],
          [-0.4, 0.5, 0.85],
          [0.3, 1.0, 0.6],
          [-0.9, -0.2, 0.5],
        ].map(([x, y, z], i) => (
          <Mesh key={i} p={[x, y, z]} s={0.11} mat={toon('#FF6B6B')}>
            <sphereGeometry args={[1, 12, 10]} />
          </Mesh>
        ))}
      </group>
    </group>
  )
}

function Pond() {
  const { x, z } = GARDEN_SPOTS.pond
  const pads: V3[] = [
    [0.4, 0.05, 0.2],
    [-0.35, 0.05, -0.25],
    [0.1, 0.05, -0.5],
  ]
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        return (
          <Mesh key={i} p={[Math.cos(a) * 1.15, 0.06, Math.sin(a) * 0.9]} s={[0.2, 0.1, 0.17]} r={[0, a, 0]} mat={toon(i % 2 ? '#D9D2CC' : '#CBC2BA')}>
            <sphereGeometry args={[1, 10, 8]} />
          </Mesh>
        )
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} scale={[1, 0.78, 1]} material={toon('#6EC6F5')}>
        <circleGeometry args={[1.1, 40]} />
      </mesh>
      {pads.map((p, i) => (
        <group key={i} position={p}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} material={toon('#5CBF83')}>
            <circleGeometry args={[0.2, 20, 0.3, Math.PI * 1.8]} />
          </mesh>
          {i === 0 && (
            <Mesh p={[0, 0.06, 0]} s={0.07} mat={toon(colors.pink)}>
              <sphereGeometry args={[1, 10, 8]} />
            </Mesh>
          )}
        </group>
      ))}
    </group>
  )
}

function Bench({ p }: { p: V3 }) {
  const wood = toon('#E9A35E')
  return (
    <group position={p} rotation={[0, -Math.PI / 2, 0]}>
      <Box p={[0, 0.45, 0]} s={[1.5, 0.08, 0.5]} mat={wood} r={0.03} />
      <Box p={[0, 0.82, -0.22]} s={[1.5, 0.4, 0.07]} mat={wood} r={0.03} />
      {[-0.65, 0.65].map((x) => (
        <Box key={x} p={[x, 0.22, 0]} s={[0.08, 0.45, 0.45]} mat={toon('#B9805A')} r={0.02} />
      ))}
    </group>
  )
}

function FlowerBed({ p, rot = 0 }: { p: V3; rot?: number }) {
  const flowers = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: (i - 4) * 0.28 + Math.sin(i * 3) * 0.06,
        z: Math.cos(i * 2.3) * 0.15,
        h: 0.25 + (i % 3) * 0.07,
        c: [colors.pink, colors.sunny, colors.lavender, colors.coral, '#FFFFFF'][i % 5],
      })),
    [],
  )
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <Box p={[0, 0.06, 0]} s={[2.7, 0.12, 0.6]} mat={toon('#A9734F')} r={0.05} />
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, 0.1, f.z]}>
          <mesh position={[0, f.h / 2, 0]} material={toon('#4FAE6E')}>
            <cylinderGeometry args={[0.015, 0.015, f.h, 5]} />
          </mesh>
          <Mesh p={[0, f.h, 0]} s={0.09} mat={toon(f.c)}>
            <sphereGeometry args={[1, 10, 8]} />
          </Mesh>
          <mesh position={[0, f.h + 0.01, 0.06]} scale={0.035} material={toon(colors.sunny)}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Bush({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      {[
        [0, 0.4, 0, 0.5],
        [0.4, 0.3, 0.1, 0.38],
        [-0.4, 0.28, 0, 0.36],
      ].map(([x, y, z, r], i) => (
        <Mesh key={i} p={[x, y, z]} s={r} mat={toon(i ? '#5CBF83' : '#6FD397')}>
          <icosahedronGeometry args={[1, 1]} />
        </Mesh>
      ))}
    </group>
  )
}

function WateringCan({ p }: { p: V3 }) {
  return (
    <group position={p} rotation={[0, 0.6, 0]}>
      <Mesh p={[0, 0.2, 0]} mat={toon(colors.mint)}>
        <cylinderGeometry args={[0.18, 0.2, 0.4, 16]} />
      </Mesh>
      <Mesh p={[0.26, 0.28, 0]} r={[0, 0, -0.9]} mat={toon(colors.mint)}>
        <cylinderGeometry args={[0.03, 0.05, 0.35, 8]} />
      </Mesh>
      <Mesh p={[0, 0.45, 0]} r={[Math.PI / 2, 0, 0]} mat={toon(colors.mint)}>
        <torusGeometry args={[0.12, 0.025, 6, 16, Math.PI]} />
      </Mesh>
    </group>
  )
}

function Butterflies() {
  const refs = useRef<Group[]>([])
  const data = useMemo(
    () => [
      { c: colors.pink, cx: -2.2, cz: 0.5, r: 1.4, sp: 0.5 },
      { c: colors.sunny, cx: 1.5, cz: 1.5, r: 1.1, sp: 0.7 },
      { c: colors.sky, cx: -3.0, cz: -2.8, r: 0.8, sp: 0.6 },
    ],
    [],
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    data.forEach((d, i) => {
      const g = refs.current[i]
      if (!g) return
      const a = t * d.sp + i * 2
      g.position.set(d.cx + Math.cos(a) * d.r, 1.0 + Math.sin(t * 2 + i) * 0.25, d.cz + Math.sin(a * 1.3) * d.r)
      g.rotation.y = -a
      const flap = Math.sin(t * 18 + i) * 0.9
      ;(g.children[0] as Group).rotation.z = flap
      ;(g.children[1] as Group).rotation.z = -flap
    })
  })
  return (
    <>
      {data.map((d, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el!)}>
          {[1, -1].map((s) => (
            <group key={s}>
              <mesh position={[s * 0.08, 0, 0]} scale={[0.08, 0.01, 0.06]} material={toon(d.c)}>
                <sphereGeometry args={[1, 10, 8]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </>
  )
}
