import type { ThemeId } from '../game/types'

export type WallPattern = 'dots' | 'snow' | 'bricks' | 'stars'

/** Visual definition of a room theme. Add a theme here + a shop item + i18n. */
export interface RoomTheme {
  id: ThemeId
  wallBack: { base: string; dot: string; pattern: WallPattern }
  wallLeft: { base: string; dot: string; pattern: WallPattern }
  capBack: string
  capLeft: string
  floor: string[]
  floorSide: string
  rug: string[]
  curtain: string
  bunting: string[]
  /** Colour used for previews (swatches in the UI). */
  swatch: [string, string, string]
}

export const THEMES: Record<ThemeId, RoomTheme> = {
  cozy: {
    id: 'cozy',
    wallBack: { base: '#FFD9C7', dot: '#FFC2AA', pattern: 'dots' },
    wallLeft: { base: '#CBEBDD', dot: '#B2E0CB', pattern: 'dots' },
    capBack: '#F7A58C',
    capLeft: '#8FD3B6',
    floor: ['#E8B583', '#EDBE8E', '#E3AD79', '#F0C597'],
    floorSide: '#C98F62',
    rug: ['#FFB3A6', '#FFF1E2', '#FF9C8A', '#FFE0C2', '#FFB3A6', '#FFF1E2'],
    curtain: '#FF9DB0',
    bunting: ['#FF7A6B', '#FFC94A', '#4FD1A5', '#5BB8FF', '#A98BFF', '#FF8FB8'],
    swatch: ['#FFD9C7', '#CBEBDD', '#E8B583'],
  },
  frost: {
    id: 'frost',
    wallBack: { base: '#D6ECFF', dot: '#FFFFFF', pattern: 'snow' },
    wallLeft: { base: '#E6E2FF', dot: '#FFFFFF', pattern: 'snow' },
    capBack: '#8FC3F2',
    capLeft: '#B3A8F0',
    floor: ['#F1EEF7', '#E8E4F2', '#F6F4FA', '#E2DEEF'],
    floorSide: '#A9A2C9',
    rug: ['#9FD3FF', '#FFFFFF', '#7FC2FF', '#E6F4FF', '#9FD3FF', '#FFFFFF'],
    curtain: '#9FD3FF',
    bunting: ['#FFFFFF', '#9FD3FF', '#C9BDFF', '#FFFFFF', '#7FC2FF', '#E6F4FF'],
    swatch: ['#D6ECFF', '#E6E2FF', '#F1EEF7'],
  },
  castle: {
    id: 'castle',
    wallBack: { base: '#C9C2DA', dot: '#B3AAC9', pattern: 'bricks' },
    wallLeft: { base: '#BDB5D1', dot: '#A79EC0', pattern: 'bricks' },
    capBack: '#8E84AE',
    capLeft: '#8E84AE',
    floor: ['#B9805A', '#A9724F', '#C08A63', '#A46C49'],
    floorSide: '#7E5338',
    rug: ['#C24B5A', '#FFD27A', '#B03C4D', '#FFE3A8', '#C24B5A', '#FFD27A'],
    curtain: '#C24B5A',
    bunting: ['#C24B5A', '#FFD27A', '#4FAE84', '#5B7BD8', '#FFD27A', '#C24B5A'],
    swatch: ['#C9C2DA', '#BDB5D1', '#B9805A'],
  },
  candy: {
    id: 'candy',
    wallBack: { base: '#FFD6EC', dot: '#FFFFFF', pattern: 'stars' },
    wallLeft: { base: '#FFF1B8', dot: '#FFFFFF', pattern: 'stars' },
    capBack: '#FF9CCB',
    capLeft: '#FFD45E',
    floor: ['#FFE2EF', '#FFD4E6', '#FFEBF4', '#FCCDE2'],
    floorSide: '#E79BBE',
    rug: ['#B9F0E0', '#FFFFFF', '#8FE3CB', '#FFF6D6', '#B9F0E0', '#FFFFFF'],
    curtain: '#B9F0E0',
    bunting: ['#FF8FB8', '#FFD45E', '#8FE3CB', '#B9A3FF', '#FF8FB8', '#FFD45E'],
    swatch: ['#FFD6EC', '#FFF1B8', '#FFE2EF'],
  },
}

export const THEME_ORDER: ThemeId[] = ['cozy', 'frost', 'candy', 'castle']
