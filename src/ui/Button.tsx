import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { sfx } from '../assets/sfx'

/** Big candy-style primary button with springy press feedback. */
export function CandyButton({ children, color = '#FF7A6B', className = '', onClick, ...rest }: { children: ReactNode; color?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      onClick={(e) => {
        sfx.tap()
        onClick?.(e)
      }}
      className={`squishy relative rounded-[24px] px-8 py-4 font-display text-2xl font-extrabold text-white ${className}`}
      style={{ background: color, boxShadow: `0 6px 0 color-mix(in srgb, ${color} 70%, #3D2C4E), 0 14px 28px -8px rgb(61 44 78 / .35)`, textShadow: '0 2px 0 rgb(61 44 78 / .25)' }}
    >
      <span className="pointer-events-none absolute inset-x-4 top-1.5 h-2 rounded-full bg-white/35" />
      {children}
    </button>
  )
}
