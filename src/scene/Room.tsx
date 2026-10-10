import { Outlines } from '@react-three/drei'
import { Box, Mesh, OUTLINE } from './primitives'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { useGame } from '../store/gameStore'
import { Bathtub, Bed, BowlShape, FoodBowl, Litter } from './Furniture'
import { THEMES } from './themes'
import { ThemeDecor } from './ThemeDecor'
import { Plant } from './Plant'
import { CatmullRomCurve3, Color, MeshBasicMaterial, ShaderMaterial, Vector3 } from 'three'
import { colors } from '../ui/tokens'
import { runtime } from '../pets/runtime'
import { toon } from './materials'
import { ROOM, SPOTS } from './layout'
import { floorTexture, rugTexture, wallpaperTexture } from './textures'

const OL = OUTLINE

export function Room() {
  const theme = THEMES[useGame((s) => s.theme)]
  const tex = useMemo(
    () => ({
      floor: floorTexture(theme.floor),
      wallBack: wallpaperTexture(theme.wallBack.base, theme.wallBack.dot, theme.wallBack.pattern),
      wallLeft: wallpaperTexture(theme.wallLeft.base, theme.wallLeft.dot, theme.wallLeft.pattern),
      rug: rugTexture(theme.rug),
    }),
    [theme],
  )
  useEffect(() => () => Object.values(tex).forEach((t) => t.dispose()), [tex])
  const { half: H, height: WH, wall: WT } = ROOM

  return (
    <group>
      {/* Floor slab */}
      <Box p={[0, -0.2, 0]} s={[H * 2, 0.4, H * 2]} mat={toon(theme.floorSide)} r={0.08} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow material={toon('#ffffff', { map: tex.floor })}>
        <planeGeometry args={[H * 2 - 0.06, H * 2 - 0.06]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.1, 0.012, 0.2]} receiveShadow material={toon('#ffffff', { map: tex.rug })}>
        <circleGeometry args={[1.9, 48]} />
      </mesh>

      {/* Walls */}
      <Box p={[0, WH / 2, -H + WT / 2]} s={[H * 2, WH, WT]} mat={toon('#ffffff', { map: tex.wallBack })} r={0.06} />
      <Box p={[-H + WT / 2, WH / 2, 0]} s={[WT, WH, H * 2]} mat={toon('#ffffff', { map: tex.wallLeft })} r={0.06} />
      {/* Baseboards + wall caps */}
      <Box p={[0, 0.12, -H + WT + 0.03]} s={[H * 2 - 0.1, 0.24, 0.06]} mat={toon(colors.paper)} r={0.02} />
      <Box p={[-H + WT + 0.03, 0.12, 0]} s={[0.06, 0.24, H * 2 - 0.1]} mat={toon(colors.paper)} r={0.02} />
      <Box p={[0, WH + 0.04, -H + WT / 2]} s={[H * 2 + 0.06, 0.1, WT + 0.08]} mat={toon(theme.capBack)} r={0.04} />
      <Box p={[-H + WT / 2, WH + 0.04, 0]} s={[WT + 0.08, 0.1, H * 2 + 0.06]} mat={toon(theme.capLeft)} r={0.04} />

      <Window curtain={theme.curtain} />
      <Bunting palette={theme.bunting} />
      <WallDecor />
      <FoodCorner />
      <Litter />
      <Bed />
      <Bathtub />
      <FloorLamp />
      <ToyBasket />
      <ThemeDecor theme={theme.id} />
      <Plant p={[2.25, 0, -3.25]} scale={0.9} />
    </group>
  )
}

/* ---------------- Window with live sky ---------------- */

const skyMat = new ShaderMaterial({
  uniforms: { top: { value: new Color('#7CC8FF') }, bottom: { value: new Color('#FFE3B8') } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec2 vUv; void main(){ gl_FragColor = vec4(mix(bottom, top, smoothstep(0.,1.,vUv.y)), 1.); }',
})
const DAY_TOP = new Color('#78C6FF')
const DAY_BOTTOM = new Color('#FFE8C2')
const NIGHT_TOP = new Color('#1E2150')
const NIGHT_BOTTOM = new Color('#5B4A8E')
const sunMat = new MeshBasicMaterial({ color: '#FFF2B3' })
const moonMat = new MeshBasicMaterial({ color: '#FFF8E0' })

function Window({ curtain }: { curtain: string }) {
  const z = -ROOM.half + ROOM.wall + 0.01
  const [x, y, w, h] = [-2.0, 2.05, 1.7, 1.4]
  const sun = useRef<import('three').Mesh>(null)
  const moon = useRef<import('three').Mesh>(null)
  useFrame(() => {
    const d = runtime.daylight
    skyMat.uniforms.top.value.copy(NIGHT_TOP).lerp(DAY_TOP, d)
    skyMat.uniforms.bottom.value.copy(NIGHT_BOTTOM).lerp(DAY_BOTTOM, d)
    if (sun.current) sun.current.visible = d > 0.5
    if (moon.current) moon.current.visible = d <= 0.5
  })
  const frame = toon(colors.paper)
  return (
    <group position={[x, y, z]}>
      <mesh material={skyMat} position={[0, 0, 0.005]}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh ref={sun} material={sunMat} position={[0.45, 0.35, 0.01]}>
        <circleGeometry args={[0.16, 24]} />
      </mesh>
      <mesh ref={moon} material={moonMat} position={[-0.4, 0.35, 0.01]}>
        <circleGeometry args={[0.12, 24]} />
      </mesh>
      {/* little clouds / hills */}
      <mesh material={toon('#9BD9A8')} position={[0, -h / 2 + 0.05, 0.012]} scale={[1, 0.35, 1]}>
        <circleGeometry args={[0.7, 32, 0, Math.PI]} />
      </mesh>
      <Box p={[0, h / 2 + 0.05, 0.06]} s={[w + 0.2, 0.1, 0.12]} mat={frame} />
      <Box p={[0, -h / 2 - 0.05, 0.1]} s={[w + 0.36, 0.1, 0.24]} mat={frame} />
      <Box p={[-w / 2 - 0.05, 0, 0.06]} s={[0.1, h + 0.2, 0.12]} mat={frame} />
      <Box p={[w / 2 + 0.05, 0, 0.06]} s={[0.1, h + 0.2, 0.12]} mat={frame} />
      <Box p={[0, 0, 0.04]} s={[0.06, h, 0.06]} mat={frame} />
      <Box p={[0, 0.1, 0.04]} s={[w, 0.06, 0.06]} mat={frame} />
      {/* curtains */}
      <Box p={[0, h / 2 + 0.25, 0.18]} s={[w + 1.0, 0.06, 0.06]} mat={toon('#C98F62')} r={0.03} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.28), 0.05, 0.2]}>
          {[0, 1, 2].map((i) => (
            <Mesh key={i} p={[(i - 1) * 0.11, 0, 0]} s={[0.075, (h + 0.35) / 2, 0.07]} mat={toon(curtain)} outline={i !== 1}>
              <capsuleGeometry args={[1, 1, 6, 12]} />
            </Mesh>
          ))}
          <Box p={[0, -0.15, 0.04]} s={[0.4, 0.08, 0.12]} mat={toon(colors.sunny)} r={0.03} />
        </group>
      ))}
      {/* small cactus on sill */}
      <group position={[-0.55, -h / 2 + 0.02, 0.14]}>
        <Mesh p={[0, 0.06, 0]} mat={toon('#E98A5E')}>
          <cylinderGeometry args={[0.08, 0.06, 0.12, 16]} />
        </Mesh>
        <Mesh p={[0, 0.2, 0]} s={[0.06, 0.1, 0.06]} mat={toon('#6CC48F')}>
          <capsuleGeometry args={[1, 1, 6, 12]} />
        </Mesh>
      </group>
    </group>
  )
}

function Bunting({ palette }: { palette: string[] }) {
  const flags = useMemo(() => {
    const curve = new CatmullRomCurve3([new Vector3(-3.6, 3.15, -3.62), new Vector3(-1.5, 2.85, -3.62), new Vector3(0.5, 2.95, -3.62), new Vector3(3.6, 3.2, -3.62)])
    return Array.from({ length: 14 }, (_, i) => ({ p: curve.getPoint((i + 0.5) / 14), c: palette[i % palette.length] }))
  }, [palette])
  return (
    <group>
      {flags.map((f, i) => (
        <Mesh key={i} p={[f.p.x, f.p.y - 0.12, f.p.z]} r={[0, 0, Math.PI]} s={[0.14, 0.24, 0.02]} mat={toon(f.c)} shadow={false}>
          <coneGeometry args={[1, 1, 3]} />
        </Mesh>
      ))}
    </group>
  )
}

function WallDecor() {
  const x = -ROOM.half + ROOM.wall
  return (
    <group>
      {/* Framed heart picture on left wall */}
      <group position={[x + 0.04, 2.15, -1.6]} rotation={[0, Math.PI / 2, 0]}>
        <Box p={[0, 0, 0]} s={[0.9, 0.75, 0.06]} mat={toon(colors.sunny)} />
        <mesh position={[0, 0, 0.035]} material={toon(colors.paper)}>
          <planeGeometry args={[0.72, 0.57]} />
        </mesh>
        <Mesh p={[0, 0, 0.05]} s={0.13} mat={toon(colors.coral)}>
          <sphereGeometry args={[1, 16, 12]} />
        </Mesh>
        <Mesh p={[-0.12, 0.1, 0.05]} s={0.08} mat={toon(colors.mint)}>
          <sphereGeometry args={[1, 16, 12]} />
        </Mesh>
      </group>
      {/* Shelf with books on left wall */}
      <group position={[x + 0.2, 1.75, 1.6]}>
        <Box p={[0, 0, 0]} s={[0.36, 0.06, 1.3]} mat={toon('#C98F62')} />
        {['#FF7A6B', '#5BB8FF', '#FFC94A', '#A98BFF'].map((c, i) => (
          <Box key={i} p={[0, 0.2, -0.45 + i * 0.13]} s={[0.26, 0.34 - (i % 2) * 0.06, 0.1]} mat={toon(c)} r={0.02} />
        ))}
        <group position={[0, 0.03, 0.35]}>
          <Plant p={[0, 0, 0]} scale={0.45} />
        </group>
      </group>
      {/* Round clock on back wall */}
      <group position={[0.15, 2.45, -ROOM.half + ROOM.wall + 0.03]}>
        <Mesh r={[Math.PI / 2, 0, 0]} mat={toon(colors.sky)}>
          <cylinderGeometry args={[0.32, 0.32, 0.06, 32]} />
        </Mesh>
        <mesh position={[0, 0, 0.035]} material={toon(colors.paper)}>
          <circleGeometry args={[0.25, 32]} />
        </mesh>
        <ClockHands />
      </group>
    </group>
  )
}

function ClockHands() {
  const hour = useRef<import('three').Mesh>(null)
  const min = useRef<import('three').Mesh>(null)
  useFrame(() => {
    const d = new Date()
    const m = d.getMinutes() + d.getSeconds() / 60
    const h = (d.getHours() % 12) + m / 60
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2
    if (min.current) min.current.rotation.z = -(m / 60) * Math.PI * 2
  })
  const ink = toon(colors.ink)
  return (
    <group position={[0, 0, 0.045]}>
      <mesh ref={hour} material={ink}>
        <boxGeometry args={[0.035, 0.26, 0.01]} />
      </mesh>
      <mesh ref={min} material={ink}>
        <boxGeometry args={[0.025, 0.4, 0.01]} />
      </mesh>
    </group>
  )
}

/* ---------------- Furniture ---------------- */

function FoodCorner() {
  return (
    <group>
      <Box p={[-2.85, 0.015, 0.55]} s={[1.3, 0.03, 2.0]} mat={toon(colors.coral)} r={0.012} />
      <FoodBowl />
      <BowlShape p={[SPOTS.water.x, 0.03, SPOTS.water.z]} color={colors.lavender} inner="#9FDCFF" />
    </group>
  )
}

function FloorLamp() {
  const shade = useRef<import('three').MeshToonMaterial>(null)
  const light = useRef<import('three').PointLight>(null)
  useFrame(() => {
    const on = Math.max(1 - runtime.daylight, 0) * (1 - runtime.dark * 0.85)
    if (shade.current) shade.current.emissiveIntensity = 0.1 + on * 0.75
    if (light.current) light.current.intensity = on * 3
  })
  return (
    <group position={[-3.35, 0, -1.05]}>
      <Mesh p={[0, 0.03, 0]} mat={toon(colors.ink)}>
        <cylinderGeometry args={[0.25, 0.28, 0.06, 24]} />
      </Mesh>
      <Mesh p={[0, 1.0, 0]} mat={toon(colors.ink)} outline={false}>
        <cylinderGeometry args={[0.025, 0.025, 2, 8]} />
      </Mesh>
      <mesh position={[0, 2.05, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.4, 0.42, 28, 1, true]} />
        <meshToonMaterial ref={shade} color="#FFE7A8" emissive="#FFC867" emissiveIntensity={0.2} side={2} />
        <Outlines thickness={OL} color={colors.ink} />
      </mesh>
      <pointLight ref={light} position={[0, 1.85, 0.1]} color="#FFC27A" intensity={0} distance={6} decay={1.6} />
    </group>
  )
}

function ToyBasket() {
  const { x, z } = SPOTS.basket
  return (
    <group position={[x, 0, z]}>
      <Mesh p={[0, 0.2, 0]} mat={toon('#E7B27A')}>
        <cylinderGeometry args={[0.42, 0.34, 0.4, 24]} />
      </Mesh>
      <Mesh p={[0, 0.4, 0]} r={[Math.PI / 2, 0, 0]} mat={toon('#D79B60')}>
        <torusGeometry args={[0.42, 0.04, 8, 32]} />
      </Mesh>
      <Mesh p={[0.1, 0.48, 0.05]} s={0.17} mat={toon(colors.pink)}>
        <sphereGeometry args={[1, 20, 14]} />
      </Mesh>
      <Mesh p={[-0.15, 0.45, -0.1]} s={0.15} mat={toon(colors.sky)}>
        <icosahedronGeometry args={[1, 1]} />
      </Mesh>
      <Mesh p={[-0.05, 0.62, -0.18]} r={[0.3, 0, 0.5]} mat={toon(colors.sunny)}>
        <torusGeometry args={[0.12, 0.04, 8, 20]} />
      </Mesh>
    </group>
  )
}
