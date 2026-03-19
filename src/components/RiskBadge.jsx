import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

// Maps mockData risk keys to i18n translation keys
const riskKeyMap = {
  'low': 'risk.low',
  'med-low': 'risk.medLow',
  'med': 'risk.med',
  'med-high': 'risk.medHigh',
  'high': 'risk.high',
}

const riskColors = {
  'low': 'bg-green-50 text-green-600',
  'med-low': 'bg-blue-50 text-blue-600',
  'med': 'bg-yellow-50 text-yellow-600',
  'med-high': 'bg-orange-50 text-orange-600',
  'high': 'bg-red-50 text-red-600',
}

export default function RiskBadge({ risk }) {
  const { t } = useTranslation()
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', riskColors[risk] || 'bg-gray-100 text-gray-500')}>
      {riskKeyMap[risk] ? t(riskKeyMap[risk]) : risk}
    </span>
  )
}
