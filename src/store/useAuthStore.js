import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: async (username, password) => {
        const { token, user } = await authApi.login(username, password)
        set({ token, user, isLoggedIn: true })
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false })
      },
    }),
    { name: 'auth-storage' }
  )
)

export default useAuthStore
