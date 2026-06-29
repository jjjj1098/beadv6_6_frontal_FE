import { createContext, useContext, useEffect, useMemo, useState } from "react"
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

  // 토큰의 exp 시각이 되면 아래 타이머가 "auth:expired" 이벤트를 던진다.
  // 여기서 React 상태를 비워주면 isAuthenticated가 false로 바뀌고,
  // ProtectedRoute가 자동으로 /login으로 보내준다 (서버에 다시 로그아웃 요청은 안 함 — 이미 만료된 토큰이므로).
  useEffect(() => {
    const handleExpired = () => {
      clearTokens()
      setAccessToken(null)
    }
    window.addEventListener("auth:expired", handleExpired)
    return () => window.removeEventListener("auth:expired", handleExpired)
  }, [])

  // accessToken이 바뀔 때마다, 토큰의 exp 시각에 맞춰 자동 로그아웃 타이머를 건다.
  // API 요청 없이 가만히 있어도 만료 시각이 되면 바로 "auth:expired"를 발생시킨다.
  useEffect(() => {
    if (!accessToken) return

    const payload = decodeJwtPayload(accessToken)
    const expMs = payload?.exp ? payload.exp * 1000 : null
    if (!expMs) return

    const delay = expMs - Date.now()
    if (delay <= 0) {
      window.dispatchEvent(new Event("auth:expired"))
      return
    }

    const timerId = window.setTimeout(() => {
      window.dispatchEvent(new Event("auth:expired"))
    }, delay)

    return () => window.clearTimeout(timerId)
  }, [accessToken])

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
    } catch (error) {
      console.warn("Server logout request failed, clearing local tokens anyway:", error)
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