export type SpeciesId = 'cat' | 'dog' | 'rabbit' | 'dragon' | 'penguin'
export type StatKey = 'hunger' | 'energy' | 'fun' | 'hygiene' | 'bladder' | 'health'
export type Stats = Record<StatKey, number>

export type FoodId = 'fish' | 'chicken' | 'carrot' | 'bone' | 'chili' | 'apple' | 'cookie'
export type ToyId = 'ball' | 'frisbee' | 'mouse' | 'yarn' | 'laser'
export type ThemeId = 'cozy' | 'frost' | 'castle' | 'candy'
export type FurnitureSlot = 'bed' | 'bowl' | 'litter' | 'tub'
export type Location = 'house' | 'garden'
export type AgeStage = 'baby' | 'kid' | 'adult'

export type ActivityKind = 'idle' | 'eat' | 'toilet' | 'sleep' | 'play' | 'pet' | 'wash'

export interface Activity {
  kind: ActivityKind
  /** Unique id so the 3D controller can detect a fresh activity of the same kind. */
  id: number
  foodId?: FoodId
  toy?: ToyId
}

export type Mood = 'happy' | 'content' | 'hungry' | 'sleepy' | 'sad' | 'dirty' | 'needsToilet' | 'sick'
