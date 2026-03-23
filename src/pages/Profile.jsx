import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/useAuthStore'
import usePortfolioStore from '../store/usePortfolioStore'
import PageHeader from '../components/PageHeader'
import { languages, setLanguage } from '../i18n'

function LanguagePicker() {
  const { i18n } = useTranslation()
  return (
    <div className="flex gap-2">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
            i18n.language === lang.code
              ? 'bg-apple-blue text-white border-apple-blue'
              : 'bg-white text-apple-gray-1 border-apple-gray-4 hover:border-apple-blue hover:text-apple-blue'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const { summary } = usePortfolioStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-apple-gray-6 pb-24 lg:pb-0">
      {/* Mobile header */}
      <div className="lg:hidden">
        <PageHeader title={t('profile.title')} />
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden max-w-lg mx-auto px-4 space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-apple-blue flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-semibold">{user?.name?.[0]}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-apple-gray-1 text-sm mt-0.5">@{user?.username}</p>
            </div>
          </div>
          {summary && (
            <div className="grid grid-cols-3 mt-5 pt-4 border-t border-apple-gray-5">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">¥{(summary.totalAsset + summary.cash).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-apple-gray-1 mt-0.5">{t('profile.totalAsset')}</p>
              </div>
              <div className="text-center border-x border-apple-gray-5">
                <p className={`text-lg font-bold ${summary.totalProfit >= 0 ? 'text-apple-red' : 'text-apple-green'}`}>
                  {summary.totalProfit >= 0 ? '+' : ''}{summary.totalProfitRate.toFixed(2)}%
                </p>
                <p className="text-xs text-apple-gray-1 mt-0.5">{t('profile.totalReturn')}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">4</p>
                <p className="text-xs text-apple-gray-1 mt-0.5">{t('profile.holdingCount')}</p>
              </div>
            </div>
          )}
        </div>
        <div className="card overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-medium text-apple-gray-1 uppercase tracking-wide">{t('profile.language')}</p>
          </div>
          <div className="px-4 pb-3"><LanguagePicker /></div>
        </div>
        <div className="card overflow-hidden">
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-3.5 text-apple-red text-sm font-medium hover:bg-red-50 transition-colors">
            🚪 <span className="ml-3">{t('profile.logout')}</span>
          </button>
        </div>
        <p className="text-center text-apple-gray-3 text-xs pb-2">{t('profile.version')} · {t('common.riskWarning')}</p>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:block px-8 py-8 max-w-3xl">
        {/* Header row */}
        <div className="flex items-center mb-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-apple-blue flex items-center justify-center flex-shrink-0">
              <span className="text-white text-3xl font-bold">{user?.name?.[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-apple-gray-1 mt-0.5">@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: t('profile.totalAsset'), value: `¥${(summary.totalAsset + summary.cash).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-gray-900' },
              { label: t('profile.totalReturn'), value: `${summary.totalProfit >= 0 ? '+' : ''}${summary.totalProfitRate.toFixed(2)}%`, color: summary.totalProfit >= 0 ? 'text-apple-red' : 'text-apple-green' },
              { label: t('profile.holdingCount'), value: '4', color: 'text-gray-900' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-2xl p-5 border border-apple-gray-5">
                <p className="text-sm text-apple-gray-1 mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Language */}
        <div className="bg-white rounded-2xl p-5 border border-apple-gray-5">
          <p className="text-sm font-semibold text-gray-900 mb-3">{t('profile.language')}</p>
          <LanguagePicker />
        </div>

        <p className="text-apple-gray-3 text-xs mt-6">{t('profile.version')} · {t('common.riskWarning')}</p>
      </div>
    </div>
  )
}
