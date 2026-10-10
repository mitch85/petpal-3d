import { MathUtils } from 'three'

export type EyeState = 'open' | 'closed' | 'happy' | 'squint' | 'sad'
export type MouthState = 'smile' | 'open' | 'chew' | 'frown' | 'flat'
/** Logical clip names – mapped to real clip names for GLB models. */
export type ClipName = 'idle' | 'walk' | 'eat' | 'sleep' | 'jump' | 'sit' | 'happy' | 'sad'

/**
 * Model-agnostic pose. Controllers write a *target* pose; `dampPose` blends
 * the *current* pose towards it every frame so transitions always crossfade.
 */
export interface PetPose {
  clip: ClipName
  eyes: EyeState
  mouth: MouthState
  /** 0..1 lowers the body (eat, squat). */
  crouch: number
  /** 0..1 lying down. */
  lie: number
  headPitch: number
  headYaw: number
  headTilt: number
  /** 0..1 ears hang down (sad/sick). */
  earDroop: number
  tailSpeed: number
  tailAmp: number
  /** 0..1 walk-cycle blend; walkPhase advances with distance. */
  walk: number
  walkPhase: number
  /** Vertical offset (jumps/hops) – not damped. */
  hop: number
  roll: number
  lean: number
  /** 0..1 shaking (after washing). */
  shake: number
  breathRate: number
  squash: number
  wing: number
  /** Pupil offset -1..1. */
  lookX: number
  lookY: number
  blush: number
}

export const createPose = (): PetPose => ({
  clip: 'idle',
  eyes: 'open',
  mouth: 'smile',
  crouch: 0,
  lie: 0,
  headPitch: 0,
  headYaw: 0,
  headTilt: 0,
  earDroop: 0,
  tailSpeed: 2,
  tailAmp: 0.3,
  walk: 0,
  walkPhase: 0,
  hop: 0,
  roll: 0,
  lean: 0,
  shake: 0,
  breathRate: 2.2,
  squash: 1,
  wing: 0,
  lookX: 0,
  lookY: 0,
  blush: 0.6,
})

const DAMPED = [
  'crouch', 'lie', 'headPitch', 'headYaw', 'headTilt', 'earDroop', 'tailSpeed', 'tailAmp', 'walk',
  'roll', 'lean', 'shake', 'breathRate', 'squash', 'wing', 'lookX', 'lookY', 'blush',
] as const

export function dampPose(cur: PetPose, target: PetPose, dt: number, lambda = 7) {
  for (const k of DAMPED) cur[k] = MathUtils.damp(cur[k], target[k], lambda, dt)
  cur.hop = target.hop
  cur.walkPhase = target.walkPhase
  cur.eyes = target.eyes
  cur.mouth = target.mouth
  cur.clip = target.clip
}

/** Reset the transient target fields that each behaviour frame sets explicitly. */
export function neutral(p: PetPose) {
  p.eyes = 'open'
  p.mouth = 'smile'
  p.crouch = 0
  p.lie = 0
  p.headPitch = 0
  p.headYaw = 0
  p.headTilt = 0
  p.earDroop = 0
  p.tailSpeed = 2
  p.tailAmp = 0.3
  p.walk = 0
  p.hop = 0
  p.roll = 0
  p.lean = 0
  p.shake = 0
  p.breathRate = 2.2
  p.squash = 1
  p.wing = 0
  p.lookX = 0
  p.lookY = 0
  p.blush = 0.6
  p.clip = 'idle'
}
