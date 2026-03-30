import http from '../http'

export const authApi = {
  login: (username, password) =>
    http.post('/auth/login', { username, password }),

  getProfile: () =>
    http.get('/auth/profile'),
}
