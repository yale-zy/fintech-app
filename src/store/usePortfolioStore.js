import { create } from 'zustand'
import { portfolioApi } from '../api'

const usePortfolioStore = create((set) => ({
  summary: null,
  holdings: [],
  transactions: [],
  accounts: [],
  totalAccountBalance: null,
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

  fetchTotalAccountBalance: async () => {
    const accounts = await portfolioApi.getProductAccounts()
    const balances = await Promise.all(
      accounts.map(acc => portfolioApi.getAccountBalance(acc.accountNo))
    )
    const total = balances.reduce((sum, b) => sum + (b?.balance ?? 0), 0)
    set({ totalAccountBalance: total })
  },
}))

export default usePortfolioStore
