import axios from 'axios'
import config from '../config'
import { mockHandler, resolveMockKey, mockedEndpoints } from './mock/handlers'

const http = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach token, short-circuit with mock if endpoint is in mockedEndpoints
http.interceptors.request.use(async cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`

  const label = resolveMockKey(cfg)
  if (label && mockedEndpoints.has(label)) {
    try {
      const { data } = await mockHandler(cfg)
      return Promise.reject({ isMockIntercepted: true, mockResult: data })
    } catch (e) {
      if (e.isMockIntercepted) return Promise.reject(e)
      return Promise.reject(e)
    }
  }

  return cfg
})

http.interceptors.response.use(
  res => res.data,
  async err => {
    if (err.isMockIntercepted) return err.mockResult

    const status = err.response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data || err)
  }
)

export default http
