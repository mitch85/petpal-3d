/**
 * Central design tokens. CSS mirrors these in `src/index.css` (@theme) so
 * Tailwind classes and the 3D scene share one palette.
 */
export const colors = {
  cream: '#FFF3E6',
  paper: '#FFFBF6',
  ink: '#3D2C4E',
  inkSoft: '#7A6A8A',
  coral: '#FF7A6B',
  peach: '#FFB38A',
  sunny: '#FFC94A',
  mint: '#4FD1A5',
  sky: '#5BB8FF',
  lavender: '#A98BFF',
  pink: '#FF8FB8',
  danger: '#FF5A5F',
} as const

export const statColors = {
  hunger: '#FF9F5A',
  energy: '#FFC23D',
  fun: '#FF7EB6',
  hygiene: '#4FB4FF',
  bladder: '#A98BFF',
  health: '#3FCB98',
} as const

/** Outline colour used for toon outlines in 3D and icon strokes in 2D. */
export const outline = colors.ink

/** Spring presets for @react-spring (UI and 3D). */
export const springs = {
  bouncy: { tension: 420, friction: 18 },
  soft: { tension: 200, friction: 24 },
  bar: { tension: 170, friction: 20 },
} as const
