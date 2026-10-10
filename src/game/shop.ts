import type { FurnitureSlot, ThemeId, ToyId } from './types'

/**
 * Shop catalogue. Furniture items fill a slot and modify care formulas,
 * toys unlock play variants, themes restyle the room, the garden unlocks
 * a second location. Prices are in coins.
 */
export type ShopCategory = 'furniture' | 'toys' | 'rooms' | 'garden'

export interface FurnitureEffects {
  /** Multiplier for energy regained while sleeping. */
  sleepGain: number
  /** Multiplier for satiation gained when eating. */
  hungerMul: number
  /** Extra coins per meal. */
  mealCoins: number
  /** Hygiene lost when using the toilet. */
  toiletHygiene: number
  /** Fun gained when using the toilet. */
  toiletFun: number
  /** Fun change from a bath. */
  washFun: number
}

interface BaseItem {
  id: string
  price: number
  tier: 1 | 2 | 3
}
export interface FurnitureItem extends BaseItem {
  category: 'furniture'
  slot: FurnitureSlot
  effects: Partial<FurnitureEffects>
}
export interface ToyItem extends BaseItem {
  category: 'toys'
  toy: ToyId
}
export interface ThemeItem extends BaseItem {
  category: 'rooms'
  theme: ThemeId
}
export interface GardenItem extends BaseItem {
  category: 'garden'
}
export type ShopItem = FurnitureItem | ToyItem | ThemeItem | GardenItem

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'bed_basic', category: 'furniture', slot: 'bed', price: 0, tier: 1, effects: {} },
  { id: 'bed_cloud', category: 'furniture', slot: 'bed', price: 60, tier: 2, effects: { sleepGain: 1.3 } },
  { id: 'bed_canopy', category: 'furniture', slot: 'bed', price: 150, tier: 3, effects: { sleepGain: 1.6 } },
  { id: 'bowl_basic', category: 'furniture', slot: 'bowl', price: 0, tier: 1, effects: {} },
  { id: 'bowl_ceramic', category: 'furniture', slot: 'bowl', price: 40, tier: 2, effects: { hungerMul: 1.15 } },
  { id: 'bowl_golden', category: 'furniture', slot: 'bowl', price: 120, tier: 3, effects: { hungerMul: 1.3, mealCoins: 1 } },
  { id: 'litter_basic', category: 'furniture', slot: 'litter', price: 0, tier: 1, effects: {} },
  { id: 'litter_hood', category: 'furniture', slot: 'litter', price: 50, tier: 2, effects: { toiletHygiene: 0, toiletFun: 5 } },
  { id: 'litter_throne', category: 'furniture', slot: 'litter', price: 140, tier: 3, effects: { toiletHygiene: 0, toiletFun: 10 } },
  { id: 'tub_basic', category: 'furniture', slot: 'tub', price: 0, tier: 1, effects: {} },
  { id: 'tub_bubble', category: 'furniture', slot: 'tub', price: 90, tier: 2, effects: { washFun: 8 } },
  { id: 'toy_ball', category: 'toys', toy: 'ball', price: 0, tier: 1 },
  { id: 'toy_yarn', category: 'toys', toy: 'yarn', price: 25, tier: 1 },
  { id: 'toy_mouse', category: 'toys', toy: 'mouse', price: 30, tier: 2 },
  { id: 'toy_laser', category: 'toys', toy: 'laser', price: 35, tier: 2 },
  { id: 'toy_frisbee', category: 'toys', toy: 'frisbee', price: 45, tier: 2 },
  { id: 'theme_cozy', category: 'rooms', theme: 'cozy', price: 80, tier: 1 },
  { id: 'theme_frost', category: 'rooms', theme: 'frost', price: 80, tier: 1 },
  { id: 'theme_candy', category: 'rooms', theme: 'candy', price: 80, tier: 1 },
  { id: 'theme_castle', category: 'rooms', theme: 'castle', price: 100, tier: 2 },
  { id: 'garden', category: 'garden', price: 300, tier: 3 },
]

export const ITEM_BY_ID: Record<string, ShopItem> = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]))

export const DEFAULT_EQUIPPED: Record<FurnitureSlot, string> = {
  bed: 'bed_basic',
  bowl: 'bowl_basic',
  litter: 'litter_basic',
  tub: 'tub_basic',
}

export const toyItemId = (toy: ToyId) => `toy_${toy}`
export const themeItemId = (theme: ThemeId) => `theme_${theme}`

const BASE_EFFECTS: FurnitureEffects = { sleepGain: 1, hungerMul: 1, mealCoins: 0, toiletHygiene: 4, toiletFun: 3, washFun: -3 }

/** Combined effects of everything currently equipped. */
export function furnitureEffects(equipped: Record<FurnitureSlot, string>): FurnitureEffects {
  const fx = { ...BASE_EFFECTS }
  for (const id of Object.values(equipped)) {
    const item = ITEM_BY_ID[id]
    if (item?.category === 'furniture') Object.assign(fx, item.effects)
  }
  return fx
}

/** Toys every new pet starts with: the ball plus its favourite toy. */
export function starterItems(favoriteToy: ToyId, theme: ThemeId): string[] {
  return [...new Set([...Object.values(DEFAULT_EQUIPPED), 'toy_ball', toyItemId(favoriteToy), themeItemId(theme)])]
}

/** Fun-decay multiplier for where the pet currently is. */
export function funDecayMul(opts: { location: 'house' | 'garden'; likesTheme: boolean; species: string }) {
  let m = 1
  if (opts.location === 'garden') m *= opts.species === 'dog' ? 0.4 : 0.6
  else if (opts.likesTheme) m *= 0.7
  return m
}
