import type { ReactElement, ReactNode } from 'react'
import { ITEM_BY_ID } from '../game/shop'
import type { ThemeId, ToyId } from '../game/types'
import { THEMES } from '../scene/themes'
import { IconPlay } from './Icons'

/** Sticker-style icons for shop items (same 48×48 grid + stroke as Icons.tsx). */
const INK = '#3D2C4E'

function Svg({ children, size = 44 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}
const Shine = ({ d }: { d: string }) => <path d={d} stroke="#fff" strokeWidth={3} opacity={0.85} />

type P = { size?: number }

const BedBasic = (p: P) => (
  <Svg {...p}>
    <ellipse cx="24" cy="30" rx="19" ry="9" fill="#B79CFF" />
    <ellipse cx="24" cy="27" rx="12" ry="5" fill="#EDE4FF" />
    <ellipse cx="15" cy="24" rx="5" ry="3" fill="#fff" />
  </Svg>
)
const BedCloud = (p: P) => (
  <Svg {...p}>
    <path d="M8 32c-4 0-4-7 1-7 0-5 6-7 9-4 2-5 10-5 12 0 3-3 9-1 9 4 5 0 5 7 1 7Z" fill="#EAF3FF" />
    <path d="M30 13l1.5 3 3 .5-2.2 2 .6 3-2.9-1.5-2.8 1.5.5-3-2.2-2 3-.5Z" fill="#FFC94A" strokeWidth={2.2} />
    <Shine d="M13 27h5" />
  </Svg>
)
const BedCanopy = (p: P) => (
  <Svg {...p}>
    <path d="M9 40V12M39 40V12" />
    <path d="M7 12c5-6 29-6 34 0Z" fill="#FF9DC0" />
    <rect x="9" y="28" width="30" height="8" rx="3" fill="#FFE6F0" />
    <path d="M9 36h30" />
    <path d="M24 22c-1.5-2-4-1-4 1 0 2 3 3.5 4 4.5 1-1 4-2.5 4-4.5 0-2-2.5-3-4-1Z" fill="#FF7A6B" strokeWidth={2.2} />
  </Svg>
)
const Bowl = ({ fill, band, sparkle, ...p }: P & { fill: string; band?: string; sparkle?: boolean }) => (
  <Svg {...p}>
    <path d="M6 22h36l-3.5 12.5A5 5 0 0 1 33.7 38H14.3a5 5 0 0 1-4.8-3.5Z" fill={fill} />
    {band && <path d="M8 26h32" stroke={band} strokeWidth={3.5} />}
    <Shine d="M12 30h6" />
    {sparkle && <path d="M38 8l1.4 3 3 1.4-3 1.4L38 17l-1.4-3.2-3-1.4 3-1.4Z" fill="#fff" strokeWidth={2.2} />}
  </Svg>
)
const Litter = ({ fill, hood, ...p }: P & { fill: string; hood?: boolean }) => (
  <Svg {...p}>
    {hood && <path d="M10 28c0-12 28-12 28 0" fill={fill} />}
    <rect x="6" y="26" width="36" height="12" rx="4" fill={fill} />
    <path d="M10 28h28" stroke="#F3DDB0" strokeWidth={3} />
    {hood && <circle cx="24" cy="15" r="3" fill="#FF8FB8" strokeWidth={2.2} />}
  </Svg>
)
const Throne = (p: P) => (
  <Svg {...p}>
    <rect x="13" y="14" width="22" height="20" rx="6" fill="#9B6BFF" />
    <ellipse cx="24" cy="34" rx="14" ry="5" fill="#FFC83D" />
    <path d="M17 13l2-6 5 4 5-4 2 6Z" fill="#FFC83D" />
  </Svg>
)
const Tub = ({ fill, fancy, ...p }: P & { fill: string; fancy?: boolean }) => (
  <Svg {...p}>
    <path d="M5 22h38v5a11 11 0 0 1-11 11H16A11 11 0 0 1 5 27Z" fill={fill} />
    <path d="M14 38l-2 4M34 38l2 4" />
    <path d="M10 13v-3a4 4 0 0 1 8 0" />
    <circle cx="16" cy="17" r="3" fill="#E9F6FF" />
    <circle cx="28" cy="16" r="4" fill="#E9F6FF" />
    {fancy && <circle cx="36" cy="15" r="3" fill="#FFC94A" />}
    <Shine d="M10 27h6" />
  </Svg>
)
const Frisbee = (p: P) => (
  <Svg {...p}>
    <ellipse cx="24" cy="26" rx="18" ry="9" fill="#5BB8FF" />
    <ellipse cx="24" cy="24" rx="10" ry="4" stroke="#fff" />
    <path d="M6 26c0 5 8 9 18 9s18-4 18-9" />
  </Svg>
)
const Mouse = (p: P) => (
  <Svg {...p}>
    <path d="M8 34c0-9 7-16 17-16s15 7 15 16Z" fill="#B9B3C9" />
    <circle cx="30" cy="16" r="5" fill="#FFB3C7" />
    <circle cx="35" cy="28" r="1.8" fill={INK} stroke="none" />
    <path d="M8 34c-3 0-5 2-4 5" stroke="#FF8FB8" />
    <path d="M20 18v-6M16 12h8" stroke="#FFC94A" strokeWidth={3.4} />
  </Svg>
)
const Yarn = (p: P) => (
  <Svg {...p}>
    <circle cx="22" cy="24" r="15" fill="#FF7A6B" />
    <path d="M10 18c8 2 16 10 18 20M14 33c4-8 12-14 22-14M18 10c2 8 0 18-6 24" stroke="#FFB3A6" strokeWidth={2.4} />
    <circle cx="22" cy="24" r="15" />
    <path d="M36 30c4 2 6 6 4 10" />
  </Svg>
)
const Laser = (p: P) => (
  <Svg {...p}>
    <rect x="6" y="10" width="22" height="9" rx="4.5" fill="#E4DCEB" transform="rotate(25 17 14)" />
    <path d="M27 21l9 10" stroke="#FF2E55" strokeWidth={2.4} strokeDasharray="2 3" />
    <circle cx="38" cy="34" r="5" fill="#FF2E55" />
    <circle cx="38" cy="34" r="2" fill="#fff" stroke="none" />
  </Svg>
)
export const GardenIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 40h40" />
    <rect x="18" y="24" width="5" height="16" rx="2" fill="#A0704E" />
    <circle cx="20" cy="18" r="11" fill="#6FD397" />
    <circle cx="15" cy="16" r="2.4" fill="#FF6B6B" />
    <circle cx="25" cy="21" r="2.4" fill="#FF6B6B" />
    <path d="M32 40v-8M38 40v-8M30 34h10" stroke={INK} />
    <circle cx="9" cy="35" r="3" fill="#FF8FB8" />
  </Svg>
)
export const HouseIcon = (p: P) => (
  <Svg {...p}>
    <path d="M6 22 24 7l18 15" fill="#FF7A6B" />
    <path d="M10 20v19h28V20" fill="#FFE1CC" />
    <rect x="20" y="27" width="8" height="12" rx="2" fill="#7FB8F2" />
  </Svg>
)
export const ShopIcon = (p: P) => (
  <Svg {...p}>
    <path d="M9 18h30l-3 21H12Z" fill="#FF8FB8" />
    <path d="M17 18v-3a7 7 0 0 1 14 0v3" />
    <path d="M18 27c2 3 10 3 12 0" stroke="#fff" />
  </Svg>
)

/** Mini room preview: two walls + floor in the theme colours. */
export function ThemeSwatch({ theme, size = 44 }: { theme: ThemeId; size?: number }) {
  const [back, left, floor] = THEMES[theme].swatch
  return (
    <Svg size={size}>
      <path d="M24 6 42 14v16L24 22Z" fill={back} />
      <path d="M24 6 6 14v16l18-8Z" fill={left} />
      <path d="M6 30l18-8 18 8-18 10Z" fill={floor} />
    </Svg>
  )
}

const TOY_ICONS: Record<ToyId, (p: P) => ReactElement> = {
  ball: (p) => <IconPlay size={p.size ?? 44} />,
  frisbee: Frisbee,
  mouse: Mouse,
  yarn: Yarn,
  laser: Laser,
}

export function ToyIcon({ toy, size = 44 }: { toy: ToyId; size?: number }) {
  const I = TOY_ICONS[toy]
  return <I size={size} />
}

export function ItemIcon({ id, size = 44 }: { id: string; size?: number }) {
  const item = ITEM_BY_ID[id]
  if (!item) return null
  if (item.category === 'toys') return <ToyIcon toy={item.toy} size={size} />
  if (item.category === 'rooms') return <ThemeSwatch theme={item.theme} size={size} />
  if (item.category === 'garden') return <GardenIcon size={size} />
  switch (id) {
    case 'bed_cloud': return <BedCloud size={size} />
    case 'bed_canopy': return <BedCanopy size={size} />
    case 'bowl_basic': return <Bowl size={size} fill="#5BB8FF" />
    case 'bowl_ceramic': return <Bowl size={size} fill="#FFFFFF" band="#FF7A6B" />
    case 'bowl_golden': return <Bowl size={size} fill="#FFC83D" sparkle />
    case 'litter_basic': return <Litter size={size} fill="#4FD1A5" />
    case 'litter_hood': return <Litter size={size} fill="#B79CFF" hood />
    case 'litter_throne': return <Throne size={size} />
    case 'tub_basic': return <Tub size={size} fill="#FFFFFF" />
    case 'tub_bubble': return <Tub size={size} fill="#FFB3D1" fancy />
    default: return <BedBasic size={size} />
  }
}
