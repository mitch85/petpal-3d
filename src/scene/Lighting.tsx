import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Color, MathUtils, type AmbientLight, type DirectionalLight, type HemisphereLight } from 'three'
import { runtime } from '../pets/runtime'
import { useGame } from '../store/gameStore'

/** Daylight 0..1 from the real clock (dawn 6–8, dusk 18–20). `?hour=21` overrides for testing. */
export function daylightAt(date = new Date()) {
  const q = new URLSearchParams(location.search).get('hour')
  const h = q !== null ? Number(q) : date.getHours() + date.getMinutes() / 60
  if (h < 6 || h >= 20) return 0
  if (h < 8) return (h - 6) / 2
  if (h >= 18) return 1 - (h - 18) / 2
  return 1
}

const C = {
  bgDay: new Color('#FFE9D6'),
  bgGarden: new Color('#BFE3FF'),
  bgNight: new Color('#3B3468'),
  bgDark: new Color('#16142B'),
  sunDay: new Color('#FFF1DC'),
  sunNight: new Color('#C9C4FF'),
  skyDay: new Color('#FFFFFF'),
  skyNight: new Color('#A7A3EA'),
  groundDay: new Color('#F6C9AE'),
  groundNight: new Color('#7A5C8E'),
  moon: new Color('#8F9CFF'),
  moonSky: new Color('#7F86E0'),
  moonGround: new Color('#43407A'),
}

export function Lighting() {
  const sun = useRef<DirectionalLight>(null)
  const hemi = useRef<HemisphereLight>(null)
  const amb = useRef<AmbientLight>(null)
  const scene = useThree((s) => s.scene)
  const bg = useRef(new Color())

  useFrame((_, dt) => {
    const { sleeping, location } = useGame.getState()
    runtime.daylight = MathUtils.damp(runtime.daylight, daylightAt(), 1.5, dt)
    runtime.dark = MathUtils.damp(runtime.dark, sleeping ? 1 : 0, 2.2, dt)
    const d = runtime.daylight
    const k = 1 - runtime.dark * 0.45

    if (sun.current) {
      sun.current.color.copy(C.sunNight).lerp(C.sunDay, d).lerp(C.moon, runtime.dark * 0.8)
      sun.current.intensity = (1.1 + d * 0.85) * k
    }
    if (hemi.current) {
      hemi.current.color.copy(C.skyNight).lerp(C.skyDay, d)
      hemi.current.groundColor.copy(C.groundNight).lerp(C.groundDay, d).lerp(C.moonGround, runtime.dark * 0.8)
      hemi.current.color.lerp(C.moonSky, runtime.dark * 0.8)
      hemi.current.intensity = (1.6 - d * 0.35) * k
    }
    if (amb.current) amb.current.intensity = (0.4 - d * 0.1) * k
    bg.current.copy(C.bgNight).lerp(location === 'garden' ? C.bgGarden : C.bgDay, d).lerp(C.bgDark, runtime.dark * 0.8)
    scene.background = bg.current
  })

  return (
    <>
      <hemisphereLight ref={hemi} intensity={1.4} />
      <ambientLight ref={amb} intensity={0.4} />
      <directionalLight
        ref={sun}
        position={[5, 9, 6]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={25}
      />
    </>
  )
}
