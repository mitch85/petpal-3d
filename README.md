# PetPal 3D

Tamagotchi-style virtual pet in 3D (React + TypeScript + Vite + React Three Fiber).

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest: stat logic + pet behaviour routines
npm run build    # production build incl. PWA service worker
```

Dev helpers: `?play` skips the start screen (if a pet exists), `?hour=21` overrides the
day/night clock. In dev, `window.game` (Zustand store) and `window.runtime` are exposed.

## Structure

| Folder | Contents |
| --- | --- |
| `src/game/` | Pure game logic: `pets.config.ts` (species), `stats.ts` (tick, offline catch-up, mood, age), `care.ts` (actions), `foods.ts` |
| `src/store/` | Zustand store with `persist` (LocalStorage) |
| `src/pets/` | `<Pet />`, `PetBrain` (behaviour routines as generators), `pose.ts` (model-agnostic pose + crossfade), `PlaceholderPet`, `GlbPet` |
| `src/scene/` | Room, lighting & day/night, camera, particles, props, materials/textures |
| `src/ui/` | Design tokens, custom icon set, HUD, action bar, menus, screens |
| `src/i18n/` | UI strings (German), `t()` helper |
| `public/models/` | Drop GLB models here and reference them via `model` in `pets.config.ts` |

## Adding a real model

Set `model: { url: '/models/cat.glb', scale: 1, clips: { idle: 'Idle', walk: 'Walk', eat: 'Eat', sleep: 'Sleep', ... } }`
on a species. `<Pet />` then renders the GLB and crossfades clips based on the brain's pose.
