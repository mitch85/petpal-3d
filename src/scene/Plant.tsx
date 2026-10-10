import { toon } from './materials'
import { Mesh, type V3 } from './primitives'

export function Plant({ p, scale = 1 }: { p: V3; scale?: number }) {
  return (
    <group position={p} scale={scale}>
      <Mesh p={[0, 0.25, 0]} mat={toon('#F08F6B')}>
        <cylinderGeometry args={[0.28, 0.21, 0.5, 20]} />
      </Mesh>
      <Mesh p={[0, 0.5, 0]} r={[Math.PI / 2, 0, 0]} mat={toon('#E57E59')}>
        <torusGeometry args={[0.28, 0.05, 8, 24]} />
      </Mesh>
      {[
        [0, 0.95, 0, 0.34],
        [0.2, 0.75, 0.12, 0.26],
        [-0.2, 0.78, -0.05, 0.27],
        [0.05, 1.22, -0.05, 0.22],
      ].map(([x, y, z, s], i) => (
        <Mesh key={i} p={[x, y, z]} s={s} mat={toon(i % 2 ? '#5CBF83' : '#6FD397')}>
          <icosahedronGeometry args={[1, 1]} />
        </Mesh>
      ))}
    </group>
  )
}
