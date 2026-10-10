import { useEffect, useState } from 'react'
import { IconPaw } from './Icons'

/** Cosy overlay shown until the 3D scene has rendered its first frames. */
export function Loader({ ready }: { ready: boolean }) {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!ready) return
    const id = setTimeout(() => setGone(true), 500)
    return () => clearTimeout(id)
  }, [ready])
  if (gone) return null
  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-cream transition-opacity duration-500"
      style={{ opacity: ready ? 0 : 1, pointerEvents: ready ? 'none' : 'auto' }}
    >
      <div className="flex gap-3">
        {['#FF8FB8', '#FFC94A', '#5BB8FF'].map((c, i) => (
          <div key={c} style={{ animation: `float-y 0.9s ease-in-out ${i * 0.15}s infinite` }}>
            <IconPaw size={40} color={c} />
          </div>
        ))}
      </div>
    </div>
  )
}
