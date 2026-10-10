import type { AgeStage, Mood, StatKey, Stats } from './types'
import type { StatRates } from './pets.config'

export const STAT_KEYS: StatKey[] = ['hunger', 'energy', 'fun', 'hygiene', 'bladder', 'health']
/** Below this a need counts as critical ("red"). Bladder is inverted. */
export const CRITICAL = 20
export const LOW = 35
export const TOILET_URGE = 75

/** Offline simulation is capped so a holiday doesn't make the pet sick instantly. */
export const OFFLINE_CAP_MINUTES = 8 * 60
export const OFFLINE_RATE = 0.5
export const OFFLINE_FLOOR = 15
export const OFFLINE_HEALTH_FLOOR = 50

const SLEEP_ENERGY_GAIN = 4

export const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v))

export function initialStats(): Stats {
  return { hunger: 80, energy: 85, fun: 80, hygiene: 90, bladder: 10, health: 100 }
}

export interface TickContext {
  sleeping: boolean
  /** Multiplier for energy regained while sleeping (better beds). */
  sleepGain?: number
  /** Multiplier for fun decay (favourite room, garden). */
  funDecay?: number
}

export interface TickResult {
  stats: Stats
  accident: boolean
}

/** Is a stat in a bad state? Bladder is "bad" when high. */
export function isCritical(key: StatKey, value: number) {
  return key === 'bladder' ? value >= 100 - CRITICAL : value < CRITICAL
}

/** Advance stats by `minutes` (expected ≤ ~1 per call; use simulate() for long spans). */
export function tickStats(stats: Stats, minutes: number, rates: StatRates, ctx: TickContext): TickResult {
  const sleepMul = ctx.sleeping ? 0.4 : 1
  const s: Stats = { ...stats }
  s.hunger = clamp(s.hunger + rates.hunger * minutes * sleepMul)
  s.energy = clamp(s.energy + (ctx.sleeping ? SLEEP_ENERGY_GAIN * (ctx.sleepGain ?? 1) : rates.energy) * minutes)
  s.fun = clamp(s.fun + rates.fun * minutes * (ctx.sleeping ? 0.15 : 1) * (ctx.funDecay ?? 1))
  s.hygiene = clamp(s.hygiene + rates.hygiene * minutes * sleepMul)
  s.bladder = clamp(s.bladder + rates.bladder * minutes * sleepMul)

  const reds = (['hunger', 'energy', 'fun', 'hygiene'] as const).filter((k) => s[k] < CRITICAL).length
  if (reds > 0) s.health = clamp(s.health - 0.6 * reds * minutes)
  else if (s.hunger > 50 && s.energy > 50 && s.fun > 50 && s.hygiene > 50) s.health = clamp(s.health + 0.5 * minutes)

  let accident = false
  if (s.bladder >= 100) {
    accident = true
    s.bladder = 5
    s.hygiene = clamp(s.hygiene - 20)
  }
  return { stats: s, accident }
}

export interface OfflineResult {
  stats: Stats
  accidents: number
  minutes: number
}

/** Catch up after the app was closed: capped, slowed down and floored. */
export function simulateOffline(stats: Stats, elapsedMs: number, rates: StatRates, sleeping: boolean, extra: Omit<TickContext, 'sleeping'> = {}): OfflineResult {
  const minutes = Math.min(Math.max(0, elapsedMs) / 60000, OFFLINE_CAP_MINUTES)
  const slowed: StatRates = {
    hunger: rates.hunger * OFFLINE_RATE,
    energy: rates.energy * OFFLINE_RATE,
    fun: rates.fun * OFFLINE_RATE,
    hygiene: rates.hygiene * OFFLINE_RATE,
    bladder: rates.bladder * OFFLINE_RATE,
  }
  const healthFloor = Math.min(stats.health, OFFLINE_HEALTH_FLOOR)
  let s = { ...stats }
  let accidents = 0
  let left = minutes
  while (left > 0) {
    const step = Math.min(1, left)
    const prev = s
    const r = tickStats(s, step, slowed, { ...extra, sleeping })
    s = r.stats
    for (const k of ['hunger', 'energy', 'fun', 'hygiene'] as const) {
      s[k] = Math.max(s[k], Math.min(prev[k], OFFLINE_FLOOR))
    }
    s.health = Math.max(s.health, healthFloor)
    if (r.accident) accidents++
    // A sleeping pet wakes up once rested.
    if (sleeping && s.energy >= 100) sleeping = false
    left -= step
  }
  return { stats: s, accidents: Math.min(accidents, 3), minutes }
}

export function moodOf(s: Stats): Mood {
  if (s.health < LOW) return 'sick'
  if (s.bladder >= TOILET_URGE) return 'needsToilet'
  if (s.hunger < 25) return 'hungry'
  if (s.energy < CRITICAL) return 'sleepy'
  if (s.hygiene < 25) return 'dirty'
  if (s.fun < 25) return 'sad'
  if (s.hunger > 65 && s.energy > 50 && s.fun > 65 && s.hygiene > 60) return 'happy'
  return 'content'
}

const DAY = 24 * 60 * 60 * 1000

export function ageStage(bornAt: number, now: number): AgeStage {
  const days = (now - bornAt) / DAY
  if (days < 1) return 'baby'
  if (days < 4) return 'kid'
  return 'adult'
}

export const STAGE_SCALE: Record<AgeStage, number> = { baby: 0.86, kid: 0.96, adult: 1.08 }
