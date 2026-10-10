import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as care from '../game/care'
import { PETS } from '../game/pets.config'
import { DEFAULT_EQUIPPED, ITEM_BY_ID, funDecayMul, furnitureEffects, starterItems, type ShopCategory } from '../game/shop'
import { initialStats, simulateOffline, tickStats } from '../game/stats'
import type { Activity, ActivityKind, FoodId, FurnitureSlot, Location, SpeciesId, Stats, ThemeId, ToyId } from '../game/types'
import { t, type I18nKey } from '../i18n'

export interface PetInfo {
  species: SpeciesId
  name: string
  bornAt: number
}

export interface Poop {
  id: number
  x: number
  z: number
}

export interface Toast {
  id: number
  text: string
  tone: 'good' | 'info' | 'warn'
}

/** Summary shown after returning to the app. */
export interface WelcomeBack {
  minutes: number
  before: Stats
  after: Stats
}

interface GameState {
  pet: PetInfo | null
  stats: Stats
  coins: number
  lastTick: number
  sleeping: boolean
  activity: Activity
  poops: Poop[]
  muted: boolean
  counts: Partial<Record<ActivityKind, number>>
  theme: ThemeId
  owned: string[]
  equipped: Record<FurnitureSlot, string>
  location: Location
  // transient
  toasts: Toast[]
  welcome: WelcomeBack | null
  foodMenuOpen: boolean
  toyMenuOpen: boolean
  shopTab: ShopCategory | null

  adopt: (species: SpeciesId, name: string, theme: ThemeId) => void
  tick: (now?: number) => void
  feed: (food: FoodId) => void
  toilet: () => void
  wash: () => void
  play: (toy: ToyId) => void
  buy: (itemId: string) => boolean
  equip: (itemId: string) => void
  goTo: (location: Location) => void
  setToyMenu: (open: boolean) => void
  openShop: (tab: ShopCategory | null) => void
  stroke: () => void
  toggleSleep: () => void
  cleanPoop: (id: number) => void
  completeActivity: (activity: Activity) => void
  setFoodMenu: (open: boolean) => void
  toggleMute: () => void
  toast: (text: string, tone?: Toast['tone']) => void
  dismissToast: (id: number) => void
  dismissWelcome: () => void
  reset: () => void
}

let seq = 1
const nextId = () => Date.now() * 10 + (seq++ % 10)

/** Random free floor spot for an accident, away from furniture corners. */
function randomPoopSpot(): Pick<Poop, 'x' | 'z'> {
  const a = Math.random() * Math.PI * 2
  const r = 0.8 + Math.random() * 1.4
  return { x: Math.cos(a) * r, z: Math.sin(a) * r + 0.3 }
}

const idle = (): Activity => ({ kind: 'idle', id: nextId() })

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      /** Start an activity if the pet is free. Returns false when refused. */
      const begin = (activity: Omit<Activity, 'id'>): boolean => {
        const s = get()
        if (!s.pet) return false
        const name = s.pet.name
        if (s.sleeping) {
          s.toast(t('toast.sleeping', { name }), 'info')
          return false
        }
        if (s.activity.kind !== 'idle') {
          s.toast(t('toast.busy', { name }), 'info')
          return false
        }
        if (s.location === 'garden' && activity.kind !== 'play' && activity.kind !== 'pet') set({ location: 'house' })
        set({ activity: { ...activity, id: nextId() } })
        return true
      }

      const reward = (r: care.CareResult, key: I18nKey) => {
        set((s) => ({ stats: r.stats, coins: s.coins + r.coins }))
        get().toast(t(key, { coins: r.coins }), 'good')
      }

      return {
        pet: null,
        stats: initialStats(),
        coins: 10,
        lastTick: Date.now(),
        sleeping: false,
        activity: idle(),
        poops: [],
        muted: false,
        counts: {},
        toasts: [],
        welcome: null,
        foodMenuOpen: false,
        toyMenuOpen: false,
        shopTab: null,
        theme: 'cozy',
        owned: starterItems('ball', 'cozy'),
        equipped: { ...DEFAULT_EQUIPPED },
        location: 'house',

        adopt: (species, name, theme) =>
          set({
            pet: { species, name: name.trim() || t(`species.${species}`), bornAt: Date.now() },
            theme,
            owned: starterItems(PETS[species].favoriteToy, theme),
            equipped: { ...DEFAULT_EQUIPPED },
            location: 'house',
            stats: initialStats(),
            coins: 10,
            lastTick: Date.now(),
            sleeping: false,
            activity: idle(),
            poops: [],
            counts: {},
          }),

        tick: (now = Date.now()) => {
          const s = get()
          if (!s.pet) return
          const elapsed = now - s.lastTick
          if (elapsed <= 0) return set({ lastTick: now })
          const species = PETS[s.pet.species]
          const rates = species.rates
          const minutes = elapsed / 60000
          const ctx = {
            sleepGain: furnitureEffects(s.equipped).sleepGain,
            funDecay: funDecayMul({ location: s.location, likesTheme: species.favoriteTheme === s.theme, species: species.id }),
          }

          let stats: Stats
          let accidents = 0
          if (minutes > 2) {
            const r = simulateOffline(s.stats, elapsed, rates, s.sleeping, ctx)
            stats = r.stats
            accidents = r.accidents
            if (r.minutes > 5) set({ welcome: { minutes: r.minutes, before: s.stats, after: stats } })
          } else {
            const r = tickStats(s.stats, minutes, rates, { ...ctx, sleeping: s.sleeping })
            stats = r.stats
            accidents = r.accident ? 1 : 0
          }

          const poops = [...s.poops]
          // In the garden accidents just disappear into the grass.
          const inHouse = s.location === 'house'
          for (let i = 0; inHouse && i < accidents && poops.length < 5; i++) poops.push({ id: nextId() + i, ...randomPoopSpot() })
          if (inHouse && accidents > 0 && minutes <= 2) s.toast(t('toast.accident'), 'warn')

          let { sleeping, activity } = s
          if (sleeping && stats.energy >= 100) {
            sleeping = false
            activity = idle()
            const coins = 3
            set((st) => ({ coins: st.coins + coins }))
            s.toast(t('toast.rested', { coins }), 'good')
          }
          set({ stats, lastTick: now, poops, sleeping, activity })
        },

        feed: (food) => {
          const s = get()
          if (s.pet && s.stats.hunger >= 96) return s.toast(t('toast.full', { name: s.pet.name }), 'info')
          if (begin({ kind: 'eat', foodId: food })) set({ foodMenuOpen: false })
        },
        toilet: () => {
          const s = get()
          if (s.pet && s.stats.bladder < 15) return s.toast(t('toast.noNeed', { name: s.pet.name }), 'info')
          begin({ kind: 'toilet' })
        },
        wash: () => void begin({ kind: 'wash' }),
        play: (toy) => {
          if (begin({ kind: 'play', toy })) set({ toyMenuOpen: false })
        },

        buy: (itemId) => {
          const s = get()
          const item = ITEM_BY_ID[itemId]
          if (!item || s.owned.includes(itemId)) return false
          if (s.coins < item.price) {
            s.toast(t('shop.tooExpensive', { missing: item.price - s.coins }), 'warn')
            return false
          }
          set({ coins: s.coins - item.price, owned: [...s.owned, itemId] })
          s.toast(t('shop.bought'), 'good')
          get().equip(itemId)
          // Show off new furniture / rooms right away.
          if (item.category === 'furniture' || item.category === 'rooms') set({ shopTab: null })
          return true
        },

        equip: (itemId) => {
          const s = get()
          const item = ITEM_BY_ID[itemId]
          if (!item || !s.owned.includes(itemId)) return
          if (item.category === 'furniture') set({ equipped: { ...s.equipped, [item.slot]: itemId } })
          else if (item.category === 'rooms') set({ theme: item.theme, location: 'house' })
          else if (item.category === 'garden') set({ location: 'garden', shopTab: null })
        },

        goTo: (location) => {
          const s = get()
          if (location === 'garden' && !s.owned.includes('garden')) return
          if (s.location === location) return
          if (s.sleeping) return s.toast(t('toast.sleeping', { name: s.pet?.name ?? '' }), 'info')
          set({ location, activity: idle(), foodMenuOpen: false, toyMenuOpen: false })
        },

        setToyMenu: (open) => set({ toyMenuOpen: open, foodMenuOpen: false }),
        openShop: (tab) => set({ shopTab: tab, foodMenuOpen: false, toyMenuOpen: false }),
        stroke: () => void begin({ kind: 'pet' }),

        toggleSleep: () => {
          const s = get()
          if (!s.pet) return
          if (s.sleeping) return set({ sleeping: false, activity: idle() })
          if (s.activity.kind !== 'idle') return s.toast(t('toast.busy', { name: s.pet.name }), 'info')
          set({ sleeping: true, location: 'house', activity: { kind: 'sleep', id: nextId() }, foodMenuOpen: false, toyMenuOpen: false })
        },

        cleanPoop: (id) => {
          const s = get()
          if (!s.poops.some((p) => p.id === id)) return
          set({ poops: s.poops.filter((p) => p.id !== id) })
          reward(care.cleanPoop(get().stats), 'toast.cleanedPoop')
        },

        completeActivity: (activity) => {
          const s = get()
          if (!s.pet || s.activity.id !== activity.id) return
          const species = PETS[s.pet.species]
          const fx = furnitureEffects(s.equipped)
          const counts = { ...s.counts, [activity.kind]: (s.counts[activity.kind] ?? 0) + 1 }
          set({ activity: idle(), counts })
          switch (activity.kind) {
            case 'eat': {
              const r = care.feed(s.stats, activity.foodId ?? 'apple', species, fx)
              return reward(r, r.favorite ? 'toast.favorite' : 'toast.yummy')
            }
            case 'toilet':
              return reward(care.relieve(s.stats, fx), 'toast.relieved')
            case 'wash':
              return reward(care.wash(s.stats, fx), 'toast.clean')
            case 'play':
              return reward(care.play(s.stats, activity.toy ?? 'ball', species, s.location === 'garden'), 'toast.played')
            case 'pet':
              return reward(care.stroke(s.stats), 'toast.petted')
          }
        },

        setFoodMenu: (open) => set({ foodMenuOpen: open, toyMenuOpen: false }),
        toggleMute: () => set((s) => ({ muted: !s.muted })),
        toast: (text, tone = 'info') => {
          const id = nextId()
          set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, tone }] }))
          setTimeout(() => get().dismissToast(id), 2600)
        },
        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
        dismissWelcome: () => set({ welcome: null }),
        reset: () => set({ pet: null }),
      }
    },
    {
      name: 'petpal-save-v1',
      version: 2,
      migrate: (persisted, version) => {
        const p = persisted as Partial<GameState>
        if (version < 2 && p.pet) {
          // v1 saves had no shop: give them the starter kit for their species.
          p.theme = 'cozy'
          p.owned = starterItems(PETS[p.pet.species].favoriteToy, 'cozy')
          p.equipped = { ...DEFAULT_EQUIPPED }
          p.location = 'house'
        }
        return p as GameState
      },
      partialize: (s) => ({
        pet: s.pet,
        stats: s.stats,
        coins: s.coins,
        lastTick: s.lastTick,
        sleeping: s.sleeping,
        poops: s.poops,
        muted: s.muted,
        counts: s.counts,
        theme: s.theme,
        owned: s.owned,
        equipped: s.equipped,
        location: s.location,
      }),
    },
  ),
)
