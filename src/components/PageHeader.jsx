import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function PageHeader({ title, back, right }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <div className="sticky top-12 lg:top-0 z-30 bg-apple-gray-6/80 backdrop-blur-xl">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="w-16">
          {back && (
            <button onClick={() => navigate(-1)} className="flex items-center text-apple-blue text-sm font-medium">
              <svg className="w-5 h-5 mr-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {t('common.back')}
            </button>
          )}
        </div>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        <div className="w-16 flex justify-end">{right}</div>
      </div>
    </div>
  )
}
