// Mock user data
export const mockUsers = [
  { id: 1, username: 'demo', password: '123456', name: 'Wei Zhang', avatar: null },
]

// Mock product data
export const mockProducts = [
  // Funds
  { id: 'f001', type: 'fund', name: 'EF Blue Chip Select Mixed', code: '005827', category: 'Mixed', risk: 'med-high', nav: 2.3451, change: 0.0234, changeRate: 1.01, minAmount: 100, annualReturn: 28.5, description: 'Focused on consumer, healthcare and tech sector leaders' },
  { id: 'f002', type: 'fund', name: 'CE Healthcare Mixed A', code: '003095', category: 'Mixed', risk: 'med-high', nav: 4.1230, change: -0.0312, changeRate: -0.75, minAmount: 100, annualReturn: 35.2, description: 'Dedicated healthcare and medical industry fund' },
  { id: 'f003', type: 'fund', name: 'TH Yu\'ebao Money A', code: '000198', category: 'Money Market', risk: 'low', nav: 1.0000, change: 0.0001, changeRate: 0.01, minAmount: 1, annualReturn: 1.85, description: 'Flexible money market fund, low risk' },
  { id: 'f004', type: 'fund', name: 'HX CSI 300 ETF', code: '510330', category: 'Index', risk: 'med', nav: 4.5670, change: 0.0456, changeRate: 1.01, minAmount: 100, annualReturn: 12.3, description: 'Tracks the CSI 300 Index' },
  { id: 'f005', type: 'fund', name: 'FG Tianhui Growth Mixed A', code: '161005', category: 'Mixed', risk: 'med-high', nav: 18.2340, change: 0.1823, changeRate: 1.01, minAmount: 100, annualReturn: 22.1, description: 'Long-term growth oriented mixed fund' },
  // Stocks
  { id: 's001', type: 'stock', name: 'Kweichow Moutai', code: '600519', category: 'A-Share', risk: 'high', nav: 1698.00, change: 12.00, changeRate: 0.71, minAmount: 1698, annualReturn: null, description: 'Leading premium baijiu brand, blue-chip consumer stock' },
  { id: 's002', type: 'stock', name: 'CATL', code: '300750', category: 'A-Share', risk: 'high', nav: 234.50, change: -3.20, changeRate: -1.35, minAmount: 234.5, annualReturn: null, description: 'Global leader in EV battery manufacturing' },
  { id: 's003', type: 'stock', name: 'China Merchants Bank', code: '600036', category: 'A-Share', risk: 'med', nav: 38.20, change: 0.45, changeRate: 1.19, minAmount: 382, annualReturn: null, description: 'High-quality joint-stock commercial bank' },
  { id: 's004', type: 'stock', name: 'BYD', code: '002594', category: 'A-Share', risk: 'high', nav: 278.30, change: 5.60, changeRate: 2.05, minAmount: 278.3, annualReturn: null, description: 'Leading new energy vehicle and battery company' },
  // Wealth management
  { id: 'w001', type: 'wealth', name: 'CMB Wealth Stable', code: 'ZY2024001', category: 'Fixed Income', risk: 'low', nav: 1.0523, change: 0.0002, changeRate: 0.02, minAmount: 10000, annualReturn: 3.2, description: 'Stable fixed-income wealth product, 180-day term' },
  { id: 'w002', type: 'wealth', name: 'ICBC Wealth Enhanced', code: 'GY2024002', category: 'Enhanced Fixed', risk: 'med-low', nav: 1.1234, change: 0.0003, changeRate: 0.03, minAmount: 50000, annualReturn: 4.1, description: 'Enhanced fixed-income wealth product, 365-day term' },
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

// Mock holdings
export const mockHoldings = [
  { productId: 'f001', shares: 1000, costNav: 2.1200, buyDate: '2024-01-15' },
  { productId: 'f003', shares: 50000, costNav: 1.0000, buyDate: '2024-03-01' },
  { productId: 's001', shares: 10, costNav: 1650.00, buyDate: '2024-02-20' },
  { productId: 'w001', shares: 20000, costNav: 1.0000, buyDate: '2024-04-10' },
]

// Mock transactions
export const mockTransactions = [
  { id: 't001', productId: 'f001', type: 'buy', amount: 2120, shares: 1000, nav: 2.1200, date: '2024-01-15 10:23' },
  { id: 't002', productId: 'f003', type: 'buy', amount: 50000, shares: 50000, nav: 1.0000, date: '2024-03-01 09:15' },
  { id: 't003', productId: 's001', type: 'buy', amount: 16500, shares: 10, nav: 1650.00, date: '2024-02-20 14:30' },
  { id: 't004', productId: 'w001', type: 'buy', amount: 20000, shares: 20000, nav: 1.0000, date: '2024-04-10 11:00' },
]
