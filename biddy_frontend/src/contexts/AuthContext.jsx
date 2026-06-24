import { createContext, useContext, useMemo, useState } from "react"
import { login as loginApi, logoutRequest, signup as signupApi } from "../api/authApi"
import { decodeJwtPayload } from "../lib/jwt"

const AuthContext = createContext(null)

function getStoredToken(key) {
  return typeof window !== "undefined" ? window.localStorage.getItem(key) : null
}

function storeTokens(tokens) {
  window.localStorage.setItem("accessToken", tokens.accessToken)
  window.localStorage.setItem("refreshToken", tokens.refreshToken)
}

function clearTokens() {
  window.localStorage.removeItem("accessToken")
  window.localStorage.removeItem("refreshToken")
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => getStoredToken("accessToken"))

  const login = async (credentials) => {
    const tokens = await loginApi(credentials)
    storeTokens(tokens)
    setAccessToken(tokens.accessToken)
  }

  const signup = (form) => signupApi(form)

  const logout = async () => {
    try {
      if (accessToken) {
        await logoutRequest()
      }
    } finally {
      clearTokens()
      setAccessToken(null)
    }
  }

  const user = useMemo(() => {
    if (!accessToken) return null
    const payload = decodeJwtPayload(accessToken)
    if (!payload) return null
    return {
      id: payload.sub ?? payload.memberId,
      role: payload.role ?? null,
    }
  }, [accessToken])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(accessToken),
      isAdmin: user?.role === "ADMIN",
      accessToken,
      user,
      login,
      signup,
      logout,
    }),
    [accessToken, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}