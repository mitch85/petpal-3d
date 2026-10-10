import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { Group } from 'three'
import { PETS } from '../game/pets.config'
import { STAGE_SCALE, ageStage, moodOf } from '../game/stats'
import { EmoteBubble } from '../scene/Props'
import { useGame } from '../store/gameStore'
import { EmoteDirty, EmoteHeart, EmoteSad, EmoteSick, EmoteSleepy, IconBladder, IconHunger } from '../ui/Icons'
import { GlbPet } from './GlbPet'
import { PetBrain, type Emote } from './PetBrain'
import { PlaceholderPet } from './PlaceholderPet'
import { createPose, dampPose } from './pose'

const EMOTE_ICONS: Record<Exclude<Emote, null>, () => React.ReactElement> = {
  hungry: () => <IconHunger size={38} />,
  toilet: () => <IconBladder size={38} />,
  sleepy: () => <EmoteSleepy size={38} />,
  sick: () => <EmoteSick size={38} />,
  sad: () => <EmoteSad size={38} />,
  dirty: () => <EmoteDirty size={38} />,
  heart: () => <EmoteHeart size={38} />,
}

/**
 * The pet in the room: model (placeholder or GLB) + behaviour brain.
 * Independent of the concrete species – everything comes from pets.config.
 */
export function Pet() {
  const pet = useGame((s) => s.pet)!
  const species = PETS[pet.species]
  const camera = useThree((s) => s.camera)
  const stage = ageStage(pet.bornAt, Date.now())
  const scale = STAGE_SCALE[stage]

  const brain = useMemo(() => new PetBrain(species, scale), [species, scale])
  const pose = useMemo(() => createPose(), [])
  const root = useRef<Group>(null)
  const [emote, setEmote] = useState<Emote>(null)
  const drag = useRef({ down: false, x: 0, y: 0, moved: 0 })

  useEffect(() => {
    brain.camera = camera
    brain.onComplete = (a) => useGame.getState().completeActivity(a)
  }, [brain, camera])

  useFrame((_, dt) => {
    const s = useGame.getState()
    brain.mood = moodOf(s.stats)
    brain.furniture = s.equipped
    brain.setLocation(s.location)
    brain.setActivity(s.sleeping ? { kind: 'sleep', id: -1 } : s.activity)
    brain.update(dt)
    dampPose(pose, brain.pose, Math.min(dt, 0.05), 9)
    if (root.current) {
      root.current.position.copy(brain.pos)
      root.current.rotation.y = brain.heading
    }
    if (brain.emote !== emote) setEmote(brain.emote)
  })

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    drag.current = { down: true, x: e.clientX, y: e.clientY, moved: 0 }
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    if (!d.down) return
    e.stopPropagation()
    d.moved += Math.hypot(e.clientX - d.x, e.clientY - d.y)
    d.x = e.clientX
    d.y = e.clientY
    // Stroking = dragging across the pet
    if (d.moved > 60 && useGame.getState().activity.kind === 'idle' && !useGame.getState().sleeping) {
      d.down = false
      useGame.getState().stroke()
    }
  }
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    if (d.down && d.moved < 12) {
      e.stopPropagation()
      brain.poke()
    }
    d.down = false
  }

  return (
    <>
      <group ref={root}>
        <group scale={scale} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => (drag.current.down = false)}>
          {species.model ? (
            <Suspense fallback={<PlaceholderPet look={species.look} pose={pose} />}>
              <GlbPet model={species.model} pose={pose} />
            </Suspense>
          ) : (
            <PlaceholderPet look={species.look} pose={pose} />
          )}
        </group>
      </group>
      <EmoteBubble id={emote ?? ''} icon={emote ? EMOTE_ICONS[emote]() : null} thought={emote !== 'heart'} />
    </>
  )
}
