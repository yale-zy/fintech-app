import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productApi } from '../api'
import LoadingSpinner from '../components/LoadingSpinner'
import RiskBadge from '../components/RiskBadge'

function ProductWidget({ p, onClick }) {
  const isUp = p.changeRate >= 0

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-apple-blue/30 active:scale-[0.98] transition-all border border-apple-gray-5 flex flex-col gap-3 w-full sm:w-44 flex-shrink-0"
    >
      {/* Code */}
      <span className="text-xs text-apple-gray-2">{p.code}</span>

      {/* Name */}
      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{p.name}</p>

      {/* Price */}
      <div>
        <p className="text-lg font-bold text-gray-900">
          {p.type === 'stock' ? `¥${p.nav.toFixed(2)}` : p.nav.toFixed(4)}
        </p>
        <p className={`text-xs font-medium mt-0.5 ${isUp ? 'text-apple-red' : 'text-apple-green'}`}>
          {isUp ? '+' : ''}{p.changeRate.toFixed(2)}%
        </p>
      </div>

      {/* Risk */}
      <RiskBadge risk={p.risk} />
    </div>
  )
}

export default function Market() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    setLoading(true)
    productApi.getList({ keyword })
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [keyword])

  return (
    <div className="min-h-screen bg-apple-gray-6 pb-24 lg:pb-6">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-apple-gray-6/90 backdrop-blur-xl px-4 pt-4 pb-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder={t('market.searchPlaceholder')}
            className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-apple-blue/30"
          />
        </div>
      </div>

      {/* Widget flow */}
      <div className="px-4">
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-apple-gray-2 text-sm">{t('market.noProducts')}</div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {products.map(p => (
              <ProductWidget
                key={p.id}
                p={p}
                onClick={() => navigate(`/product/${p.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
