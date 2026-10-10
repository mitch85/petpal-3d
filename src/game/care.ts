import { FOODS } from './foods'
import type { FurnitureEffects } from './shop'
import { clamp } from './stats'
import type { FoodId, Stats, ToyId } from './types'
import type { SpeciesConfig } from './pets.config'

/** Result of a care action: new stats plus coins earned for good care. */
export interface CareResult {
  stats: Stats
  coins: number
  favorite?: boolean
}

const NO_FX: FurnitureEffects = { sleepGain: 1, hungerMul: 1, mealCoins: 0, toiletHygiene: 4, toiletFun: 3, washFun: -3 }

export function feed(stats: Stats, foodId: FoodId, species: SpeciesConfig, fx = NO_FX): CareResult {
  const food = FOODS[foodId]
  const favorite = species.favoriteFood === foodId
  const mul = (favorite ? 1.3 : 1) * fx.hungerMul
  const wasHungry = stats.hunger < 70
  return {
    stats: {
      ...stats,
      hunger: clamp(stats.hunger + food.hunger * mul),
      bladder: clamp(stats.bladder + food.bladder),
      fun: clamp(stats.fun + food.fun * (favorite ? 2 : 1)),
    },
    coins: (wasHungry ? (favorite ? 5 : 3) : 1) + fx.mealCoins,
    favorite,
  }
}

export function relieve(stats: Stats, fx = NO_FX): CareResult {
  const needed = stats.bladder >= 40
  return {
    stats: { ...stats, bladder: 0, hygiene: clamp(stats.hygiene - fx.toiletHygiene), fun: clamp(stats.fun + fx.toiletFun) },
    coins: needed ? 4 : 0,
  }
}

export function wash(stats: Stats, fx = NO_FX): CareResult {
  const needed = stats.hygiene < 70
  return { stats: { ...stats, hygiene: 100, fun: clamp(stats.fun + fx.washFun) }, coins: needed ? 4 : 1 }
}

/** Base fun per toy – fancier toys are more fun. */
export const TOY_FUN: Record<ToyId, number> = { ball: 22, yarn: 24, mouse: 26, laser: 26, frisbee: 28 }

export function play(stats: Stats, toy: ToyId, species: SpeciesConfig, inGarden = false): CareResult {
  const favorite = species.favoriteToy === toy
  const bored = stats.fun < 70
  const fun = (TOY_FUN[toy] + (favorite ? 10 : 0)) * (inGarden ? 1.3 : 1)
  return {
    stats: {
      ...stats,
      fun: clamp(stats.fun + fun),
      energy: clamp(stats.energy - 9),
      hunger: clamp(stats.hunger - 5),
      hygiene: clamp(stats.hygiene - (inGarden ? 8 : 4)),
    },
    coins: bored ? (favorite ? 5 : 3) : 1,
    favorite,
  }
}

export function stroke(stats: Stats): CareResult {
  return { stats: { ...stats, fun: clamp(stats.fun + 12), health: clamp(stats.health + 1) }, coins: stats.fun < 60 ? 2 : 1 }
}

export function cleanPoop(stats: Stats): CareResult {
  return { stats: { ...stats, hygiene: clamp(stats.hygiene + 10) }, coins: 2 }
}
