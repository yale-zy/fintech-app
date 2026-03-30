import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { productApi, tradeApi } from '../api'
import RiskBadge from '../components/RiskBadge'
import LoadingSpinner from '../components/LoadingSpinner'

function TradeModal({ product, mode, onClose }) {
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const [shares, setShares] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleTrade = async () => {
    setError('')
    setLoading(true)
    try {
      const res = mode === 'buy'
        ? await tradeApi.buy({ productId: product.id, amount: parseFloat(amount) })
        : await tradeApi.sell({ productId: product.id, shares: parseFloat(shares) })
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-apple-gray-4 rounded-full mx-auto mb-5" />
        {result ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-apple-green" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {mode === 'buy' ? t('product.buySuccess') : t('product.sellSuccess')}
            </h3>
            <p className="text-apple-gray-1 text-sm mb-4">{result.message}</p>
            <div className="bg-apple-gray-6 rounded-2xl p-4 text-left space-y-2 mb-6">
              {[
                { label: t('product.productName'), value: result.productName },
                { label: mode === 'buy' ? t('product.buyAmount') : t('product.sellShares'), value: mode === 'buy' ? `¥${result.amount}` : `${result.shares}` },
                { label: t('product.orderId'), value: result.orderId },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-apple-gray-1">{row.label}</span>
                  <span className="font-medium text-gray-900 text-xs">{row.value}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="btn-primary w-full">{t('common.done')}</button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {mode === 'buy' ? t('product.buyTitle') : t('product.sellTitle')}
            </h3>
            <p className="text-apple-gray-1 text-sm mb-5">{product.name}</p>
            {mode === 'buy' ? (
              <div>
                <label className="text-xs text-apple-gray-1 font-medium">{t('product.buyAmountLabel')}</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={t('product.buyAmountPlaceholder', { min: product.minAmount })}
                  className="mt-2 w-full bg-apple-gray-6 rounded-xl px-4 py-3 text-2xl font-semibold outline-none focus:ring-2 focus:ring-apple-blue/30"
                />
                <div className="flex gap-2 mt-3">
                  {[1000, 5000, 10000, 50000].map(v => (
                    <button key={v} onClick={() => setAmount(String(v))} className="flex-1 py-1.5 rounded-lg bg-apple-gray-6 text-xs text-apple-gray-1 font-medium hover:bg-apple-gray-5 transition-colors">
                      {v >= 10000 ? `${v / 10000}w` : v}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs text-apple-gray-1 font-medium">{t('product.sellSharesLabel')}</label>
                <input
                  type="number"
                  value={shares}
                  onChange={e => setShares(e.target.value)}
                  placeholder={t('product.sellSharesPlaceholder')}
                  className="mt-2 w-full bg-apple-gray-6 rounded-xl px-4 py-3 text-2xl font-semibold outline-none focus:ring-2 focus:ring-apple-blue/30"
                />
              </div>
            )}
            {error && <p className="text-apple-red text-sm mt-3">{error}</p>}
            <button
              onClick={handleTrade}
              disabled={loading || (!amount && !shares)}
              className={`w-full mt-5 py-3.5 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50 ${mode === 'buy' ? 'bg-apple-blue' : 'bg-apple-green'}`}
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
                : mode === 'buy' ? t('product.confirmBuy') : t('product.confirmSell')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tradeMode, setTradeMode] = useState(null)

  useEffect(() => {
    productApi.getDetail(id).then(setProduct).finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner fullscreen />
  if (!product) return null

  const isUp = product.changeRate >= 0

  const infoRows = [
    { label: t('product.category'),    value: product.category },
    { label: t('product.risk'),        value: <RiskBadge risk={product.risk} /> },
    { label: t('product.minAmount'),   value: `¥${product.minAmount.toLocaleString()}` },
    product.annualReturn && { label: t('product.annualReturn'), value: <span className="text-apple-red font-medium">+{product.annualReturn}%</span> },
    { label: t('product.description'), value: product.description },
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-apple-gray-6 pb-28 lg:pb-8">
      <div className="sticky top-12 lg:top-14 z-30 bg-apple-gray-6/95 backdrop-blur-xl border-b border-apple-gray-5">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => window.history.back()} className="flex items-center gap-1 text-apple-blue text-sm font-medium flex-shrink-0 w-16">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.back')}
          </button>
          <div className="flex-1 text-center">
            <span className="text-sm font-bold text-gray-900">{product.code}</span>
            <span className="text-xs text-apple-gray-1 ml-1.5">{product.name}</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Price card */}
        <div className="bg-white rounded-2xl p-5 border border-apple-gray-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-apple-blue/10 text-apple-blue">{product.code}</span>
            <RiskBadge risk={product.risk} />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">{product.name}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {product.type === 'stock' ? `¥${product.nav.toFixed(2)}` : product.nav.toFixed(4)}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${isUp ? 'text-apple-red' : 'text-apple-green'}`}>
              {isUp ? '+' : ''}{product.change.toFixed(4)}
            </span>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${isUp ? 'bg-red-50 text-apple-red' : 'bg-green-50 text-apple-green'}`}>
              {isUp ? '+' : ''}{product.changeRate.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl p-4 border border-apple-gray-5">
          <p className="text-sm font-semibold text-gray-900 mb-3">{t('product.recentTrend')}</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={product.chartData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#AEAEB2' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis
                tick={{ fontSize: 10, fill: '#AEAEB2' }}
                tickLine={false}
                axisLine={false}
                width={50}
                tickFormatter={v => `¥${Number(v).toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{ background: 'white', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={v => [v.toFixed(4), t('product.nav')]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isUp ? '#971b2f' : '#34C759'}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Product info */}
        <div>
          <p className="text-xs font-semibold text-apple-gray-1 uppercase tracking-wide mb-2 px-1">
            {t('product.productInfo')}
          </p>
          <div className="bg-white rounded-2xl border border-apple-gray-5 overflow-hidden">
            {infoRows.map((item, i) => (
              <div key={item.label} className={`flex items-start justify-between px-4 py-3.5 ${i < infoRows.length - 1 ? 'border-b border-apple-gray-5' : ''}`}>
                <span className="text-sm text-apple-gray-1 flex-shrink-0 mr-4">{item.label}</span>
                <span className="text-sm text-gray-900 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buy / Sell bar */}
      <div className="fixed bottom-0 left-0 lg:left-56 right-0 bg-white/90 backdrop-blur-xl border-t border-apple-gray-5 px-4 py-4 pb-8">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={() => setTradeMode('sell')}
            className="flex-1 py-3.5 rounded-xl bg-green-50 text-apple-green font-semibold text-base hover:bg-green-100 transition-colors"
          >
            {t('product.sell')}
          </button>
          <button
            onClick={() => setTradeMode('buy')}
            className="flex-1 py-3.5 rounded-xl bg-apple-blue/10 text-apple-blue font-semibold text-base hover:bg-apple-blue/20 transition-colors"
          >
            {t('product.buy')}
          </button>
        </div>
      </div>

      {tradeMode && <TradeModal product={product} mode={tradeMode} onClose={() => setTradeMode(null)} />}
    </div>
  )
}
