import { mockUsers, mockProducts, mockChartData, mockHoldings, mockTransactions, mockProductAccounts } from '../mockData'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

// Route table: { method, urlPattern } → handler(config, params)
const routes = [
  // Auth
  {
    method: 'post', url: /^\/auth\/login$/,
    async handler(cfg) {
      await delay()
      const { username, password } = typeof cfg.data === 'string' ? JSON.parse(cfg.data) : cfg.data
      const user = mockUsers.find(u => u.username === username && u.password === password)
      if (!user) throw { message: 'invalid_credentials', status: 401 }
      const { password: _, ...userInfo } = user
      return { token: 'mock-token-' + user.id, user: userInfo }
    },
  },
  {
    method: 'get', url: /^\/auth\/profile$/,
    async handler() {
      await delay(200)
      const { password: _, ...userInfo } = mockUsers[0]
      return userInfo
    },
  },

  // Products
  {
    method: 'get', url: /^\/products$/,
    async handler(cfg) {
      await delay()
      const params = cfg.params || {}
      let list = [...mockProducts]
      if (params.type) list = list.filter(p => p.type === params.type)
      if (params.keyword) {
        const kw = params.keyword.toLowerCase()
        list = list.filter(p => p.name.toLowerCase().includes(kw) || p.code.includes(kw))
      }
      return list
    },
  },
  {
    method: 'get', url: /^\/products\/(.+)$/,
    async handler(cfg, [id]) {
      await delay()
      const product = mockProducts.find(p => p.id === id)
      if (!product) throw { message: 'product_not_found', status: 404 }
      return { ...product, chartData: mockChartData[id] }
    },
  },

  // Portfolio
  {
    method: 'get', url: /^\/portfolio\/holdings$/,
    async handler() {
      await delay()
      return mockHoldings.map(h => {
        const product = mockProducts.find(p => p.id === h.productId)
        const currentValue = h.shares * product.nav
        const costValue = h.shares * h.costNav
        const profit = currentValue - costValue
        const profitRate = (profit / costValue) * 100
        return {
          ...h, product,
          currentValue: parseFloat(currentValue.toFixed(2)),
          costValue: parseFloat(costValue.toFixed(2)),
          profit: parseFloat(profit.toFixed(2)),
          profitRate: parseFloat(profitRate.toFixed(2)),
        }
      })
    },
  },
  {
    method: 'get', url: /^\/portfolio\/summary$/,
    async handler() {
      await delay(200)
      const holdings = mockHoldings.map(h => {
        const product = mockProducts.find(p => p.id === h.productId)
        return { currentValue: h.shares * product.nav, costValue: h.shares * h.costNav }
      })
      const totalAsset = holdings.reduce((s, h) => s + h.currentValue, 0)
      const totalCost = holdings.reduce((s, h) => s + h.costValue, 0)
      const totalProfit = totalAsset - totalCost
      return {
        totalAsset: parseFloat(totalAsset.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        totalProfitRate: parseFloat(((totalProfit / totalCost) * 100).toFixed(2)),
        cash: 28650.00,
      }
    },
  },
  {
    method: 'get', url: /^\/portfolio\/transactions$/,
    async handler() {
      await delay()
      return mockTransactions.map(t => ({
        ...t,
        product: mockProducts.find(p => p.id === t.productId),
      }))
    },
  },
  {
    method: 'get', url: /^\/portfolio\/accounts$/,
    async handler() {
      await delay(200)
      return mockProductAccounts.map(acc => ({
        ...acc,
        product: mockProducts.find(p => p.id === acc.productId),
      }))
    },
  },

  // Trade
  {
    method: 'post', url: /^\/trade\/buy$/,
    async handler(cfg) {
      await delay(600)
      const { productId, amount } = typeof cfg.data === 'string' ? JSON.parse(cfg.data) : cfg.data
      const product = mockProducts.find(p => p.id === productId)
      if (!product) throw { message: 'product_not_found', status: 404 }
      return {
        success: true,
        orderId: 'ORD' + Date.now(),
        tradeDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        action: 'Buy',
        status: 'Pending',
        productName: product.name,
        assetAmount: parseFloat((amount / product.nav).toFixed(4)),
        paymentAmount: amount,
        paymentAction: 'Debit',
        amount,
        shares: parseFloat((amount / product.nav).toFixed(4)),
        nav: product.nav,
        message: 'Purchase submitted. Shares confirmed T+1.',
      }
    },
  },
  {
    method: 'post', url: /^\/trade\/sell$/,
    async handler(cfg) {
      await delay(600)
      const { productId, shares } = typeof cfg.data === 'string' ? JSON.parse(cfg.data) : cfg.data
      const product = mockProducts.find(p => p.id === productId)
      if (!product) throw { message: 'product_not_found', status: 404 }
      return {
        success: true,
        orderId: 'ORD' + Date.now(),
        tradeDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        action: 'Sell',
        status: 'Pending',
        productName: product.name,
        assetAmount: shares,
        paymentAmount: parseFloat((shares * product.nav).toFixed(2)),
        paymentAction: 'Credit',
        amount: parseFloat((shares * product.nav).toFixed(2)),
        shares,
        nav: product.nav,
        message: 'Redemption submitted. Funds arrive T+3.',
      }
    },
  },
]

export async function mockHandler(cfg) {
  // Strip base URL to get just the path
  const url = cfg.url.replace(cfg.baseURL || '', '').split('?')[0]
  const method = (cfg.method || 'get').toLowerCase()

  for (const route of routes) {
    if (route.method !== method) continue
    const match = url.match(route.url)
    if (match) {
      return route.handler(cfg, match.slice(1))
    }
  }

  throw { message: `No mock handler for ${method.toUpperCase()} ${url}`, status: 404 }
}
