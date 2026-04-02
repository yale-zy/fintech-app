import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
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

function StatusTimeline({ history }) {
  const { t } = useTranslation()
  return (
    <div className="pt-3 pb-1">
      {history.map((item, i) => {
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.purchasing
        const isLast = i === history.length - 1
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${isLast ? cfg.dot : 'bg-apple-gray-4'}`} />
              {!isLast && <span className="w-px flex-1 bg-apple-gray-5 my-1" />}
            </div>
            <div className="pb-3">
              <p className={`text-xs font-semibold ${isLast ? cfg.text : 'text-apple-gray-1'}`}>{t(cfg.key)}</p>
              <p className="text-xs text-apple-gray-2 mt-0.5">{item.time}</p>
            </div>
          </div>
        )
      })}
    </div>
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
            { label: t('product.minAmount'),   value: `$${p.minAmount.toLocaleString()}` },
            p.annualReturn != null && { label: t('product.annualReturn'), value: `${p.annualReturn}%` },
            { label: t('product.nav'),         value: `$${p.nav.toFixed(4)}` },
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

function ChartTooltip({ active, payload, t }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-white rounded-xl shadow-lg border border-apple-gray-5 px-3 py-2 text-xs min-w-[130px]">
      <p className="text-apple-gray-1 mb-1">{d.date}</p>
      <p className="font-semibold text-gray-900">${Number(d.value).toFixed(4)}</p>
      {d.txType && (
        <div className={`mt-1.5 pt-1.5 border-t border-apple-gray-5 ${d.txType === 'buy' ? 'text-apple-red' : 'text-apple-green'}`}>
          <p className="font-semibold">{d.txType === 'buy' ? t('product.buy') : t('product.sell')}</p>
          <p className="text-apple-gray-1 mt-0.5">
            ${Number(d.txAmount).toLocaleString()} · {d.txShares} {t('assets.shares').toLowerCase()}
          </p>
        </div>
      )}
    </div>
  )
}

function HoldingChart({ transactions }) {
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    if (!transactions.length) return []
    const txDates = transactions.map(tx => new Date(tx.date))
    const earliest = new Date(Math.min(...txDates))
    const today = new Date()
    const start = new Date(earliest)
    start.setDate(start.getDate() - 5)

    const points = []
    let price = transactions[0].nav * (0.93 + Math.random() * 0.07)
    const cur = new Date(start)

    while (cur <= today) {
      price = price * (1 + (Math.random() - 0.48) * 0.018)
      const isoDate = cur.toISOString().slice(0, 10)
      const label = cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const match = transactions.find(tx => tx.date.startsWith(isoDate))
      if (match) price = match.nav
      points.push({
        date: label,
        value: parseFloat(price.toFixed(4)),
        ...(match ? { txType: match.type, txAmount: match.amount, txShares: match.shares } : {}),
      })
      cur.setDate(cur.getDate() + 1)
    }
    return points
  }, [transactions])

  const values = chartData.map(d => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const pad = (maxVal - minVal) * 0.2 || 0.05
  const totalDays = chartData.length
  const tickInterval = totalDays > 90 ? Math.floor(totalDays / 8) : totalDays > 30 ? 14 : 7

  // render function �?Recharts calls this for every point; return SVG only for tx points
  const renderDot = (props) => {
    const { cx, cy, payload } = props
    if (!payload?.txType) return <g key={`nd-${cx}`} />
    const isBuy = payload.txType === 'buy'
    const color = isBuy ? '#971b2f' : '#34C759'
    return (
      <g key={`d-${cx}-${cy}`}>
        <circle cx={cx} cy={cy} r={9} fill={color} fillOpacity={0.15} />
        <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
        <text x={cx} y={cy - 13} textAnchor="middle" fontSize={9} fontWeight="800" fill={color}>
          {isBuy ? 'B' : 'S'}
        </text>
      </g>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-apple-gray-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-900">{t('assets.navTrend')}</p>
        <div className="flex items-center gap-3 text-xs text-apple-gray-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-blue inline-block" />
            {t('product.buy')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-green inline-block" />
            {t('product.sell')}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#AEAEB2' }}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
          />
          <YAxis
            domain={[minVal - pad, maxVal + pad]}
            tick={{ fontSize: 10, fill: '#AEAEB2' }}
            tickLine={false}
            axisLine={false}
            width={50}
            tickFormatter={v => `$${Number(v).toFixed(2)}`}
          />
          <Tooltip content={<ChartTooltip t={t} />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#971b2f"
            strokeWidth={1.5}
            dot={renderDot}
            activeDot={{ r: 4, fill: '#971b2f', stroke: 'white', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
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
        <div className="px-4 bg-apple-gray-6 border-t border-apple-gray-5">
          <p className="text-xs font-semibold text-apple-gray-1 uppercase tracking-wide pt-3 mb-1">
            {t('order.statusHistory')}
          </p>
          <StatusTimeline history={tx.statusHistory} />
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
              { label: t('assets.cost'),    value: `$${holding.costValue.toFixed(2)}` },
              { label: t('assets.costNav'), value: `$${holding.costNav.toFixed(4)}` },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-apple-gray-1 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {transactions.length > 0 && <HoldingChart transactions={transactions} />}

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

