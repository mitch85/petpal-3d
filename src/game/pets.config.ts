import type { FoodId, SpeciesId, StatKey, ThemeId, ToyId } from './types'

/**
 * Central pet configuration. Add a new species by adding an entry here
 * (plus its i18n strings). To use a real model, drop a GLB into
 * `public/models/` and set `model` – the <Pet /> component picks it up and
 * maps activities to the clip names listed in `model.clips`.
 */

/** Per-minute change of each stat while awake (negative = decays). */
export type StatRates = Record<Exclude<StatKey, 'health'>, number>

export interface PlaceholderLook {
  primary: string
  secondary: string
  belly: string
  accent: string
  ears: 'pointy' | 'floppy' | 'long' | 'horns' | 'none'
  tail: 'long' | 'wag' | 'pom' | 'spiky' | 'stub'
  muzzle: 'nose' | 'snout' | 'beak'
  extras?: Array<'wings' | 'flippers' | 'spikes' | 'whiskers' | 'spots'>
  /** Body proportions: [width, height, length]. */
  body: [number, number, number]
  headSize: number
}

export interface GlbModelConfig {
  url: string
  scale: number
  /** Activity/state -> animation clip name inside the GLB. */
  clips: Partial<Record<'idle' | 'walk' | 'eat' | 'sleep' | 'jump' | 'sit' | 'happy' | 'sad', string>>
}

export interface SpeciesConfig {
  id: SpeciesId
  rates: StatRates
  favoriteFood: FoodId
  favoriteToy: ToyId
  /** Room theme this species loves (slower fun decay there). */
  favoriteTheme: ThemeId
  walkStyle: 'trot' | 'hop' | 'waddle'
  walkSpeed: number
  /** Visual flourish when the pet is very happy. */
  happyFx: 'sparks' | 'wag' | 'hearts'
  look: PlaceholderLook
  model?: GlbModelConfig
}

const base: StatRates = { hunger: -1.1, energy: -0.7, fun: -1.0, hygiene: -0.6, bladder: 0.35 }

export const PETS: Record<SpeciesId, SpeciesConfig> = {
  cat: {
    id: 'cat',
    rates: { ...base, fun: -1.5 },
    favoriteFood: 'chicken',
    favoriteToy: 'laser',
    favoriteTheme: 'cozy',
    walkStyle: 'trot',
    walkSpeed: 1.5,
    happyFx: 'hearts',
    look: {
      primary: '#FFB070', secondary: '#F08A4B', belly: '#FFF1DE', accent: '#FF8FB8',
      ears: 'pointy', tail: 'long', muzzle: 'nose', extras: ['whiskers'],
      body: [0.62, 0.55, 0.78], headSize: 0.5,
    },
  },
  dog: {
    id: 'dog',
    rates: { ...base, fun: -1.3, energy: -0.9 },
    favoriteFood: 'bone',
    favoriteToy: 'frisbee',
    favoriteTheme: 'cozy',
    walkStyle: 'trot',
    walkSpeed: 1.8,
    happyFx: 'wag',
    look: {
      primary: '#E9C29A', secondary: '#9A6B4B', belly: '#FFF4E6', accent: '#FF7A6B',
      ears: 'floppy', tail: 'wag', muzzle: 'snout', extras: ['spots'],
      body: [0.66, 0.58, 0.82], headSize: 0.5,
    },
  },
  rabbit: {
    id: 'rabbit',
    rates: { ...base, hunger: -1.7 },
    favoriteFood: 'carrot',
    favoriteToy: 'yarn',
    favoriteTheme: 'candy',
    walkStyle: 'hop',
    walkSpeed: 1.6,
    happyFx: 'hearts',
    look: {
      primary: '#F4EEF6', secondary: '#D9CBE3', belly: '#FFFFFF', accent: '#FF8FB8',
      ears: 'long', tail: 'pom', muzzle: 'nose',
      body: [0.6, 0.56, 0.7], headSize: 0.48,
    },
  },
  dragon: {
    id: 'dragon',
    rates: { ...base },
    favoriteFood: 'chili',
    favoriteToy: 'ball',
    favoriteTheme: 'castle',
    walkStyle: 'trot',
    walkSpeed: 1.4,
    happyFx: 'sparks',
    look: {
      primary: '#7FD8A6', secondary: '#3FAE84', belly: '#FFE9A8', accent: '#FF8F6B',
      ears: 'horns', tail: 'spiky', muzzle: 'snout', extras: ['wings', 'spikes'],
      body: [0.66, 0.58, 0.8], headSize: 0.5,
    },
  },
  penguin: {
    id: 'penguin',
    rates: { ...base, hygiene: -0.4 },
    favoriteFood: 'fish',
    favoriteToy: 'mouse',
    favoriteTheme: 'frost',
    walkStyle: 'waddle',
    walkSpeed: 1.0,
    happyFx: 'hearts',
    look: {
      primary: '#3E4A6B', secondary: '#2C3550', belly: '#FFFFFF', accent: '#FFB13D',
      ears: 'none', tail: 'stub', muzzle: 'beak', extras: ['flippers'],
      body: [0.64, 0.8, 0.6], headSize: 0.46,
    },
  },
}

export const SPECIES_ORDER: SpeciesId[] = ['cat', 'dog', 'rabbit', 'dragon', 'penguin']
