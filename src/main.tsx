import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Dev-only handle for debugging/QA from the browser console.
if (import.meta.env.DEV)
  void Promise.all([import('./store/gameStore'), import('./pets/runtime')]).then(([{ useGame }, { runtime }]) => Object.assign(window, { game: useGame, runtime }))
