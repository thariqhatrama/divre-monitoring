import { createContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

function readStoredUser() {
  const rawUser = localStorage.getItem('divre_user')

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    localStorage.removeItem('divre_user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('divre_token'))
  const [user, setUser] = useState(() => readStoredUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      localStorage.setItem('divre_token', token)
    } else {
      localStorage.removeItem('divre_token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('divre_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('divre_user')
    }
  }, [user])

  async function login(email, password) {
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { token: nextToken, user: nextUser } = response.data.data

      setToken(nextToken)
      setUser(nextUser)

      return nextUser
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Login gagal'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout')
    } finally {
      setToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        isAuthenticated: Boolean(token && user),
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
