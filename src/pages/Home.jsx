import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { productApi } from '../api'
import usePortfolioStore from '../store/usePortfolioStore'
import LoadingSpinner from '../components/LoadingSpinner'
import TradeModal from '../components/TradeModal'
import { STATUS_CONFIG } from '../constants/orderStatus'

const STATUS_CFG = STATUS_CONFIG
const PIE_COLORS = ['#971b2f', '#34C759', '#e67e22', '#AF52DE', '#AEAEB2']

function AssetSummary({ summary, accounts, transactions }) {
  const { t } = useTranslation()
  if (!summary) return null
  const totalAsset = summary.totalAsset + summary.cash
  const totalAccountBalance = accounts.reduce((s, a) => s + a.balance, 0)
  // frozen = sum of buy transactions still in purchasing status
  const onHolding = transactions
    .filter(tx => tx.type === 'buy' && tx.status === 'purchasing')
    .reduce((s, tx) => s + tx.amount, 0)
  const todayPnl = summary.totalProfit * 0.03
  const isUp = summary.totalProfit >= 0
  const todayUp = todayPnl >= 0

  const pieData = [
    { name: t('account.totalBalance'),    value: totalAccountBalance },
    { name: t('dashboard.availableCash'), value: summary.cash },
    { name: t('home.onHolding'),          value: onHolding },
  ].filter(d => d.value > 0)

  return (
    <div className="bg-white rounded-2xl border border-apple-gray-5 px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <p className="text-xs text-apple-gray-1 mb-1">{t('profile.totalAsset')}</p>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {totalAsset.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-apple-gray-1">{t('dashboard.todayPnl')}</span>
                <span className={`text-sm font-semibold ${todayUp ? 'text-apple-red' : 'text-apple-green'}`}>
                  {todayUp ? '+' : ''}{todayPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-apple-gray-5 pt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: t('account.totalBalance'), value: `¥${totalAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: PIE_COLORS[0] },
              { label: t('dashboard.availableCash'), value: summary.cash.toLocaleString(undefined, { minimumFractionDigits: 2 }), color: PIE_COLORS[1] },
              { label: t('profile.totalReturn'), value: `${isUp ? '+' : ''}${summary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: isUp ? '#971b2f' : '#34C759' },
              { label: t('home.onHolding'), value: `¥${onHolding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: PIE_COLORS[2] },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: item.color }} />
                <div>
                  <p className="text-xs text-apple-gray-1">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 w-28 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={52} strokeWidth={2}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'white', border: 'none', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 11 }}
                formatter={v => [`¥${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function TxRow({ tx }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const isBuy = tx.type === 'buy'
  const cfg = STATUS_CFG[tx.status] || STATUS_CFG.purchasing
  return (
    <div className="border-b border-apple-gray-5 last:border-0">
      <div className="flex items-center px-4 py-3 cursor-pointer hover:bg-apple-gray-6 transition-colors" onClick={() => setExpanded(o => !o)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-semibold ${isBuy ? 'text-apple-red' : 'text-apple-green'}`}>
              {isBuy ? t('product.buy') : t('product.sell')}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {t(cfg.key)}
            </span>
          </div>
          <p className="text-xs text-apple-gray-2">{tx.date}</p>
        </div>
        <div className="text-right ml-3 flex-shrink-0">
          <p className={`text-sm font-semibold ${isBuy ? 'text-apple-red' : 'text-apple-green'}`}>
            {isBuy ? '-' : '+'}¥{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-apple-gray-1 mt-0.5">{tx.shares} {t('assets.shares').toLowerCase()}</p>
        </div>
        {tx.statusHistory && (
          <svg className={`w-3.5 h-3.5 text-apple-gray-3 ml-2 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
      {expanded && tx.statusHistory && (
        <div className="px-4 bg-apple-gray-6 border-t border-apple-gray-5 pb-2">
          <p className="text-xs font-semibold text-apple-gray-1 uppercase tracking-wide pt-2 mb-1">{t('order.statusHistory')}</p>
          {tx.statusHistory.map((item, i) => {
            const c = STATUS_CFG[item.status] || STATUS_CFG.purchasing
            const last = i === tx.statusHistory.length - 1
            return (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${last ? c.dot : 'bg-apple-gray-4'}`} />
                  {!last && <span className="w-px flex-1 bg-apple-gray-5 my-1" />}
                </div>
                <div className="pb-2">
                  <p className={`text-xs font-semibold ${last ? c.text : 'text-apple-gray-1'}`}>{t(c.key)}</p>
                  <p className="text-xs text-apple-gray-2">{item.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const TX_COLLAPSE_THRESHOLD = 3 // change to 10 for production

function ProductTransactions({ txs }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  if (!txs.length) return null

  const visible = expanded ? txs : txs.slice(0, TX_COLLAPSE_THRESHOLD)
  const hasMore = txs.length > TX_COLLAPSE_THRESHOLD

  return (
    <div className="border-t border-apple-gray-5 overflow-hidden">
      <p className="text-xs font-semibold text-apple-gray-1 uppercase tracking-wide px-4 py-2.5 border-b border-apple-gray-5">
        {t('assets.transactions')}
      </p>
      {visible.map(tx => <TxRow key={tx.id} tx={tx} />)}
      {hasMore && (
        <button
          onClick={() => setExpanded(o => !o)}
          className="w-full flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-apple-blue hover:bg-apple-gray-6 transition-colors border-t border-apple-gray-5"
        >
          {expanded ? t('common.collapse') : t('common.showMore', { count: txs.length - TX_COLLAPSE_THRESHOLD })}
          <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  )
}

function ProductInfoPopover({ p }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
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
        <div className="absolute right-0 top-7 w-64 bg-white rounded-2xl shadow-xl border border-apple-gray-5 p-4 z-20 text-xs space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-900">{p.name}</p>
            <button onClick={() => setOpen(false)} className="text-apple-gray-3 hover:text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {[
            { label: t('product.category'),    value: p.category },
            { label: t('product.minAmount'),   value: `¥${p.minAmount.toLocaleString()}` },
            p.annualReturn != null && { label: t('product.annualReturn'), value: `+${p.annualReturn}%`, color: 'text-apple-red' },
            { label: t('product.nav'),         value: `¥${p.nav.toFixed(4)}` },
          ].filter(Boolean).map(item => (
            <div key={item.label} className="flex justify-between">
              <span className="text-apple-gray-1">{item.label}</span>
              <span className={`font-semibold ${item.color || 'text-gray-900'}`}>{item.value}</span>
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

function ProductCard({ p, holding, account, onBuy, onSell }) {
  const { t } = useTranslation()
  const isUp = p.changeRate >= 0

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-apple-gray-2">{p.code}</span>
          {holding && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-apple-blue/10 text-apple-blue">
              {t('home.holding')}
            </span>
          )}
        </div>
        <ProductInfoPopover p={p} />
      </div>
      <p className="text-base font-semibold text-gray-900 mb-3">{p.name}</p>

      {/* Account info */}
      {account && (
        <div className="flex items-center justify-between bg-apple-gray-6 rounded-xl px-3 py-2 mb-3">
          <div>
            <p className="text-xs text-apple-gray-1">{t('account.number')}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{account.accountNo}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-apple-gray-1">{t('account.balance')}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">¥{account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      {/* Price + holding value */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {p.type === 'stock' ? `¥${p.nav.toFixed(2)}` : p.nav.toFixed(4)}
          </p>
          <span className={`text-sm font-semibold mt-1 inline-block ${isUp ? 'text-apple-red' : 'text-apple-green'}`}>
            {isUp ? '+' : ''}{p.changeRate.toFixed(2)}%
          </span>
        </div>
        {holding && (
          <div className="text-right">
            <p className="text-xs text-apple-gray-1 mb-0.5">{t('dashboard.investedAsset')}</p>
            <p className="text-sm font-semibold text-gray-900">¥{holding.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className={`text-xs mt-0.5 ${holding.profit >= 0 ? 'text-apple-red' : 'text-apple-green'}`}>
              {holding.profit >= 0 ? '+' : ''}¥{holding.profit.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Buy / Sell buttons */}
      <div className="flex gap-2">
        <button onClick={e => { e.stopPropagation(); onSell() }}
          className="flex-1 py-2 rounded-xl bg-green-50 text-apple-green text-sm font-semibold hover:bg-green-100 transition-colors">
          {t('product.sell')}
        </button>
        <button onClick={e => { e.stopPropagation(); onBuy() }}
          className="flex-1 py-2 rounded-xl bg-apple-blue/10 text-apple-blue text-sm font-semibold hover:bg-apple-blue/20 transition-colors">
          {t('product.buy')}
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const { t } = useTranslation()
  const { holdings, summary, transactions, accounts, fetchSummary, fetchTransactions } = usePortfolioStore()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tradeModal, setTradeModal] = useState(null) // { product, mode }

  useEffect(() => {
    fetchSummary()
    fetchTransactions()
    productApi.getList().then(setProducts).finally(() => setLoading(false))
  }, [])

  const holdingMap = Object.fromEntries(holdings.map(h => [h.productId, h]))
  const accountMap = Object.fromEntries(accounts.map(a => [a.productId, a]))
  const txByProduct = products.reduce((acc, p) => {
    acc[p.id] = transactions.filter(tx => tx.productId === p.id)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-apple-gray-6 pb-24 lg:pb-6">
      <div className="px-4 pt-4 space-y-4">
        <div className="sticky top-12 lg:top-14 z-30 bg-apple-gray-6/95 backdrop-blur-xl pb-1">
          <AssetSummary summary={summary} accounts={accounts} transactions={transactions} />
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-apple-gray-5 overflow-hidden hover:shadow-md transition-shadow">
                <ProductCard
                  p={p}
                  holding={holdingMap[p.id] || null}
                  account={accountMap[p.id] || null}
                  onBuy={() => setTradeModal({ product: p, mode: 'buy' })}
                  onSell={() => setTradeModal({ product: p, mode: 'sell' })}
                />
                <ProductTransactions txs={txByProduct[p.id] || []} />
              </div>
            ))}
          </div>
        )}
      </div>

      {tradeModal && (
        <TradeModal
          product={tradeModal.product}
          mode={tradeModal.mode}
          onClose={() => setTradeModal(null)}
        />
      )}
    </div>
  )
}

