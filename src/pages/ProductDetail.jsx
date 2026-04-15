import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productApi } from '../api'
import TradeModal from '../components/TradeModal'
import RiskBadge from '../components/RiskBadge'
import LoadingSpinner from '../components/LoadingSpinner'

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
    { label: t('product.assetType'),   value: product.assetType },
    { label: t('product.issuer'),      value: product.issuer },
    { label: t('product.exchange'),    value: product.exchange },
    product.annualReturn != null && { label: t('product.annualReturn'), value: <span className="text-apple-red font-medium">+{product.annualReturn}%</span> },
    { label: t('product.minAmount'),   value: product.minAmount?.toLocaleString() },
    product.pegCurrency && { label: t('product.pegCurrency'), value: product.pegCurrency },
    product.pegRatio    && { label: t('product.pegRatio'),    value: product.pegRatio },
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
          <p className="text-sm font-medium text-gray-700 mb-1">{product.name}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {product.type === 'stock' ? `${product.nav.toFixed(2)}` : product.nav.toFixed(4)}
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

        {/* Product info */}
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
