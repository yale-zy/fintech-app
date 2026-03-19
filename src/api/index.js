import { mockUsers, mockProducts, mockChartData, mockHoldings, mockTransactions } from './mockData'

// Simulate network delay
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms))

// Auth
export const authApi = {
  async login(username, password) {
    await delay()
    const user = mockUsers.find(u => u.username === username && u.password === password)
    if (!user) throw new Error('invalid_credentials')
    const { password: _, ...userInfo } = user
    return { token: 'mock-token-' + user.id, user: userInfo }
  },
  async getProfile() {
    await delay(200)
    const { password: _, ...userInfo } = mockUsers[0]
    return userInfo
  },
}

// Products
export const productApi = {
  async getList(params = {}) {
    await delay()
    let list = [...mockProducts]
    if (params.type) list = list.filter(p => p.type === params.type)
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(kw) || p.code.includes(kw))
    }
    return list
  },
  async getDetail(id) {
    await delay()
    const product = mockProducts.find(p => p.id === id)
    if (!product) throw new Error('product_not_found')
    return { ...product, chartData: mockChartData[id] }
  },
}

// Portfolio & assets
export const portfolioApi = {
  async getHoldings() {
    await delay()
    return mockHoldings.map(h => {
      const product = mockProducts.find(p => p.id === h.productId)
      const currentValue = h.shares * product.nav
      const costValue = h.shares * h.costNav
      const profit = currentValue - costValue
      const profitRate = (profit / costValue) * 100
      return {
        ...h,
        product,
        currentValue: parseFloat(currentValue.toFixed(2)),
        costValue: parseFloat(costValue.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        profitRate: parseFloat(profitRate.toFixed(2)),
      }
    })
  },
  async getAssetSummary() {
    await delay(200)
    const holdings = await portfolioApi.getHoldings()
    const totalAsset = holdings.reduce((sum, h) => sum + h.currentValue, 0)
    const totalCost = holdings.reduce((sum, h) => sum + h.costValue, 0)
    const totalProfit = totalAsset - totalCost
    const totalProfitRate = (totalProfit / totalCost) * 100
    return {
      totalAsset: parseFloat(totalAsset.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalProfitRate: parseFloat(totalProfitRate.toFixed(2)),
      cash: 28650.00,
    }
  },
  async getTransactions() {
    await delay()
    return mockTransactions.map(t => ({
      ...t,
      product: mockProducts.find(p => p.id === t.productId),
    }))
  },
}

// Trading
export const tradeApi = {
  async buy({ productId, amount }) {
    await delay(600)
    const product = mockProducts.find(p => p.id === productId)
    if (!product) throw new Error('product_not_found')
    if (amount < product.minAmount) throw new Error(`Minimum investment is ¥${product.minAmount}`)
    const shares = parseFloat((amount / product.nav).toFixed(4))
    return {
      success: true,
      orderId: 'ORD' + Date.now(),
      productName: product.name,
      amount,
      shares,
      nav: product.nav,
      message: 'Purchase submitted. Shares confirmed T+1.',
    }
  },
  async sell({ productId, shares }) {
    await delay(600)
    const product = mockProducts.find(p => p.id === productId)
    if (!product) throw new Error('product_not_found')
    const amount = parseFloat((shares * product.nav).toFixed(2))
    return {
      success: true,
      orderId: 'ORD' + Date.now(),
      productName: product.name,
      amount,
      shares,
      nav: product.nav,
      message: 'Redemption submitted. Funds arrive T+3.',
    }
  },
}
