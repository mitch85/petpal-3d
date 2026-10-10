import type { ReactNode, SVGProps } from 'react'

/**
 * Custom "sticker" icon set: flat fills, chunky ink outline, a soft white
 * highlight. All icons share a 48×48 viewBox and the same stroke weight.
 */
const INK = '#3D2C4E'
const SW = 3.2

function Svg({ children, size = 32, ...rest }: { children: ReactNode; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {children}
    </svg>
  )
}

const Shine = ({ d }: { d: string }) => <path d={d} stroke="#fff" strokeWidth={3} opacity={0.85} />

type P = { size?: number }

export const IconFeed = (p: P) => (
  <Svg {...p}>
    <path d="M12 22c0-5 5-9 12-9s12 4 12 9" fill="#FFB26B" />
    <circle cx="19" cy="15" r="2.6" fill="#FF7A6B" stroke="none" />
    <circle cx="27" cy="13.5" r="2.4" fill="#FFE07A" stroke="none" />
    <path d="M6 22h36l-3.5 12.5A5 5 0 0 1 33.7 38H14.3a5 5 0 0 1-4.8-3.5Z" fill="#5BB8FF" />
    <Shine d="M12 27h6" />
  </Svg>
)

export const IconPlay = (p: P) => (
  <Svg {...p}>
    <circle cx="24" cy="24" r="16" fill="#FF8FB8" />
    <path d="M9.5 18c6 3 23 3 29 0M9.5 30c6-3 23-3 29 0" stroke="#fff" strokeWidth={3.4} />
    <circle cx="24" cy="24" r="16" />
    <Shine d="M15 14a12 12 0 0 1 6-3" />
  </Svg>
)

export const IconToilet = (p: P) => (
  <Svg {...p}>
    <rect x="12" y="6" width="17" height="13" rx="4" fill="#E6F7FF" />
    <path d="M8 22h32a2 2 0 0 1 0 0c0 7-6 12-13 12h-6C14 34 8 29 8 22Z" fill="#fff" />
    <path d="M17 34l-2 7h18l-2-7" fill="#E6F7FF" />
    <ellipse cx="24" cy="22" rx="16" ry="3.5" fill="#A98BFF" />
    <Shine d="M15.5 10v5" />
  </Svg>
)

export const IconWash = (p: P) => (
  <Svg {...p}>
    <rect x="7" y="22" width="28" height="17" rx="7" fill="#7FD8E6" />
    <Shine d="M12 27h8" />
    <circle cx="33" cy="14" r="7" fill="#E9F6FF" />
    <circle cx="20" cy="12" r="4.5" fill="#E9F6FF" />
    <circle cx="40" cy="26" r="3.5" fill="#E9F6FF" />
    <Shine d="M30.5 11.5a3 3 0 0 1 2.5-1" />
  </Svg>
)

export const IconSleep = (p: P) => (
  <Svg {...p}>
    <path d="M30 8a15 15 0 1 0 11 22A13 13 0 0 1 30 8Z" fill="#FFD66B" />
    <path d="M36 9l1.4 3 3 1.4-3 1.4L36 18l-1.4-3.2-3-1.4 3-1.4Z" fill="#fff" strokeWidth={2.4} />
    <Shine d="M14 22a10 10 0 0 1 4-7" />
  </Svg>
)

export const IconWake = (p: P) => (
  <Svg {...p}>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <path key={a} d="M24 4v5" transform={`rotate(${a} 24 24)`} />
    ))}
    <circle cx="24" cy="24" r="10.5" fill="#FFC94A" />
    <Shine d="M19 20a6 6 0 0 1 3-2.5" />
  </Svg>
)

export const IconPet = (p: P) => (
  <Svg {...p}>
    <path
      d="M14 40c-4-3-6-8-6-13v-6a3 3 0 0 1 6 0v-9a3 3 0 0 1 6 0v-2a3 3 0 0 1 6 0v2a3 3 0 0 1 6 0v8a3 3 0 0 1 6 0v10c0 6-3 10-8 12Z"
      fill="#FFD8B8"
    />
    <path d="M20 20v6M26 18v8M32 20v6" strokeWidth={2.6} />
    <path d="M38 6c-1.8-2.2-5-1.3-5 1.4 0 2.3 3.2 4.3 5 5.6 1.8-1.3 5-3.3 5-5.6 0-2.7-3.2-3.6-5-1.4Z" fill="#FF6F9F" strokeWidth={2.4} />
  </Svg>
)

/* ---------- Stats ---------- */

export const IconHunger = (p: P) => (
  <Svg {...p}>
    <path d="M30 6c7 0 12 5 12 12 0 8-9 13-15 10l-9 9a4 4 0 1 1-6-1 4 4 0 1 1-1-6l9-9c-3-6 2-15 10-15Z" fill="#FF9F5A" />
    <Shine d="M28 12a7 7 0 0 1 6-1" />
  </Svg>
)

export const IconEnergy = (p: P) => (
  <Svg {...p}>
    <path d="M27 4 10 27h12l-3 17 19-25H26Z" fill="#FFC23D" />
    <Shine d="M24 11l-6 9" />
  </Svg>
)

export const IconFun = (p: P) => (
  <Svg {...p}>
    <circle cx="24" cy="24" r="17" fill="#FF7EB6" />
    <circle cx="18" cy="21" r="2" fill={INK} stroke="none" />
    <circle cx="30" cy="21" r="2" fill={INK} stroke="none" />
    <path d="M17 28c3 4 11 4 14 0" />
    <Shine d="M13 15a12 12 0 0 1 5-4" />
  </Svg>
)

export const IconHygiene = (p: P) => (
  <Svg {...p}>
    <path d="M24 5C18 14 11 21 11 29a13 13 0 0 0 26 0c0-8-7-15-13-24Z" fill="#4FB4FF" />
    <Shine d="M17 29a7 7 0 0 0 3 6" />
  </Svg>
)

export const IconBladder = (p: P) => (
  <Svg {...p}>
    <path d="M10 18h28c0 9-6 14-14 14S10 27 10 18Z" fill="#fff" />
    <ellipse cx="24" cy="18" rx="14" ry="3.5" fill="#A98BFF" />
    <path d="M18 32l-2 9h16l-2-9" fill="#E6F7FF" />
    <path d="M14 13V7h10v6" fill="#E6F7FF" />
  </Svg>
)

export const IconHealth = (p: P) => (
  <Svg {...p}>
    <path d="M24 41C10 32 5 24 5 17a9.5 9.5 0 0 1 19-3 9.5 9.5 0 0 1 19 3c0 7-5 15-19 24Z" fill="#3FCB98" />
    <path d="M24 17v12M18 23h12" stroke="#fff" strokeWidth={4} />
  </Svg>
)

export const IconCoin = (p: P) => (
  <Svg {...p}>
    <circle cx="24" cy="24" r="17" fill="#FFC94A" />
    <circle cx="24" cy="24" r="11" fill="#FFDC7A" strokeWidth={2.4} />
    <path d="M24 18v12" strokeWidth={3.4} />
    <Shine d="M13 18a12 12 0 0 1 4-5" />
  </Svg>
)

/* ---------- Food ---------- */

export const FoodFish = (p: P) => (
  <Svg {...p}>
    <path d="M6 24c6-9 18-11 27-4l8-6v20l-8-6c-9 7-21 5-27-4Z" fill="#7CC4FF" />
    <circle cx="14" cy="22" r="2" fill={INK} stroke="none" />
    <path d="M22 18c2 4 2 8 0 12" strokeWidth={2.4} />
  </Svg>
)
export const FoodChicken = IconHunger
export const FoodCarrot = (p: P) => (
  <Svg {...p}>
    <path d="M34 14 8 40c-2 1-3 0-2-2l24-28c3-2 6 1 4 4Z" fill="#FF8A3D" />
    <path d="M32 12c0-5 2-7 6-8M34 14c4 0 7-1 9-5M33 13c3-3 7-4 10-2" stroke="#3FCB98" strokeWidth={3.4} />
    <path d="M18 26l3 3M13 32l3 2" strokeWidth={2.2} />
  </Svg>
)
export const FoodBone = (p: P) => (
  <Svg {...p}>
    <path
      d="M14 10a5 5 0 0 0-4 8 5 5 0 0 0 0 8 5 5 0 0 0 8-2l16 6a5 5 0 0 0 8 6 5 5 0 0 0 2-8 5 5 0 0 0-8-2l-16-6a5 5 0 0 0-6-10Z"
      fill="#FFF3DC"
    />
    <Shine d="M15 16l3 1" />
  </Svg>
)
export const FoodChili = (p: P) => (
  <Svg {...p}>
    <path d="M30 12c6 2 7 9 3 16-4 8-14 13-24 12 9-4 14-11 14-20 0-6 3-9 7-8Z" fill="#FF5A5F" />
    <path d="M30 12c0-3 2-6 6-7" stroke="#3FCB98" strokeWidth={3.4} />
    <Shine d="M30 18c0 4-2 8-5 11" />
  </Svg>
)
export const FoodApple = (p: P) => (
  <Svg {...p}>
    <path d="M24 14c-4-3-14-3-15 8-1 9 6 20 15 17 9 3 16-8 15-17-1-11-11-11-15-8Z" fill="#FF6B6B" />
    <path d="M24 14c0-4 1-6 3-8" />
    <path d="M27 10c3-4 8-4 10-3-2 4-6 5-10 3Z" fill="#3FCB98" strokeWidth={2.4} />
    <Shine d="M14 20a6 6 0 0 1 3-3" />
  </Svg>
)
export const FoodCookie = (p: P) => (
  <Svg {...p}>
    <circle cx="24" cy="24" r="16" fill="#E9A35E" />
    {[
      [18, 18],
      [29, 16],
      [31, 28],
      [19, 30],
      [24, 23],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="2.4" fill={INK} stroke="none" />
    ))}
  </Svg>
)

/* ---------- Emotes ---------- */

export const EmoteSleepy = (p: P) => (
  <Svg {...p}>
    <path d="M10 12h12L10 26h12M28 22h10l-10 12h10" fill="none" stroke="#A98BFF" strokeWidth={4} />
  </Svg>
)
export const EmoteSick = (p: P) => (
  <Svg {...p}>
    <rect x="19" y="5" width="10" height="28" rx="5" fill="#fff" />
    <circle cx="24" cy="36" r="7" fill="#FF5A5F" />
    <path d="M24 33V16" stroke="#FF5A5F" strokeWidth={4} />
  </Svg>
)
export const EmoteSad = (p: P) => (
  <Svg {...p}>
    <path d="M13 26a8 8 0 0 1 2-15 10 10 0 0 1 19 1 7 7 0 0 1 1 14Z" fill="#B9C6DA" />
    <path d="M17 32l-2 5M25 32l-2 5M33 32l-2 5" stroke="#4FB4FF" strokeWidth={3.4} />
  </Svg>
)
export const EmoteDirty = (p: P) => (
  <Svg {...p}>
    <path d="M24 10c-6 0-6 6-11 6-4 0-6 5-3 8-3 3-1 9 4 8 2 5 9 6 12 2 3 4 11 2 11-3 5-1 6-8 1-10 2-4-1-9-5-7-2-4-5-4-9-4Z" fill="#B58A63" />
    <circle cx="18" cy="23" r="2" fill="#fff" stroke="none" />
  </Svg>
)
export const EmoteHeart = (p: P) => (
  <Svg {...p}>
    <path d="M24 41C10 32 5 24 5 17a9.5 9.5 0 0 1 19-3 9.5 9.5 0 0 1 19 3c0 7-5 15-19 24Z" fill="#FF6F9F" />
    <Shine d="M11 17a6 6 0 0 1 4-5" />
  </Svg>
)

/* ---------- UI ---------- */

export const IconSoundOn = (p: P) => (
  <Svg {...p}>
    <path d="M8 19h7l9-8v26l-9-8H8Z" fill="#FFC94A" />
    <path d="M31 17c3 4 3 10 0 14M36 12c6 7 6 17 0 24" />
  </Svg>
)
export const IconSoundOff = (p: P) => (
  <Svg {...p}>
    <path d="M8 19h7l9-8v26l-9-8H8Z" fill="#E4DCEB" />
    <path d="M31 19l10 10M41 19 31 29" />
  </Svg>
)
export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M14 14l20 20M34 14 14 34" strokeWidth={4.4} />
  </Svg>
)
export const IconArrow = ({ dir = 'right', ...p }: P & { dir?: 'left' | 'right' }) => (
  <Svg {...p}>
    <path d={dir === 'right' ? 'M18 10l14 14-14 14' : 'M30 10 16 24l14 14'} strokeWidth={5} />
  </Svg>
)
export const IconPaw = (p: P & { color?: string }) => (
  <Svg {...p}>
    <ellipse cx="24" cy="31" rx="10" ry="8.5" fill={p.color ?? '#FF8FB8'} />
    {[
      [11, 20],
      [19, 12],
      [29, 12],
      [37, 20],
    ].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx="4.4" ry="5.2" fill={p.color ?? '#FF8FB8'} />
    ))}
  </Svg>
)
