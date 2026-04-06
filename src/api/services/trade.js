import http from '../http'
import { mapTradeResult, mapTradeStatus } from '../mappers/trade.mapper'

export const tradeApi = {
  buy: async ({ customerNumber, accountNumber, amount }) => {
    const data = await http.post('/trade/buy', { customerNumber, accountNumber, action: 'BUY', amount })
    return mapTradeResult(data)
  },

  sell: async ({ customerNumber, accountNumber, shares }) => {
    const data = await http.post('/trade/sell', { customerNumber, accountNumber, action: 'SELL', amount: shares })
    return mapTradeResult(data)
  },

  getStatus: async (tradeId) => {
    const data = await http.get(`/trade/status/${tradeId}`)
    return mapTradeStatus(data)
  },
}
