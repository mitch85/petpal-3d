import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import type { GlbModelConfig } from '../game/pets.config'
import type { PetPose } from './pose'

/**
 * Renders a GLB pet and crossfades between its clips based on `pose.clip`.
 * Expression details (eyes, mouth) are left to the model's own animations.
 */
export function GlbPet({ model, pose }: { model: GlbModelConfig; pose: PetPose }) {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(model.url)
  const { actions } = useAnimations(animations, group)
  const current = useRef<string | null>(null)

  useEffect(() => {
    scene.traverse((o) => {
      o.castShadow = true
    })
  }, [scene])

  useFrame(() => {
    if (group.current) group.current.position.y = pose.hop
    const name = model.clips[pose.clip] ?? model.clips.idle
    if (!name || name === current.current) return
    const next = actions[name]
    const prev = current.current ? actions[current.current] : null
    if (!next) return
    next.reset().fadeIn(0.3).play()
    prev?.fadeOut(0.3)
    current.current = name
  })

  return (
    <group ref={group} scale={model.scale}>
      <primitive object={scene} />
    </group>
  )
}
