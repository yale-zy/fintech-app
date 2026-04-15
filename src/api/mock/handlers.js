/**
 * Mock route registry
 *
 * Each route maps to an endpoint folder under ./endpoints/<key>/
 *   response.json  — the static mock response (edit this to change mock data)
 *
 * To unmock an endpoint: comment it out or delete it from mockedEndpoints.
 * To mock an endpoint:   make sure it's listed here.
 */

export const mockedEndpoints = new Set([
  'POST /auth/login',
  'GET /auth/profile',
  'GET /products',
  'GET /products/:id',
  'GET /portfolio/holdings',
  'GET /portfolio/summary',
  'GET /portfolio/transactions',
  'GET /portfolio/accounts',
  'GET /portfolio/account-balances/:accountNo',
  'POST /trade/buy',
  'POST /trade/sell',
  'GET /trade/status/:tradeId',
])

import authLogin       from './endpoints/auth_login/response.json'
import authProfile     from './endpoints/auth_profile/response.json'
import products        from './endpoints/products/response.json'
import productsDetail  from './endpoints/products_detail/response.json'
import holdings        from './endpoints/portfolio_holdings/response.json'
import summary         from './endpoints/portfolio_summary/response.json'
import transactions    from './endpoints/portfolio_transactions/response.json'
import accounts        from './endpoints/portfolio_accounts/response.json'
import tradeBuy        from './endpoints/trade_buy/response.json'
import tradeSell       from './endpoints/trade_sell/response.json'
import tradeStatus     from './endpoints/trade_status/response.json'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

const routes = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  {
    key: 'auth_login', label: 'POST /auth/login', method: 'post', url: /^\/auth\/login$/,
    async handler(cfg) {
      await delay()
      const { username, password } = typeof cfg.data === 'string' ? JSON.parse(cfg.data) : cfg.data
      if (username !== 'demo' || password !== '123456') throw { message: 'invalid_credentials', status: 401 }
      return authLogin
    },
  },
  {
    key: 'auth_profile', label: 'GET /auth/profile', method: 'get', url: /^\/auth\/profile$/,
    async handler() { await delay(200); return authProfile },
  },

  // ── Products ──────────────────────────────────────────────────────────────
  {
    key: 'products', label: 'GET /products', method: 'get', url: /^\/products$/,
    async handler(cfg) {
      await delay()
      const { type, keyword } = cfg.params || {}
      let list = [...products]
      if (type) list = list.filter(p => p.type === type)
      if (keyword) {
        const kw = keyword.toLowerCase()
        list = list.filter(p => p.name.toLowerCase().includes(kw) || p.code.includes(kw))
      }
      return list
    },
  },
  {
    key: 'products_detail', label: 'GET /products/:id', method: 'get', url: /^\/products\/(.+)$/,
    async handler(cfg, [id]) {
      await delay()
      const found = products.find(p => p.id === id)
      if (!found) throw { message: 'product_not_found', status: 404 }
      return found
    },
  },

  // ── Portfolio ─────────────────────────────────────────────────────────────
  {
    key: 'portfolio_holdings', label: 'GET /portfolio/holdings', method: 'get', url: /^\/portfolio\/holdings$/,
    async handler() { await delay(); return holdings },
  },
  {
    key: 'portfolio_summary', label: 'GET /portfolio/summary', method: 'get', url: /^\/portfolio\/summary$/,
    async handler() { await delay(200); return summary },
  },
  {
    key: 'portfolio_transactions', label: 'GET /portfolio/transactions', method: 'get', url: /^\/portfolio\/transactions$/,
    async handler() { await delay(); return transactions },
  },
  {
    key: 'portfolio_accounts', label: 'GET /portfolio/accounts', method: 'get', url: /^\/portfolio\/accounts$/,
    async handler() { await delay(200); return accounts },
  },
  {
    key: 'portfolio_account_balances', label: 'GET /portfolio/account-balances/:accountNo', method: 'get', url: /^\/portfolio\/account-balances\/(.+)$/,
    async handler(cfg, [accountNo]) {
      await delay(200)
      // Generate a deterministic balance from the account number suffix
      const suffix = parseInt(accountNo.replace(/\D/g, '').slice(-6), 10) || 1000
      const balance = parseFloat(((suffix % 90000) + 1000).toFixed(2))
      return { accountNo, balance, currency: 'CNY' }
    },
  },

  // ── Trade ─────────────────────────────────────────────────────────────────
  {
    key: 'trade_buy', label: 'POST /trade/buy', method: 'post', url: /^\/trade\/buy$/,
    async handler() {
      await delay(600)
      return { ...tradeBuy, tradeId: 'TRD' + Date.now(), orderId: 'ORD' + Date.now(), tradeDate: new Date().toISOString().slice(0, 19).replace('T', ' ') }
    },
  },
  {
    key: 'trade_sell', label: 'POST /trade/sell', method: 'post', url: /^\/trade\/sell$/,
    async handler() {
      await delay(600)
      return { ...tradeSell, tradeId: 'TRD' + Date.now(), orderId: 'ORD' + Date.now(), tradeDate: new Date().toISOString().slice(0, 19).replace('T', ' ') }
    },
  },
  {
    key: 'trade_status', label: 'GET /trade/status/:tradeId', method: 'get', url: /^\/trade\/status\/(.+)$/,
    async handler(cfg, [tradeId]) {
      await delay(400)
      const statuses = ['pending', 'pending', 'filled']
      const idx = parseInt(tradeId.slice(-1), 10) % statuses.length
      const status = statuses[idx] || 'pending'
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
      const history = [{ status: 'pending', timestamp: now }]
      if (status === 'filled') history.push({ status: 'filled', timestamp: now })
      return { ...tradeStatus, tradeId, status, statusHistory: history }
    },
  },
]

export async function mockHandler(cfg) {
  const url = cfg.url.replace(cfg.baseURL || '', '').split('?')[0]
  const method = (cfg.method || 'get').toLowerCase()
  for (const route of routes) {
    if (route.method !== method) continue
    const match = url.match(route.url)
    if (match) return { label: route.label, data: await route.handler(cfg, match.slice(1)) }
  }
  throw { message: `No mock handler for ${method.toUpperCase()} ${url}`, status: 404 }
}

export function resolveMockKey(cfg) {
  const url = cfg.url.replace(cfg.baseURL || '', '').split('?')[0]
  const method = (cfg.method || 'get').toLowerCase()
  for (const route of routes) {
    if (route.method !== method) continue
    if (url.match(route.url)) return route.label
  }
  return null
}

export const mockRouteKeys = routes.map(r => r.key)
