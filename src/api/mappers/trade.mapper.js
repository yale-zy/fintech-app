/**
 * Maps raw API trade response → TradeResultViewModel
 */
export function mapTradeResult(raw) {
  if (!raw) return null
  return {
    success:        raw.success,
    tradeId:        raw.tradeId,
    action:         raw.action,
    customerNumber: raw.customerNumber,
    accountNumber:  raw.accountNumber,
    accountType:    raw.accountType,
    orderId:        raw.orderId,
    asset:          raw.asset,
    assetAmount:    raw.assetAmount,
    tradeDate:      raw.tradeDate,
    message:        raw.message,
  }
}

/**
 * Maps raw API trade status response → TradeStatusViewModel
 */
export function mapTradeStatus(raw) {
  if (!raw) return null
  return {
    tradeId:       raw.tradeId,
    orderId:       raw.orderId,
    action:        raw.action,
    asset:         raw.asset,
    assetAmount:   raw.assetAmount,
    status:        raw.status,
    statusHistory: raw.statusHistory || [],
    tradeDate:     raw.tradeDate,
    message:       raw.message,
  }
}
