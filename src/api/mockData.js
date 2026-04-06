// Mock user data
export const mockUsers = [
  { id: 1, username: 'demo', password: '123456', name: 'Wei Zhang', customerNumber: 'CUST-001827', avatar: null },
]

// Mock product data — 2 products only
export const mockProducts = [
  { id: 'p001', type: 'fund',   name: 'EF Blue Chip Select Mixed', code: '005827',    category: 'Mixed',        risk: 'med-high', nav: 2.3451, change: 0.0234,  changeRate:  1.01, minAmount: 100,   annualReturn: 28.5, description: 'Focused on consumer, healthcare and tech sector leaders' },
  { id: 'p002', type: 'wealth', name: 'CMB Wealth Stable',         code: 'ZY2024001', category: 'Fixed Income', risk: 'low',      nav: 1.0523, change: 0.0002,  changeRate:  0.02, minAmount: 10000, annualReturn: 3.2,  description: 'Stable fixed-income wealth product, 180-day term' },
]

// Generate chart data
function generateChartData(basePrice, days = 30) {
  const data = []
  let price = basePrice
  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    price = price * (1 + (Math.random() - 0.48) * 0.03)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(price.toFixed(4)),
    })
  }
  return data
}

export const mockChartData = {}
mockProducts.forEach(p => {
  mockChartData[p.id] = generateChartData(p.nav)
})

// Mock holdings — 1 holding
export const mockHoldings = [
  { productId: 'p001', shares: 1000, costNav: 2.1200, buyDate: '2024-01-15' },
]

// Product accounts — one per product, linked to the user
export const mockProductAccounts = [
  { id: 'acc001', productId: 'p001', accountNo: 'FA-2024-001827', customerNumber: 'CUST-001827', balance: 2345.10, currency: 'CNY' },
  { id: 'acc002', productId: 'p002', accountNo: 'WA-2024-002001', customerNumber: 'CUST-001827', balance: 10523.00, currency: 'CNY' },
]

// Mock transactions
export const mockTransactions = [
  { id: 't001', orderId: 'ORD20240115001', orderStatus: 'filled',   productId: 'p001', type: 'buy',  amount: 2120,  shares: 1000,  nav: 2.1200, date: '2024-01-15 10:23', status: 'success',    statusHistory: [{ status: 'purchasing', time: '2024-01-15 10:23' }, { status: 'success', time: '2024-01-16 09:00' }] },
  { id: 't002', orderId: 'ORD20240210002', orderStatus: 'filled',   productId: 'p002', type: 'buy',  amount: 10000, shares: 9503,  nav: 1.0523, date: '2024-02-10 09:15', status: 'success',    statusHistory: [{ status: 'purchasing', time: '2024-02-10 09:15' }, { status: 'success', time: '2024-02-11 09:00' }] },
  { id: 't003', orderId: 'ORD20240502003', orderStatus: 'filled',   productId: 'p001', type: 'sell', amount: 500,   shares: 210,   nav: 2.3800, date: '2024-05-02 13:45', status: 'success',    statusHistory: [{ status: 'purchasing', time: '2024-05-02 13:45' }, { status: 'success', time: '2024-05-05 09:00' }] },
  { id: 't004', orderId: 'ORD20240715004', orderStatus: 'pending',  productId: 'p001', type: 'buy',  amount: 3000,  shares: 1279,  nav: 2.3451, date: '2024-07-15 09:15', status: 'purchasing', statusHistory: [{ status: 'purchasing', time: '2024-07-15 09:15' }] },
  { id: 't005', orderId: 'ORD20240801005', orderStatus: 'rejected', productId: 'p002', type: 'buy',  amount: 20000, shares: 19007, nav: 1.0523, date: '2024-08-01 10:30', status: 'failed',     statusHistory: [{ status: 'purchasing', time: '2024-08-01 10:30' }, { status: 'failed', time: '2024-08-01 15:00' }] },
  { id: 't006', orderId: 'ORD20240910006', orderStatus: 'filled',   productId: 'p001', type: 'buy',  amount: 1000,  shares: 426,   nav: 2.3451, date: '2024-09-10 11:00', status: 'success',    statusHistory: [{ status: 'purchasing', time: '2024-09-10 11:00' }, { status: 'success', time: '2024-09-11 09:00' }] },
  { id: 't007', orderId: 'ORD20240920007', orderStatus: 'filled',   productId: 'p002', type: 'sell', amount: 5000,  shares: 4752,  nav: 1.0523, date: '2024-09-20 14:00', status: 'success',    statusHistory: [{ status: 'purchasing', time: '2024-09-20 14:00' }, { status: 'success', time: '2024-09-23 09:00' }] },
  { id: 't008', orderId: 'ORD20241005008', orderStatus: 'rejected', productId: 'p001', type: 'sell', amount: 800,   shares: 341,   nav: 2.3451, date: '2024-10-05 10:30', status: 'failed',     statusHistory: [{ status: 'purchasing', time: '2024-10-05 10:30' }, { status: 'failed', time: '2024-10-05 15:00' }] },
  { id: 't009', orderId: 'ORD20241015009', orderStatus: 'filled',   productId: 'p002', type: 'buy',  amount: 15000, shares: 14254, nav: 1.0523, date: '2024-10-15 09:00', status: 'success',    statusHistory: [{ status: 'purchasing', time: '2024-10-15 09:00' }, { status: 'success', time: '2024-10-16 09:00' }] },
  { id: 't010', orderId: 'ORD20241101010', orderStatus: 'pending',  productId: 'p001', type: 'buy',  amount: 2000,  shares: 853,   nav: 2.3451, date: '2024-11-01 10:00', status: 'purchasing', statusHistory: [{ status: 'purchasing', time: '2024-11-01 10:00' }] },
  { id: 't011', orderId: 'ORD20241110011', orderStatus: 'pending',  productId: 'p002', type: 'buy',  amount: 8000,  shares: 7603,  nav: 1.0523, date: '2024-11-10 11:30', status: 'purchasing', statusHistory: [{ status: 'purchasing', time: '2024-11-10 11:30' }] },
]
