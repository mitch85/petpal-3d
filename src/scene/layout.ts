import { Vector3 } from 'three'

export const ROOM = { half: 4, height: 3.4, wall: 0.24 }

/** Important places in the house the pet walks to. */
export const SPOTS = {
  bowl: new Vector3(-2.45, 0, 0.55),
  eat: new Vector3(-3.1, 0, -0.05),
  water: new Vector3(-3.05, 0, 1.25),
  litter: new Vector3(0.75, 0, -2.85),
  litterFront: new Vector3(0.75, 0, -1.65),
  bed: new Vector3(-2.55, 0, -2.45),
  bedFront: new Vector3(-1.6, 0, -1.6),
  tub: new Vector3(2.5, 0, 0.75),
  tubFront: new Vector3(1.35, 0, 1.05),
  stage: new Vector3(0.2, 0, 0.6),
  play: new Vector3(0.0, 0, 0.2),
  basket: new Vector3(0.9, 0, 2.75),
}

/** Tub footprint (long axis along z). */
export const TUB = { halfX: 0.48, halfZ: 0.78, floor: 0.24 }

/** Walkable area for wandering / playing, per location. */
export const BOUNDS = {
  house: { minX: -2.2, maxX: 1.5, minZ: -1.6, maxZ: 2.4 },
  garden: { minX: -3.6, maxX: 3.0, minZ: -3.0, maxZ: 3.0 },
}

export const GARDEN_SPOTS = {
  stage: new Vector3(0.3, 0, 1.0),
  door: new Vector3(-0.8, 0, -3.0),
  pond: new Vector3(2.3, 0, -1.6),
  pondRadius: 1.35,
}

export const CAMERA = {
  position: new Vector3(7.2, 5.6, 8.2),
  target: new Vector3(-0.6, 0.6, -0.6),
}
