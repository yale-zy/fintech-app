import axios from 'axios'
import config from '../config'
import { mockHandler } from './mock/handlers'

const http = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach auth token
http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Response interceptor — mock or real
http.interceptors.response.use(
  res => res.data,
  async err => {
    const req = err.config

    // If mock mode is on, intercept the failed/pending request and return mock data
    if (config.useMock && req) {
      try {
        const mockResult = await mockHandler(req)
        return mockResult
      } catch (mockErr) {
        return Promise.reject(mockErr)
      }
    }

    // Real error handling
    const status = err.response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data || err)
  }
)

// When mock mode is on, intercept before the request even goes out
if (config.useMock) {
  http.interceptors.request.use(async cfg => {
    const mockResult = await mockHandler(cfg)
    // Return a resolved response so the response interceptor's success path runs
    return Promise.reject({
      config: cfg,
      isMockIntercepted: true,
      mockResult,
    })
  })

  // Catch the mock-intercepted "error" and resolve it
  http.interceptors.response.use(undefined, async err => {
    if (err.isMockIntercepted) return err.mockResult
    return Promise.reject(err)
  })
}

export default http
