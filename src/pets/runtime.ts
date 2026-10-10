import { Vector3 } from 'three'
import type { FoodId, ToyId } from '../game/types'

/**
 * Per-frame shared state between the pet controller and scene props.
 * Mutated inside useFrame – never stored in React state to avoid re-renders.
 */
export const runtime = {
  petPos: new Vector3(),
  petHeading: 0,
  /** Head world position, used for emotes and particles. */
  petHead: new Vector3(0, 1, 0),
  food: { id: null as FoodId | null, progress: 0 },
  /** The toy currently in play (one at a time). */
  toy: { kind: null as ToyId | null, visible: false, pos: new Vector3(), yaw: 0, roll: 0, held: false },
  /** Water + foam in the tub. */
  bath: false,
  /** 0 = night, 1 = full day (damped). */
  daylight: 1,
  /** 0 = lights on, 1 = lights off (damped). */
  dark: 0,
  /** Ask the camera to focus the pet. */
  focusRequest: 0,
}

export type ParticleKind = 'heart' | 'bubble' | 'zzz' | 'spark' | 'drop' | 'sparkle' | 'crumb' | 'puff' | 'note'

type EmitFn = (kind: ParticleKind, at: Vector3, count?: number) => void
let emitter: EmitFn = () => {}

export function setEmitter(fn: EmitFn) {
  emitter = fn
}

export function emit(kind: ParticleKind, at: Vector3, count = 1) {
  emitter(kind, at, count)
}
