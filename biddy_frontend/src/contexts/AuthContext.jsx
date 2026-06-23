import { createContext, useContext, useMemo, useState } from "react"
import { login as loginApi, logoutRequest, signup as signupApi } from "../api/authApi"

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

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(accessToken),
      accessToken,
      login,
      signup,
      logout,
    }),
    [accessToken],
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
