import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import useAuthStore from '../store/useAuthStore'
import usePortfolioStore from '../store/usePortfolioStore'
import NavBar from '../components/NavBar'
import LoadingSpinner from '../components/LoadingSpinner'

function generateAssetTrend() {
  const data = []
  let val = 95000
  for (let i = 30; i >= 0; i--) {
    val = val * (1 + (Math.random() - 0.46) * 0.015)
    const d = new Date()
    d.setDate(d.getDate() - i)
    data.push({ date: d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }), value: Math.round(val) })
  }
  return data
}

const trendData = generateAssetTrend()

export default function Dashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const { summary, holdings, loading, fetchSummary } = usePortfolioStore()
  const [hideAmount, setHideAmount] = useState(false)

  useEffect(() => { fetchSummary() }, [])

  if (loading && !summary) return <LoadingSpinner fullscreen />

  const totalAsset = summary ? summary.totalAsset + summary.cash : 0

  const shortcuts = [
    { label: t('dashboard.buyFund'), icon: '📈', path: '/market?type=fund' },
    { label: t('dashboard.buyStock'), icon: '📊', path: '/market?type=stock' },
    { label: t('dashboard.wealthProduct'), icon: '💰', path: '/market?type=wealth' },
    { label: t('dashboard.tradeHistory'), icon: '📋', path: '/portfolio?tab=transactions' },
  ]

  return (
    <div className="min-h-screen bg-apple-gray-6 pb-24">
      {/* Header */}
      <div className="bg-apple-blue pt-12 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-100 text-sm">{t('dashboard.greeting', { name: user?.name })}</p>
              <h2 className="text-white text-lg font-semibold mt-0.5">{t('dashboard.title')}</h2>
            </div>
            <button
              onClick={() => setHideAmount(h => !h)}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                {hideAmount
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                }
              </svg>
            </button>
          </div>

          <div className="text-center">
            <p className="text-blue-100 text-sm mb-1">{t('dashboard.totalAsset')}</p>
            <p className="text-white text-4xl font-bold tracking-tight">
              {hideAmount ? '****.**' : totalAsset.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
            {summary && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="text-blue-100 text-sm">{t('dashboard.cumulativeProfit')}</span>
                <span className={`text-sm font-medium ${summary.totalProfit >= 0 ? 'text-yellow-300' : 'text-red-300'}`}>
                  {hideAmount ? '****' : `${summary.totalProfit >= 0 ? '+' : ''}${summary.totalProfit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`}
                </span>
                <span className={`text-sm ${summary.totalProfitRate >= 0 ? 'text-yellow-300' : 'text-red-300'}`}>
                  ({summary.totalProfitRate >= 0 ? '+' : ''}{summary.totalProfitRate.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Asset breakdown */}
        {summary && (
          <div className="card p-4">
            <div className="grid grid-cols-3 divide-x divide-apple-gray-5">
              <div className="text-center px-2">
                <p className="text-apple-gray-1 text-xs mb-1">{t('dashboard.investedAsset')}</p>
                <p className="text-gray-900 font-semibold text-sm">
                  {hideAmount ? '****' : `¥${summary.totalAsset.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className="text-center px-2">
                <p className="text-apple-gray-1 text-xs mb-1">{t('dashboard.availableCash')}</p>
                <p className="text-gray-900 font-semibold text-sm">
                  {hideAmount ? '****' : `¥${summary.cash.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className="text-center px-2">
                <p className="text-apple-gray-1 text-xs mb-1">{t('dashboard.todayPnl')}</p>
                <p className={`font-semibold text-sm ${summary.totalProfit >= 0 ? 'text-apple-red' : 'text-apple-green'}`}>
                  {hideAmount ? '****' : `${summary.totalProfit >= 0 ? '+' : ''}¥${(summary.totalProfit * 0.03).toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trend chart */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('dashboard.trendTitle')}</h3>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={trendData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007AFF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#007AFF" strokeWidth={2} fill="url(#assetGrad)" dot={false} />
              <Tooltip
                contentStyle={{ background: 'white', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={(v) => [`¥${v.toLocaleString()}`, t('dashboard.totalAssetLabel')]}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Holdings */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-apple-gray-5">
            <h3 className="text-sm font-semibold text-gray-900">{t('dashboard.holdingsTitle')}</h3>
            <button onClick={() => navigate('/portfolio')} className="text-apple-blue text-sm">{t('dashboard.viewAll')}</button>
          </div>
          {holdings.slice(0, 3).map((h, i) => (
            <div
              key={h.productId}
              onClick={() => navigate(`/product/${h.productId}`)}
              className={`flex items-center px-4 py-3 active:bg-apple-gray-6 cursor-pointer ${i < 2 ? 'border-b border-apple-gray-5' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-apple-blue/10 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-apple-blue text-xs font-bold">
                  {t(`market.typeLabel.${h.product.type}`)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{h.product.name}</p>
                <p className="text-xs text-apple-gray-1 mt-0.5">
                  {t('dashboard.holdingValue', { value: hideAmount ? '****' : h.currentValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) })}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${h.profit >= 0 ? 'text-apple-red' : 'text-apple-green'}`}>
                  {h.profit >= 0 ? '+' : ''}{h.profitRate.toFixed(2)}%
                </p>
                <p className={`text-xs mt-0.5 ${h.profit >= 0 ? 'text-apple-red' : 'text-apple-green'}`}>
                  {h.profit >= 0 ? '+' : ''}¥{hideAmount ? '**' : h.profit.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick access */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('dashboard.shortcuts')}</h3>
          <div className="grid grid-cols-4 gap-3">
            {shortcuts.map(item => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-apple-gray-6 active:bg-apple-gray-5 transition-colors"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-gray-700 font-medium text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <NavBar />
    </div>
  )
}
