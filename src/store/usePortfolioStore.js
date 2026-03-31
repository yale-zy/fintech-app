import { create } from 'zustand'
import { portfolioApi } from '../api'

const usePortfolioStore = create((set) => ({
  summary: null,
  holdings: [],
  transactions: [],
  accounts: [],
  loading: false,

  fetchSummary: async () => {
    set({ loading: true })
    try {
      const [summary, holdings, accounts] = await Promise.all([
        portfolioApi.getAssetSummary(),
        portfolioApi.getHoldings(),
        portfolioApi.getProductAccounts(),
      ])
      set({ summary, holdings, accounts })
    } finally {
      set({ loading: false })
    }
  },

  fetchTransactions: async () => {
    const transactions = await portfolioApi.getTransactions()
    set({ transactions })
  },
}))

export default usePortfolioStore
