import { describe, expect, it } from 'vitest'
import { PETS } from './pets.config'
import { feed, play, relieve, wash } from './care'
import { DEFAULT_EQUIPPED, ITEM_BY_ID, funDecayMul, furnitureEffects, starterItems } from './shop'
import {
  OFFLINE_CAP_MINUTES,
  OFFLINE_FLOOR,
  OFFLINE_HEALTH_FLOOR,
  ageStage,
  initialStats,
  moodOf,
  simulateOffline,
  tickStats,
} from './stats'

const cat = PETS.cat
const rabbit = PETS.rabbit

describe('tickStats', () => {
  it('decays needs over time', () => {
    const r = tickStats(initialStats(), 1, cat.rates, { sleeping: false })
    expect(r.stats.hunger).toBeLessThan(80)
    expect(r.stats.fun).toBeLessThan(80)
    expect(r.stats.bladder).toBeGreaterThan(10)
  })

  it('restores energy while sleeping', () => {
    const s = { ...initialStats(), energy: 20 }
    expect(tickStats(s, 1, cat.rates, { sleeping: true }).stats.energy).toBeGreaterThan(20)
  })

  it('stays within 0..100', () => {
    const s = { ...initialStats(), hunger: 0.2, energy: 99.9 }
    const r = tickStats(s, 5, cat.rates, { sleeping: true })
    expect(r.stats.hunger).toBe(0)
    expect(r.stats.energy).toBe(100)
  })

  it('reduces health while needs are critical', () => {
    const s = { ...initialStats(), hunger: 5, hygiene: 5 }
    expect(tickStats(s, 1, cat.rates, { sleeping: false }).stats.health).toBeLessThan(100)
  })

  it('causes an accident when the bladder overflows', () => {
    const s = { ...initialStats(), bladder: 99.9 }
    const r = tickStats(s, 1, cat.rates, { sleeping: false })
    expect(r.accident).toBe(true)
    expect(r.stats.bladder).toBeLessThan(10)
    expect(r.stats.hygiene).toBeLessThan(s.hygiene)
  })

  it('rabbits get hungry faster than cats', () => {
    const c = tickStats(initialStats(), 1, cat.rates, { sleeping: false }).stats.hunger
    const r = tickStats(initialStats(), 1, rabbit.rates, { sleeping: false }).stats.hunger
    expect(r).toBeLessThan(c)
  })
})

describe('simulateOffline', () => {
  it('caps the simulated time', () => {
    const r = simulateOffline(initialStats(), 14 * 24 * 3600_000, cat.rates, false)
    expect(r.minutes).toBe(OFFLINE_CAP_MINUTES)
  })

  it('never pushes needs below the floor or health below the health floor', () => {
    const r = simulateOffline(initialStats(), 30 * 24 * 3600_000, cat.rates, false)
    for (const k of ['hunger', 'energy', 'fun', 'hygiene'] as const) expect(r.stats[k]).toBeGreaterThanOrEqual(OFFLINE_FLOOR)
    expect(r.stats.health).toBeGreaterThanOrEqual(OFFLINE_HEALTH_FLOOR)
  })

  it('does nothing for negative elapsed time (clock skew)', () => {
    const s = initialStats()
    expect(simulateOffline(s, -5000, cat.rates, false).stats).toEqual(s)
  })

  it('limits the number of offline accidents', () => {
    const r = simulateOffline({ ...initialStats(), bladder: 95 }, 8 * 3600_000, { ...cat.rates, bladder: 5 }, false)
    expect(r.accidents).toBeLessThanOrEqual(3)
    expect(r.accidents).toBeGreaterThan(0)
  })
})

describe('care actions', () => {
  it('feeding raises hunger and bladder; favourite food gives a bonus', () => {
    const s = { ...initialStats(), hunger: 30 }
    const normal = feed(s, 'apple', cat)
    const fav = feed(s, cat.favoriteFood, cat)
    expect(normal.stats.hunger).toBeGreaterThan(30)
    expect(normal.stats.bladder).toBeGreaterThan(s.bladder)
    expect(fav.favorite).toBe(true)
    expect(fav.coins).toBeGreaterThan(normal.coins)
  })

  it('toilet empties the bladder', () => {
    expect(relieve({ ...initialStats(), bladder: 90 }).stats.bladder).toBe(0)
  })

  it('washing fully cleans', () => {
    expect(wash({ ...initialStats(), hygiene: 10 }).stats.hygiene).toBe(100)
  })

  it('playing costs energy and the favourite game is more fun', () => {
    const s = { ...initialStats(), fun: 30 }
    const laser = play(s, 'laser', cat)
    const ball = play(s, 'ball', cat)
    expect(laser.stats.energy).toBeLessThan(s.energy)
    expect(laser.stats.fun).toBeGreaterThan(ball.stats.fun)
  })
})

describe('shop effects', () => {
  it('better beds restore energy faster', () => {
    const s = { ...initialStats(), energy: 20 }
    const basic = tickStats(s, 1, cat.rates, { sleeping: true }).stats.energy
    const canopy = tickStats(s, 1, cat.rates, { sleeping: true, sleepGain: furnitureEffects({ ...DEFAULT_EQUIPPED, bed: 'bed_canopy' }).sleepGain }).stats.energy
    expect(canopy).toBeGreaterThan(basic)
  })

  it('golden bowl gives more satiation and a coin bonus', () => {
    const s = { ...initialStats(), hunger: 20 }
    const fx = furnitureEffects({ ...DEFAULT_EQUIPPED, bowl: 'bowl_golden' })
    const basic = feed(s, 'apple', cat)
    const golden = feed(s, 'apple', cat, fx)
    expect(golden.stats.hunger).toBeGreaterThan(basic.stats.hunger)
    expect(golden.coins).toBe(basic.coins + 1)
  })

  it('comfort toilet keeps the pet clean', () => {
    const s = { ...initialStats(), bladder: 90 }
    expect(relieve(s, furnitureEffects({ ...DEFAULT_EQUIPPED, litter: 'litter_hood' })).stats.hygiene).toBe(s.hygiene)
  })

  it('favourite room and garden slow down boredom', () => {
    const base = tickStats(initialStats(), 1, cat.rates, { sleeping: false }).stats.fun
    const fav = tickStats(initialStats(), 1, cat.rates, { sleeping: false, funDecay: funDecayMul({ location: 'house', likesTheme: true, species: 'cat' }) }).stats.fun
    const garden = tickStats(initialStats(), 1, cat.rates, { sleeping: false, funDecay: funDecayMul({ location: 'garden', likesTheme: false, species: 'dog' }) }).stats.fun
    expect(fav).toBeGreaterThan(base)
    expect(garden).toBeGreaterThan(fav)
  })

  it('every equipped default exists in the catalogue and starter items include the favourite toy', () => {
    for (const id of Object.values(DEFAULT_EQUIPPED)) expect(ITEM_BY_ID[id]).toBeDefined()
    expect(starterItems('laser', 'cozy')).toContain('toy_laser')
  })
})

describe('mood & age', () => {
  it('derives mood with priorities', () => {
    expect(moodOf({ ...initialStats(), health: 20 })).toBe('sick')
    expect(moodOf({ ...initialStats(), bladder: 80 })).toBe('needsToilet')
    expect(moodOf({ ...initialStats(), hunger: 10 })).toBe('hungry')
    expect(moodOf(initialStats())).toBe('happy')
  })

  it('ages from baby to adult', () => {
    const day = 86400_000
    expect(ageStage(0, day * 0.5)).toBe('baby')
    expect(ageStage(0, day * 2)).toBe('kid')
    expect(ageStage(0, day * 5)).toBe('adult')
  })
})
