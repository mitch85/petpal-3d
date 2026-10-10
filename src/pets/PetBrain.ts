import { MathUtils, Vector3, type Camera } from 'three'
import { sfx } from '../assets/sfx'
import type { SpeciesConfig } from '../game/pets.config'
import type { Activity, Mood } from '../game/types'
import type { FurnitureSlot, Location, ToyId } from '../game/types'
import { SURFACE } from '../scene/Furniture'
import { BOUNDS, GARDEN_SPOTS, SPOTS, TUB } from '../scene/layout'
import { createPose, neutral, type PetPose } from './pose'
import { emit, runtime } from './runtime'

export type Emote = 'hungry' | 'toilet' | 'sleepy' | 'sick' | 'sad' | 'dirty' | 'heart' | null

/** A behaviour routine: a generator advanced once per frame with `dt`. */
type Routine = Generator<void, void, number>

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const TAU = Math.PI * 2
const angleTo = (from: Vector3, to: Vector3) => Math.atan2(to.x - from.x, to.z - from.z)
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

/** Height of furniture the pet can stand on (house only). */
function groundAt(x: number, z: number, furniture: Record<FurnitureSlot, string>) {
  if (Math.abs(x - SPOTS.litter.x) < 0.55 && Math.abs(z - SPOTS.litter.z) < 0.45) return SURFACE[furniture.litter] ?? 0.18
  if (Math.hypot(x - SPOTS.bed.x, z - SPOTS.bed.z) < 0.75) return SURFACE[furniture.bed] ?? 0.2
  if (Math.abs(x - SPOTS.tub.x) < TUB.halfX - 0.05 && Math.abs(z - SPOTS.tub.z) < TUB.halfZ - 0.05) return TUB.floor
  return 0
}

/**
 * The pet's "brain": turns the current activity + mood into a target pose
 * and a position in the room. Model-independent – drives placeholder and
 * GLB pets alike.
 */
export class PetBrain {
  readonly pose = createPose()
  readonly pos = new Vector3(0.4, 0, 0.9)
  heading = 0.5
  time = 0
  mood: Mood = 'content'
  emote: Emote = null
  camera: Camera | null = null
  onComplete: (a: Activity) => void = () => {}
  furniture: Record<FurnitureSlot, string> = { bed: 'bed_basic', bowl: 'bowl_basic', litter: 'litter_basic', tub: 'tub_basic' }
  location: Location = 'house'

  private routine: Routine
  private activity: Activity | null = null
  private dt = 0
  private pokeUntil = 0
  private emoteOverride: Emote | undefined = undefined

  species: SpeciesConfig
  scale: number

  constructor(species: SpeciesConfig, scale = 1) {
    this.species = species
    this.scale = scale
    this.routine = this.idle()
  }

  /** Switch behaviour when the store's activity changes. */
  setActivity(a: Activity) {
    if (this.activity?.id === a.id) return
    const prev = this.activity
    this.activity = a
    this.cleanupProps()
    this.emoteOverride = undefined
    switch (a.kind) {
      case 'eat': this.routine = this.eat(a); break
      case 'toilet': this.routine = this.toilet(a); break
      case 'sleep': this.routine = this.sleep(); break
      case 'play': this.routine = this.play(a.toy ?? 'ball'); break
      case 'pet': this.routine = this.stroke(a); break
      case 'wash': this.routine = this.wash(a); break
      default: this.routine = prev?.kind === 'sleep' ? this.wakeUp() : this.idle()
    }
  }

  /** Move between house and garden: pop in at the new place. */
  setLocation(loc: Location) {
    if (loc === this.location) return
    this.location = loc
    this.cleanupProps()
    this.pos.copy(loc === 'garden' ? GARDEN_SPOTS.door : SPOTS.stage).setY(0)
    this.heading = this.faceCameraAngle()
    this.routine = this.arrive()
    emit('puff', this.pos.clone().setY(0.3), 8)
    emit('sparkle', this.pos.clone().setY(0.6), 5)
  }

  /** Quick tap reaction on top of whatever is going on. */
  poke() {
    if (this.activity?.kind === 'sleep') return
    this.pokeUntil = this.time + 0.55
    sfx.squeak()
    emit('heart', this.headPos(), 1)
  }

  update(dt: number) {
    this.dt = Math.min(dt, 0.05)
    this.time += this.dt
    const p = this.pose
    neutral(p)
    this.applyMood(p)
    const r = this.routine.next(this.dt)
    if (r.done) {
      const a = this.activity
      if (a && a.kind !== 'idle' && a.kind !== 'sleep') this.onComplete(a)
      this.routine = this.idle()
    }
    // tap overlay: little squashy hop
    if (this.time < this.pokeUntil) {
      const k = 1 - (this.pokeUntil - this.time) / 0.55
      p.hop += Math.sin(k * Math.PI) * 0.22
      p.squash = 1 + Math.sin(k * Math.PI * 2) * 0.12
      p.eyes = 'happy'
      p.mouth = 'open'
    }
    // ground following
    this.pos.y = MathUtils.damp(this.pos.y, this.location === 'house' ? groundAt(this.pos.x, this.pos.z, this.furniture) : 0, 10, this.dt)
    runtime.petPos.copy(this.pos)
    runtime.petHeading = this.heading
    runtime.petHead.copy(this.headPos())
    this.emote = this.emoteOverride !== undefined ? this.emoteOverride : this.moodEmote()
  }

  headPos(out = new Vector3()) {
    const look = this.species.look
    const upright = look.body[1] > look.body[2]
    const h = (upright ? 0.07 + look.body[1] : 0.2 + look.body[1] * 1.05) + look.headSize * 0.6
    const fwd = upright ? 0.05 : look.body[2] * 0.38
    return out.set(this.pos.x + Math.sin(this.heading) * fwd * this.scale, this.pos.y + (h + this.pose.hop) * this.scale, this.pos.z + Math.cos(this.heading) * fwd * this.scale)
  }

  /* ---------------- mood ---------------- */

  private applyMood(p: PetPose) {
    switch (this.mood) {
      case 'happy':
        p.tailAmp = 0.45; p.tailSpeed = 5; p.blush = 1
        break
      case 'sad':
        p.eyes = 'sad'; p.mouth = 'frown'; p.earDroop = 0.8; p.tailAmp = 0.08; p.headPitch = 0.15; p.blush = 0.3
        break
      case 'sick':
        p.eyes = 'sad'; p.mouth = 'flat'; p.earDroop = 1; p.tailAmp = 0.04; p.headPitch = 0.25; p.blush = 0; p.breathRate = 3.5
        p.roll = Math.sin(this.time * 1.5) * 0.04
        break
      case 'hungry':
        p.mouth = 'flat'; p.earDroop = 0.4; p.tailAmp = 0.15
        break
      case 'sleepy':
        p.eyes = Math.sin(this.time * 0.8) > 0.3 ? 'closed' : 'sad'; p.earDroop = 0.5; p.breathRate = 1.4; p.headPitch = 0.2
        break
      case 'dirty':
        p.mouth = 'flat'; p.earDroop = 0.3
        break
    }
  }

  private moodEmote(): Emote {
    if (this.activity && this.activity.kind !== 'idle') return null
    const show = this.time % 9 < 4.5
    if (!show) return null
    switch (this.mood) {
      case 'hungry': return 'hungry'
      case 'needsToilet': return 'toilet'
      case 'sleepy': return 'sleepy'
      case 'sick': return 'sick'
      case 'sad': return 'sad'
      case 'dirty': return 'dirty'
      default: return null
    }
  }

  private get speedMul() {
    return this.mood === 'sick' ? 0.45 : this.mood === 'sad' || this.mood === 'sleepy' ? 0.65 : 1
  }

  private cleanupProps() {
    runtime.food.id = null
    runtime.toy.visible = false
    runtime.toy.held = false
    runtime.toy.kind = null
    runtime.bath = false
  }

  private get bounds() {
    return BOUNDS[this.location]
  }

  private get stage() {
    return this.location === 'garden' ? GARDEN_SPOTS.stage : SPOTS.stage
  }

  /** Keep points out of the pond (garden) and the tub (house). */
  private walkable(p: Vector3) {
    if (this.location === 'garden') return Math.hypot(p.x - GARDEN_SPOTS.pond.x, p.z - GARDEN_SPOTS.pond.z) > GARDEN_SPOTS.pondRadius
    return !(Math.abs(p.x - SPOTS.tub.x) < TUB.halfX + 0.4 && Math.abs(p.z - SPOTS.tub.z) < TUB.halfZ + 0.4)
  }

  private faceCameraAngle() {
    const c = this.camera?.position ?? new Vector3(7, 5, 8)
    return angleTo(this.pos, c)
  }

  /* ---------------- building blocks ---------------- */

  private *wait(sec: number, each?: (k: number, p: PetPose) => void): Routine {
    let t = 0
    while (t < sec) {
      each?.(t / sec, this.pose)
      t += yield
    }
  }

  private *turnTo(angle: number, each?: (p: PetPose) => void): Routine {
    while (Math.abs(wrap(angle - this.heading)) > 0.06) {
      const dt: number = yield
      this.heading += wrap(angle - this.heading) * (1 - Math.exp(-9 * dt))
      this.pose.walk = 0.5
      this.pose.walkPhase += dt * 8
      each?.(this.pose)
    }
  }

  private stepWalk(dest: Vector3, speed: number, dt: number) {
    const p = this.pose
    const want = angleTo(this.pos, dest)
    this.heading += wrap(want - this.heading) * (1 - Math.exp(-8 * dt))
    const facing = Math.cos(wrap(want - this.heading))
    const dist = Math.hypot(dest.x - this.pos.x, dest.z - this.pos.z)
    const v = speed * Math.max(0.15, facing) * Math.min(1, dist * 3 + 0.3)
    this.pos.x += Math.sin(this.heading) * v * dt
    this.pos.z += Math.cos(this.heading) * v * dt
    p.walk = 1
    p.clip = 'walk'
    p.walkPhase += v * dt * 9
    const ph = p.walkPhase
    switch (this.species.walkStyle) {
      case 'hop':
        p.walk = 0.4
        p.hop = Math.abs(Math.sin(ph * 0.5)) * 0.2
        p.squash = 1 + Math.cos(ph) * 0.06
        p.lean = -Math.cos(ph * 0.5) * 0.12
        break
      case 'waddle':
        p.roll = Math.sin(ph * 0.5) * 0.16
        p.hop = Math.abs(Math.sin(ph * 0.5)) * 0.03
        break
      default:
        p.hop = Math.abs(Math.sin(ph)) * 0.035
        p.headPitch += Math.sin(ph * 2) * 0.03
    }
    return dist
  }

  private *walkTo(dest: Vector3, speedMul = 1, each?: (p: PetPose) => void): Routine {
    const speed = this.species.walkSpeed * speedMul * this.speedMul * Math.max(0.8, this.scale)
    for (;;) {
      const dt: number = yield
      each?.(this.pose)
      if (this.stepWalk(dest, speed, dt) < 0.06) break
    }
  }

  private *jump(height = 0.35, dur = 0.5, each?: (p: PetPose) => void): Routine {
    // anticipation squash -> stretch in air -> landing squash
    yield* this.wait(0.12, (k, p) => { p.squash = 1 - 0.18 * Math.sin(k * Math.PI); p.crouch = 0.3 })
    sfx.boing()
    yield* this.wait(dur, (k, p) => {
      p.hop = 4 * height * k * (1 - k)
      p.squash = 1 + 0.15 * Math.sin(k * Math.PI)
      p.eyes = 'happy'
      p.mouth = 'open'
      each?.(p)
    })
    yield* this.wait(0.12, (k, p) => { p.squash = 1 - 0.15 * Math.sin(k * Math.PI) })
  }

  private *celebrate(dur = 1.4): Routine {
    sfx.happy()
    const fx = this.species.happyFx
    let next = 0
    yield* this.wait(dur, (k, p) => {
      p.eyes = 'happy'
      p.mouth = 'open'
      p.blush = 1.3
      p.hop = Math.abs(Math.sin(k * Math.PI * 3)) * 0.22
      p.squash = 1 + Math.sin(k * Math.PI * 6) * 0.06
      p.tailAmp = 0.7
      p.tailSpeed = fx === 'wag' ? 22 : 9
      p.wing = 1
      if (this.time > next) {
        next = this.time + 0.22
        const at = this.headPos()
        if (fx === 'sparks') emit('spark', at.add(new Vector3(Math.sin(this.heading) * 0.35, -0.1, Math.cos(this.heading) * 0.35)), 4)
        else if (fx === 'wag') emit('note', at, 1)
        else emit('heart', at, 1)
      }
    })
  }

  private randomPoint(margin = 0) {
    const b = this.bounds
    const p = new Vector3()
    for (let i = 0; i < 12; i++) {
      p.set(rand(b.minX + margin, b.maxX - margin), 0, rand(b.minZ + margin, b.maxZ - margin))
      if (this.walkable(p) && this.clearPath(this.pos, p)) break
    }
    return p
  }

  /** Straight walk from a to b must not cross the pond / tub (sampled). */
  private clearPath(a: Vector3, b: Vector3) {
    const q = new Vector3()
    for (let i = 1; i < 10; i++) if (!this.walkable(q.lerpVectors(a, b, i / 10))) return false
    return true
  }

  private *arrive(): Routine {
    yield* this.jump(0.3, 0.45)
    yield* this.lookAround(1.6)
    yield* this.idle()
  }

  /* ---------------- routines ---------------- */

  private *idle(): Routine {
    yield* this.wait(rand(0.6, 1.4))
    for (;;) {
      const r = Math.random()
      if (this.mood === 'needsToilet') {
        yield* this.fidget(2.2)
        yield* this.wait(1)
        continue
      }
      if (this.mood === 'sick') {
        yield* this.wait(3, (_, p) => { p.crouch = 0.4; p.lie = 0.3 })
        if (r < 0.4) yield* this.walkTo(this.randomPoint(), 0.6)
        continue
      }
      if (r < 0.32) yield* this.walkTo(this.randomPoint())
      else if (r < 0.5) yield* this.lookAround(rand(2.5, 4))
      else if (r < 0.64) yield* this.sit(rand(3, 5))
      else if (r < 0.74) {
        yield* this.turnTo(this.faceCameraAngle())
        yield* this.curious(2.2)
      } else if (r < 0.84) yield* this.groom(2.4)
      else if (r < 0.92 && this.mood === 'happy') yield* this.jump(0.3, 0.45)
      else yield* this.stretch()
      yield* this.wait(rand(0.8, 2.2), (k, p) => {
        p.headYaw = Math.sin(this.time * 0.7) * 0.15
        p.lookX = Math.sin(this.time * 0.5) * 0.6
        void k
      })
    }
  }

  private *lookAround(dur: number): Routine {
    const a = rand(-0.7, 0.7)
    const b = rand(-0.7, 0.7)
    yield* this.wait(dur, (k, p) => {
      const yaw = k < 0.45 ? a : k < 0.9 ? b : 0
      p.headYaw = yaw
      p.lookX = Math.sign(yaw) * 0.8
      p.headTilt = yaw * 0.25
      p.headPitch += k > 0.3 && k < 0.6 ? -0.15 : 0
    })
  }

  private *sit(dur: number): Routine {
    yield* this.wait(dur, (k, p) => {
      p.crouch = 0.65
      p.clip = 'sit'
      p.lean = -0.15
      p.headYaw = Math.sin(k * TAU) * 0.3
      p.tailAmp = 0.15
    })
  }

  private *curious(dur: number): Routine {
    yield* this.wait(dur, (k, p) => {
      p.headTilt = Math.sin(k * Math.PI) * (k < 0.5 ? 0.35 : -0.3)
      p.earDroop = Math.max(p.earDroop - 0.2, 0)
      p.lookY = 0.3
      p.mouth = k > 0.4 && k < 0.6 ? 'open' : p.mouth
    })
  }

  private *groom(dur: number): Routine {
    yield* this.wait(dur, (k, p) => {
      p.crouch = 0.5
      p.headPitch = 0.55
      p.headYaw = 0.6
      p.headTilt = 0.2 + Math.sin(k * 30) * 0.08
      p.eyes = 'closed'
      p.mouth = 'open'
    })
  }

  private *stretch(): Routine {
    yield* this.wait(1.6, (k, p) => {
      const s = Math.sin(k * Math.PI)
      p.lean = 0.25 * s
      p.crouch = 0.3 * s
      p.headPitch = -0.35 * s
      p.eyes = s > 0.5 ? 'closed' : 'open'
      p.mouth = s > 0.6 ? 'open' : 'smile'
      p.squash = 1 - 0.08 * s
    })
  }

  private *fidget(dur: number): Routine {
    this.emoteOverride = 'toilet'
    yield* this.wait(dur, (_, p) => {
      p.roll = Math.sin(this.time * 18) * 0.08
      p.hop = Math.abs(Math.sin(this.time * 9)) * 0.05
      p.eyes = 'squint'
      p.mouth = 'flat'
      p.tailSpeed = 14
      p.tailAmp = 0.4
      p.headYaw = Math.sin(this.time * 3) * 0.4
    })
    this.emoteOverride = undefined
  }

  private *eat(a: Activity): Routine {
    runtime.food.id = a.foodId ?? 'apple'
    runtime.food.progress = 0
    sfx.pop()
    emit('sparkle', SPOTS.bowl.clone().setY(0.3), 5)
    yield* this.turnTo(angleTo(this.pos, SPOTS.bowl))
    yield* this.jump(0.2, 0.35)
    yield* this.walkTo(SPOTS.eat, 1.3)
    yield* this.turnTo(angleTo(this.pos, SPOTS.bowl))
    let nextChew = 0
    yield* this.wait(4, (k, p) => {
      runtime.food.progress = k
      p.clip = 'eat'
      p.crouch = 0.55
      p.headPitch = 0.55 + Math.sin(this.time * 11) * 0.06
      p.mouth = 'chew'
      p.eyes = k > 0.5 ? 'happy' : 'open'
      p.tailAmp = 0.5
      p.tailSpeed = 6
      if (this.time > nextChew) {
        nextChew = this.time + 0.32
        sfx.chew()
        emit('crumb', SPOTS.bowl.clone().setY(0.25), 2)
      }
    })
    runtime.food.id = null
    yield* this.wait(0.5, (_, p) => { p.mouth = 'chew'; p.eyes = 'happy' })
    this.emoteOverride = 'heart'
    yield* this.celebrate(this.species.favoriteFood === a.foodId ? 1.8 : 1.2)
  }

  private *toilet(_a: Activity): Routine {
    this.emoteOverride = 'toilet'
    yield* this.wait(1.0, (_, p) => {
      p.roll = Math.sin(this.time * 18) * 0.08
      p.eyes = 'squint'
      p.mouth = 'flat'
    })
    yield* this.walkTo(SPOTS.litterFront, 1.4)
    yield* this.jump(0.25, 0.35)
    yield* this.walkTo(SPOTS.litter, 0.8)
    yield* this.turnTo(this.faceCameraAngle())
    this.emoteOverride = null
    yield* this.wait(2.6, (k, p) => {
      p.clip = 'sit'
      p.crouch = 1
      p.eyes = k > 0.85 ? 'closed' : 'squint'
      p.mouth = 'flat'
      p.roll = Math.sin(this.time * 30) * 0.015
      p.tailAmp = 0
      p.blush = 1.4
      p.earDroop = 0.2
    })
    sfx.plop()
    emit('sparkle', this.pos.clone().setY(this.pos.y + 0.4), 6)
    yield* this.wait(1.1, (k, p) => {
      p.eyes = 'happy'
      p.mouth = 'open'
      p.squash = 1 + Math.sin(k * Math.PI) * 0.1
      p.hop = Math.sin(k * Math.PI) * 0.1
      p.breathRate = 6
    })
    yield* this.walkTo(SPOTS.litterFront)
    this.emoteOverride = 'heart'
    yield* this.celebrate(0.8)
  }

  private *sleep(): Routine {
    this.emoteOverride = null
    yield* this.walkTo(SPOTS.bedFront, 0.9, (p) => { p.eyes = 'sad' })
    yield* this.walkTo(SPOTS.bed, 0.7)
    // circle once, then flop down
    const start = this.heading
    yield* this.wait(1.0, (k) => { this.heading = start + k * TAU; this.pose.walk = 0.6; this.pose.walkPhase += 0.3 })
    yield* this.turnTo(this.faceCameraAngle() + 0.5)
    yield* this.wait(0.6, (k, p) => { p.lie = k; p.eyes = 'closed'; p.mouth = 'open' })
    let nextZ = 0
    for (;;) {
      yield* this.wait(1, (_, p) => {
        p.clip = 'sleep'
        p.lie = 1
        p.eyes = 'closed'
        p.mouth = 'flat'
        p.breathRate = 1.1
        p.headPitch = 0.08
        p.headTilt = 0.3
        p.tailAmp = 0.04
        p.tailSpeed = 0.8
        p.earDroop = 0.6
        p.blush = 0.9
        if (this.time > nextZ) {
          nextZ = this.time + 1.7
          emit('zzz', this.headPos().add(new Vector3(0.15, 0.1, 0)), 1)
        }
      })
    }
  }

  private *wakeUp(): Routine {
    yield* this.wait(1.4, (k, p) => {
      const s = Math.sin(k * Math.PI)
      p.lie = 1 - k
      p.mouth = s > 0.4 ? 'open' : 'flat'
      p.eyes = k < 0.7 ? 'closed' : 'open'
      p.lean = 0.2 * s
      p.headPitch = -0.3 * s
    })
    yield* this.walkTo(SPOTS.bedFront)
    yield* this.idle()
  }

  private *play(toy: ToyId): Routine {
    const t = runtime.toy
    t.kind = toy
    t.held = false
    t.roll = 0
    t.yaw = 0
    switch (toy) {
      case 'ball':
        yield* this.fetch(3, { flight: 0.9, arc: 1.6, catchHeight: 0 })
        break
      case 'frisbee':
        yield* this.fetch(3, { flight: 1.25, arc: 0.7, catchHeight: 0.55 })
        break
      case 'laser':
      case 'mouse':
        yield* this.chase(toy)
        break
      case 'yarn':
        yield* this.batYarn()
        break
    }
    t.visible = false
    t.kind = null
    this.emoteOverride = 'heart'
    yield* this.celebrate(1.4)
  }

  /** Thrown toy: watch, run, catch (in the air for frisbees), bring it back. */
  private *fetch(rounds: number, o: { flight: number; arc: number; catchHeight: number }): Routine {
    const toy = runtime.toy
    for (let i = 0; i < rounds; i++) {
      const cam = this.camera?.position ?? new Vector3(7, 5, 8)
      const start = new Vector3().copy(cam).lerp(new Vector3(0, 1.4, 0), 0.7).setY(1.6)
      const land = this.randomPoint(0.3)
      const flying = o.catchHeight > 0
      toy.visible = true
      toy.held = false
      sfx.whoosh()
      // Frisbee: the pet sprints while it glides and snatches it mid-air.
      let k = 0
      const end = land.clone().setY(o.catchHeight)
      const at = (u: number) => {
        toy.pos.lerpVectors(start, end, u)
        toy.pos.y += Math.sin(u * Math.PI) * o.arc
        if (flying) toy.yaw += 0.4
        else toy.roll += 0.25
      }
      if (flying) {
        while (k < 1) {
          const dt: number = yield
          k = Math.min(1, k + dt / o.flight)
          at(k)
          if (k > 0.2) this.stepWalk(land, this.species.walkSpeed * 2, dt)
          this.pose.eyes = 'open'
          this.pose.tailAmp = 0.7
          this.pose.tailSpeed = 16
        }
        yield* this.walkTo(land, 2)
        // leap and catch
        yield* this.jump(0.45, 0.42, () => this.holdToy())
      } else {
        yield* this.wait(o.flight, (u, p) => {
          at(u)
          this.heading += wrap(angleTo(this.pos, toy.pos) - this.heading) * 0.15
          p.eyes = 'open'
          p.lookY = 0.5
          p.headPitch = -0.3
          p.tailAmp = 0.6
          p.tailSpeed = 14
          p.crouch = 0.35
        })
        sfx.boing()
        let bt = 0
        yield* this.walkTo(land, 1.8, () => {
          bt += this.dt
          toy.pos.y = Math.abs(Math.sin(bt * 7)) * 0.3 * Math.exp(-bt * 2.5)
          toy.roll += this.dt * 6
        })
        yield* this.jump(0.32, 0.4, () => this.holdToy())
      }
      toy.held = true
      yield* this.walkTo(this.stage, 1.2, () => this.holdToy())
      yield* this.turnTo(this.faceCameraAngle(), () => this.holdToy())
      toy.held = false
      toy.pos.y = 0
      toy.roll = 0
      yield* this.wait(0.7, (u, p) => {
        p.eyes = 'happy'
        p.mouth = 'open'
        p.tailAmp = 0.8
        p.tailSpeed = 20
        p.roll = Math.sin(u * 20) * 0.08
        p.wing = 1
      })
    }
  }

  private holdToy() {
    const h = this.headPos()
    const toy = runtime.toy
    const r = toy.kind === 'frisbee' ? 0.04 : 0.14
    toy.pos.set(h.x + Math.sin(this.heading) * 0.36 * this.scale, h.y - 0.22 * this.scale - r, h.z + Math.cos(this.heading) * 0.36 * this.scale)
    toy.yaw = this.heading
    // frisbees are carried upright, like between the teeth
    toy.roll = toy.kind === 'frisbee' ? Math.PI / 2 : 0
    this.pose.mouth = 'open'
    this.pose.eyes = 'happy'
  }

  /** Laser dot or wind-up mouse zipping around: stalk, wiggle, pounce. */
  private *chase(kind: 'laser' | 'mouse'): Routine {
    const toy = runtime.toy
    toy.visible = true
    const b = this.bounds
    toy.pos.set(this.pos.x + 1, 0, this.pos.z + 0.5)
    const goal = toy.pos.clone()
    const isMouse = kind === 'mouse'
    let retarget = 0
    let pounceCd = 1
    let t = 0
    sfx.squeak()
    while (t < 7.5) {
      const dt: number = yield
      t += dt
      if (t > retarget) {
        retarget = t + (isMouse ? rand(1.0, 1.8) : rand(0.5, 1.3))
        for (let i = 0; i < 12; i++) {
          goal.set(rand(b.minX + 0.4, b.maxX), 0, rand(b.minZ + 0.3, b.maxZ))
          if (this.walkable(goal) && this.clearPath(toy.pos, goal)) break
        }
      }
      if (isMouse) {
        // drives like a little car: turn, then roll forward
        const want = angleTo(toy.pos, goal)
        toy.yaw += wrap(want - toy.yaw) * (1 - Math.exp(-5 * dt))
        const speed = 1.6 * Math.min(1, toy.pos.distanceTo(goal))
        toy.pos.x += Math.sin(toy.yaw) * speed * dt
        toy.pos.z += Math.cos(toy.yaw) * speed * dt
        toy.roll = Math.sin(t * 40) * 0.05
      } else {
        toy.pos.lerp(goal, 1 - Math.exp(-7 * dt))
        toy.pos.x += Math.sin(t * 23) * 0.004
      }
      pounceCd -= dt
      const dist = Math.hypot(toy.pos.x - this.pos.x, toy.pos.z - this.pos.z)
      if (dist < 0.85 && pounceCd < 0) {
        pounceCd = 1.4
        yield* this.turnTo(angleTo(this.pos, toy.pos))
        yield* this.wait(0.45, (_, p) => {
          p.crouch = 0.8
          p.roll = Math.sin(this.time * 30) * 0.1
          p.tailSpeed = 20
          p.tailAmp = 0.5
          p.eyes = 'open'
          p.lookY = -0.4
        })
        const from = this.pos.clone()
        const to = toy.pos.clone()
        sfx.boing()
        yield* this.wait(0.42, (k, p) => {
          this.pos.lerpVectors(from, to, k)
          p.hop = Math.sin(k * Math.PI) * 0.35
          p.squash = 1 + Math.sin(k * Math.PI) * 0.15
          p.eyes = 'happy'
          p.mouth = 'open'
        })
        emit('sparkle', this.pos.clone().setY(0.2), 3)
        if (isMouse) sfx.squeak()
        continue
      }
      if (dist > 0.25) this.stepWalk(toy.pos, this.species.walkSpeed * 1.7, dt)
      this.pose.eyes = 'open'
      this.pose.lookY = -0.4
      this.pose.tailAmp = 0.5
      this.pose.tailSpeed = 12
    }
  }

  /** Yarn ball: walk up, bat it with a paw, watch it roll away – repeat. */
  private *batYarn(): Routine {
    const toy = runtime.toy
    toy.pos.copy(this.randomPoint(0.6))
    toy.visible = true
    sfx.pop()
    for (let i = 0; i < 4; i++) {
      const near = toy.pos.clone().add(this.pos.clone().sub(toy.pos).setY(0).setLength(0.45))
      yield* this.walkTo(near, 1.3)
      yield* this.turnTo(angleTo(this.pos, toy.pos))
      // paw swipe
      yield* this.wait(0.35, (k, p) => {
        p.crouch = 0.5 - k * 0.3
        p.lean = 0.2 * Math.sin(k * Math.PI)
        p.headTilt = 0.3
        p.eyes = 'open'
        p.lookY = -0.5
      })
      sfx.boing()
      const dir = toy.pos.clone().sub(this.pos).setY(0).normalize()
      dir.applyAxisAngle(new Vector3(0, 1, 0), rand(-0.6, 0.6))
      const from = toy.pos.clone()
      let to = from.clone().addScaledVector(dir, rand(1.2, 1.9))
      const b = this.bounds
      to.x = Math.min(b.maxX, Math.max(b.minX, to.x))
      to.z = Math.min(b.maxZ, Math.max(b.minZ, to.z))
      if (!this.walkable(to)) to = from.clone()
      toy.yaw = Math.atan2(dir.x, dir.z)
      yield* this.wait(1.0, (k, p) => {
        const e = 1 - Math.pow(1 - k, 3)
        toy.pos.lerpVectors(from, to, e)
        toy.roll += (1 - k) * 0.35
        p.eyes = k > 0.5 ? 'happy' : 'open'
        p.mouth = 'open'
        p.tailAmp = 0.7
        p.tailSpeed = 14
        this.heading += wrap(angleTo(this.pos, toy.pos) - this.heading) * 0.12
      })
    }
  }

  private *stroke(_a: Activity): Routine {
    yield* this.turnTo(this.faceCameraAngle())
    sfx.squeak()
    this.emoteOverride = 'heart'
    let next = 0
    yield* this.wait(2.8, (k, p) => {
      p.eyes = 'happy'
      p.mouth = k > 0.3 ? 'open' : 'smile'
      p.headTilt = Math.sin(k * TAU * 1.5) * 0.3
      p.roll = Math.sin(k * TAU * 1.5) * 0.08
      p.lean = 0.08
      p.crouch = 0.25
      p.blush = 1.6
      p.tailAmp = 0.6
      p.tailSpeed = this.species.happyFx === 'wag' ? 20 : 6
      p.earDroop = 0.35
      if (this.time > next) {
        next = this.time + 0.35
        emit('heart', this.headPos(), 1)
      }
    })
  }

  private *wash(_a: Activity): Routine {
    yield* this.walkTo(SPOTS.tubFront)
    yield* this.turnTo(angleTo(this.pos, SPOTS.tub))
    // hop into the tub
    runtime.bath = true
    sfx.splash()
    const from = this.pos.clone()
    yield* this.wait(0.55, (k, p) => {
      this.pos.x = from.x + (SPOTS.tub.x - from.x) * k
      this.pos.z = from.z + (SPOTS.tub.z - from.z) * k
      p.hop = Math.sin(k * Math.PI) * 0.6
      p.squash = 1 + Math.sin(k * Math.PI) * 0.15
      p.eyes = 'happy'
      p.mouth = 'open'
    })
    emit('drop', this.pos.clone().setY(0.5), 10)
    yield* this.turnTo(this.faceCameraAngle())
    let next = 0
    yield* this.wait(3.4, (k, p) => {
      p.eyes = k < 0.5 ? 'squint' : 'happy'
      p.mouth = k > 0.4 ? 'open' : 'flat'
      p.crouch = 0.35
      p.headTilt = Math.sin(this.time * 4) * 0.18
      p.squash = 1 + Math.sin(this.time * 10) * 0.03
      p.blush = 1.2
      p.tailAmp = 0.6
      p.tailSpeed = 8
      if (this.time > next) {
        next = this.time + 0.07
        const at = this.pos.clone().add(new Vector3(rand(-0.35, 0.35), rand(0.35, 1.0) * this.scale, rand(-0.45, 0.45)))
        emit('bubble', at, 2)
        if (Math.random() < 0.25) sfx.bubble()
      }
    })
    // hop out, then shake dry
    const inTub = this.pos.clone()
    yield* this.turnTo(angleTo(this.pos, SPOTS.tubFront))
    runtime.bath = false
    yield* this.wait(0.55, (k, p) => {
      this.pos.x = inTub.x + (SPOTS.tubFront.x - inTub.x) * k
      this.pos.z = inTub.z + (SPOTS.tubFront.z - inTub.z) * k
      p.hop = Math.sin(k * Math.PI) * 0.6
      p.eyes = 'open'
    })
    yield* this.turnTo(this.faceCameraAngle())
    sfx.splash()
    let nextDrop = 0
    yield* this.wait(1.1, (_, p) => {
      p.shake = 1
      p.eyes = 'closed'
      p.mouth = 'open'
      p.earDroop = Math.sin(this.time * 40) * 0.5 + 0.5
      if (this.time > nextDrop) {
        nextDrop = this.time + 0.05
        emit('drop', this.pos.clone().add(new Vector3(0, 0.5 * this.scale, 0)), 2)
      }
    })
    emit('sparkle', this.headPos(), 6)
    this.emoteOverride = 'heart'
    yield* this.celebrate(1.0)
  }

}
