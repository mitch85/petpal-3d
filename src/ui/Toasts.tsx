import { animated, useTransition } from '@react-spring/web'
import { useGame } from '../store/gameStore'
import { IconCoin } from './Icons'
import { springs } from './tokens'

export function Toasts() {
  const toasts = useGame((s) => s.toasts)
  const hasGarden = useGame((s) => s.owned.includes('garden'))
  const transitions = useTransition(toasts, {
    keys: (t) => t.id,
    from: { opacity: 0, scale: 0.6, y: -10 },
    enter: { opacity: 1, scale: 1, y: 0 },
    leave: { opacity: 0, scale: 0.8, y: -16 },
    config: springs.bouncy,
  })
  return (
    <div className="pointer-events-none absolute inset-x-0 z-20 flex flex-col items-center gap-2"
      style={{ top: hasGarden ? 200 : 150 }}>
      {transitions((style, toast) => (
        <animated.div
          style={{ opacity: style.opacity, transform: style.scale.to((s) => `scale(${s})`) }}
          className={`flex items-center gap-2 rounded-full py-2 pl-2 pr-4 font-display text-base font-extrabold shadow-[var(--shadow-float)] ${
            toast.tone === 'good' ? 'bg-mint text-white' : toast.tone === 'warn' ? 'bg-coral text-white' : 'glass text-ink'
          }`}
        >
          {toast.tone === 'good' ? <IconCoin size={26} /> : <span className="w-1" />}
          {toast.text}
        </animated.div>
      ))}
    </div>
  )
}
