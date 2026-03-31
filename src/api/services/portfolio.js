import http from '../http'

export const portfolioApi = {
  getHoldings: () =>
    http.get('/portfolio/holdings'),

  getAssetSummary: () =>
    http.get('/portfolio/summary'),

  getTransactions: () =>
    http.get('/portfolio/transactions'),

  getProductAccounts: () =>
    http.get('/portfolio/accounts'),
}
