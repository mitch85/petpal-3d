import { Outlines } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import {
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  MeshBasicMaterial,
  SphereGeometry,
  TorusGeometry,
  type Material,
  type BufferGeometry,
} from 'three'
import type { PlaceholderLook } from '../game/pets.config'
import { toon } from '../scene/materials'
import { colors } from '../ui/tokens'
import type { PetPose } from './pose'

/** Shared geometries – created once, reused by every pet instance. */
const G = {
  sphere: new SphereGeometry(1, 32, 22),
  sphereLo: new SphereGeometry(1, 16, 12),
  cone: new ConeGeometry(1, 1, 24),
  capsule: new CapsuleGeometry(1, 1, 8, 16),
  cyl: new CylinderGeometry(1, 1, 1, 6),
  arc: new TorusGeometry(1, 0.26, 8, 20, Math.PI),
}
const white = new MeshBasicMaterial({ color: '#ffffff' })
// NB: drei's <Outlines> uses pixel thickness when `screenspace` is *false* (flag is inverted in its shader).
const OUTLINE_PX = 2.6

type V3 = [number, number, number]

function Blob({
  geo = G.sphere,
  mat,
  p,
  r,
  s,
  outline = true,
  shadow = true,
  children,
}: {
  geo?: BufferGeometry
  mat: Material
  p?: V3
  r?: V3
  s?: V3 | number
  outline?: boolean
  shadow?: boolean
  children?: ReactNode
}) {
  return (
    <mesh geometry={geo} material={mat} position={p} rotation={r} scale={s} castShadow={shadow}>
      {outline && <Outlines thickness={OUTLINE_PX} color={colors.ink} />}
      {children}
    </mesh>
  )
}

interface Props {
  look: PlaceholderLook
  pose: PetPose
}

/**
 * Procedural chibi pet built from primitives. Purely a renderer: it reads the
 * (already damped) pose every frame and never decides behaviour itself.
 */
export function PlaceholderPet({ look, pose }: Props) {
  const m = useMemo(
    () => ({
      primary: toon(look.primary),
      secondary: toon(look.secondary),
      belly: toon(look.belly),
      accent: toon(look.accent),
      inner: toon('#FFB3C7'),
      eye: toon('#2A1E36'),
      mouth: toon('#5A2E46'),
      tongue: toon('#FF7A9A'),
      blush: toon('#FF9DB8'),
      ink: toon(colors.ink),
    }),
    [look],
  )

  const upright = look.body[1] > look.body[2]
  const [w, h, l] = look.body
  const R = look.headSize
  const legH = upright ? 0.07 : 0.2
  const bodyY = legH + h / 2 - (upright ? 0 : 0.04)
  const headPos: V3 = upright ? [0, legH + h * 0.98, 0.03] : [0, bodyY + h * 0.5, l * 0.38]
  const tailPos: V3 = upright ? [0, legH + 0.12, -l * 0.42] : [0, bodyY + h * 0.08, -l * 0.46]

  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const head = useRef<Group>(null)
  const eyes = useRef<Group>(null)
  const eyeOpen = useRef<Group[]>([])
  const eyeHappy = useRef<Group[]>([])
  const eyeClosed = useRef<Group[]>([])
  const brows = useRef<Group>(null)
  const mouthSmile = useRef<Group>(null)
  const mouthOpen = useRef<Group>(null)
  const mouthFrown = useRef<Group>(null)
  const beak = useRef<Group>(null)
  const ears = useRef<Group[]>([])
  const legs = useRef<Group[]>([])
  const tailSegs = useRef<Group[]>([])
  const wings = useRef<Group[]>([])
  const cheeks = useRef<Group>(null)
  const blink = useRef({ next: 2, until: 0 })

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    if (!root.current || !body.current || !head.current) return

    // Root: hop, roll, lean, shake
    root.current.position.y = pose.hop
    root.current.rotation.z = pose.roll + pose.shake * Math.sin(t * 46) * 0.32
    root.current.rotation.x = pose.lean

    // Body: breathing, squash & stretch, crouch / lie
    const breath = Math.sin(t * pose.breathRate) * 0.03
    const sy = pose.squash * (1 + breath)
    body.current.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy))
    body.current.position.y = -legH * (pose.crouch * 0.55 + pose.lie * 0.95)

    // Head
    head.current.rotation.set(
      pose.headPitch + Math.sin(t * pose.breathRate) * 0.025,
      pose.headYaw,
      pose.headTilt,
    )

    // Legs
    legs.current.forEach((leg, i) => {
      if (!leg) return
      const phase = upright ? (i === 0 ? 0 : Math.PI) : i === 0 || i === 3 ? 0 : Math.PI
      leg.rotation.x = Math.sin(pose.walkPhase + phase) * 0.75 * pose.walk - pose.lie * (i < 2 ? 1.2 : -1.2) * (upright ? 0 : 1)
      leg.scale.y = 1 - pose.lie * 0.45 - pose.crouch * 0.25
    })

    // Tail chain: travelling wave
    tailSegs.current.forEach((seg, i) => {
      if (!seg) return
      const wave = Math.sin(t * pose.tailSpeed - i * 0.7) * pose.tailAmp
      if (look.tail === 'wag') seg.rotation.z = wave * 1.6
      else seg.rotation.y = wave * (i === 0 ? 0.6 : 0.45)
    })

    // Ears droop
    ears.current.forEach((ear, i) => {
      if (!ear) return
      const side = i === 0 ? 1 : -1
      const wiggle = Math.sin(t * 1.3 + i) * 0.04
      if (look.ears === 'long') {
        ear.rotation.x = -0.12 - pose.earDroop * 1.5
        ear.rotation.z = side * (0.12 + pose.earDroop * 0.5) + wiggle
      } else if (look.ears === 'floppy') {
        ear.rotation.z = side * (0.15 - pose.earDroop * 0.2) + wiggle * 2
        ear.rotation.x = pose.earDroop * 0.35
      } else {
        ear.rotation.z = side * pose.earDroop * 0.7 + wiggle
        ear.rotation.x = pose.earDroop * 0.4
      }
    })

    // Wings / flippers flap
    wings.current.forEach((wing, i) => {
      if (!wing) return
      const side = i === 0 ? 1 : -1
      const flap = Math.sin(t * (6 + pose.wing * 14)) * (0.08 + pose.wing * 0.55)
      wing.rotation.z = side * (upright ? 0.15 + flap : 0.35 + flap)
    })

    // Eyes: blinking + expression
    const b = blink.current
    if (t > b.next) {
      b.until = t + 0.12
      b.next = t + 1.8 + Math.random() * 3.5
      if (Math.random() < 0.2) b.next = t + 0.3 // double blink
    }
    const blinking = t < b.until && (pose.eyes === 'open' || pose.eyes === 'sad')
    const showOpen = pose.eyes === 'open' || pose.eyes === 'sad' || pose.eyes === 'squint'
    const openY = blinking ? 0.1 : pose.eyes === 'squint' ? 0.18 : pose.eyes === 'sad' ? 0.85 : 1
    eyeOpen.current.forEach((e) => {
      if (!e) return
      e.visible = showOpen
      e.scale.y = MathDamp(e.scale.y, openY, 30, dt)
      e.position.x = pose.lookX * 0.03
      e.position.y = pose.lookY * 0.03
    })
    eyeHappy.current.forEach((e) => e && (e.visible = pose.eyes === 'happy'))
    eyeClosed.current.forEach((e) => e && (e.visible = pose.eyes === 'closed'))
    if (brows.current) brows.current.visible = pose.eyes === 'sad'
    if (cheeks.current) cheeks.current.scale.setScalar(0.7 + pose.blush * 0.5)

    // Mouth
    const chewing = pose.mouth === 'chew'
    const openAmt = chewing ? 0.35 + Math.abs(Math.sin(t * 11)) * 0.75 : 1
    if (mouthSmile.current) mouthSmile.current.visible = pose.mouth === 'smile' || (chewing && openAmt < 0.6)
    if (mouthOpen.current) {
      mouthOpen.current.visible = pose.mouth === 'open' || (chewing && openAmt >= 0.6)
      mouthOpen.current.scale.y = chewing ? openAmt : 1
    }
    if (mouthFrown.current) mouthFrown.current.visible = pose.mouth === 'frown' || pose.mouth === 'flat'
    if (beak.current) beak.current.rotation.x = chewing ? Math.sin(t * 11) * 0.12 : pose.mouth === 'open' ? -0.1 : 0
    if (eyes.current) eyes.current.position.y = 0
  })

  const eyeX = R * 0.37
  const eyeY = R * 0.08
  const eyeZ = R * 0.86
  const eyeR = R * 0.19

  return (
    <group ref={root}>
      <group ref={body}>
        {/* Torso */}
        <Blob mat={m.primary} p={[0, bodyY, 0]} s={[w / 2, h / 2, l / 2]} />
        <Blob
          mat={m.belly}
          outline={false}
          p={upright ? [0, bodyY - 0.02, l * 0.17] : [0, bodyY - h * 0.12, l * 0.08]}
          s={upright ? [w * 0.4, h * 0.42, l * 0.36] : [w * 0.38, h * 0.36, l * 0.42]}
        />

        {look.extras?.includes('spots') && (
          <>
            <Blob mat={m.secondary} outline={false} p={[w * 0.3, bodyY + h * 0.2, -l * 0.08]} s={[0.1, 0.13, 0.15]} r={[0, 0, -0.5]} />
            <Blob mat={m.secondary} outline={false} p={[-w * 0.26, bodyY + h * 0.27, -l * 0.22]} s={[0.12, 0.1, 0.13]} />
          </>
        )}

        {look.extras?.includes('spikes') &&
          [0.12, -0.1, -0.3].map((z, i) => (
            <Blob key={i} geo={G.cone} mat={m.accent} p={[0, bodyY + h * 0.48 - Math.abs(z) * 0.2, l * z]} s={[0.06, 0.13, 0.06]} r={[-0.3, 0, 0]} />
          ))}

        {/* Wings / flippers */}
        {(look.extras?.includes('wings') || look.extras?.includes('flippers')) &&
          [1, -1].map((side, i) => (
            <group
              key={side}
              ref={(el) => void (wings.current[i] = el!)}
              position={upright ? [side * w * 0.47, bodyY + h * 0.18, 0] : [side * w * 0.22, bodyY + h * 0.38, -l * 0.1]}
            >
              {upright ? (
                <Blob mat={m.primary} p={[side * 0.04, -0.16, 0]} s={[0.06, 0.22, 0.12]} r={[0, 0, side * 0.1]} />
              ) : (
                <>
                  <Blob mat={m.secondary} p={[side * 0.2, 0.1, -0.02]} s={[0.24, 0.05, 0.16]} r={[0, 0, side * 0.4]} />
                  <Blob mat={m.accent} outline={false} p={[side * 0.22, 0.1, 0.02]} s={[0.18, 0.055, 0.1]} r={[0, 0, side * 0.4]} />
                </>
              )}
            </group>
          ))}

        {/* Tail */}
        <group position={tailPos}>
          <Tail look={look} m={m} segs={tailSegs} />
        </group>

        {/* Head */}
        <group ref={head} position={headPos}>
          <Blob mat={m.primary} s={R} />
          {upright && <Blob mat={m.belly} outline={false} p={[0, -R * 0.08, R * 0.24]} s={[R * 0.82, R * 0.78, R * 0.8]} />}
          {look.extras?.includes('spots') && <Blob mat={m.secondary} outline={false} p={[R * 0.36, R * 0.22, R * 0.78]} s={[R * 0.3, R * 0.3, R * 0.15]} r={[-0.2, 0.4, 0]} />}
          {look.ears === 'pointy' && (
            // forehead stripes
            [-1, 0, 1].map((i) => (
              <Blob key={i} mat={m.secondary} outline={false} p={[i * R * 0.18, R * 0.82, R * 0.42]} s={[R * 0.05, R * 0.14, R * 0.08]} r={[0.7, 0, i * 0.25]} />
            ))
          )}

          {/* Ears */}
          {look.ears !== 'none' &&
            [1, -1].map((side, i) => (
              <group key={side} ref={(el) => void (ears.current[i] = el!)} position={earPos(look.ears, side, R)}>
                <Ear kind={look.ears} side={side} R={R} m={m} />
              </group>
            ))}

          {/* Eyes */}
          <group ref={eyes}>
            {[1, -1].map((side, i) => (
              <group key={side} position={[side * eyeX, eyeY, eyeZ]} rotation={[0, side * 0.38, 0]}>
                <group ref={(el) => void (eyeOpen.current[i] = el!)}>
                  <mesh geometry={G.sphere} material={m.eye} scale={[eyeR, eyeR * 1.18, eyeR * 0.55]} />
                  <mesh geometry={G.sphereLo} material={white} position={[eyeR * 0.32, eyeR * 0.42, eyeR * 0.45]} scale={eyeR * 0.34} />
                  <mesh geometry={G.sphereLo} material={white} position={[-eyeR * 0.32, -eyeR * 0.38, eyeR * 0.48]} scale={eyeR * 0.16} />
                </group>
                <group ref={(el) => void (eyeHappy.current[i] = el!)} visible={false} position={[0, -eyeR * 0.3, eyeR * 0.3]}>
                  <mesh geometry={G.arc} material={m.eye} scale={eyeR * 0.75} />
                </group>
                <group ref={(el) => void (eyeClosed.current[i] = el!)} visible={false} position={[0, eyeR * 0.15, eyeR * 0.3]} rotation={[0, 0, Math.PI]}>
                  <mesh geometry={G.arc} material={m.eye} scale={eyeR * 0.7} />
                </group>
              </group>
            ))}
          </group>
          <group ref={brows} visible={false}>
            {[1, -1].map((side) => (
              <mesh key={side} geometry={G.capsule} material={m.eye} position={[side * eyeX * 0.95, eyeY + eyeR * 1.55, eyeZ * 0.98]} rotation={[0, 0, Math.PI / 2 + side * 0.4]} scale={[R * 0.025, R * 0.09, R * 0.025]} />
            ))}
          </group>

          {/* Cheeks */}
          <group ref={cheeks}>
            {[1, -1].map((side) => (
              <mesh key={side} geometry={G.sphereLo} material={m.blush} position={[side * R * 0.6, -R * 0.2, R * 0.74]} rotation={[0, side * 0.7, 0]} scale={[R * 0.13, R * 0.08, R * 0.04]} />
            ))}
          </group>

          {/* Muzzle + mouth */}
          <Muzzle look={look} R={R} m={m} refs={{ mouthSmile, mouthOpen, mouthFrown, beak }} />

          {look.extras?.includes('whiskers') &&
            [1, -1].map((side) =>
              [-0.08, 0.04].map((dy, j) => (
                <mesh key={`${side}${j}`} geometry={G.cyl} material={m.ink} position={[side * R * 0.72, -R * 0.12 + dy * R, R * 0.66]} rotation={[0, 0, Math.PI / 2 + side * (j ? -0.12 : 0.12)]} scale={[0.006, R * 0.36, 0.006]} />
              )),
            )}
        </group>
      </group>

      {/* Legs (outside the body group so feet stay grounded) */}
      {(upright ? [[0.13, 0.12], [-0.13, 0.12]] : [[w * 0.27, l * 0.27], [-w * 0.27, l * 0.27], [w * 0.27, -l * 0.27], [-w * 0.27, -l * 0.27]]).map(
        ([x, z], i) => (
          <group key={i} ref={(el) => void (legs.current[i] = el!)} position={[x, legH, z]}>
            {upright ? (
              <Blob mat={m.accent} p={[0, -legH + 0.03, 0.03]} s={[0.1, 0.035, 0.14]} />
            ) : (
              <Blob geo={G.capsule} mat={i < 2 ? m.primary : m.primary} p={[0, -legH / 2 + 0.02, 0]} s={[0.085, legH * 0.42, 0.085]} />
            )}
          </group>
        ),
      )}
    </group>
  )
}

function MathDamp(a: number, b: number, l: number, dt: number) {
  return a + (b - a) * (1 - Math.exp(-l * dt))
}

type Mats = Record<'primary' | 'secondary' | 'belly' | 'accent' | 'inner' | 'eye' | 'mouth' | 'tongue' | 'blush' | 'ink', Material>

function earPos(kind: PlaceholderLook['ears'], side: number, R: number): V3 {
  switch (kind) {
    case 'pointy':
      return [side * R * 0.52, R * 0.66, -R * 0.02]
    case 'floppy':
      return [side * R * 0.78, R * 0.42, -R * 0.05]
    case 'long':
      return [side * R * 0.3, R * 0.82, -R * 0.08]
    case 'horns':
      return [side * R * 0.42, R * 0.78, -R * 0.18]
    default:
      return [0, 0, 0]
  }
}

function Ear({ kind, side, R, m }: { kind: PlaceholderLook['ears']; side: number; R: number; m: Mats }) {
  switch (kind) {
    case 'pointy':
      return (
        <group rotation={[0, 0, side * -0.32]}>
          <Blob geo={G.cone} mat={m.primary} p={[0, R * 0.22, 0]} s={[R * 0.3, R * 0.5, R * 0.22]} />
          <Blob geo={G.cone} mat={m.inner} outline={false} p={[0, R * 0.2, R * 0.08]} s={[R * 0.18, R * 0.34, R * 0.1]} />
          <Blob geo={G.cone} mat={m.secondary} outline={false} p={[0, R * 0.4, 0]} s={[R * 0.13, R * 0.14, R * 0.1]} />
        </group>
      )
    case 'floppy':
      return (
        <group rotation={[0, 0, side * 0.1]}>
          <Blob mat={m.secondary} p={[side * R * 0.08, -R * 0.32, 0]} s={[R * 0.2, R * 0.46, R * 0.12]} />
        </group>
      )
    case 'long':
      return (
        <group>
          <Blob geo={G.capsule} mat={m.primary} p={[0, R * 0.55, 0]} s={[R * 0.17, R * 0.42, R * 0.11]} />
          <Blob geo={G.capsule} mat={m.inner} outline={false} p={[0, R * 0.55, R * 0.06]} s={[R * 0.1, R * 0.34, R * 0.06]} />
        </group>
      )
    case 'horns':
      return (
        <group rotation={[-0.45, 0, side * -0.25]}>
          <Blob geo={G.cone} mat={m.belly} p={[0, R * 0.2, 0]} s={[R * 0.12, R * 0.42, R * 0.12]} />
        </group>
      )
    default:
      return null
  }
}

function Tail({ look, m, segs }: { look: PlaceholderLook; m: Mats; segs: React.RefObject<Group[]> }) {
  const set = (i: number) => (el: Group | null) => void (segs.current[i] = el!)
  switch (look.tail) {
    case 'long': {
      // Recursive chain so the wave travels to the tip.
      const n = 6
      const build = (i: number): ReactNode =>
        i >= n ? (
          <Blob mat={m.secondary} p={[0, 0, -0.03]} s={0.07} />
        ) : (
          <group ref={set(i)} position={i === 0 ? [0, 0, 0] : [0, 0.045, -0.085]} rotation={[i === 0 ? 0.9 : -0.12, 0, 0]}>
            <Blob mat={m.primary} p={[0, 0, -0.04]} s={0.072 - i * 0.003} outline={i === 0} />
            {build(i + 1)}
          </group>
        )
      return <group rotation={[-0.4, 0, 0]}>{build(0)}</group>
    }
    case 'wag':
      return (
        <group ref={set(0)} rotation={[-0.7, 0, 0]}>
          <Blob geo={G.capsule} mat={m.primary} p={[0, 0.12, -0.02]} s={[0.06, 0.09, 0.06]} />
          <Blob mat={m.belly} outline={false} p={[0, 0.24, -0.02]} s={0.065} />
        </group>
      )
    case 'pom':
      return (
        <group ref={set(0)}>
          <Blob mat={m.belly} p={[0, 0.02, -0.05]} s={0.14} />
        </group>
      )
    case 'spiky': {
      const n = 4
      const build = (i: number): ReactNode =>
        i >= n ? (
          <Blob geo={G.cone} mat={m.accent} p={[0, 0, -0.05]} r={[-Math.PI / 2, 0, 0]} s={[0.08, 0.12, 0.03]} />
        ) : (
          <group ref={set(i)} position={i === 0 ? [0, 0, 0] : [0, -0.01, -0.12]} rotation={[i === 0 ? 0.25 : -0.08, 0, 0]}>
            <Blob mat={m.primary} p={[0, 0, -0.05]} s={[0.1 - i * 0.018, 0.09 - i * 0.016, 0.1]} />
            {build(i + 1)}
          </group>
        )
      return build(0)
    }
    case 'stub':
      return (
        <group ref={set(0)}>
          <Blob geo={G.cone} mat={m.secondary} p={[0, 0, -0.04]} r={[-Math.PI / 2 - 0.4, 0, 0]} s={[0.1, 0.12, 0.04]} />
        </group>
      )
  }
}

function Muzzle({
  look,
  R,
  m,
  refs,
}: {
  look: PlaceholderLook
  R: number
  m: Mats
  refs: Record<'mouthSmile' | 'mouthOpen' | 'mouthFrown' | 'beak', React.RefObject<Group | null>>
}) {
  const mouthZ = look.muzzle === 'snout' ? R * 1.06 : R * 0.95
  const mouthY = look.muzzle === 'snout' ? -R * 0.34 : -R * 0.3
  return (
    <>
      {look.muzzle === 'nose' && <mesh geometry={G.sphereLo} material={m.accent} position={[0, -R * 0.13, R * 0.98]} scale={[R * 0.08, R * 0.06, R * 0.05]} />}
      {look.muzzle === 'snout' && (
        <>
          <Blob mat={m.belly} p={[0, -R * 0.24, R * 0.78]} s={[R * 0.42, R * 0.3, R * 0.32]} />
          <mesh geometry={G.sphereLo} material={m.eye} position={[0, -R * 0.12, R * 1.08]} scale={[R * 0.12, R * 0.08, R * 0.07]} />
        </>
      )}
      {look.muzzle === 'beak' ? (
        <group ref={refs.beak} position={[0, -R * 0.16, R * 0.88]}>
          <Blob geo={G.cone} mat={m.accent} p={[0, 0, R * 0.14]} r={[Math.PI / 2, 0, 0]} s={[R * 0.17, R * 0.32, R * 0.11]} />
        </group>
      ) : (
        <>
          <group ref={refs.mouthSmile} position={[0, mouthY, mouthZ]}>
            {/* "w" shaped cat-mouth: two small smiles */}
            {[1, -1].map((side) => (
              <mesh key={side} geometry={G.arc} material={m.mouth} position={[side * R * 0.075, 0, 0]} rotation={[0, 0, Math.PI]} scale={R * 0.075} />
            ))}
          </group>
          <group ref={refs.mouthOpen} position={[0, mouthY - R * 0.04, mouthZ - R * 0.02]} visible={false}>
            <mesh geometry={G.sphereLo} material={m.mouth} scale={[R * 0.12, R * 0.1, R * 0.05]} />
            <mesh geometry={G.sphereLo} material={m.tongue} position={[0, -R * 0.045, R * 0.02]} scale={[R * 0.08, R * 0.045, R * 0.04]} />
          </group>
          <group ref={refs.mouthFrown} position={[0, mouthY - R * 0.05, mouthZ]} visible={false}>
            <mesh geometry={G.arc} material={m.mouth} scale={R * 0.09} />
          </group>
        </>
      )}
    </>
  )
}
