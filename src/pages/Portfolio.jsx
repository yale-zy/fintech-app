import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import usePortfolioStore from '../store/usePortfolioStore'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#971b2f', '#34C759', '#e67e22', '#c0392b', '#AF52DE']
const PAGE_SIZE = 6

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
        <p>{t('portfolio.shares')} {h.shares.toLocaleString()}</p>
        <p>{t('portfolio.cost')} ¥{h.costValue.toFixed(2)}</p>
      </div>
    </div>
  )
}

function TransactionRow({ tx, isLast }) {
  const { t } = useTranslation()
  const isBuy = tx.type === 'buy'
  return (
    <div className={`flex items-center px-4 py-3.5 cursor-pointer hover:bg-apple-gray-6 transition-colors ${!isLast ? 'border-b border-apple-gray-5' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{tx.product?.name}</p>
        <p className="text-xs text-apple-gray-1 mt-0.5">{tx.date}</p>
      </div>
      <div className="text-right ml-3">
        <p className={`text-sm font-semibold ${isBuy ? 'text-apple-red' : 'text-apple-green'}`}>
          {isBuy ? '-' : '+'}¥{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-apple-gray-1 mt-0.5">{tx.shares} {t('portfolio.shares').toLowerCase()}</p>
      </div>
    </div>
  )
}

function TransactionList({ transactions }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef(null)

  const visible = transactions.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < transactions.length

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
    return <div className="py-16 text-center text-apple-gray-2 text-sm">{t('portfolio.noTransactions')}</div>
  }

  return (
    <div>
      <div className="bg-white rounded-2xl border border-apple-gray-5 overflow-hidden">
        {visible.map((tx, i) => (
          <TransactionRow key={tx.id} tx={tx} isLast={i === visible.length - 1 && !hasMore} />
        ))}
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
  )
}

export default function Portfolio() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'holdings'
  const { holdings, transactions, loading, fetchSummary, fetchTransactions } = usePortfolioStore()

  useEffect(() => {
    fetchSummary()
    fetchTransactions()
  }, [])

  return (
    <div className="min-h-screen bg-apple-gray-6 pb-24 lg:pb-6">
      <div className="px-4 pt-4">
        {loading && !holdings.length ? (
          <LoadingSpinner />
        ) : activeTab === 'holdings' ? (
          holdings.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-apple-gray-2 text-sm">{t('portfolio.noHoldings')}</p>
              <button onClick={() => navigate('/market')} className="mt-3 text-apple-blue text-sm">{t('portfolio.goMarket')}</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {holdings.map((h, i) => (
                <HoldingWidget key={h.productId} h={h} index={i} onClick={() => navigate(`/product/${h.productId}`)} />
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
