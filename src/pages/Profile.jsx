import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/useAuthStore'
import usePortfolioStore from '../store/usePortfolioStore'
import NavBar from '../components/NavBar'
import PageHeader from '../components/PageHeader'
import { languages, setLanguage } from '../i18n'

function MenuItem({ icon, label, value, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center px-4 py-3.5 active:bg-apple-gray-6 transition-colors"
    >
      <span className="text-xl mr-3">{icon}</span>
      <span className={`flex-1 text-left text-sm font-medium ${danger ? 'text-apple-red' : 'text-gray-900'}`}>{label}</span>
      {value && <span className="text-sm text-apple-gray-1 mr-2">{value}</span>}
      {!danger && (
        <svg className="w-4 h-4 text-apple-gray-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}

function LanguagePicker() {
  const { i18n } = useTranslation()
  return (
    <div className="flex gap-2 px-4 py-3">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${
            i18n.language === lang.code
              ? 'bg-apple-blue text-white border-apple-blue'
              : 'bg-white text-apple-gray-1 border-apple-gray-4'
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
    <div className="min-h-screen bg-apple-gray-6 pb-24">
      <PageHeader title={t('profile.title')} />

      <div className="max-w-lg mx-auto px-4 space-y-4">
        {/* User info */}
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
                <p className="text-lg font-bold text-gray-900">
                  ¥{(summary.totalAsset + summary.cash).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </p>
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

        {/* Language switcher */}
        <div className="card overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-medium text-apple-gray-1 uppercase tracking-wide">{t('profile.language')}</p>
          </div>
          <LanguagePicker />
        </div>

        {/* Menu items */}
        <div className="card overflow-hidden divide-y divide-apple-gray-5">
          <MenuItem icon="💼" label={t('profile.myHoldings')} onClick={() => navigate('/portfolio')} />
          <MenuItem icon="📋" label={t('profile.tradeHistory')} onClick={() => navigate('/portfolio?tab=transactions')} />
          <MenuItem icon="🔔" label={t('profile.notifications')} value={t('profile.unread', { count: 3 })} onClick={() => {}} />
        </div>

        <div className="card overflow-hidden divide-y divide-apple-gray-5">
          <MenuItem icon="🛡️" label={t('profile.security')} onClick={() => {}} />
          <MenuItem icon="📞" label={t('profile.contactUs')} onClick={() => {}} />
          <MenuItem icon="📄" label={t('profile.about')} onClick={() => {}} />
        </div>

        <div className="card overflow-hidden">
          <MenuItem icon="🚪" label={t('profile.logout')} onClick={handleLogout} danger />
        </div>

        <p className="text-center text-apple-gray-3 text-xs pb-2">
          {t('profile.version')} · {t('common.riskWarning')}
        </p>
      </div>

      <NavBar />
    </div>
  )
}
