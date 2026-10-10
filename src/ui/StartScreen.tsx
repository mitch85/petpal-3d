import { ShowcaseCanvas } from '../pets/Showcase'
import { t } from '../i18n'
import { CandyButton } from './Button'
import { IconPaw } from './Icons'

const LETTERS = 'PetPal'.split('')
const LETTER_COLORS = ['#FF7A6B', '#FF9F5A', '#FFC23D', '#3FCB98', '#4FB4FF', '#A98BFF']

export function Backdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'radial-gradient(120% 80% at 50% 10%, #FFF6EA 0%, #FFE3CF 55%, #FFCFB8 100%)' }}>
      {[
        ['8%', '18%', '#FFB3C7', 0],
        ['82%', '12%', '#BFE8FF', 1.2],
        ['14%', '72%', '#C9F2DE', 0.6],
        ['86%', '64%', '#E2D6FF', 1.8],
        ['4%', '48%', '#FFE7A3', 2.4],
      ].map(([l, tp, c, d], i) => (
        <div key={i} className="absolute" style={{ left: l as string, top: tp as string, animation: `float-y ${4 + i * 0.7}s ease-in-out ${d}s infinite`, opacity: 0.85 }}>
          <div style={{ transform: `rotate(${i * 37 - 40}deg)` }}>
            <IconPaw size={38 + (i % 3) * 10} color={c as string} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StartScreen({ hasPet, onStart }: { hasPet: boolean; onStart: () => void }) {
  return (
    <div className="absolute inset-0">
      <Backdrop />
      <div className="absolute inset-x-0 top-[38%] bottom-[16%]">
        <ShowcaseCanvas mode="lineup" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[max(56px,9vh)] flex flex-col items-center text-center">
        <h1 className="flex font-display text-[84px] font-extrabold leading-none tracking-tight sm:text-[112px]">
          {LETTERS.map((ch, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                color: LETTER_COLORS[i],
                WebkitTextStroke: '6px #3D2C4E',
                paintOrder: 'stroke fill',
                textShadow: '0 6px 0 rgb(61 44 78 / .18)',
                animation: `pop-in 600ms var(--ease-spring) ${i * 70}ms both, float-y 2.8s ease-in-out ${0.8 + i * 0.15}s infinite`,
              }}
            >
              {ch}
            </span>
          ))}
        </h1>
        <div className="-mt-1 rounded-full bg-ink px-3 py-1 font-display text-sm font-extrabold tracking-[0.2em] text-white" style={{ animation: 'pop-in 500ms var(--ease-spring) 500ms both' }}>
          3D
        </div>
        <p className="mt-3 font-body text-lg font-bold text-ink-soft" style={{ animation: 'pop-in 500ms var(--ease-spring) 650ms both' }}>
          {t('app.tagline')}
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-[max(36px,7vh)] flex justify-center" style={{ animation: 'pop-in 600ms var(--ease-spring) 900ms both' }}>
        <CandyButton onClick={onStart} className="min-w-[240px]">
          {hasPet ? t('start.continue') : t('start.play')}
        </CandyButton>
      </div>
    </div>
  )
}
