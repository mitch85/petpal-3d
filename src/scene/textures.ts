import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat = 1) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(repeat, repeat)
  tex.anisotropy = 4
  return tex
}

/** Wooden planks with soft seams. */
export const floorTexture = (tones = ['#E8B583', '#EDBE8E', '#E3AD79', '#F0C597']) =>
  canvasTex(512, 512, (g) => {
    const rows = 8
    const h = 512 / rows
    for (let r = 0; r < rows; r++) {
      let x = r % 2 ? -140 : 0
      while (x < 512) {
        const w = 220 + ((r * 37 + x) % 90)
        g.fillStyle = tones[(r + Math.floor(x / 97)) % tones.length]
        g.fillRect(x, r * h, w, h)
        g.fillStyle = 'rgba(120,70,40,0.25)'
        g.fillRect(x, r * h, 3, h)
        x += w
      }
      g.fillStyle = 'rgba(120,70,40,0.28)'
      g.fillRect(0, r * h, 512, 3)
      g.fillStyle = 'rgba(255,255,255,0.18)'
      g.fillRect(0, r * h + 4, 512, 2)
    }
  }, 2)

function star(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, points = 5, inner = 0.45) {
  g.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 ? r * inner : r
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
  }
  g.closePath()
  g.fill()
}

/** Pastel wallpaper in one of several patterns. */
export const wallpaperTexture = (base: string, dot: string, pattern: 'dots' | 'snow' | 'bricks' | 'stars' = 'dots') =>
  canvasTex(256, 256, (g) => {
    g.fillStyle = base
    g.fillRect(0, 0, 256, 256)
    g.fillStyle = dot
    g.strokeStyle = dot
    if (pattern === 'bricks') {
      const h = 32
      for (let r = 0; r < 8; r++) {
        g.fillRect(0, r * h, 256, 3)
        for (let x = r % 2 ? 32 : 0; x < 256; x += 64) g.fillRect(x, r * h, 3, h)
      }
      return
    }
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        const cx = x * 64 + (y % 2 ? 32 : 0) + 16
        const cy = y * 64 + 16
        if (pattern === 'stars') star(g, cx, cy, 8)
        else if (pattern === 'snow') {
          g.lineWidth = 2.5
          g.lineCap = 'round'
          for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI
            g.beginPath()
            g.moveTo(cx - Math.cos(a) * 8, cy - Math.sin(a) * 8)
            g.lineTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8)
            g.stroke()
          }
        } else {
          g.beginPath()
          g.arc(cx, cy, 5, 0, Math.PI * 2)
          g.fill()
        }
      }
    g.fillStyle = 'rgba(255,255,255,0.25)'
    for (let x = 0; x < 256; x += 64) g.fillRect(x + 46, 0, 6, 256)
  }, 3)

/** Mowed grass stripes for the garden. */
export const grassTexture = () =>
  canvasTex(256, 256, (g) => {
    const tones = ['#8FD88A', '#9FE098']
    for (let i = 0; i < 8; i++) {
      g.fillStyle = tones[i % 2]
      g.fillRect(0, i * 32, 256, 32)
    }
    g.fillStyle = 'rgba(255,255,255,0.18)'
    for (let i = 0; i < 40; i++) g.fillRect((i * 53) % 256, (i * 97) % 256, 3, 7)
  }, 4)

/** Rug with concentric rings. */
export const rugTexture = (rings = ['#FFB3A6', '#FFF1E2', '#FF9C8A', '#FFE0C2', '#FFB3A6', '#FFF1E2']) =>
  canvasTex(512, 512, (g) => {
    rings.forEach((c, i) => {
      g.fillStyle = c
      g.beginPath()
      g.arc(256, 256, 256 - i * 40, 0, Math.PI * 2)
      g.fill()
    })
    g.strokeStyle = 'rgba(255,255,255,0.7)'
    g.setLineDash([10, 14])
    g.lineWidth = 5
    g.beginPath()
    g.arc(256, 256, 236, 0, Math.PI * 2)
    g.stroke()
  })

/** Particle sprites drawn once into canvases. */
export const spriteTexture = (kind: 'heart' | 'bubble' | 'zzz' | 'spark' | 'drop' | 'sparkle' | 'crumb' | 'puff' | 'note') =>
  canvasTex(128, 128, (g) => {
    g.lineJoin = 'round'
    g.lineCap = 'round'
    const ink = '#3D2C4E'
    switch (kind) {
      case 'heart': {
        g.beginPath()
        g.moveTo(64, 108)
        g.bezierCurveTo(10, 70, 8, 30, 38, 24)
        g.bezierCurveTo(54, 21, 62, 32, 64, 42)
        g.bezierCurveTo(66, 32, 74, 21, 90, 24)
        g.bezierCurveTo(120, 30, 118, 70, 64, 108)
        g.fillStyle = '#FF6F9F'
        g.fill()
        g.lineWidth = 8
        g.strokeStyle = ink
        g.stroke()
        g.fillStyle = 'rgba(255,255,255,0.8)'
        g.beginPath()
        g.ellipse(40, 44, 9, 6, -0.6, 0, Math.PI * 2)
        g.fill()
        break
      }
      case 'bubble': {
        const grd = g.createRadialGradient(50, 46, 6, 64, 64, 56)
        grd.addColorStop(0, 'rgba(255,255,255,0.95)')
        grd.addColorStop(0.55, 'rgba(210,240,255,0.6)')
        grd.addColorStop(0.85, 'rgba(255,190,235,0.75)')
        grd.addColorStop(1, 'rgba(150,170,255,0.9)')
        g.fillStyle = grd
        g.beginPath()
        g.arc(64, 64, 54, 0, Math.PI * 2)
        g.fill()
        g.lineWidth = 6
        g.strokeStyle = 'rgba(90,120,220,0.9)'
        g.stroke()
        g.fillStyle = '#fff'
        g.beginPath()
        g.ellipse(44, 40, 12, 7, -0.7, 0, Math.PI * 2)
        g.fill()
        break
      }
      case 'zzz':
        g.font = '900 96px "Baloo 2", sans-serif'
        g.textAlign = 'center'
        g.textBaseline = 'middle'
        g.lineWidth = 12
        g.strokeStyle = ink
        g.strokeText('Z', 64, 68)
        g.fillStyle = '#B9A3FF'
        g.fillText('Z', 64, 68)
        break
      case 'spark': {
        const grd = g.createRadialGradient(64, 64, 2, 64, 64, 60)
        grd.addColorStop(0, '#FFFFFF')
        grd.addColorStop(0.25, '#FFE27A')
        grd.addColorStop(0.6, 'rgba(255,140,60,0.7)')
        grd.addColorStop(1, 'rgba(255,90,40,0)')
        g.fillStyle = grd
        g.fillRect(0, 0, 128, 128)
        break
      }
      case 'sparkle':
        g.fillStyle = '#FFE066'
        g.strokeStyle = ink
        g.lineWidth = 7
        g.beginPath()
        for (let i = 0; i < 8; i++) {
          const r = i % 2 ? 16 : 54
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2
          g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r)
        }
        g.closePath()
        g.fill()
        g.stroke()
        break
      case 'drop':
        g.fillStyle = '#7CCBFF'
        g.strokeStyle = ink
        g.lineWidth = 7
        g.beginPath()
        g.moveTo(64, 14)
        g.bezierCurveTo(90, 54, 104, 70, 96, 90)
        g.arc(64, 86, 32, 0.1, Math.PI - 0.1)
        g.bezierCurveTo(24, 70, 38, 54, 64, 14)
        g.fill()
        g.stroke()
        break
      case 'crumb':
        g.fillStyle = '#E9A35E'
        g.beginPath()
        g.arc(64, 64, 40, 0, Math.PI * 2)
        g.fill()
        break
      case 'puff': {
        const grd = g.createRadialGradient(64, 64, 10, 64, 64, 60)
        grd.addColorStop(0, 'rgba(255,255,255,1)')
        grd.addColorStop(1, 'rgba(255,255,255,0)')
        g.fillStyle = grd
        g.fillRect(0, 0, 128, 128)
        break
      }
      case 'note':
        g.font = '900 100px "Baloo 2", sans-serif'
        g.textAlign = 'center'
        g.textBaseline = 'middle'
        g.lineWidth = 10
        g.strokeStyle = ink
        g.strokeText('♪', 64, 64)
        g.fillStyle = '#5BB8FF'
        g.fillText('♪', 64, 64)
        break
    }
  })
