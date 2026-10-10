import { useState } from 'react'
import { sfx } from '../assets/sfx'
import { SPECIES_ORDER } from '../game/pets.config'
import { PETS } from '../game/pets.config'
import { t } from '../i18n'
import { ShowcaseCanvas } from '../pets/Showcase'
import { useGame } from '../store/gameStore'
import { CandyButton } from './Button'
import { EmoteHeart, IconArrow } from './Icons'
import { ThemeSwatch } from './ItemIcons'
import { THEME_ORDER } from '../scene/themes'
import type { ThemeId } from '../game/types'
import { Backdrop } from './StartScreen'

export function PetSelect({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const [name, setName] = useState('')
  const [picked, setPicked] = useState<ThemeId | null>(null)
  const id = SPECIES_ORDER[(index + SPECIES_ORDER.length * 10) % SPECIES_ORDER.length]
  const look = PETS[id].look
  // Pre-select the species' favourite room until the player picks one.
  const theme = picked ?? PETS[id].favoriteTheme
  const go = (d: number) => {
    sfx.whoosh()
    setIndex((i) => i + d)
  }

  return (
    <div className="absolute inset-0">
      <Backdrop />
      <div className="absolute inset-x-0 top-[max(28px,5vh)] z-10 text-center">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl" style={{ animation: 'pop-in 500ms var(--ease-spring) both' }}>
          {t('select.title')}
        </h1>
      </div>

      <div className="absolute inset-x-0 top-[9%] h-[38%]">
        <ShowcaseCanvas mode="single" selected={id} />
        <div className="pointer-events-none absolute inset-x-0 bottom-1 text-center font-body text-sm font-bold text-ink-soft">{t('select.tapHint')}</div>
      </div>

      {[-1, 1].map((d) => (
        <button
          key={d}
          onClick={() => go(d)}
          aria-label={d < 0 ? 'previous' : 'next'}
          className={`squishy glass absolute top-[24%] flex h-14 w-14 items-center justify-center rounded-full ${d < 0 ? 'left-4' : 'right-4'}`}
        >
          <IconArrow dir={d < 0 ? 'left' : 'right'} size={26} />
        </button>
      ))}

      <div className="absolute inset-x-0 bottom-0 px-4 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-2.5 rounded-[32px] p-4">
          <div className="flex gap-2">
            {SPECIES_ORDER.map((s, i) => (
              <button
                key={s}
                aria-label={t(`species.${s}`)}
                onClick={() => {
                  sfx.tap()
                  setIndex(i)
                }}
                className="squishy h-4 rounded-full transition-all duration-300"
                style={{ width: s === id ? 32 : 16, background: s === id ? look.primary : '#E8DCE6', boxShadow: s === id ? 'inset 0 0 0 3px #3D2C4E' : undefined }}
              />
            ))}
          </div>
          <div key={id} className="text-center" style={{ animation: 'pop-in 420ms var(--ease-spring) both' }}>
            <h2 className="font-display text-3xl font-extrabold leading-tight">{t(`species.${id}`)}</h2>
            <p className="mt-0.5 font-body text-base font-bold text-ink-soft">{t(`species.${id}.trait`)}</p>
          </div>
          <div className="w-full">
            <div className="mb-1.5 text-center font-display text-xs font-extrabold uppercase tracking-wider text-ink-soft">{t('select.room')}</div>
            <div className="grid grid-cols-4 gap-2">
              {THEME_ORDER.map((th) => {
                const active = th === theme
                const loved = PETS[id].favoriteTheme === th
                return (
                  <button
                    key={th}
                    onClick={() => {
                      sfx.tap()
                      setPicked(th)
                    }}
                    className="squishy relative flex flex-col items-center gap-0.5 rounded-[18px] bg-white px-0.5 pb-1.5 pt-1"
                    style={{ boxShadow: active ? 'inset 0 0 0 3px #A98BFF, var(--shadow-candy)' : 'var(--shadow-candy)' }}
                  >
                    <ThemeSwatch theme={th} size={40} />
                    <span className="max-w-full truncate font-display text-[11px] font-bold leading-none">{t(`room.${th}`)}</span>
                    {loved && (
                      <span className="absolute -right-1 -top-1.5 rounded-full bg-pink p-0.5" title={t('room.loved')}>
                        <EmoteHeart size={12} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 14))}
            placeholder={t('select.namePlaceholder')}
            className="h-12 w-full rounded-[20px] border-[3px] border-[#EADCE6] bg-white px-5 text-center font-display text-xl font-bold text-ink outline-none transition-colors placeholder:text-[#C2B3C9] focus:border-lavender"
            style={{ userSelect: 'text', touchAction: 'auto' }}
          />
          <CandyButton
            className="w-full"
            color="#3FCB98"
            onClick={() => {
              sfx.happy()
              useGame.getState().adopt(id, name, theme)
              onDone()
            }}
          >
            {t('select.confirm')}
          </CandyButton>
        </div>
      </div>
    </div>
  )
}
