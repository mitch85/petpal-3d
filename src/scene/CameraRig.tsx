import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Vector3, type PerspectiveCamera } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { runtime } from '../pets/runtime'
import { CAMERA } from './layout'

/** Limited orbit (swipe), pinch zoom, double-tap focuses the pet. */
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null)
  const gl = useThree((s) => s.gl)
  const aspect = useThree((s) => s.size.width / s.size.height)
  const camera = useThree((s) => s.camera) as PerspectiveCamera

  // Portrait phones see less horizontally: widen FOV and step back.
  useLayoutEffect(() => {
    const portrait = aspect < 0.8
    camera.fov = portrait ? 46 : 38
    camera.updateProjectionMatrix()
    const dir = CAMERA.position.clone().sub(CAMERA.target).normalize()
    const dist = portrait ? 12 + (0.8 - aspect) * 11 : 12
    camera.position.copy(CAMERA.target).addScaledVector(dir, dist)
    controls.current?.update()
  }, [aspect, camera])
  const focus = useRef({ until: 0, target: new Vector3() })
  const lastTap = useRef({ t: 0, x: 0, y: 0 })
  const seen = useRef(0)

  useEffect(() => {
    const el = gl.domElement
    const onUp = (e: PointerEvent) => {
      const now = performance.now()
      const l = lastTap.current
      if (now - l.t < 320 && Math.hypot(e.clientX - l.x, e.clientY - l.y) < 30) {
        runtime.focusRequest++
        l.t = 0
      } else lastTap.current = { t: now, x: e.clientX, y: e.clientY }
    }
    el.addEventListener('pointerup', onUp)
    return () => el.removeEventListener('pointerup', onUp)
  }, [gl])

  useFrame(({ clock }, dt) => {
    const c = controls.current
    if (!c) return
    if (runtime.focusRequest !== seen.current) {
      seen.current = runtime.focusRequest
      focus.current.until = clock.elapsedTime + 0.9
    }
    if (clock.elapsedTime < focus.current.until) {
      focus.current.target.set(runtime.petPos.x, 0.6, runtime.petPos.z)
      const k = 1 - Math.exp(-6 * dt)
      const delta = focus.current.target.clone().sub(c.target).multiplyScalar(k)
      c.target.add(delta)
      c.object.position.add(delta)
      // also dolly in a little
      const dir = c.object.position.clone().sub(c.target)
      const len = dir.length()
      dir.setLength(len + (Math.min(len, 8) - len) * k)
      c.object.position.copy(c.target).add(dir)
      c.update()
    }
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={CAMERA.target}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.6}
      minDistance={4}
      maxDistance={20}
      minPolarAngle={0.45}
      maxPolarAngle={1.32}
      minAzimuthAngle={-0.05}
      maxAzimuthAngle={1.55}
    />
  )
}
