import { useGame } from '../store/gameStore'

/**
 * Tiny WebAudio synth for cute UI and pet sounds – no audio files needed,
 * works offline. Replace individual sounds with samples later if desired.
 */
let ctx: AudioContext | null = null
const ac = () => (ctx ??= new AudioContext())

const silent = () => typeof AudioContext === 'undefined' || useGame.getState().muted

function tone(freq: number, dur: number, opts: { type?: OscillatorType; to?: number; gain?: number; delay?: number } = {}) {
  if (silent()) return
  const c = ac()
  if (c.state === 'suspended') void c.resume()
  const t0 = c.currentTime + (opts.delay ?? 0)
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = opts.type ?? 'sine'
  osc.frequency.setValueAtTime(freq, t0)
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur)
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(opts.gain ?? 0.15, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

function noise(dur: number, gain = 0.08, delay = 0, freq = 1800) {
  if (silent()) return
  const c = ac()
  const t0 = c.currentTime + delay
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
  const src = c.createBufferSource()
  src.buffer = buf
  const f = c.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = freq
  const g = c.createGain()
  g.gain.value = gain
  src.connect(f).connect(g).connect(c.destination)
  src.start(t0)
}

export const sfx = {
  tap: () => tone(620, 0.09, { to: 880, type: 'triangle', gain: 0.12 }),
  pop: () => tone(400, 0.12, { to: 1200, gain: 0.14 }),
  open: () => (tone(500, 0.1, { to: 700, type: 'triangle' }), tone(750, 0.12, { to: 1000, type: 'triangle', delay: 0.06 })),
  close: () => tone(700, 0.12, { to: 420, type: 'triangle' }),
  coin: () => (tone(988, 0.08, { type: 'square', gain: 0.06 }), tone(1319, 0.22, { type: 'square', gain: 0.06, delay: 0.07 })),
  chew: () => noise(0.07, 0.12, 0, 900),
  happy: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, { type: 'triangle', delay: i * 0.07, gain: 0.11 })),
  sad: () => tone(440, 0.4, { to: 280, type: 'triangle', gain: 0.1 }),
  squeak: () => tone(900, 0.14, { to: 1500, gain: 0.1 }),
  boing: () => tone(220, 0.25, { to: 660, type: 'sine', gain: 0.16 }),
  bubble: () => tone(600 + Math.random() * 500, 0.06, { to: 1400, gain: 0.07 }),
  splash: () => noise(0.35, 0.1, 0, 2500),
  sparkle: () => [1568, 2093, 2637].forEach((f, i) => tone(f, 0.12, { delay: i * 0.05, gain: 0.06 })),
  whoosh: () => noise(0.25, 0.08, 0, 600),
  snore: () => tone(110, 0.8, { to: 90, type: 'sawtooth', gain: 0.02 }),
  error: () => tone(300, 0.15, { to: 220, type: 'triangle', gain: 0.1 }),
  plop: () => tone(300, 0.15, { to: 120, gain: 0.15 }),
}
