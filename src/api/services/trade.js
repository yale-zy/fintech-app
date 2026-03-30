import http from '../http'

export const tradeApi = {
  buy: ({ productId, amount }) =>
    http.post('/trade/buy', { productId, amount }),

  sell: ({ productId, shares }) =>
    http.post('/trade/sell', { productId, shares }),
}
