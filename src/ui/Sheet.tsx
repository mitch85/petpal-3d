import { animated, useTransition } from '@react-spring/web'
import type { ReactNode } from 'react'
import { sfx } from '../assets/sfx'
import { IconClose } from './Icons'
import { springs } from './tokens'

/** Bottom sheet with springy slide-in, dimmed backdrop and close button. */
export function Sheet({ open, onClose, title, children, header }: { open: boolean; onClose: () => void; title: string; children: ReactNode; header?: ReactNode }) {
  const transitions = useTransition(open, {
    from: { y: 110, opacity: 0 },
    enter: { y: 0, opacity: 1 },
    leave: { y: 110, opacity: 0 },
    config: springs.bouncy,
  })
  const close = () => {
    sfx.close()
    onClose()
  }
  return transitions(
    (style, show) =>
      show && (
        <>
          <animated.div className="absolute inset-0 z-20 bg-ink/25" style={{ opacity: style.opacity }} onClick={close} />
          <animated.div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))]" style={{ transform: style.y.to((y) => `translateY(${y}%)`) }}>
            <div className="glass mx-auto flex max-h-[78vh] max-w-xl flex-col rounded-[30px] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-extrabold leading-tight">{title}</h2>
                {header}
                <button className="squishy flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white" style={{ boxShadow: 'var(--shadow-candy)' }} onClick={close} aria-label="close">
                  <IconClose size={22} />
                </button>
              </div>
              <div className="-mx-1 overflow-y-auto px-1 pb-1" style={{ touchAction: 'pan-y' }}>
                {children}
              </div>
            </div>
          </animated.div>
        </>
      ),
  )
}

/** Tappable card used in all menus. */
export function MenuCard({
  children,
  onClick,
  index = 0,
  highlight,
  dimmed,
  badge,
}: {
  children: ReactNode
  onClick: () => void
  index?: number
  highlight?: string
  dimmed?: boolean
  badge?: ReactNode
}) {
  return (
    <button
      className="squishy relative flex flex-col items-center gap-1 rounded-[20px] bg-white px-1 pb-2 pt-2.5"
      style={{
        boxShadow: 'var(--shadow-candy)',
        animation: `pop-in 380ms var(--ease-spring) ${index * 35}ms both`,
        outline: highlight ? `3px solid ${highlight}` : undefined,
        opacity: dimmed ? 0.62 : 1,
      }}
      onClick={() => {
        sfx.pop()
        onClick()
      }}
    >
      {children}
      {badge}
    </button>
  )
}

export function Badge({ children, color = '#FF8FB8' }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="absolute -right-1.5 -top-2 flex items-center gap-0.5 rounded-full py-0.5 pl-1.5 pr-2 font-display text-[10px] font-bold leading-tight text-white"
      style={{ background: color, boxShadow: '0 2px 0 rgb(61 44 78 / .15)' }}
    >
      {children}
    </span>
  )
}
