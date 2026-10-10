import { useEffect, useState } from 'react'
import { GameScene } from './scene/GameScene'
import { useGame } from './store/gameStore'
import { ActionBar, FoodMenu, ToyMenu } from './ui/ActionBar'
import { Shop } from './ui/Shop'
import { Hud } from './ui/Hud'
import { PetSelect } from './ui/PetSelect'
import { StartScreen } from './ui/StartScreen'
import { Toasts } from './ui/Toasts'
import { Loader } from './ui/Loader'
import { t } from './i18n'

type Screen = 'start' | 'select' | 'game'

/** Runs the stat simulation once per second and catches up after the tab was hidden. */
function useGameLoop(active: boolean) {
  useEffect(() => {
    if (!active) return
    const tick = () => useGame.getState().tick()
    tick()
    const id = setInterval(tick, 1000)
    const onVis = () => document.visibilityState === 'visible' && tick()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [active])
}

function Game() {
  const [ready, setReady] = useState(false)
  const welcome = useGame((s) => s.welcome)
  useEffect(() => {
    if (!welcome) return
    useGame.getState().toast(t('welcome.back'), 'info')
    useGame.getState().dismissWelcome()
  }, [welcome])
  return (
    <div className="absolute inset-0">
      <GameScene onReady={() => setReady(true)} />
      <Loader ready={ready} />
      <Hud />
      <Toasts />
      <ActionBar />
      <FoodMenu />
      <ToyMenu />
      <Shop />
    </div>
  )
}

export default function App() {
  const hasPet = useGame((s) => s.pet !== null)
  const [screen, setScreen] = useState<Screen>(() => (new URLSearchParams(location.search).has('play') && hasPet ? 'game' : 'start'))
  useGameLoop(screen === 'game' && hasPet)

  if (screen === 'start') return <StartScreen hasPet={hasPet} onStart={() => setScreen(hasPet ? 'game' : 'select')} />
  if (screen === 'select' || !hasPet) return <PetSelect onDone={() => setScreen('game')} />
  return <Game />
}
