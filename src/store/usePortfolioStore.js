import { create } from 'zustand'
import { portfolioApi } from '../api'

const usePortfolioStore = create((set) => ({
  summary: null,
  holdings: [],
  transactions: [],
  loading: false,

  fetchSummary: async () => {
    set({ loading: true })
    try {
      const [summary, holdings] = await Promise.all([
        portfolioApi.getAssetSummary(),
        portfolioApi.getHoldings(),
      ])
      set({ summary, holdings })
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
