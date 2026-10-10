import type { FoodId } from './types'

export interface FoodDef {
  id: FoodId
  /** Satiation gained (hunger stat goes up). */
  hunger: number
  /** How much the bladder fills afterwards. */
  bladder: number
  fun: number
  /** Price in the (future) shop. */
  price: number
}

export const FOODS: Record<FoodId, FoodDef> = {
  fish: { id: 'fish', hunger: 35, bladder: 22, fun: 4, price: 6 },
  chicken: { id: 'chicken', hunger: 40, bladder: 24, fun: 4, price: 7 },
  carrot: { id: 'carrot', hunger: 25, bladder: 16, fun: 2, price: 3 },
  bone: { id: 'bone', hunger: 35, bladder: 20, fun: 8, price: 6 },
  chili: { id: 'chili', hunger: 25, bladder: 18, fun: 10, price: 5 },
  apple: { id: 'apple', hunger: 20, bladder: 14, fun: 2, price: 2 },
  cookie: { id: 'cookie', hunger: 12, bladder: 8, fun: 12, price: 4 },
}

export const FOOD_ORDER: FoodId[] = ['fish', 'chicken', 'carrot', 'bone', 'chili', 'apple', 'cookie']
