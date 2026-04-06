import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { productApi } from '../api'
import usePortfolioStore from '../store/usePortfolioStore'
import LoadingSpinner from '../components/LoadingSpinner'
import TradeModal from '../components/TradeModal'
import { STATUS_CONFIG } from '../constants/orderStatus'

// ─── Asset Summary ────────────────────────────────────────────────────────────
function AssetSummary({ summary, accounts, transactions, productName }) {
  const { t } = useTranslation()
  if (!summary) return null
  const totalAccountBalance = accounts.reduce((s, a) => s + a.balance, 0)
  const onHolding = transactions
    .filter(tx => tx.type === 'buy' && tx.status === 'purchasing')
    .reduce((s, tx) => s + tx.amount, 0)

  return (
    <div className="bg-white rounded-2xl border border-apple-gray-5 px-5 py-4">
      {productName && (
        <p className="text-sm font-semibold text-gray-900 mb-3">{productName}</p>
      )}
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <p className="text-xs text-apple-gray-1 mb-1">{t('profile.totalAsset')}</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">
            {totalAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="w-px h-10 bg-apple-gray-5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-apple-green flex-shrink-0" />
            <p className="text-xs text-apple-gray-1">{t('home.onHolding')}</p>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {onHolding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Info Popover ─────────────────────────────────────────────────────────────
function InfoPopover({ product }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const rows = [
    { label: t('product.minTradeAmount'),     value: product.minTradeAmount?.toLocaleString() },
    { label: t('product.pricingModel'),       value: product.pricingModel },
    { label: t('product.settlementCurrency'), value: product.settlementCurrency },
    { label: t('product.settlementCycle'),    value: product.settlementCycle },
    { label: t('product.managementFee'),      value: product.managementFee },
    { label: t('product.custodianFee'),       value: product.custodianFee },
  ].filter(r => r.value != null)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-xs font-medium transition-colors ${open ? 'text-apple-blue' : 'text-apple-gray-2 hover:text-apple-blue'}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t('product.moreInfo')}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 w-72 bg-white rounded-2xl shadow-xl border border-apple-gray-5 p-4 z-20 text-xs space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-900">{product.name}</p>
              <button onClick={() => setOpen(false)} className="text-apple-gray-3 hover:text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {rows.map(row => (
              <div key={row.label} className="flex justify-between gap-4">
                <span className="text-apple-gray-1 flex-shrink-0">{row.label}</span>
                <span className="font-semibold text-gray-900 text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Product Info ─────────────────────────────────────────────────────────────
function ProductInfo({ product }) {
  const { t } = useTranslation()
  const infoRows = [
    { label: t('product.assetType'),   value: product.assetType },
    { label: t('product.issuer'),      value: product.issuer },
    { label: t('product.exchange'),    value: product.exchange },
    { label: t('product.minAmount'),   value: product.minAmount?.toLocaleString() },
    product.pegCurrency && { label: t('product.pegCurrency'), value: product.pegCurrency },
    product.pegRatio    && { label: t('product.pegRatio'),    value: product.pegRatio },
  ].filter(Boolean)

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs font-semibold text-apple-gray-1 uppercase tracking-wide">
          {t('product.productInfo')}
        </p>
        <InfoPopover product={product} />
      </div>
      <div className="bg-white rounded-2xl border border-apple-gray-5 overflow-hidden">
        {infoRows.map((item, i) => (
          <div key={item.label} className={`flex items-start justify-between px-4 py-3.5 ${i < infoRows.length - 1 ? 'border-b border-apple-gray-5' : ''}`}>
            <span className="text-sm text-apple-gray-1 flex-shrink-0 mr-4">{item.label}</span>
            <span className="text-sm text-gray-900 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TxRow({ tx }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const isBuy = tx.type === 'buy'
  const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.purchasing
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
            {isBuy ? '-' : '+'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 pb-3 border-b border-apple-gray-5">
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

const TX_COLLAPSE_THRESHOLD = 3

function TransactionSection({ txs }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  if (!txs.length) return null
  const visible = expanded ? txs : txs.slice(0, TX_COLLAPSE_THRESHOLD)
  const hasMore = txs.length > TX_COLLAPSE_THRESHOLD
  return (
    <div>
      <p className="text-xs font-semibold text-apple-gray-1 uppercase tracking-wide mb-2 px-1">
        {t('assets.transactions')}
      </p>
      <div className="bg-white rounded-2xl border border-apple-gray-5 overflow-hidden">
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
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { t } = useTranslation()
  const { summary, transactions, accounts, fetchSummary, fetchTransactions } = usePortfolioStore()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tradeModal, setTradeModal] = useState(null)

  useEffect(() => {
    fetchSummary()
    fetchTransactions()
    // Load the first (and currently only) product
    productApi.getList().then(list => {
      if (list[0]) {
        productApi.getDetail(list[0].id).then(setProduct)
      }
    }).finally(() => setLoading(false))
  }, [])

  const productAccounts = product ? accounts.filter(a => a.productId === product.id) : []
  const productTxs = product ? transactions.filter(tx => tx.productId === product.id) : []

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-apple-gray-6 pb-36">
      <div className="px-4 pt-4 space-y-4">
        {/* Asset summary */}
        <div className="sticky top-12 lg:top-14 z-30 bg-apple-gray-6/95 backdrop-blur-xl pb-1">
          <AssetSummary summary={summary} accounts={accounts} transactions={transactions} productName={product?.name} />
        </div>

        {product && (
          <>
            {/* Product details */}
            <ProductInfo product={product} />

            {/* Transaction history */}
            <TransactionSection txs={productTxs} />
          </>
        )}
      </div>

      {/* Buy / Sell sticky bar */}
      {product && (
        <div className="fixed bottom-0 left-0 lg:left-56 right-0 bg-white/90 backdrop-blur-xl border-t border-apple-gray-5 px-4 py-4 pb-8">
          <div className="max-w-lg mx-auto flex gap-3">
            <button
              onClick={() => setTradeModal({ product, mode: 'sell', accounts: productAccounts })}
              className="flex-1 py-3.5 rounded-xl bg-green-50 text-apple-green font-semibold text-base hover:bg-green-100 transition-colors"
            >
              {t('product.sell')}
            </button>
            <button
              onClick={() => setTradeModal({ product, mode: 'buy', accounts: productAccounts })}
              className="flex-1 py-3.5 rounded-xl bg-apple-blue/10 text-apple-blue font-semibold text-base hover:bg-apple-blue/20 transition-colors"
            >
              {t('product.buy')}
            </button>
          </div>
        </div>
      )}

      {tradeModal && (
        <TradeModal
          product={tradeModal.product}
          mode={tradeModal.mode}
          accounts={tradeModal.accounts}
          onClose={() => setTradeModal(null)}
        />
      )}
    </div>
  )
}
