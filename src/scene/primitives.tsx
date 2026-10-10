import { Outlines, RoundedBox } from '@react-three/drei'
import type { ReactNode } from 'react'
import type { Material } from 'three'
import { colors } from '../ui/tokens'

export type V3 = [number, number, number]
export const OUTLINE = 2.2

/** Rounded box with toon outline. */
export function Box({ p, s, mat, r = 0.04, rot, outline = true, children }: { p: V3; s: V3; mat: Material; r?: number; rot?: V3; outline?: boolean; children?: ReactNode }) {
  return (
    <RoundedBox args={s} radius={Math.min(r, ...s.map((v) => v / 2 - 0.001))} smoothness={3} position={p} rotation={rot} material={mat} castShadow receiveShadow>
      {outline && <Outlines thickness={OUTLINE} color={colors.ink} />}
      {children}
    </RoundedBox>
  )
}

/** Any geometry (as child) with toon outline. */
export function Mesh({ children, p, r, s, mat, outline = true, shadow = true }: { children: ReactNode; p?: V3; r?: V3; s?: V3 | number; mat: Material; outline?: boolean; shadow?: boolean }) {
  return (
    <mesh position={p} rotation={r} scale={s} material={mat} castShadow={shadow} receiveShadow>
      {children}
      {outline && <Outlines thickness={OUTLINE} color={colors.ink} />}
    </mesh>
  )
}
