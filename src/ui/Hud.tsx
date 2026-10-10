import { animated, useSpring } from '@react-spring/web'
import { useEffect, useRef } from 'react'
import { sfx } from '../assets/sfx'
import { STAT_KEYS, ageStage, isCritical } from '../game/stats'
import type { StatKey } from '../game/types'
import { t } from '../i18n'
import { useGame } from '../store/gameStore'
import { IconBladder, IconCoin, IconEnergy, IconFun, IconHealth, IconHunger, IconHygiene, IconSoundOff, IconSoundOn } from './Icons'
import { colors, springs, statColors } from './tokens'
import { GardenIcon, HouseIcon, ShopIcon } from './ItemIcons'

const STAT_ICON: Record<StatKey, (p: { size?: number }) => React.ReactElement> = {
  hunger: IconHunger,
  energy: IconEnergy,
  fun: IconFun,
  hygiene: IconHygiene,
  bladder: IconBladder,
  health: IconHealth,
}

const R = 21
const CIRC = 2 * Math.PI * R

/** Ring gauge: icon in the middle, spring-animated arc around it. */
function StatRing({ k }: { k: StatKey }) {
  const value = useGame((s) => Math.round(s.stats[k]))
  const critical = isCritical(k, value)
  const spring = useSpring({ v: value, config: springs.bar })
  const Icon = STAT_ICON[k]
  const color = critical ? colors.danger : statColors[k]
  return (
    <div className="relative flex flex-col items-center" aria-label={`${t(`stat.${k}`)} ${value}`} title={t(`stat.${k}`)}>
      <div className="relative h-[52px] w-[52px] rounded-full" style={{ animation: critical ? 'pulse-ring 1.2s infinite' : undefined }}>
        <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90">
          <circle cx="26" cy="26" r={R} fill="#fff" stroke="#EFE5EE" strokeWidth="6" />
          <animated.circle
            cx="26"
            cy="26"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={spring.v.to((v) => CIRC * (1 - Math.max(v, 3) / 100))}
            style={{ transition: 'stroke 400ms' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" style={{ animation: critical ? 'wiggle 0.5s ease-in-out infinite' : undefined }}>
          <Icon size={26} />
        </div>
      </div>
      <span className="mt-0.5 font-display text-[10.5px] font-bold leading-none text-ink-soft">{t(`stat.${k}`)}</span>
    </div>
  )
}

function Coins() {
  const coins = useGame((s) => s.coins)
  const prev = useRef(coins)
  const [style, api] = useSpring(() => ({ scale: 1, config: springs.bouncy }))
  useEffect(() => {
    if (coins > prev.current) {
      sfx.coin()
      api.start({ from: { scale: 1.35 }, to: { scale: 1 } })
    }
    prev.current = coins
  }, [coins, api])
  return (
    <animated.div style={style} className="glass flex h-11 items-center gap-1 rounded-full pl-1.5 pr-3">
      <IconCoin size={30} />
      <span className="font-display text-lg font-extrabold tabular-nums">{coins}</span>
    </animated.div>
  )
}

export function Hud() {
  const pet = useGame((s) => s.pet)!
  const muted = useGame((s) => s.muted)
  const stage = ageStage(pet.bornAt, Date.now())
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 px-3 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="flex items-center gap-1.5">
        <div className="glass pointer-events-auto flex h-11 min-w-0 items-center gap-1.5 rounded-full pl-3.5 pr-1.5">
          <span className="truncate font-display text-lg font-extrabold leading-none">{pet.name}</span>
          <span className="shrink-0 rounded-full bg-lavender px-2 py-1 font-display text-[11px] font-bold leading-none text-white">{t(`stage.${stage}`)}</span>
        </div>
        <div className="flex-1" />
        <div className="pointer-events-auto">
          <Coins />
        </div>
        <button
          className="squishy glass pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full"
          aria-label={t('shop.title')}
          onClick={() => {
            sfx.open()
            useGame.getState().openShop('furniture')
          }}
        >
          <ShopIcon size={30} />
        </button>
        <button
          className="squishy glass pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full"
          aria-label={muted ? t('sound.off') : t('sound.on')}
          onClick={() => {
            useGame.getState().toggleMute()
            sfx.tap()
          }}
        >
          {muted ? <IconSoundOff size={26} /> : <IconSoundOn size={26} />}
        </button>
      </div>
      <div className="glass pointer-events-auto mx-auto flex w-full max-w-md justify-between rounded-[26px] px-2.5 pb-2 pt-2">
        {STAT_KEYS.map((k) => (
          <StatRing key={k} k={k} />
        ))}
      </div>
      <PlaceSwitch />
    </div>
  )
}

/** House / garden segmented control – appears once the garden is bought. */
function PlaceSwitch() {
  const hasGarden = useGame((s) => s.owned.includes('garden'))
  const location = useGame((s) => s.location)
  if (!hasGarden) return null
  const opts = [
    { id: 'house' as const, icon: <HouseIcon size={24} />, label: t('place.house') },
    { id: 'garden' as const, icon: <GardenIcon size={24} />, label: t('place.garden') },
  ]
  return (
    <div className="glass pointer-events-auto relative flex self-start rounded-full p-1" style={{ animation: 'pop-in 450ms var(--ease-spring) both' }}>
      <div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-white transition-transform duration-500"
        style={{ transform: location === 'garden' ? 'translateX(100%)' : 'none', transitionTimingFunction: 'var(--ease-spring)', boxShadow: '0 2px 0 rgb(61 44 78 / .12)' }}
      />
      {opts.map((o) => (
        <button
          key={o.id}
          className="relative flex items-center gap-1.5 rounded-full py-1 pl-2 pr-3.5 font-display text-sm font-extrabold"
          style={{ color: location === o.id ? '#3D2C4E' : '#7A6A8A' }}
          onClick={() => {
            if (location === o.id) return
            sfx.whoosh()
            useGame.getState().goTo(o.id)
          }}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  )
}
