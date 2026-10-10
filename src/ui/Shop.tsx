import { useState } from 'react'
import { sfx } from '../assets/sfx'
import { TOY_FUN } from '../game/care'
import { PETS, SPECIES_ORDER } from '../game/pets.config'
import { SHOP_ITEMS, type ShopCategory, type ShopItem } from '../game/shop'
import type { FurnitureSlot } from '../game/types'
import { t, type I18nKey } from '../i18n'
import { useGame } from '../store/gameStore'
import { EmoteHeart, IconCoin } from './Icons'
import { GardenIcon, ItemIcon } from './ItemIcons'
import { Sheet } from './Sheet'

const TABS: ShopCategory[] = ['furniture', 'toys', 'rooms', 'garden']
const SLOTS: FurnitureSlot[] = ['bed', 'bowl', 'litter', 'tub']
const TINT: Record<ShopCategory, string> = { furniture: '#FFE3D3', toys: '#FFE0EE', rooms: '#E6E0FF', garden: '#DDF5E4' }

function itemName(item: ShopItem) {
  if (item.category === 'toys') return t(`toy.${item.toy}` as I18nKey)
  if (item.category === 'rooms') return t(`room.${item.theme}` as I18nKey)
  return t(`item.${item.id}` as I18nKey)
}

function itemEffect(item: ShopItem) {
  if (item.category === 'furniture') return t(`fx.${item.id}` as I18nKey)
  if (item.category === 'toys') return t('fx.toy', { fun: TOY_FUN[item.toy] })
  if (item.category === 'garden') return t('fx.garden')
  const lovers = SPECIES_ORDER.filter((s) => PETS[s].favoriteTheme === item.theme).map((s) => t(`species.${s}`))
  return lovers.length ? `${t('fx.room')} · ${t('room.loved')}: ${lovers.join(', ')}` : t('fx.room')
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n}/3`}>
      {[1, 2, 3].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24">
          <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.1l1.5-7L2 9.3l7-.8Z" fill={i <= n ? '#FFC23D' : '#E9DFEA'} stroke="#3D2C4E" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  )
}

function ItemRow({ item, index }: { item: ShopItem; index: number }) {
  const owned = useGame((s) => s.owned.includes(item.id))
  const coins = useGame((s) => s.coins)
  const active = useGame((s) =>
    item.category === 'furniture' ? s.equipped[item.slot] === item.id : item.category === 'rooms' ? s.theme === item.theme : item.category === 'garden' ? s.location === 'garden' : false,
  )
  const [shake, setShake] = useState(0)
  const affordable = coins >= item.price
  const g = useGame.getState

  const onAction = () => {
    if (!owned) {
      if (g().buy(item.id)) sfx.coin()
      else {
        sfx.error()
        setShake((n) => n + 1)
      }
    } else if (!active) {
      sfx.pop()
      g().equip(item.id)
    }
  }

  return (
    <div
      className="flex items-center gap-3 rounded-[22px] bg-white p-2.5 pr-3"
      style={{ boxShadow: 'var(--shadow-candy)', animation: `pop-in 380ms var(--ease-spring) ${index * 40}ms both`, outline: active ? '3px solid #4FD1A5' : undefined }}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px]" style={{ background: TINT[item.category] }}>
        <ItemIcon id={item.id} size={44} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-display text-[17px] font-extrabold leading-tight">{itemName(item)}</span>
          <Stars n={item.tier} />
        </div>
        <p className="font-body text-[12.5px] font-bold leading-snug text-ink-soft">{itemEffect(item)}</p>
      </div>
      {item.category === 'toys' && owned ? (
        <span className="shrink-0 rounded-full bg-[#EFE8F2] px-3 py-1.5 font-display text-sm font-bold text-ink-soft">{t('shop.owned')}</span>
      ) : active ? (
        <span className="shrink-0 rounded-full bg-mint px-3 py-1.5 font-display text-sm font-bold text-white">{t('shop.active')}</span>
      ) : (
        <button
          key={shake}
          onClick={onAction}
          className="squishy flex shrink-0 items-center gap-1 rounded-full py-1.5 pl-2 pr-3 font-display text-sm font-extrabold text-white"
          style={{
            background: owned ? '#A98BFF' : affordable ? '#FF7A6B' : '#C9BCCF',
            boxShadow: '0 3px 0 rgb(61 44 78 / .18)',
            animation: shake ? 'wiggle 0.12s ease-in-out 3' : undefined,
          }}
        >
          {owned ? (
            <span className="px-1">{t('shop.equip')}</span>
          ) : item.price === 0 ? (
            <span className="px-1">{t('shop.buy')}</span>
          ) : (
            <>
              <IconCoin size={20} />
              {item.price}
            </>
          )}
        </button>
      )}
    </div>
  )
}

function GardenHero() {
  const owned = useGame((s) => s.owned.includes('garden'))
  const coins = useGame((s) => s.coins)
  const item = SHOP_ITEMS.find((i) => i.id === 'garden')!
  const progress = Math.min(1, coins / item.price)
  return (
    <div className="flex flex-col items-center gap-3 rounded-[26px] p-5 text-center" style={{ background: 'linear-gradient(180deg,#DDF5E4,#FFFFFF)', boxShadow: 'var(--shadow-candy)' }}>
      <div style={{ animation: 'float-y 3s ease-in-out infinite' }}>
        <GardenIcon size={96} />
      </div>
      <h3 className="font-display text-2xl font-extrabold">{t('item.garden')}</h3>
      <p className="max-w-xs font-body text-sm font-bold text-ink-soft">{t('fx.garden')}</p>
      {!owned && (
        <div className="h-3 w-full max-w-xs overflow-hidden rounded-full bg-[#E5EFE8]">
          <div className="h-full rounded-full bg-mint transition-all duration-700" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
      <ItemRowAction owned={owned} price={item.price} />
    </div>
  )
}

function ItemRowAction({ owned, price }: { owned: boolean; price: number }) {
  const location = useGame((s) => s.location)
  const coins = useGame((s) => s.coins)
  const g = useGame.getState
  if (owned)
    return (
      <button
        className="squishy rounded-full bg-mint px-6 py-2.5 font-display text-lg font-extrabold text-white"
        style={{ boxShadow: '0 4px 0 #2FA57E' }}
        onClick={() => {
          sfx.whoosh()
          g().goTo(location === 'garden' ? 'house' : 'garden')
          g().openShop(null)
        }}
      >
        {location === 'garden' ? t('place.house') : t('place.garden')} →
      </button>
    )
  return (
    <button
      className="squishy flex items-center gap-1.5 rounded-full px-6 py-2.5 font-display text-lg font-extrabold text-white"
      style={{ background: coins >= price ? '#FF7A6B' : '#C9BCCF', boxShadow: '0 4px 0 rgb(61 44 78 / .18)' }}
      onClick={() => (g().buy('garden') ? sfx.happy() : sfx.error())}
    >
      <IconCoin size={24} />
      {coins} / {price}
    </button>
  )
}

export function Shop() {
  const tab = useGame((s) => s.shopTab)
  const coins = useGame((s) => s.coins)
  const species = useGame((s) => s.pet?.species)
  const current = tab ?? 'furniture'
  const g = useGame.getState

  const header = (
    <div className="flex items-center gap-1 rounded-full bg-white py-1 pl-1 pr-3 font-display text-lg font-extrabold" style={{ boxShadow: 'var(--shadow-candy)' }}>
      <IconCoin size={26} />
      {coins}
    </div>
  )

  return (
    <Sheet open={tab !== null} onClose={() => g().openShop(null)} title={t('shop.title')} header={<div className="flex-1 flex justify-end">{header}</div>}>
      <div className="mb-3 flex gap-1.5 rounded-full bg-[#F1E8EE] p-1">
        {TABS.map((c) => (
          <button
            key={c}
            onClick={() => {
              sfx.tap()
              g().openShop(c)
            }}
            className="flex-1 rounded-full py-2 font-display text-[14px] font-extrabold transition-all duration-300"
            style={{ background: c === current ? '#FFFFFF' : 'transparent', color: c === current ? '#3D2C4E' : '#7A6A8A', boxShadow: c === current ? '0 2px 0 rgb(61 44 78 / .12)' : undefined }}
          >
            {t(`shop.tab.${c}` as I18nKey)}
          </button>
        ))}
      </div>

      {current === 'furniture' &&
        SLOTS.map((slot) => (
          <section key={slot} className="mb-4">
            <h3 className="mb-2 px-1 font-display text-sm font-extrabold uppercase tracking-wider text-ink-soft">{t(`shop.slot.${slot}` as I18nKey)}</h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {SHOP_ITEMS.filter((i) => i.category === 'furniture' && i.slot === slot).map((item, i) => (
                <ItemRow key={item.id} item={item} index={i} />
              ))}
            </div>
          </section>
        ))}
      {(current === 'toys' || current === 'rooms') && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SHOP_ITEMS.filter((i) => i.category === current).map((item, i) => (
            <div key={item.id} className="relative">
              <ItemRow item={item} index={i} />
              {species &&
                ((item.category === 'toys' && PETS[species].favoriteToy === item.toy) || (item.category === 'rooms' && PETS[species].favoriteTheme === item.theme)) && (
                  <span className="absolute -top-2 left-3 flex items-center gap-0.5 rounded-full bg-pink py-0.5 pl-1 pr-2 font-display text-[10px] font-bold text-white">
                    <EmoteHeart size={12} />
                    {t('food.favorite')}
                  </span>
                )}
            </div>
          ))}
        </div>
      )}
      {current === 'garden' && <GardenHero />}
    </Sheet>
  )
}
