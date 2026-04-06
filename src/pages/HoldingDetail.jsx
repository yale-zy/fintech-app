import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { portfolioApi } from '../api'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import { STATUS_CONFIG } from '../constants/orderStatus'

function StatusBadge({ status }) {
  const { t } = useTranslation()
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.purchasing
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {t(cfg.key)}
    </span>
  )
}

function ProductInfoPopover({ p, t }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-xs font-medium transition-colors ${open ? 'text-apple-blue' : 'text-apple-gray-2 hover:text-apple-blue'}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t('product.productInfo')}
      </button>

      {open && (
        <div className="absolute right-0 top-7 w-72 bg-white rounded-2xl shadow-xl border border-apple-gray-5 p-4 z-20 text-xs space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-900">{p.name}</p>
            <button onClick={() => setOpen(false)} className="text-apple-gray-3 hover:text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {[
            { label: t('product.risk'),        value: t(`risk.${p.risk.replace('-', '')}`) || p.risk },
            { label: t('product.minAmount'),   value: `${p.minAmount.toLocaleString()}` },
            p.annualReturn != null && { label: t('product.annualReturn'), value: `${p.annualReturn}%` },
            { label: t('product.nav'),         value: `${p.nav.toFixed(4)}` },
          ].filter(Boolean).map(item => (
            <div key={item.label} className="flex justify-between">
              <span className="text-apple-gray-1">{item.label}</span>
              <span className="font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
          {p.description && (
            <p className="text-apple-gray-1 pt-1 border-t border-apple-gray-5 leading-relaxed">{p.description}</p>
          )}
        </div>
      )}
    </div>
  )
}

function TransactionRow({ tx }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const isBuy = tx.type === 'buy'
  return (
    <div className="border-b border-apple-gray-5 last:border-0">
      <div
        className="flex items-center px-4 py-3.5 cursor-pointer hover:bg-apple-gray-6 transition-colors"
        onClick={() => setExpanded(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${isBuy ? 'text-apple-red' : 'text-apple-green'}`}>
              {isBuy ? t('product.buy') : t('product.sell')}
            </span>
            <StatusBadge status={tx.status} />
          </div>
          <p className="text-xs text-apple-gray-1">{t('order.id')}: {tx.id.toUpperCase()}</p>
          <p className="text-xs text-apple-gray-2 mt-0.5">{tx.date}</p>
        </div>
        <div className="text-right ml-3 flex-shrink-0">
          <p className="text-sm font-semibold text-gray-900">
            {isBuy ? '-' : '+'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-apple-gray-1 mt-0.5">
            {tx.shares} {t('assets.shares').toLowerCase()} @ ${tx.nav}
          </p>
          <svg
            className={`w-3.5 h-3.5 text-apple-gray-3 mt-1 ml-auto transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {expanded && (
        <div className="px-4 bg-apple-gray-6 border-t border-apple-gray-5 pb-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 pb-3">
            <div>
              <p className="text-[10px] text-apple-gray-2 uppercase tracking-wide">{t('trade.tradeDate')}</p>
              <p className="text-xs font-medium text-gray-800 mt-0.5">{tx.date}</p>
            </div>
            <div>
              <p className="text-[10px] text-apple-gray-2 uppercase tracking-wide">{t('trade.tradeId')}</p>
              <p className="text-xs font-medium text-gray-800 mt-0.5">{tx.id}</p>
            </div>
            <div className="col-span-2 flex gap-4">
              <div className="flex-1">
                <p className="text-[10px] text-apple-gray-2 uppercase tracking-wide">{t('product.orderId')}</p>
                <p className="text-xs font-medium text-gray-800 mt-0.5">{tx.orderId}</p>
              </div>
              {tx.accountNo && (
                <div className="flex-1">
                  <p className="text-[10px] text-apple-gray-2 uppercase tracking-wide">{t('account.number')}</p>
                  <p className="text-xs font-medium text-gray-800 mt-0.5">{tx.accountNo}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HoldingDetail() {
  const { productId } = useParams()
  const { t } = useTranslation()
  const [holding, setHolding] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      portfolioApi.getHoldings(),
      portfolioApi.getTransactions(),
    ]).then(([holdings, txs]) => {
      setHolding(holdings.find(h => h.productId === productId) || null)
      setTransactions(txs.filter(tx => tx.productId === productId))
    }).finally(() => setLoading(false))
  }, [productId])

  if (loading) return <LoadingSpinner fullscreen />
  if (!holding) return (
    <div className="min-h-screen bg-apple-gray-6 flex items-center justify-center">
      <p className="text-apple-gray-2 text-sm">{t('common.noData')}</p>
    </div>
  )

  const { product: p } = holding
  const isUp = holding.profit >= 0

  return (
    <div className="min-h-screen bg-apple-gray-6 pb-24 lg:pb-6">
      <PageHeader title={p.name} />
      <div className="px-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-apple-gray-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-apple-blue/10 text-apple-blue">{p.code}</span>
            <ProductInfoPopover p={p} t={t} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            ${holding.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-sm font-medium ${isUp ? 'text-apple-red' : 'text-apple-green'}`}>
            {isUp ? '+' : ''}${holding.profit.toFixed(2)} ({isUp ? '+' : ''}{holding.profitRate.toFixed(2)}%)
          </p>
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-apple-gray-5">
            {[
              { label: t('assets.shares'),  value: holding.shares.toLocaleString() },
              { label: t('assets.cost'),    value: `${holding.costValue.toFixed(2)}` },
              { label: t('assets.costNav'), value: `${holding.costNav.toFixed(4)}` },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-apple-gray-1 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-apple-gray-1 uppercase tracking-wide mb-2 px-1">
            {t('assets.transactions')}
          </p>
          {transactions.length === 0 ? (
            <div className="py-10 text-center text-apple-gray-2 text-sm">{t('assets.noTransactions')}</div>
          ) : (
            <div className="bg-white rounded-2xl border border-apple-gray-5 overflow-hidden">
              {transactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
