import { sfx } from '../assets/sfx'
import { FOOD_ORDER } from '../game/foods'
import { PETS } from '../game/pets.config'
import { SHOP_ITEMS, toyItemId, type ToyItem } from '../game/shop'
import type { FoodId } from '../game/types'
import { t, type I18nKey } from '../i18n'
import { useGame } from '../store/gameStore'
import {
  EmoteHeart,
  FoodApple,
  FoodBone,
  FoodCarrot,
  FoodChicken,
  FoodChili,
  FoodCookie,
  FoodFish,
  IconCoin,
  IconFeed,
  IconPet,
  IconPlay,
  IconSleep,
  IconToilet,
  IconWake,
  IconWash,
} from './Icons'
import { ToyIcon } from './ItemIcons'
import { Badge, MenuCard, Sheet } from './Sheet'

const FOOD_ICONS: Record<FoodId, (p: { size?: number }) => React.ReactElement> = {
  fish: FoodFish,
  chicken: FoodChicken,
  carrot: FoodCarrot,
  bone: FoodBone,
  chili: FoodChili,
  apple: FoodApple,
  cookie: FoodCookie,
}

function ActionButton({ label, tint, icon, onClick, active, badge }: { label: string; tint: string; icon: React.ReactNode; onClick: () => void; active?: boolean; badge?: boolean }) {
  return (
    <button
      className="squishy group relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[20px] px-0 pb-1.5 pt-2"
      style={{ background: active ? tint : `color-mix(in srgb, ${tint} 26%, white)`, boxShadow: 'var(--shadow-candy)' }}
      onClick={() => {
        sfx.tap()
        onClick()
      }}
    >
      <div className="transition-transform duration-300 group-hover:-rotate-6">{icon}</div>
      <span className={`max-w-full truncate font-display text-[12px] font-bold leading-none tracking-tight ${active ? 'text-white' : 'text-ink'}`}>{label}</span>
      {badge && <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-danger" style={{ animation: 'pulse-ring 1.2s infinite' }} />}
    </button>
  )
}

export function ActionBar() {
  const sleeping = useGame((s) => s.sleeping)
  const needsToilet = useGame((s) => s.stats.bladder >= 75)
  const hungry = useGame((s) => s.stats.hunger < 25)
  const dirty = useGame((s) => s.stats.hygiene < 25)
  const tired = useGame((s) => s.stats.energy < 20)
  const bored = useGame((s) => s.stats.fun < 25)
  const g = useGame.getState

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="glass mx-auto flex max-w-xl gap-1.5 rounded-[28px] p-1.5 sm:gap-2.5 sm:p-2.5">
        <ActionButton label={t('action.feed')} tint="#FF9F5A" icon={<IconFeed size={34} />} badge={hungry} onClick={() => (sfx.open(), g().setFoodMenu(true))} />
        <ActionButton label={t('action.play')} tint="#FF7EB6" icon={<IconPlay size={34} />} badge={bored} onClick={() => (sfx.open(), g().setToyMenu(true))} />
        <ActionButton label={t('action.toilet')} tint="#A98BFF" icon={<IconToilet size={34} />} badge={needsToilet} onClick={() => g().toilet()} />
        <ActionButton label={t('action.wash')} tint="#4FB4FF" icon={<IconWash size={34} />} badge={dirty} onClick={() => g().wash()} />
        <ActionButton
          label={t(sleeping ? 'action.wake' : 'action.sleep')}
          tint="#5B57A8"
          active={sleeping}
          icon={sleeping ? <IconWake size={34} /> : <IconSleep size={34} />}
          badge={tired && !sleeping}
          onClick={() => g().toggleSleep()}
        />
        <ActionButton label={t('action.pet')} tint="#FF7A6B" icon={<IconPet size={34} />} onClick={() => g().stroke()} />
      </div>
    </div>
  )
}

export function FoodMenu() {
  const open = useGame((s) => s.foodMenuOpen)
  const species = useGame((s) => s.pet?.species)
  const fav = species ? PETS[species].favoriteFood : null
  return (
    <Sheet open={open} onClose={() => useGame.getState().setFoodMenu(false)} title={t('food.title')}>
      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7">
        {FOOD_ORDER.map((id, i) => {
          const Icon = FOOD_ICONS[id]
          return (
            <MenuCard
              key={id}
              index={i}
              highlight={id === fav ? '#FF8FB8' : undefined}
              onClick={() => useGame.getState().feed(id)}
              badge={
                id === fav && (
                  <Badge>
                    <EmoteHeart size={13} />
                    {t('food.favorite')}
                  </Badge>
                )
              }
            >
              <Icon size={42} />
              <span className="font-display text-[13px] font-bold leading-none">{t(`food.${id}` as I18nKey)}</span>
            </MenuCard>
          )
        })}
      </div>
    </Sheet>
  )
}

const TOYS = SHOP_ITEMS.filter((i): i is ToyItem => i.category === 'toys')

export function ToyMenu() {
  const open = useGame((s) => s.toyMenuOpen)
  const owned = useGame((s) => s.owned)
  const species = useGame((s) => s.pet?.species)
  const fav = species ? PETS[species].favoriteToy : null
  return (
    <Sheet open={open} onClose={() => useGame.getState().setToyMenu(false)} title={t('toy.title')}>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {TOYS.map((item, i) => {
          const has = owned.includes(toyItemId(item.toy))
          return (
            <MenuCard
              key={item.id}
              index={i}
              dimmed={!has}
              highlight={has && item.toy === fav ? '#FF8FB8' : undefined}
              onClick={() => (has ? useGame.getState().play(item.toy) : useGame.getState().openShop('toys'))}
              badge={
                has ? (
                  item.toy === fav && (
                    <Badge>
                      <EmoteHeart size={13} />
                      {t('food.favorite')}
                    </Badge>
                  )
                ) : (
                  <Badge color="#FFB020">
                    <IconCoin size={13} />
                    {item.price}
                  </Badge>
                )
              }
            >
              <ToyIcon toy={item.toy} size={46} />
              <span className="font-display text-[13px] font-bold leading-none">{t(`toy.${item.toy}` as I18nKey)}</span>
            </MenuCard>
          )
        })}
      </div>
    </Sheet>
  )
}
