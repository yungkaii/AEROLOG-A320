import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

type ThemeMode = 'light' | 'dark' | 'auto'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
  return 'dark'
}

function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)

  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }

  document.documentElement.style.colorScheme = resolved
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('dark')

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

  useEffect(() => {
    if (mode !== 'auto') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemeMode('auto')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode])

  function toggleMode() {
    const nextMode: ThemeMode = mode === 'dark' ? 'light' : mode === 'light' ? 'auto' : 'dark'
    setMode(nextMode)
    applyThemeMode(nextMode)
    window.localStorage.setItem('theme', nextMode)
  }

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={`Current theme: ${mode}. Click to cycle.`}
      title={`Cockpit Illumination Mode: ${mode.toUpperCase()} (Click to toggle)`}
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0c1018] hover:border-amber-500/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
    >
      {mode === 'dark' && <Moon className="w-3.5 h-3.5 text-amber-400" />}
      {mode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-600" />}
      {mode === 'auto' && <Monitor className="w-3.5 h-3.5 text-slate-400" />}
      <span className="uppercase text-[11px] tracking-wider">{mode}</span>
    </button>
  )
}
