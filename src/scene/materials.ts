import { Color, DataTexture, MeshToonMaterial, NearestFilter, RedFormat, type ColorRepresentation, type Texture } from 'three'

/** 3-step ramp for the cel-shaded look. */
const gradient = (() => {
  const data = new Uint8Array([120, 195, 255])
  const tex = new DataTexture(data, data.length, 1, RedFormat)
  tex.minFilter = tex.magFilter = NearestFilter
  tex.needsUpdate = true
  return tex
})()

const cache = new Map<string, MeshToonMaterial>()

/** Shared toon material per colour (+ optional map / emissive). */
export function toon(color: ColorRepresentation, opts: { map?: Texture; emissive?: string; emissiveIntensity?: number } = {}) {
  const key = `${new Color(color).getHexString()}|${opts.map?.uuid ?? ''}|${opts.emissive ?? ''}|${opts.emissiveIntensity ?? ''}`
  let m = cache.get(key)
  if (!m) {
    m = new MeshToonMaterial({ color, gradientMap: gradient, map: opts.map ?? null })
    if (opts.emissive) {
      m.emissive = new Color(opts.emissive)
      m.emissiveIntensity = opts.emissiveIntensity ?? 1
    }
    cache.set(key, m)
  }
  return m
}

export { gradient as toonGradient }
