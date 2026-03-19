import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import usePortfolioStore from '../store/usePortfolioStore'
import NavBar from '../components/NavBar'
import PageHeader from '../components/PageHeader'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE']

export default function Portfolio() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'holdings'
  const { holdings, transactions, loading, fetchSummary, fetchTransactions } = usePortfolioStore()

  useEffect(() => {
    fetchSummary()
    fetchTransactions()
  }, [])

  const pieData = holdings.map(h => ({ name: h.product.name, value: h.currentValue }))
  const totalHoldingValue = holdings.reduce((s, h) => s + h.currentValue, 0)

  return (
    <div className="min-h-screen bg-apple-gray-6 pb-24">
      <PageHeader title={t('portfolio.title')} />

      <div className="max-w-lg mx-auto px-4 space-y-3">
        <div className="flex bg-apple-gray-5 rounded-xl p-1">
          {[['holdings', t('portfolio.holdings')], ['transactions', t('portfolio.transactions')]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSearchParams(key === 'holdings' ? {} : { tab: key })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-apple-gray-1'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && !holdings.length ? <LoadingSpinner /> : activeTab === 'holdings' ? (
          <>
            {holdings.length > 0 && (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('portfolio.assetDistribution')}</h3>
                <div className="flex items-center">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2 ml-2">
                    {pieData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-apple-gray-1 truncate flex-1">{item.name}</span>
                        <span className="text-xs font-medium text-gray-900">
                          {((item.value / totalHoldingValue) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="card overflow-hidden">
              {holdings.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-apple-gray-2 text-sm">{t('portfolio.noHoldings')}</p>
                  <button onClick={() => navigate('/market')} className="mt-3 text-apple-blue text-sm">{t('portfolio.goMarket')}</button>
                </div>
              ) : holdings.map((h, i) => (
                <div
                  key={h.productId}
                  onClick={() => navigate(`/product/${h.productId}`)}
                  className={`px-4 py-4 active:bg-apple-gray-6 cursor-pointer ${i < holdings.length - 1 ? 'border-b border-apple-gray-5' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: COLORS[i % COLORS.length] + '20' }}>
                        <span className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                          {t(`market.typeLabel.${h.product.type}`)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{h.product.name}</p>
                        <p className="text-xs text-apple-gray-1">{h.product.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">¥{h.currentValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
                      <p className={`text-xs font-medium ${h.profit >= 0 ? 'text-apple-red' : 'text-apple-green'}`}>
                        {h.profit >= 0 ? '+' : ''}¥{h.profit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-apple-gray-1 bg-apple-gray-6 rounded-xl px-3 py-2">
                    <span>{t('portfolio.shares')} {h.shares.toLocaleString()}</span>
                    <span>{t('portfolio.cost')} ¥{h.costValue.toFixed(2)}</span>
                    <span className={h.profitRate >= 0 ? 'text-apple-red' : 'text-apple-green'}>
                      {h.profitRate >= 0 ? '+' : ''}{h.profitRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="card overflow-hidden">
            {transactions.length === 0 ? (
              <div className="py-16 text-center text-apple-gray-2 text-sm">{t('portfolio.noTransactions')}</div>
            ) : transactions.map((tx, i) => (
              <div key={tx.id} className={`flex items-center px-4 py-3.5 ${i < transactions.length - 1 ? 'border-b border-apple-gray-5' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 ${tx.type === 'buy' ? 'bg-red-50' : 'bg-green-50'}`}>
                  <span className={`text-sm font-bold ${tx.type === 'buy' ? 'text-apple-red' : 'text-apple-green'}`}>
                    {tx.type === 'buy' ? t('portfolio.buy') : t('portfolio.sell')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.product?.name}</p>
                  <p className="text-xs text-apple-gray-1 mt-0.5">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.type === 'buy' ? 'text-apple-red' : 'text-apple-green'}`}>
                    {tx.type === 'buy' ? '-' : '+'}¥{tx.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-apple-gray-1 mt-0.5">{tx.shares}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NavBar />
    </div>
  )
}
