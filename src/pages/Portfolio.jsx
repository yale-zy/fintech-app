import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import usePortfolioStore from '../store/usePortfolioStore'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#971b2f', '#34C759', '#e67e22', '#c0392b', '#AF52DE']
const PAGE_SIZE = 6

function AssetSummaryCards({ summary }) {
  const { t } = useTranslation()
  if (!summary) return null

  const totalAsset = summary.totalAsset + summary.cash
  const todayPnl = summary.totalProfit * 0.03 // simulated daily P&L
  const isUp = summary.totalProfit >= 0
  const todayUp = todayPnl >= 0

  return (
    <div className="bg-white rounded-2xl border border-apple-gray-5 px-5 py-4 mb-4">
      {/* Top row: Total Assets + Today P&L inline */}
      <div className="mb-4">
        <p className="text-xs text-apple-gray-1 mb-1">{t('profile.totalAsset')}</p>
        <div className="flex items-baseline gap-4">
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

      <div className="border-t border-apple-gray-5 pt-3 grid grid-cols-3 gap-2">
        <div>
          <p className="text-xs text-apple-gray-1 mb-1">{t('dashboard.investedAsset')}</p>
          <p className="text-sm font-semibold text-gray-900">
            {summary.totalAsset.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-apple-gray-1 mb-1">{t('profile.totalReturn')}</p>
          <p className={`text-sm font-semibold ${isUp ? 'text-apple-red' : 'text-apple-green'}`}>
            {isUp ? '+' : ''}{summary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-apple-gray-1 mb-1">{t('dashboard.availableCash')}</p>
          <p className="text-sm font-semibold text-gray-900">
            {summary.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}

function HoldingWidget({ h, index, onClick }) {
  const { t } = useTranslation()
  const color = COLORS[index % COLORS.length]
  const isUp = h.profit >= 0
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-apple-blue/30 active:scale-[0.98] transition-all border border-apple-gray-5 flex flex-col gap-3 w-full sm:w-48"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: color + '20', color }}>
          {h.product.code}
        </span>
        <span className={`text-xs font-semibold ${isUp ? 'text-apple-red' : 'text-apple-green'}`}>
          {isUp ? '+' : ''}{h.profitRate.toFixed(2)}%
        </span>
      </div>
      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{h.product.name}</p>
      <div>
        <p className="text-lg font-bold text-gray-900">¥{h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <p className={`text-xs mt-0.5 ${isUp ? 'text-apple-red' : 'text-apple-green'}`}>
          {isUp ? '+' : ''}¥{h.profit.toFixed(2)}
        </p>
      </div>
      <div className="text-xs text-apple-gray-1 space-y-0.5">
        <p>{t('assets.shares')} {h.shares.toLocaleString()}</p>
        <p>{t('assets.cost')} ¥{h.costValue.toFixed(2)}</p>
      </div>
    </div>
  )
}

function TransactionRow({ tx, isLast }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const isBuy = tx.type === 'buy'
  const statusCfg = {
    pending:    { bg: 'bg-yellow-50',     text: 'text-yellow-600', dot: 'bg-yellow-400',  key: 'order.pending'    },
    reviewing:  { bg: 'bg-blue-50',       text: 'text-blue-600',   dot: 'bg-blue-400',    key: 'order.reviewing'  },
    approved:   { bg: 'bg-apple-blue/10', text: 'text-apple-blue', dot: 'bg-apple-blue',  key: 'order.approved'   },
    processing: { bg: 'bg-orange-50',     text: 'text-orange-500', dot: 'bg-orange-400',  key: 'order.processing' },
    settled:    { bg: 'bg-green-50',      text: 'text-green-600',  dot: 'bg-green-500',   key: 'order.settled'    },
    redeemed:   { bg: 'bg-green-50',      text: 'text-green-600',  dot: 'bg-green-500',   key: 'order.redeemed'   },
  }
  const cfg = statusCfg[tx.status] || statusCfg.pending

  return (
    <div className={`${!isLast ? 'border-b border-apple-gray-5' : ''}`}>
      <div
        className="flex items-center px-4 py-3.5 cursor-pointer hover:bg-apple-gray-6 transition-colors"
        onClick={() => setExpanded(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${isBuy ? 'text-apple-red' : 'text-apple-green'}`}>
              {isBuy ? t('product.buy') : t('product.sell')}
            </span>
            {tx.status && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {t(cfg.key)}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-gray-700 truncate">{tx.product?.name}</p>
          <p className="text-xs text-apple-gray-2 mt-0.5">{tx.date}</p>
        </div>
        <div className="text-right ml-3 flex-shrink-0">
          <p className={`text-sm font-semibold ${isBuy ? 'text-apple-red' : 'text-apple-green'}`}>
            {isBuy ? '-' : '+'}¥{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-apple-gray-1 mt-0.5">{tx.shares} {t('assets.shares').toLowerCase()}</p>
          {tx.statusHistory && (
            <svg
              className={`w-3.5 h-3.5 text-apple-gray-3 mt-1 ml-auto transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
      {expanded && tx.statusHistory && (
        <div className="px-4 bg-apple-gray-6 border-t border-apple-gray-5">
          <p className="text-xs font-semibold text-apple-gray-1 uppercase tracking-wide pt-3 mb-1">
            {t('order.statusHistory')}
          </p>
          <div className="pt-1 pb-1">
            {tx.statusHistory.map((item, i) => {
              const c = statusCfg[item.status] || statusCfg.pending
              const isLast = i === tx.statusHistory.length - 1
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${isLast ? c.dot : 'bg-apple-gray-4'}`} />
                    {!isLast && <span className="w-px flex-1 bg-apple-gray-5 my-1" />}
                  </div>
                  <div className="pb-3">
                    <p className={`text-xs font-semibold ${isLast ? c.text : 'text-apple-gray-1'}`}>{t(c.key)}</p>
                    <p className="text-xs text-apple-gray-2 mt-0.5">{item.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function TransactionFilters({ filters, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={filters.keyword}
          onChange={e => onChange({ ...filters, keyword: e.target.value })}
          placeholder={t('filter.searchProduct')}
          className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-apple-blue/30 border border-apple-gray-5"
        />
      </div>

      <div className="flex gap-2">
        {/* Type filter */}
        <div className="flex bg-white rounded-xl border border-apple-gray-5 overflow-hidden flex-shrink-0">
          {[
            { value: '', label: t('filter.all') },
            { value: 'buy', label: t('product.buy') },
            { value: 'sell', label: t('product.sell') },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, type: opt.value })}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                filters.type === opt.value
                  ? 'bg-apple-blue text-white'
                  : 'text-apple-gray-1 hover:bg-apple-gray-6'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Date from */}
        <label className="flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-apple-gray-5 px-3 py-1.5 focus-within:ring-2 focus-within:ring-apple-blue/30">
          <span className="text-[10px] text-apple-gray-2 leading-none mb-0.5">{t('filter.dateFrom')}</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => onChange({ ...filters, dateFrom: e.target.value })}
            className="text-xs text-gray-900 outline-none bg-transparent"
          />
        </label>
        <label className="flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-apple-gray-5 px-3 py-1.5 focus-within:ring-2 focus-within:ring-apple-blue/30">
          <span className="text-[10px] text-apple-gray-2 leading-none mb-0.5">{t('filter.dateTo')}</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => onChange({ ...filters, dateTo: e.target.value })}
            className="text-xs text-gray-900 outline-none bg-transparent"
          />
        </label>
      </div>

      {/* Active filter count + clear */}
      {(filters.keyword || filters.type || filters.dateFrom || filters.dateTo) && (
        <button
          onClick={() => onChange({ keyword: '', type: '', dateFrom: '', dateTo: '' })}
          className="text-xs text-apple-blue hover:underline"
        >
          {t('filter.clear')}
        </button>
      )}
    </div>
  )
}

function applyFilters(transactions, filters) {
  return transactions.filter(tx => {
    if (filters.type && tx.type !== filters.type) return false
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase()
      if (!tx.product?.name.toLowerCase().includes(kw) && !tx.productId.toLowerCase().includes(kw)) return false
    }
    if (filters.dateFrom && tx.date < filters.dateFrom) return false
    if (filters.dateTo && tx.date.slice(0, 10) > filters.dateTo) return false
    return true
  })
}

function TransactionList({ transactions }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filters, setFilters] = useState({ keyword: '', type: '', dateFrom: '', dateTo: '' })
  const sentinelRef = useRef(null)

  const filtered = applyFilters(transactions, filters)
  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  const handleFilterChange = (f) => { setFilters(f); setPage(1) }

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    setTimeout(() => {
      setPage(p => p + 1)
      setLoadingMore(false)
    }, 600)
  }, [loadingMore, hasMore])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  if (transactions.length === 0) {
    return <div className="py-16 text-center text-apple-gray-2 text-sm">{t('assets.noTransactions')}</div>
  }

  return (
    <div>
      <div className="sticky top-12 lg:top-14 z-30 bg-apple-gray-6/90 backdrop-blur-xl px-4 pt-3 pb-2">
        <TransactionFilters filters={filters} onChange={handleFilterChange} />
      </div>
      <div className="px-4">
      <div className="bg-white rounded-2xl border border-apple-gray-5 overflow-hidden">
        {filtered.length === 0
          ? <p className="py-10 text-center text-apple-gray-2 text-sm">{t('filter.noResults')}</p>
          : visible.map((tx, i) => (
              <TransactionRow key={tx.id} tx={tx} isLast={i === visible.length - 1 && !hasMore} />
            ))
        }
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-4" />

      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-apple-gray-4 border-t-apple-blue rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && transactions.length > PAGE_SIZE && (
        <p className="text-center text-apple-gray-3 text-xs py-4">{t('common.noData')}</p>
      )}
      </div>
    </div>
  )
}

export default function Portfolio() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'holdings'
  const { holdings, transactions, summary, loading, fetchSummary, fetchTransactions } = usePortfolioStore()

  useEffect(() => {
    fetchSummary()
    fetchTransactions()
  }, [])

  return (
    <div className="min-h-screen bg-apple-gray-6 pb-24 lg:pb-6">
      {activeTab === 'holdings' && (
        <div className="sticky top-12 lg:top-14 z-30 bg-apple-gray-6/95 backdrop-blur-xl px-4 pt-4 pb-2">
          <AssetSummaryCards summary={summary} />
        </div>
      )}
      <div className="px-4 pt-2">
        {loading && !holdings.length ? (
          <LoadingSpinner />
        ) : activeTab === 'holdings' ? (
          holdings.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-apple-gray-2 text-sm">{t('assets.noHoldings')}</p>
              <button onClick={() => navigate('/market')} className="mt-3 text-apple-blue text-sm">{t('assets.goMarket')}</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {holdings.map((h, i) => (
                <HoldingWidget key={h.productId} h={h} index={i} onClick={() => navigate(`/holding/${h.productId}`)} />
              ))}
            </div>
          )
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </div>
    </div>
  )
}
