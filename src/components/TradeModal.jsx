import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { tradeApi } from '../api'

export default function TradeModal({ product, mode, onClose }) {
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
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder={t('product.buyAmountPlaceholder', { min: product.minAmount })}
                  className="mt-2 w-full bg-apple-gray-6 rounded-xl px-4 py-3 text-2xl font-semibold outline-none focus:ring-2 focus:ring-apple-blue/30" />
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
                <input type="number" value={shares} onChange={e => setShares(e.target.value)}
                  placeholder={t('product.sellSharesPlaceholder')}
                  className="mt-2 w-full bg-apple-gray-6 rounded-xl px-4 py-3 text-2xl font-semibold outline-none focus:ring-2 focus:ring-apple-blue/30" />
              </div>
            )}
            {error && <p className="text-apple-red text-sm mt-3">{error}</p>}
            <button onClick={handleTrade} disabled={loading || (!amount && !shares)}
              className={`w-full mt-5 py-3.5 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50 ${mode === 'buy' ? 'bg-apple-blue' : 'bg-apple-green'}`}>
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
