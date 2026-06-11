import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'divre_token'
const USER_KEY = 'divre_user'

function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function decodeJwtPayload(token) {
  const encodedPayload = token?.split('.')?.[1]

  if (!encodedPayload) {
    return null
  }

  try {
    const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    )

    return JSON.parse(atob(paddedPayload))
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const decoded = decodeJwtPayload(token)

  if (!decoded?.exp) {
    return true
  }

  return decoded.exp * 1000 <= Date.now()
}

function readStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    clearStoredAuth()
    return null
  }
}

function readStoredAuth() {
  const storedToken = localStorage.getItem(TOKEN_KEY)
  const storedUser = readStoredUser()

  if (!storedToken || !storedUser || isTokenExpired(storedToken)) {
    clearStoredAuth()
    return { token: null, user: null }
  }

  return { token: storedToken, user: storedUser }
}

export function AuthProvider({ children }) {
  const [storedAuth] = useState(() => readStoredAuth())
  const [token, setToken] = useState(storedAuth.token)
  const [user, setUser] = useState(storedAuth.user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const clearAuthState = useCallback(() => {
    clearStoredAuth()
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [user])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } finally {
      clearAuthState()
    }
  }, [clearAuthState])

  useEffect(() => {
    if (!token) {
      return undefined
    }

    const decoded = decodeJwtPayload(token)

    if (!decoded?.exp) {
      const timer = window.setTimeout(clearAuthState, 0)
      return () => window.clearTimeout(timer)
    }

    const delay = decoded.exp * 1000 - Date.now()

    if (delay <= 0) {
      const timer = window.setTimeout(clearAuthState, 0)
      return () => window.clearTimeout(timer)
    }

    const timer = window.setTimeout(() => {
      clearAuthState()
    }, delay)

    return () => window.clearTimeout(timer)
  }, [clearAuthState, token])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { token: nextToken, user: nextUser } = response.data.data

      if (!nextToken || !nextUser || isTokenExpired(nextToken)) {
        throw new Error('Token login tidak valid')
      }

      setToken(nextToken)
      setUser(nextUser)

      return nextUser
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || 'Login gagal'
      setError(message)
      throw new Error(message, { cause: err })
    } finally {
      setLoading(false)
    }
  }, [])

  const isAuthenticated = Boolean(token && user && !isTokenExpired(token))
  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      isAuthenticated,
      login,
      logout
    }),
    [error, isAuthenticated, loading, login, logout, token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
