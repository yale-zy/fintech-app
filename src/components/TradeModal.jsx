import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { tradeApi } from '../api'

export default function TradeModal({ product, mode, accounts = [], onClose }) {
  const { t } = useTranslation()
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '')
  const [amount, setAmount] = useState('')
  const [shares, setShares] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [tradeStatus, setTradeStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState('')

  const handleTrade = async () => {
    if (!selectedAccount) {
      setError(t('account.selectRequired'))
      return
    }
    const acc = accounts.find(a => a.id === selectedAccount)
    setError('')
    setLoading(true)
    try {
      const res = mode === 'buy'
        ? await tradeApi.buy({ customerNumber: acc?.customerNumber, accountNumber: acc?.accountNo, amount: parseFloat(amount) })
        : await tradeApi.sell({ customerNumber: acc?.customerNumber, accountNumber: acc?.accountNo, shares: parseFloat(shares) })
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    if (!result?.tradeId) return
    setStatusError('')
    setStatusLoading(true)
    try {
      const status = await tradeApi.getStatus(result.tradeId)
      setTradeStatus(status)
    } catch (e) {
      setStatusError(e.message)
    } finally {
      setStatusLoading(false)
    }
  }

  const statusColor = {
    filled:   'text-apple-green',
    pending:  'text-apple-blue',
    rejected: 'text-apple-red',
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
            <div className="bg-apple-gray-6 rounded-2xl p-4 text-left space-y-2 mb-4">
              {[
                { label: t('trade.tradeId'),         value: result.tradeId },
                { label: t('trade.action'),           value: result.action },
                { label: t('trade.customerNumber'),   value: result.customerNumber },
                { label: t('account.number'),         value: result.accountNumber },
                { label: t('trade.accountType'),      value: result.accountType },
                { label: t('product.orderId'),        value: result.orderId },
                { label: t('trade.asset'),            value: result.asset },
                { label: t('trade.assetAmount'),      value: result.assetAmount },
                { label: t('trade.tradeDate'),        value: result.tradeDate },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-apple-gray-1">{row.label}</span>
                  <span className="font-medium text-gray-900 text-xs">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Trade status section */}
            {tradeStatus ? (
              <div className="bg-apple-gray-6 rounded-2xl p-4 text-left mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-900">{t('trade.statusTitle')}</span>
                  <button
                    onClick={handleCheckStatus}
                    disabled={statusLoading}
                    className="text-xs text-apple-blue font-medium disabled:opacity-50"
                  >
                    {statusLoading ? '...' : t('trade.refresh')}
                  </button>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-apple-gray-1">{t('trade.status')}</span>
                  <span className={`font-semibold text-xs ${statusColor[tradeStatus.status] || 'text-gray-900'}`}>
                    {t(`trade.statusLabel.${tradeStatus.status}`, tradeStatus.status)}
                  </span>
                </div>
                {tradeStatus.statusHistory.length > 0 && (
                  <div className="space-y-1.5 border-t border-apple-gray-5 pt-3">
                    {tradeStatus.statusHistory.map((h, i) => (
                      <div key={i} className="flex justify-between text-xs text-apple-gray-1">
                        <span>{t(`trade.statusLabel.${h.status}`, h.status)}</span>
                        <span>{h.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleCheckStatus}
                disabled={statusLoading}
                className="w-full mb-3 py-3 rounded-xl border border-apple-blue text-apple-blue font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {statusLoading
                  ? <div className="w-4 h-4 border-2 border-apple-blue/40 border-t-apple-blue rounded-full animate-spin" />
                  : t('trade.checkStatus')}
              </button>
            )}
            {statusError && <p className="text-apple-red text-xs mb-3">{statusError}</p>}

            <button onClick={onClose} className="btn-primary w-full">{t('common.done')}</button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {mode === 'buy' ? t('product.buyTitle') : t('product.sellTitle')}
            </h3>
            <p className="text-apple-gray-1 text-sm mb-4">{product.name}</p>

            {/* Account selector */}
            {accounts.length > 0 && (
              <div className="mb-4">
                <label className="text-xs text-apple-gray-1 font-medium block mb-2">{t('account.select')}</label>
                <div className="space-y-2">
                  {accounts.map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => setSelectedAccount(acc.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                        selectedAccount === acc.id
                          ? 'border-apple-blue bg-apple-blue/5'
                          : 'border-apple-gray-5 hover:border-apple-gray-4'
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-xs text-apple-gray-1">{t('account.number')}</p>
                        <p className="text-sm font-medium text-gray-900">{acc.accountNo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-apple-gray-1">{t('account.balance')}</p>
                        <p className="text-sm font-semibold text-gray-900">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      {selectedAccount === acc.id && (
                        <svg className="w-4 h-4 text-apple-blue ml-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'buy' ? (
              <div>
                <label className="text-xs text-apple-gray-1 font-medium">{t('product.buyAmountLabel')}</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => { const v = e.target.value; if (v === '' || parseFloat(v) > 0) setAmount(v) }}
                  min="0.000001"
                  onKeyDown={e => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                  placeholder={t('product.buyAmountPlaceholder', { min: product.minAmount })}                  className="mt-2 w-full bg-apple-gray-6 rounded-xl px-4 py-3 text-2xl font-semibold outline-none focus:ring-2 focus:ring-apple-blue/30"
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
                  onChange={e => {
                    const v = e.target.value
                    if (v === '' || (Number.isInteger(parseFloat(v)) && parseFloat(v) >= 1)) setShares(v)
                  }}
                  min="1"
                  step="1"
                  onKeyDown={e => (e.key === '-' || e.key === 'e' || e.key === '.') && e.preventDefault()}
                  placeholder={t('product.sellSharesPlaceholder')}
                  className="mt-2 w-full bg-apple-gray-6 rounded-xl px-4 py-3 text-2xl font-semibold outline-none focus:ring-2 focus:ring-apple-blue/30"
                />
                <p className="text-xs text-apple-gray-2 mt-1.5">{t('product.minSellShares')}</p>
              </div>
            )}
            {error && <p className="text-apple-red text-sm mt-3">{error}</p>}
            <button
              onClick={handleTrade}
              disabled={loading || !selectedAccount || (!amount && !shares)}
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
