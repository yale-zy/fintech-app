import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/useAuthStore'
import { languages, setLanguage } from '../i18n'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const { t, i18n } = useTranslation()
  const [form, setForm] = useState({ username: 'demo', password: '123456' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(t('login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-apple-gray-6 flex flex-col items-center justify-center px-6">
      {/* Language switcher */}
      <div className="absolute top-6 right-6 flex gap-1">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              i18n.language === lang.code
                ? 'bg-apple-blue text-white'
                : 'bg-white text-apple-gray-1'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-apple-blue rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('login.title')}</h1>
          <p className="text-apple-gray-1 mt-1 text-sm">{t('login.subtitle')}</p>
        </div>

        {/* Form */}
        <div className="card p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-apple-gray-1 uppercase tracking-wide">{t('login.username')}</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="mt-1.5 w-full bg-apple-gray-6 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-apple-blue/30 transition-all"
              placeholder={t('login.usernamePlaceholder')}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-apple-gray-1 uppercase tracking-wide">{t('login.password')}</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="mt-1.5 w-full bg-apple-gray-6 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-apple-blue/30 transition-all"
              placeholder={t('login.passwordPlaceholder')}
            />
          </div>

          {error && <p className="text-apple-red text-sm text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : t('login.submit')}
          </button>
        </div>

        <p className="text-center text-apple-gray-2 text-xs mt-6">{t('login.demoHint')}</p>
      </div>
    </div>
  )
}
