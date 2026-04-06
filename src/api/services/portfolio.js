import http from '../http'
import { mapHoldingList, mapSummary, mapTransactionList, mapAccountList } from '../mappers/portfolio.mapper'

export const portfolioApi = {
  getHoldings: async () => {
    const data = await http.get('/portfolio/holdings')
    return mapHoldingList(data)
  },

  getAssetSummary: async () => {
    const data = await http.get('/portfolio/summary')
    return mapSummary(data)
  },

  getTransactions: async () => {
    const data = await http.get('/portfolio/transactions')
    return mapTransactionList(data)
  },

  getProductAccounts: async () => {
    const data = await http.get('/portfolio/accounts')
    return mapAccountList(data)
  },
}
