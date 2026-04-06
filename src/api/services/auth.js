import http from '../http'
import { mapLoginResponse, mapUser } from '../mappers/auth.mapper'

export const authApi = {
  login: async (username, password) => {
    const data = await http.post('/auth/login', { username, password })
    return mapLoginResponse(data)
  },

  getProfile: async () => {
    const data = await http.get('/auth/profile')
    return mapUser(data)
  },
}
