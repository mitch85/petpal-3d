import { describe, expect, it } from 'vitest'
import { PETS } from '../game/pets.config'
import type { Activity, ActivityKind } from '../game/types'
import { GARDEN_SPOTS, SPOTS } from '../scene/layout'
import { PetBrain } from './PetBrain'
import { runtime } from './runtime'

const DT = 1 / 60

function run(kind: ActivityKind, extra: Partial<Activity> = {}, maxSeconds = 40) {
  const brain = new PetBrain(PETS.cat)
  brain.mood = 'content'
  let done: Activity | null = null
  brain.onComplete = (a) => (done = a)
  const activity: Activity = { kind, id: 1, ...extra }
  brain.setActivity(activity)
  const track: { x: number; y: number; z: number; t: number }[] = []
  for (let t = 0; t < maxSeconds && !done; t += DT) {
    brain.update(DT)
    track.push({ x: brain.pos.x, y: brain.pos.y, z: brain.pos.z, t })
  }
  return { brain, done: done as Activity | null, track }
}

const minDist = (track: { x: number; z: number }[], p: { x: number; z: number }) =>
  Math.min(...track.map((s) => Math.hypot(s.x - p.x, s.z - p.z)))

describe('PetBrain routines', () => {
  it('eats: walks to the bowl, food shrinks, then completes', () => {
    const { done, track } = run('eat', { foodId: 'fish' })
    expect(done?.kind).toBe('eat')
    expect(minDist(track, SPOTS.eat)).toBeLessThan(0.1)
    expect(runtime.food.id).toBeNull()
  })

  it('uses the toilet: steps into the litter box (raised ground) and completes', () => {
    const { done, track } = run('toilet')
    expect(done?.kind).toBe('toilet')
    expect(minDist(track, SPOTS.litter)).toBeLessThan(0.1)
    expect(Math.max(...track.map((s) => s.y))).toBeGreaterThan(0.12)
  })

  it.each(['ball', 'frisbee', 'mouse', 'yarn', 'laser'] as const)('plays with %s and completes', (toy) => {
    const { done, track } = run('play', { toy })
    expect(done?.kind).toBe('play')
    expect(track.at(-1)!.t).toBeLessThan(35)
    expect(runtime.toy.visible).toBe(false)
  })

  it('strokes and completes', () => {
    expect(run('pet').done?.kind).toBe('pet')
  })

  it('washes inside the bathtub', () => {
    const { done, track } = run('wash')
    expect(done?.kind).toBe('wash')
    expect(minDist(track, SPOTS.tub)).toBeLessThan(0.1)
    expect(runtime.bath).toBe(false)
  })

  it('sleeps in the bed until woken and never completes on its own', () => {
    const { brain, done, track } = run('sleep', {}, 15)
    expect(done).toBeNull()
    expect(minDist(track, SPOTS.bed)).toBeLessThan(0.1)
    expect(brain.pose.lie).toBe(1)
  })

  it('switching activity mid-way cleans up props', () => {
    const brain = new PetBrain(PETS.cat)
    brain.setActivity({ kind: 'play', id: 1, toy: 'ball' })
    for (let i = 0; i < 90; i++) brain.update(DT)
    expect(runtime.toy.visible).toBe(true)
    brain.setActivity({ kind: 'idle', id: 2 })
    expect(runtime.toy.visible).toBe(false)
  })

  it('keeps the pet out of the pond while wandering in the garden', () => {
    const brain = new PetBrain(PETS.dog)
    brain.setLocation('garden')
    for (let i = 0; i < 60 * 60; i++) {
      brain.update(DT)
      expect(Math.hypot(brain.pos.x - GARDEN_SPOTS.pond.x, brain.pos.z - GARDEN_SPOTS.pond.z)).toBeGreaterThan(0.9)
    }
  })
})
