import type { ThemeId } from '../game/types'
import { colors } from '../ui/tokens'
import { ROOM } from './layout'
import { toon } from './materials'
import { Box, Mesh } from './primitives'
import { Plant } from './Plant'

const BACK_Z = -ROOM.half + ROOM.wall
const LEFT_X = -ROOM.half + ROOM.wall
/** Free, visible floor spot in the front-right corner (also on portrait phones). */
const FRONT: [number, number, number] = [3.0, 0, 2.8]

/** Theme-specific props so every room feels different, not just recoloured. */
export function ThemeDecor({ theme }: { theme: ThemeId }) {
  switch (theme) {
    case 'frost':
      return <Frost />
    case 'castle':
      return <Castle />
    case 'candy':
      return <Candy />
    default:
      return <Plant p={FRONT} scale={1.05} />
  }
}

function Frost() {
  const ice = toon('#E3F4FF')
  return (
    <group>
      {/* icicles hanging from the wall caps */}
      {Array.from({ length: 12 }, (_, i) => (
        <Mesh key={`b${i}`} p={[-3.4 + i * 0.6, ROOM.height - 0.12 - (i % 3) * 0.04, BACK_Z + 0.05]} r={[Math.PI, 0, 0]} s={[0.06, 0.22 + (i % 3) * 0.1, 0.06]} mat={ice}>
          <coneGeometry args={[1, 1, 8]} />
        </Mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <Mesh key={`l${i}`} p={[LEFT_X + 0.05, ROOM.height - 0.12 - (i % 3) * 0.04, -3.4 + i * 0.6]} r={[Math.PI, 0, 0]} s={[0.06, 0.2 + ((i + 1) % 3) * 0.1, 0.06]} mat={ice}>
          <coneGeometry args={[1, 1, 8]} />
        </Mesh>
      ))}
      {/* snowman */}
      <group position={FRONT} rotation={[0, 0.7, 0]}>
        <Mesh p={[0, 0.35, 0]} s={0.36} mat={toon('#FFFFFF')}>
          <sphereGeometry args={[1, 20, 14]} />
        </Mesh>
        <Mesh p={[0, 0.85, 0]} s={0.25} mat={toon('#FFFFFF')}>
          <sphereGeometry args={[1, 20, 14]} />
        </Mesh>
        <Mesh p={[0.06, 0.86, 0.24]} r={[Math.PI / 2, 0, 0]} s={[0.04, 0.16, 0.04]} mat={toon('#FF8A3D')}>
          <coneGeometry args={[1, 1, 8]} />
        </Mesh>
        {[-0.08, 0.1].map((x) => (
          <mesh key={x} position={[x, 0.93, 0.22]} scale={0.03} material={toon(colors.ink)}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        ))}
        <Mesh p={[0, 0.68, 0]} r={[Math.PI / 2, 0, 0]} mat={toon(colors.coral)}>
          <torusGeometry args={[0.2, 0.06, 8, 20]} />
        </Mesh>
        <Mesh p={[0, 1.12, 0]} mat={toon(colors.sky)}>
          <coneGeometry args={[0.2, 0.3, 16]} />
        </Mesh>
      </group>
    </group>
  )
}

function Castle() {
  const banner = (x: number, color: string) => (
    <group key={x} position={[x, 2.2, BACK_Z + 0.04]}>
      <Box p={[0, 0.55, 0]} s={[0.75, 0.06, 0.06]} mat={toon('#FFD27A')} r={0.02} />
      <Box p={[0, 0, 0]} s={[0.6, 1.1, 0.03]} mat={toon(color)} r={0.02} />
      <Mesh p={[0, -0.62, 0]} r={[0, 0, Math.PI]} s={[0.3, 0.2, 0.02]} mat={toon(color)}>
        <coneGeometry args={[1, 1, 3]} />
      </Mesh>
      <Mesh p={[0, 0.08, 0.03]} s={[0.14, 0.14, 0.02]} mat={toon('#FFD27A')}>
        <octahedronGeometry args={[1, 0]} />
      </Mesh>
    </group>
  )
  return (
    <group>
      {banner(-0.55, '#C24B5A')}
      {banner(0.95, '#5B7BD8')}
      {/* shield + crossed swords on the left wall */}
      <group position={[LEFT_X + 0.05, 2.15, 0.3]} rotation={[0, Math.PI / 2, 0]}>
        {[-1, 1].map((s) => (
          <Box key={s} p={[0, 0, -0.02]} rot={[0, 0, s * 0.7]} s={[0.07, 1.1, 0.03]} mat={toon('#D9D2E6')} r={0.02} />
        ))}
        <Mesh s={[0.34, 0.4, 0.06]} mat={toon('#C24B5A')}>
          <sphereGeometry args={[1, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
        </Mesh>
        <Mesh p={[0, 0.02, 0.06]} s={[0.1, 0.1, 0.02]} mat={toon('#FFD27A')}>
          <octahedronGeometry args={[1, 0]} />
        </Mesh>
      </group>
      {/* treasure chest */}
      <group position={FRONT} rotation={[0, 0.8, 0]}>
        <Box p={[0, 0.25, 0]} s={[0.8, 0.5, 0.55]} mat={toon('#A9724F')} r={0.05} />
        <Mesh p={[0, 0.5, 0]} r={[0, 0, Math.PI / 2]} s={[0.27, 0.4, 0.27]} mat={toon('#B9805A')}>
          <cylinderGeometry args={[1, 1, 2, 16, 1, false, 0, Math.PI]} />
        </Mesh>
        <Box p={[0, 0.3, 0.29]} s={[0.12, 0.16, 0.04]} mat={toon('#FFD27A')} r={0.02} />
        {[-0.15, 0.12].map((x) => (
          <Mesh key={x} p={[x, 0.66, 0.05]} s={0.07} mat={toon('#FFD27A')}>
            <cylinderGeometry args={[1, 1, 0.3, 12]} />
          </Mesh>
        ))}
      </group>
    </group>
  )
}

function Candy() {
  const lolly = (p: [number, number, number], c: string, h: number) => (
    <group position={p}>
      <Mesh p={[0, h / 2, 0]} mat={toon('#FFFFFF')}>
        <cylinderGeometry args={[0.03, 0.03, h, 8]} />
      </Mesh>
      <Mesh p={[0, h + 0.2, 0]} r={[Math.PI / 2, 0, 0.5]} s={[0.25, 0.25, 0.06]} mat={toon(c)}>
        <cylinderGeometry args={[1, 1, 1, 24]} />
      </Mesh>
      <Mesh p={[0, h + 0.2, 0.035]} r={[0, 0, 0]} s={0.16} mat={toon('#FFFFFF')} outline={false}>
        <torusGeometry args={[0.6, 0.18, 6, 20]} />
      </Mesh>
    </group>
  )
  return (
    <group>
      {lolly([FRONT[0] - 0.2, 0, FRONT[2] - 0.3], colors.pink, 1.0)}
      {lolly([FRONT[0] + 0.35, 0, FRONT[2] + 0.1], colors.mint, 0.7)}
      {/* cupcake */}
      <group position={[FRONT[0] - 0.35, 0, FRONT[2] + 0.35]}>
        <Mesh p={[0, 0.15, 0]} mat={toon('#E9A35E')}>
          <cylinderGeometry args={[0.2, 0.15, 0.3, 16]} />
        </Mesh>
        <Mesh p={[0, 0.36, 0]} s={[0.24, 0.16, 0.24]} mat={toon('#FFD6EC')}>
          <sphereGeometry args={[1, 16, 12]} />
        </Mesh>
        <Mesh p={[0, 0.55, 0]} s={0.06} mat={toon(colors.coral)}>
          <sphereGeometry args={[1, 10, 8]} />
        </Mesh>
      </group>
      {/* star garland on the left wall */}
      {Array.from({ length: 7 }, (_, i) => (
        <Mesh key={i} p={[LEFT_X + 0.04, 2.85 + Math.sin(i) * 0.12, -3.2 + i * 0.45]} r={[0, Math.PI / 2, 0]} s={[0.12, 0.12, 0.03]} mat={toon([colors.sunny, colors.pink, colors.mint][i % 3])}>
          <octahedronGeometry args={[1, 0]} />
        </Mesh>
      ))}
    </group>
  )
}
