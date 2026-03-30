import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'

function MarketIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  )
}

function HoldingsIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function TransactionsIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

export default function AppLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)

  const logout = useAuthStore(s => s.logout)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const fabRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      const inDesktop = dropdownRef.current && dropdownRef.current.contains(e.target)
      const inFab = fabRef.current && fabRef.current.contains(e.target)
      if (!inDesktop && !inFab) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const tabs = [
    { path: '/market', label: t('nav.market'), icon: MarketIcon },
    { path: '/assets', label: t('nav.assets'), icon: HoldingsIcon },
    { path: '/assets?tab=transactions', label: t('assets.transactions'), icon: TransactionsIcon },
  ]

  return (
    <div className="min-h-screen bg-apple-gray-6 flex flex-col">
      {/* Mobile top bar — always visible */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-12 bg-white/90 backdrop-blur-xl border-b border-apple-gray-5 flex items-center px-4 gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-full bg-apple-blue flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">{user?.name?.[0]}</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
          <span className="text-xs text-apple-gray-1">@{user?.username}</span>
        </button>
      </header>
      <header className="hidden lg:flex fixed top-0 left-56 right-0 z-40 h-14 bg-white/80 backdrop-blur-xl border-b border-apple-gray-5 items-center justify-end px-6">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors ${
              dropdownOpen || location.pathname === '/profile' ? 'bg-apple-blue/10 text-apple-blue' : 'hover:bg-apple-gray-6 text-gray-700'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-apple-blue flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">{user?.name?.[0]}</span>
            </div>
            <span className="text-sm font-medium">{user?.name}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-apple-gray-5 overflow-hidden z-50">
              <button
                onClick={() => { setDropdownOpen(false); navigate('/profile') }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-apple-gray-6 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('nav.profile')}
              </button>
              <div className="border-t border-apple-gray-5" />
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-apple-red hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('profile.logout')}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-56 bg-white border-r border-apple-gray-5 flex-col z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-apple-gray-5">
          <div className="w-8 h-8 bg-apple-blue rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
          </div>
          <span className="text-base font-bold text-gray-900">WealthPro</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map(tab => {
            const active = location.pathname + location.search === tab.path ||
              (tab.path === '/market' && location.pathname.startsWith('/product'))
            const Icon = tab.icon
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-apple-blue text-white'
                    : 'text-apple-gray-1 hover:bg-apple-gray-6 hover:text-gray-900'
                }`}
              >
                <Icon active={active} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-56 lg:mt-14 mt-12">
        {children}
      </main>

      {/* Mobile float menu */}
      <div ref={fabRef} className="lg:hidden fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Expanded menu items */}
        {dropdownOpen && (
          <div className="flex flex-col items-end gap-2 mb-1">
            {tabs.map(tab => {
              const active = location.pathname + location.search === tab.path ||
                (tab.path === '/market' && location.pathname.startsWith('/product'))
              const Icon = tab.icon
              return (
                <button
                  key={tab.path}
                  onClick={() => { navigate(tab.path); setDropdownOpen(false) }}
                  className={`flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-xl shadow-lg text-sm font-medium transition-colors ${
                    active ? 'bg-apple-blue text-white' : 'bg-white text-gray-700 hover:bg-apple-gray-6'
                  }`}
                >
                  <Icon active={active} />
                  {tab.label}
                </button>
              )
            })}
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-xl shadow-lg text-sm font-medium text-apple-red hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('profile.logout')}
            </button>
          </div>
        )}

        {/* FAB toggle button */}
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className="w-14 h-14 rounded-full bg-apple-blue text-white shadow-xl flex items-center justify-center transition-transform active:scale-95"
        >
          {dropdownOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
