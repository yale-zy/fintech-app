import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Market from './pages/Market'
import ProductDetail from './pages/ProductDetail'
import Portfolio from './pages/Portfolio'
import Profile from './pages/Profile'

function PrivateRoute({ children }) {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  return isLoggedIn ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />
}

export default function App() {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/market" element={<PrivateRoute><Market /></PrivateRoute>} />
      <Route path="/product/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
      <Route path="/portfolio" element={<PrivateRoute><Portfolio /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="*" element={<Navigate to={isLoggedIn ? '/market' : '/login'} replace />} />
    </Routes>
  )
}
