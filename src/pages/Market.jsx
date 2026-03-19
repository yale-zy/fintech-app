import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productApi } from '../api'
import NavBar from '../components/NavBar'
import PageHeader from '../components/PageHeader'
import LoadingSpinner from '../components/LoadingSpinner'
import RiskBadge from '../components/RiskBadge'

export default function Market() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const activeType = searchParams.get('type') || 'all'

  const typeMap = [
    { key: 'all', label: t('market.all') },
    { key: 'fund', label: t('market.fund') },
    { key: 'stock', label: t('market.stock') },
    { key: 'wealth', label: t('market.wealth') },
  ]

  useEffect(() => {
    setLoading(true)
    productApi.getList({ type: activeType === 'all' ? undefined : activeType, keyword })
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [activeType, keyword])

  return (
    <div className="min-h-screen bg-apple-gray-6 pb-24">
      <PageHeader title={t('market.title')} />

      <div className="max-w-lg mx-auto px-4 space-y-3">
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

        <div className="flex gap-2">
          {typeMap.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSearchParams(key === 'all' ? {} : { type: key })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeType === key ? 'bg-apple-blue text-white' : 'bg-white text-apple-gray-1'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="card overflow-hidden">
            {products.length === 0 ? (
              <div className="py-16 text-center text-apple-gray-2 text-sm">{t('market.noProducts')}</div>
            ) : products.map((p, i) => (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className={`flex items-center px-4 py-3.5 active:bg-apple-gray-6 cursor-pointer ${i < products.length - 1 ? 'border-b border-apple-gray-5' : ''}`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mr-3 flex-shrink-0 ${
                  p.type === 'fund' ? 'bg-blue-50' : p.type === 'stock' ? 'bg-orange-50' : 'bg-green-50'
                }`}>
                  <span className={`text-sm font-bold ${
                    p.type === 'fund' ? 'text-apple-blue' : p.type === 'stock' ? 'text-apple-orange' : 'text-apple-green'
                  }`}>
                    {t(`market.typeLabel.${p.type}`)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-apple-gray-1">{p.code}</span>
                    <RiskBadge risk={p.risk} />
                  </div>
                </div>
                <div className="text-right ml-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {p.type === 'stock' ? `¥${p.nav.toFixed(2)}` : p.nav.toFixed(4)}
                  </p>
                  <p className={`text-xs font-medium mt-0.5 ${p.changeRate >= 0 ? 'text-apple-red' : 'text-apple-green'}`}>
                    {p.changeRate >= 0 ? '+' : ''}{p.changeRate.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NavBar />
    </div>
  )
}
