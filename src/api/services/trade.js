import http from '../http'

export const tradeApi = {
  buy: ({ customerNumber, accountNumber, amount }) =>
    http.post('/trade/buy', { customerNumber, accountNumber, action: 'BUY', amount }),

  sell: ({ customerNumber, accountNumber, shares }) =>
    http.post('/trade/sell', { customerNumber, accountNumber, action: 'SELL', amount: shares }),
}
