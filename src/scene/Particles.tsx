import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, Sprite, SpriteMaterial, Vector3, type Group, type Texture } from 'three'
import { setEmitter, type ParticleKind } from '../pets/runtime'
import { spriteTexture } from './textures'

interface Particle {
  sprite: Sprite
  vel: Vector3
  life: number
  max: number
  size: number
  spin: number
  gravity: number
  kind: ParticleKind
}

const SPECS: Record<ParticleKind, { size: [number, number]; life: [number, number]; vel: () => Vector3; gravity: number; additive?: boolean }> = {
  heart: { size: [0.18, 0.28], life: [1.1, 1.6], vel: () => new Vector3(rand(-0.4, 0.4), rand(0.9, 1.4), rand(-0.3, 0.3)), gravity: -0.2 },
  bubble: { size: [0.16, 0.34], life: [1.4, 2.4], vel: () => new Vector3(rand(-0.25, 0.25), rand(0.15, 0.45), rand(-0.25, 0.25)), gravity: -0.1 },
  zzz: { size: [0.26, 0.4], life: [2.2, 2.8], vel: () => new Vector3(rand(0.15, 0.3), rand(0.35, 0.5), rand(-0.05, 0.05)), gravity: 0 },
  spark: { size: [0.12, 0.22], life: [0.5, 0.9], vel: () => new Vector3(rand(-1, 1), rand(1, 2.2), rand(-1, 1)), gravity: 3.5, additive: true },
  sparkle: { size: [0.12, 0.22], life: [0.6, 1.0], vel: () => new Vector3(rand(-1, 1), rand(0.6, 1.6), rand(-1, 1)), gravity: 1.2 },
  drop: { size: [0.07, 0.12], life: [0.5, 0.8], vel: () => new Vector3(rand(-2, 2), rand(0.6, 1.8), rand(-2, 2)), gravity: 6 },
  crumb: { size: [0.04, 0.06], life: [0.4, 0.7], vel: () => new Vector3(rand(-0.8, 0.8), rand(0.8, 1.5), rand(-0.8, 0.8)), gravity: 6 },
  puff: { size: [0.25, 0.45], life: [0.5, 0.8], vel: () => new Vector3(rand(-0.6, 0.6), rand(0.2, 0.6), rand(-0.6, 0.6)), gravity: 0 },
  note: { size: [0.16, 0.24], life: [1.2, 1.6], vel: () => new Vector3(rand(-0.4, 0.4), rand(0.7, 1.1), rand(-0.2, 0.2)), gravity: 0 },
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

const POOL = 90

/** Pooled sprite particles; anything can call `emit()` from runtime.ts. */
export function Particles() {
  const group = useRef<Group>(null)
  const textures = useMemo(() => {
    const t = {} as Record<ParticleKind, Texture>
    for (const k of Object.keys(SPECS) as ParticleKind[]) t[k] = spriteTexture(k)
    return t
  }, [])
  const pool = useMemo<Particle[]>(
    () =>
      Array.from({ length: POOL }, () => {
        const sprite = new Sprite(new SpriteMaterial({ transparent: true, depthWrite: false }))
        sprite.visible = false
        sprite.renderOrder = 10
        return { sprite, vel: new Vector3(), life: 0, max: 1, size: 1, spin: 0, gravity: 0, kind: 'heart' as ParticleKind }
      }),
    [],
  )

  useEffect(() => {
    const g = group.current!
    pool.forEach((p) => g.add(p.sprite))
    let cursor = 0
    setEmitter((kind, at, count = 1) => {
      const spec = SPECS[kind]
      for (let i = 0; i < count; i++) {
        const p = pool[cursor]
        cursor = (cursor + 1) % POOL
        const mat = p.sprite.material
        mat.map = textures[kind]
        mat.blending = spec.additive ? AdditiveBlending : 1
        mat.needsUpdate = true
        p.kind = kind
        p.sprite.position.copy(at).add(new Vector3(rand(-0.15, 0.15), rand(-0.05, 0.1), rand(-0.15, 0.15)))
        p.vel.copy(spec.vel())
        p.max = p.life = rand(...spec.life)
        p.size = rand(...spec.size)
        p.gravity = spec.gravity
        p.spin = rand(-1.5, 1.5)
        p.sprite.visible = true
      }
    })
    return () => setEmitter(() => {})
  }, [pool, textures])

  useFrame((_, dt) => {
    for (const p of pool) {
      if (p.life <= 0) continue
      p.life -= dt
      if (p.life <= 0) {
        p.sprite.visible = false
        continue
      }
      const age = 1 - p.life / p.max
      p.vel.y -= p.gravity * dt
      if (p.kind === 'zzz' || p.kind === 'bubble') p.vel.x += Math.sin(age * 12) * dt * 0.6
      p.sprite.position.addScaledVector(p.vel, dt)
      const pop = age < 0.15 ? age / 0.15 : 1
      const s = p.size * (0.4 + 0.6 * pop) * (p.kind === 'puff' ? 1 + age : 1)
      p.sprite.scale.set(s, s, s)
      p.sprite.material.rotation += p.spin * dt * (p.kind === 'heart' || p.kind === 'zzz' ? 0.2 : 1)
      p.sprite.material.opacity = age > 0.7 ? (1 - age) / 0.3 : 1
    }
  })

  return <group ref={group} />
}
