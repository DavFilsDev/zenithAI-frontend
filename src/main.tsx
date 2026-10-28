import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { env } from './config/env'

document.documentElement.classList.toggle('dark', env.defaultTheme === 'dark')

if (import.meta.env.DEV) {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[unhandled rejection]', event.reason)
  })

  window.addEventListener('error', (event) => {
    console.error('[uncaught error]', event.error ?? event.message)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
