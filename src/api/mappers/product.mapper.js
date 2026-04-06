/**
 * Maps raw API product response → ProductViewModel
 */
export function mapProduct(raw) {
  if (!raw) return null
  return {
    id:                 raw.id,
    code:               raw.code,
    name:               raw.name,
    type:               raw.type,
    category:           raw.category,
    risk:               raw.risk,
    nav:                raw.nav,
    change:             raw.change,
    changeRate:         raw.changeRate,
    isUp:               raw.changeRate >= 0,
    minAmount:          raw.minAmount,
    minTradeAmount:     raw.minTradeAmount ?? raw.minAmount,
    annualReturn:       raw.annualReturn ?? null,
    description:        raw.description ?? '',
    issuer:             raw.issuer ?? null,
    exchange:           raw.exchange ?? null,
    assetType:          raw.assetType ?? null,
    pegCurrency:        raw.pegCurrency ?? null,
    pegRatio:           raw.pegRatio ?? null,
    pricingModel:       raw.pricingModel ?? null,
    settlementCurrency: raw.settlementCurrency ?? null,
    settlementCycle:    raw.settlementCycle ?? null,
    managementFee:      raw.managementFee ?? null,
    custodianFee:       raw.custodianFee ?? null,
  }
}

export function mapProductList(rawList) {
  return (rawList ?? []).map(mapProduct)
}
