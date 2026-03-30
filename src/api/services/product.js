import http from '../http'

export const productApi = {
  getList: (params = {}) =>
    http.get('/products', { params }),

  getDetail: (id) =>
    http.get(`/products/${id}`),
}
