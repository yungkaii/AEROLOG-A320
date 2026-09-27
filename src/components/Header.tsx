import { Link, useRouterState } from '@tanstack/react-router'
import {
  Plus,
  Search,
  Lock,
  FileSpreadsheet,
  LayoutDashboard,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { usePrivacyLock } from './PrivacyLock'

export default function Header() {
  const { lock } = usePrivacyLock()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const navLinks = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Troubleshooting Log', href: '/troubleshooting', icon: FileSpreadsheet },
  ]

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-300 dark:border-[#1e2638] bg-white/95 dark:bg-[#0c1018]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-15 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Callsign Stencil */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            {/* Instrument Logo Bezel */}
            <div className="w-8 h-8 rounded-sm bg-slate-900 dark:bg-[#151c2a] border border-slate-700 dark:border-[#2a374e] flex items-center justify-center text-amber-400 shadow-xs group-hover:border-amber-500 transition">
              <span className="font-mono font-bold text-xs tracking-tighter">A32</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-wider text-slate-900 dark:text-white uppercase font-sans">
                  AEROLOG
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  A320
                </span>
                {/* Avionics Live Status Beacon */}
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[9px] text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-sm bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>
              <p className="hidden xs:block text-[9px] font-mono text-slate-500 dark:text-slate-400 tracking-widest uppercase">
                AME MAINTENANCE & DEFECT ARCHIVE
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-slate-200 dark:border-[#1e2638] pl-4">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition ${
                    isActive
                      ? 'bg-slate-900 text-amber-400 dark:bg-[#171f2e] dark:text-amber-400 border border-slate-700 dark:border-[#2a3850]'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#141b27]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Search Shortcut */}
          <Link
            to="/troubleshooting"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-100 dark:bg-[#101520] hover:border-amber-500 text-xs font-mono text-slate-600 dark:text-slate-400 transition"
            title="Search troubleshooting history"
          >
            <Search className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline text-[11px] uppercase tracking-wider">SEARCH</span>
            <kbd className="hidden lg:inline-block font-mono text-[9px] bg-slate-200 dark:bg-[#1c2434] px-1 py-0.5 rounded-xs text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
              /
            </kbd>
          </Link>

          {/* Quick Add Button (Desktop) - Aviation Amber CTA */}
          <Link
            to="/troubleshooting/new"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ LOG DEFECT</span>
          </Link>

          {/* Lock Button (Desktop) */}
          <button
            onClick={lock}
            title="Lock maintenance logbook session"
            className="hidden sm:flex p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-sm hover:bg-slate-100 dark:hover:bg-[#151c2a] border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

