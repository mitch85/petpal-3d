import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { LatheGeometry, MeshBasicMaterial, Vector2, Vector3, type Group, type Mesh as ThreeMesh } from 'three'
import { emit, runtime } from '../pets/runtime'
import { useGame } from '../store/gameStore'
import { colors } from '../ui/tokens'
import { SPOTS, TUB } from './layout'
import { toon } from './materials'
import { Box, Mesh } from './primitives'

/**
 * Furniture variants bought in the shop. Each slot renders whatever is
 * equipped; ids come from `game/shop.ts`.
 */

const GOLD = '#FFC83D'

/** Height of the surface the pet stands on, per equipped item. */
export const SURFACE: Record<string, number> = {
  bed_basic: 0.2,
  bed_cloud: 0.27,
  bed_canopy: 0.36,
  litter_basic: 0.18,
  litter_hood: 0.18,
  litter_throne: 0.4,
}

/** Sparkle burst whenever the equipped item of a slot changes (not on mount). */
function useUnveil(id: string, at: Vector3) {
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    emit('puff', at.clone().setY(0.4), 10)
    emit('sparkle', at.clone().setY(0.8), 12)
  }, [id, at])
}

/* ---------------- Bed ---------------- */

export function Bed() {
  const id = useGame((s) => s.equipped.bed)
  useUnveil(id, SPOTS.bed)
  const { x, z } = SPOTS.bed
  return <group position={[x, 0, z]}>{id === 'bed_cloud' ? <CloudBed /> : id === 'bed_canopy' ? <CanopyBed /> : <BasicBed />}</group>
}

function BasicBed() {
  return (
    <>
      <Mesh p={[0, 0.08, 0]} mat={toon('#B79CFF')}>
        <cylinderGeometry args={[0.95, 0.98, 0.16, 40]} />
      </Mesh>
      <Mesh p={[0, 0.22, 0]} r={[Math.PI / 2, 0, 0]} mat={toon('#B79CFF')}>
        <torusGeometry args={[0.82, 0.2, 16, 40]} />
      </Mesh>
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon('#EDE4FF')} receiveShadow>
        <circleGeometry args={[0.66, 32]} />
      </mesh>
      <Mesh p={[-0.35, 0.24, -0.3]} s={[0.28, 0.1, 0.2]} r={[0, 0.6, 0]} mat={toon(colors.paper)}>
        <sphereGeometry args={[1, 20, 14]} />
      </Mesh>
    </>
  )
}

function CloudBed() {
  const puffs = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2
    return [Math.cos(a) * 0.85, 0.28 + (i % 2) * 0.05, Math.sin(a) * 0.85, 0.26 + (i % 3) * 0.03] as const
  })
  return (
    <>
      <Mesh p={[0, 0.1, 0]} mat={toon('#DDEBFF')}>
        <cylinderGeometry args={[1.0, 1.0, 0.2, 40]} />
      </Mesh>
      {puffs.map(([x, y, z, s], i) => (
        <Mesh key={i} p={[x, y, z]} s={s} mat={toon(i % 2 ? '#FFFFFF' : '#EAF3FF')}>
          <sphereGeometry args={[1, 16, 12]} />
        </Mesh>
      ))}
      <mesh position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon('#BFDBFF')} receiveShadow>
        <circleGeometry args={[0.78, 32]} />
      </mesh>
      {/* little star pillow */}
      <Mesh p={[-0.4, 0.3, -0.35]} s={[0.2, 0.08, 0.2]} mat={toon(colors.sunny)}>
        <dodecahedronGeometry args={[1, 0]} />
      </Mesh>
    </>
  )
}

function CanopyBed() {
  const wood = toon('#F3D7B6')
  const fabric = toon('#FF9DC0')
  const H = 1.55
  const posts: [number, number][] = [
    [0.8, 0.8],
    [-0.8, 0.8],
    [0.8, -0.8],
    [-0.8, -0.8],
  ]
  return (
    <>
      <Box p={[0, 0.1, 0]} s={[1.8, 0.2, 1.8]} mat={wood} r={0.06} />
      {/* puffy mattress + pillows + blanket */}
      <Box p={[0, 0.27, 0]} s={[1.62, 0.2, 1.62]} mat={toon('#FFF0F6')} r={0.09} />
      {[-0.35, 0.3].map((x) => (
        <Mesh key={x} p={[x, 0.42, -0.5]} s={[0.3, 0.11, 0.18]} mat={toon(colors.paper)}>
          <sphereGeometry args={[1, 20, 14]} />
        </Mesh>
      ))}
      <Box p={[0, 0.38, 0.35]} s={[1.64, 0.06, 0.85]} mat={toon('#C9B5FF')} r={0.03} />
      <Box p={[0, 0.41, 0.35]} s={[1.3, 0.02, 0.06]} mat={toon('#FFFFFF')} r={0.01} outline={false} />
      {posts.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Mesh p={[0, H / 2, 0]} mat={wood}>
            <cylinderGeometry args={[0.07, 0.08, H, 12]} />
          </Mesh>
          <Mesh p={[0, H + 0.08, 0]} s={0.1} mat={toon(GOLD)}>
            <sphereGeometry args={[1, 14, 10]} />
          </Mesh>
          {/* gathered curtain at each post, tied with a gold band */}
          <Mesh p={[x > 0 ? -0.06 : 0.06, H * 0.62, z > 0 ? -0.06 : 0.06]} s={[0.13, H * 0.33, 0.13]} mat={fabric}>
            <capsuleGeometry args={[1, 1, 6, 12]} />
          </Mesh>
          <Mesh p={[x > 0 ? -0.06 : 0.06, H * 0.48, z > 0 ? -0.06 : 0.06]} r={[Math.PI / 2, 0, 0]} mat={toon(GOLD)} outline={false}>
            <torusGeometry args={[0.13, 0.025, 6, 16]} />
          </Mesh>
        </group>
      ))}
      {/* canopy with scalloped valance */}
      <Box p={[0, H, 0]} s={[1.84, 0.1, 1.84]} mat={fabric} r={0.04} />
      {[-0.64, -0.21, 0.21, 0.64].flatMap((v) => [
        <Mesh key={`f${v}`} p={[v, H - 0.1, 0.9]} s={[0.22, 0.12, 0.05]} mat={fabric}>
          <sphereGeometry args={[1, 14, 10]} />
        </Mesh>,
        <Mesh key={`s${v}`} p={[0.9, H - 0.1, v]} s={[0.05, 0.12, 0.22]} mat={fabric}>
          <sphereGeometry args={[1, 14, 10]} />
        </Mesh>,
      ])}
      {/* headboard with heart */}
      <Box p={[0, 0.62, -0.86]} s={[1.5, 0.7, 0.08]} mat={wood} r={0.08} />
      <Mesh p={[0, 0.7, -0.8]} s={[0.14, 0.12, 0.05]} mat={toon(colors.coral)}>
        <sphereGeometry args={[1, 14, 10]} />
      </Mesh>
    </>
  )
}

/* ---------------- Bowl ---------------- */

const bowlGeo = new LatheGeometry(
  [new Vector2(0, 0), new Vector2(0.26, 0), new Vector2(0.34, 0.08), new Vector2(0.36, 0.16), new Vector2(0.32, 0.17), new Vector2(0.27, 0.06), new Vector2(0, 0.06)],
  32,
)

export function BowlShape({ p, color, inner, emissive }: { p: [number, number, number]; color: string; inner?: string; emissive?: boolean }) {
  return (
    <group position={p}>
      <Mesh mat={toon(color, emissive ? { emissive: '#FFB300', emissiveIntensity: 0.25 } : {})}>
        <primitive object={bowlGeo} attach="geometry" />
      </Mesh>
      {inner && (
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon(inner)}>
          <circleGeometry args={[0.3, 24]} />
        </mesh>
      )}
    </group>
  )
}

export function FoodBowl() {
  const id = useGame((s) => s.equipped.bowl)
  useUnveil(id, SPOTS.bowl)
  const next = useRef(0)
  const p: [number, number, number] = [SPOTS.bowl.x, 0.03, SPOTS.bowl.z]
  useFrame(({ clock }) => {
    if (id !== 'bowl_golden' || clock.elapsedTime < next.current) return
    next.current = clock.elapsedTime + 1.6 + Math.random()
    emit('sparkle', new Vector3(SPOTS.bowl.x + (Math.random() - 0.5) * 0.5, 0.3, SPOTS.bowl.z + (Math.random() - 0.5) * 0.5), 1)
  })
  if (id === 'bowl_golden') return <BowlShape p={p} color={GOLD} emissive />
  if (id === 'bowl_ceramic')
    return (
      <group>
        <BowlShape p={p} color="#FFFFFF" />
        <Mesh p={[p[0], 0.16, p[2]]} r={[Math.PI / 2, 0, 0]} mat={toon(colors.coral)} outline={false}>
          <torusGeometry args={[0.345, 0.03, 8, 32]} />
        </Mesh>
      </group>
    )
  return <BowlShape p={p} color={colors.sky} />
}

/* ---------------- Litter / toilet ---------------- */

export function Litter() {
  const id = useGame((s) => s.equipped.litter)
  useUnveil(id, SPOTS.litter)
  const { x, z } = SPOTS.litter
  return <group position={[x, 0, z]}>{id === 'litter_throne' ? <Throne /> : <LitterBox hood={id === 'litter_hood'} />}</group>
}

function LitterBox({ hood }: { hood: boolean }) {
  const mat = toon(hood ? '#B79CFF' : colors.mint)
  return (
    <>
      <Box p={[0, 0.04, 0]} s={[1.3, 0.08, 1.1]} mat={mat} r={0.03} />
      <Box p={[0, 0.17, 0.53]} s={[1.3, 0.26, 0.08]} mat={mat} r={0.03} />
      <Box p={[0, 0.17, -0.53]} s={[1.3, 0.26, 0.08]} mat={mat} r={0.03} />
      <Box p={[0.62, 0.17, 0]} s={[0.08, 0.26, 1.1]} mat={mat} r={0.03} />
      <Box p={[-0.62, 0.17, 0]} s={[0.08, 0.26, 1.1]} mat={mat} r={0.03} />
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon('#F3DDB0')} receiveShadow>
        <planeGeometry args={[1.16, 0.98]} />
      </mesh>
      {hood ? (
        <group position={[0, 0.3, -0.05]}>
          {/* back half dome so the pet stays visible */}
          <Mesh s={[0.66, 0.62, 0.55]} mat={mat}>
            <sphereGeometry args={[1, 32, 16, Math.PI / 2, Math.PI, 0, Math.PI / 2]} />
          </Mesh>
          <Mesh p={[0, 0.66, -0.1]} s={0.1} mat={toon(colors.pink)}>
            <sphereGeometry args={[1, 14, 10]} />
          </Mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2
            return (
              <Mesh key={i} p={[Math.cos(a) * 0.1, 0.66, -0.1 + Math.sin(a) * 0.1]} s={0.07} mat={toon('#FFFFFF')} outline={false}>
                <sphereGeometry args={[1, 10, 8]} />
              </Mesh>
            )
          })}
        </group>
      ) : (
        <group position={[0.85, 0.3, 0.3]} rotation={[0, 0, -0.25]}>
          <Box p={[0, 0.2, 0]} s={[0.05, 0.4, 0.05]} mat={toon(colors.sunny)} r={0.02} />
          <Box p={[0, -0.05, 0]} s={[0.2, 0.18, 0.03]} mat={toon(colors.sunny)} r={0.03} />
        </group>
      )}
    </>
  )
}

function Throne() {
  const velvet = toon('#9B6BFF')
  const gold = toon(GOLD, { emissive: '#FFB300', emissiveIntensity: 0.15 })
  return (
    <>
      <Mesh p={[0, 0.17, 0]} mat={velvet}>
        <cylinderGeometry args={[0.5, 0.56, 0.34, 32]} />
      </Mesh>
      <Mesh p={[0, 0.36, 0]} r={[Math.PI / 2, 0, 0]} mat={gold}>
        <torusGeometry args={[0.42, 0.08, 12, 32]} />
      </Mesh>
      <mesh position={[0, 0.37, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon('#5A3FA0')}>
        <circleGeometry args={[0.36, 24]} />
      </mesh>
      <Box p={[0, 0.85, -0.48]} s={[0.95, 1.05, 0.14]} mat={velvet} r={0.12} />
      <Box p={[0, 0.85, -0.42]} s={[0.75, 0.85, 0.04]} mat={toon('#C7A8FF')} r={0.08} outline={false} />
      {/* crown */}
      <group position={[0, 1.48, -0.48]}>
        <Mesh mat={gold}>
          <cylinderGeometry args={[0.2, 0.18, 0.12, 16]} />
        </Mesh>
        {[-0.13, 0, 0.13].map((x) => (
          <Mesh key={x} p={[x, 0.13, 0]} s={[0.05, 0.12, 0.05]} mat={gold}>
            <coneGeometry args={[1, 1, 8]} />
          </Mesh>
        ))}
        <Mesh p={[0, 0.02, 0.18]} s={0.04} mat={toon(colors.coral)} outline={false}>
          <sphereGeometry args={[1, 10, 8]} />
        </Mesh>
      </group>
    </>
  )
}

/* ---------------- Bathtub ---------------- */

const waterMat = new MeshBasicMaterial({ color: '#8FD3FF', transparent: true, opacity: 0.85 })

export function Bathtub() {
  const id = useGame((s) => s.equipped.tub)
  useUnveil(id, SPOTS.tub)
  const fancy = id === 'tub_bubble'
  const water = useRef<ThreeMesh>(null)
  const foam = useRef<Group>(null)
  const level = useRef(0)
  useFrame(({ clock }, dt) => {
    level.current += ((runtime.bath ? 1 : 0) - level.current) * (1 - Math.exp(-3 * dt))
    const l = level.current
    if (water.current) {
      water.current.visible = l > 0.02
      water.current.position.y = 0.12 + l * 0.28
    }
    if (foam.current) {
      foam.current.visible = l > 0.3
      foam.current.position.y = 0.12 + l * 0.3
      foam.current.scale.setScalar(Math.max(0.01, (l - 0.3) / 0.7))
      foam.current.rotation.y = clock.elapsedTime * 0.2
    }
  })
  const shell = toon(fancy ? '#FFB3D1' : '#FFFFFF')
  const { halfX: hx, halfZ: hz } = TUB
  const wallH = 0.5
  const t = 0.09
  return (
    <group position={[SPOTS.tub.x, 0, SPOTS.tub.z]}>
      {/* feet */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <Mesh key={`${sx}${sz}`} p={[sx * (hx - 0.1), 0.06, sz * (hz - 0.12)]} s={0.07} mat={toon(GOLD)}>
            <sphereGeometry args={[1, 12, 8]} />
          </Mesh>
        )),
      )}
      <Box p={[0, 0.14, 0]} s={[hx * 2, 0.1, hz * 2]} mat={shell} r={0.05} />
      <Box p={[hx - t / 2, 0.12 + wallH / 2, 0]} s={[t, wallH, hz * 2]} mat={shell} r={0.045} />
      <Box p={[-hx + t / 2, 0.12 + wallH / 2, 0]} s={[t, wallH, hz * 2]} mat={shell} r={0.045} />
      <Box p={[0, 0.12 + wallH / 2, hz - t / 2]} s={[hx * 2, wallH, t]} mat={shell} r={0.045} />
      <Box p={[0, 0.12 + wallH / 2 + 0.06, -hz + t / 2]} s={[hx * 2, wallH + 0.12, t]} mat={shell} r={0.045} />
      {/* inside + bath mat */}
      <mesh position={[0, 0.195, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon(fancy ? '#FFE3EF' : '#DDF1FF')}>
        <planeGeometry args={[hx * 2 - t * 2, hz * 2 - t * 2]} />
      </mesh>
      <Box p={[-hx - 0.42, 0.012, 0]} s={[0.6, 0.024, 1.0]} mat={toon(fancy ? '#B9F0E0' : '#FFB3C7')} r={0.011} />
      {/* faucet */}
      <group position={[0, 0.78, -hz + 0.02]}>
        <Mesh p={[0, 0, 0.08]} r={[Math.PI / 2, 0, 0]} mat={toon(GOLD)}>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 10]} />
        </Mesh>
        <Mesh p={[0, -0.05, 0.19]} s={0.05} mat={toon(GOLD)}>
          <sphereGeometry args={[1, 10, 8]} />
        </Mesh>
      </group>
      {/* water + foam (only while bathing) */}
      <mesh ref={water} rotation={[-Math.PI / 2, 0, 0]} material={waterMat} visible={false}>
        <planeGeometry args={[hx * 2 - t * 2, hz * 2 - t * 2]} />
      </mesh>
      <group ref={foam} visible={false}>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2
          return (
            <Mesh key={i} p={[Math.cos(a) * 0.26, 0.02, Math.sin(a) * 0.55]} s={0.11 + (i % 3) * 0.03} mat={toon('#FFFFFF')}>
              <sphereGeometry args={[1, 12, 8]} />
            </Mesh>
          )
        })}
      </group>
      {fancy && (
        <>
          {/* rim lights + rubber duck */}
          {[-0.5, -0.17, 0.17, 0.5].map((z) => (
            <mesh key={z} position={[hx + 0.005, 0.5, z]} rotation={[0, Math.PI / 2, 0]} material={toon('#FFFFFF', { emissive: '#7FE3FF', emissiveIntensity: 1.2 })}>
              <circleGeometry args={[0.04, 12]} />
            </mesh>
          ))}
          <group position={[-hx + 0.02, 0.68, -hz + 0.12]}>
            <Mesh s={[0.1, 0.08, 0.12]} mat={toon(colors.sunny)}>
              <sphereGeometry args={[1, 14, 10]} />
            </Mesh>
            <Mesh p={[0, 0.1, 0.04]} s={0.065} mat={toon(colors.sunny)}>
              <sphereGeometry args={[1, 14, 10]} />
            </Mesh>
            <Mesh p={[0, 0.09, 0.11]} s={[0.035, 0.02, 0.04]} mat={toon('#FF8A3D')} outline={false}>
              <sphereGeometry args={[1, 10, 8]} />
            </Mesh>
          </group>
        </>
      )}
    </group>
  )
}
