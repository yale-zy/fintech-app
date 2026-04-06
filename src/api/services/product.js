import http from '../http'
import { mapProduct, mapProductList } from '../mappers/product.mapper'

export const productApi = {
  getList: async (params = {}) => {
    const data = await http.get('/products', { params })
    return mapProductList(data)
  },

  getDetail: async (id) => {
    const data = await http.get(`/products/${id}`)
    return mapProduct(data)
  },
}
