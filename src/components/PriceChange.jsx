import clsx from 'clsx'

export default function PriceChange({ value, suffix = '%', className }) {
  const isPositive = value > 0
  const isNegative = value < 0
  return (
    <span className={clsx(
      'font-medium',
      isPositive && 'text-apple-red',
      isNegative && 'text-apple-green',
      !isPositive && !isNegative && 'text-apple-gray-1',
      className
    )}>
      {isPositive ? '+' : ''}{value}{suffix}
    </span>
  )
}
