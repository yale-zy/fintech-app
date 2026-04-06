import { mapProduct } from './product.mapper'

/**
 * Maps raw API holding response → HoldingViewModel
 */
export function mapHolding(raw) {
  if (!raw) return null
  return {
    productId:    raw.productId,
    shares:       raw.shares,
    costNav:      raw.costNav,
    buyDate:      raw.buyDate,
    currentValue: raw.currentValue,
    costValue:    raw.costValue,
    profit:       raw.profit,
    profitRate:   raw.profitRate,
    isUp:         raw.profit >= 0,
    product:      mapProduct(raw.product),
  }
}

export function mapHoldingList(rawList) {
  return (rawList ?? []).map(mapHolding)
}

/**
 * Maps raw API summary response → SummaryViewModel
 */
export function mapSummary(raw) {
  if (!raw) return null
  return {
    totalAsset:      raw.totalAsset,
    totalCost:       raw.totalCost,
    totalProfit:     raw.totalProfit,
    totalProfitRate: raw.totalProfitRate,
    cash:            raw.cash,
    isUp:            raw.totalProfit >= 0,
  }
}

/**
 * Maps raw API transaction response → TransactionViewModel
 */
export function mapTransaction(raw) {
  if (!raw) return null
  return {
    id:            raw.id,
    orderId:       raw.orderId,
    orderStatus:   raw.orderStatus,
    productId:     raw.productId,
    type:          raw.type,
    amount:        raw.amount,
    shares:        raw.shares,
    nav:           raw.nav,
    date:          raw.date,
    status:        raw.status,
    statusHistory: raw.statusHistory ?? [],
    accountNo:     raw.accountNo ?? null,
    product:       mapProduct(raw.product),
  }
}

export function mapTransactionList(rawList) {
  return (rawList ?? []).map(mapTransaction)
}

/**
 * Maps raw API product account response → AccountViewModel
 */
export function mapAccount(raw) {
  if (!raw) return null
  return {
    id:             raw.id,
    productId:      raw.productId,
    accountNo:      raw.accountNo,
    customerNumber: raw.customerNumber,
    balance:        raw.balance,
    currency:       raw.currency,
    product:        mapProduct(raw.product),
  }
}

export function mapAccountList(rawList) {
  return (rawList ?? []).map(mapAccount)
}
