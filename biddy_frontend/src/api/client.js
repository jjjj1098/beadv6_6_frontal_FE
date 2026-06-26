export const API_BASE_URL = "http://localhost:8000/api"

// Builds the headers for an authenticated request.
// JWT will be stored in localStorage under `accessToken` once auth is wired up.
export function getAuthHeaders(extra = {}) {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  const headers = getAuthHeaders(options.headers || {})
  
  const fetchOptions = { 
    mode: "cors",
    credentials: "omit",
    ...options, 
    headers 
  }
  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    fetchOptions.body = JSON.stringify(options.body)
  }
  
  const method = options.method || "GET"
  console.log("[apiRequest] →", method, url, "origin:", window.location.origin)

  const res = await fetch(url, fetchOptions)
  
  console.log("[apiRequest] ←", res.status, [...res.headers.entries()])

  const text = await res.text()
  console.log("[apiRequest] body:", text)

  if (!res.ok) {
    let errMsg = `오류 ${res.status}`
    try {
      const contentType = res.headers.get("Content-Type") || ""
      if (contentType.includes("application/json") && text) {
        const errorData = JSON.parse(text)
        errMsg = errorData.message || errMsg
      } else {
        errMsg = text || errMsg
      }
    } catch (e) {
      console.error("오류 파싱 실패:", e)
    }
    throw new Error(errMsg)
  }

  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    // If the response is successful (res.ok is true) but not JSON, return it as-is
    return text
  }

  return data
}
export function mockRequest(path, { data, delay = 350 } = {}) {
  return new Promise((resolve) => {
    console.log("[v0] mock API call:", path)
    setTimeout(() => resolve(structuredClone(data)), delay)
  })
}

// Auction Service 전용 API (Gateway 경유, /api/v1 prefix)
const AUCTION_API_BASE = "http://localhost:8000/api/v1"

export async function apiGet(path) {
  const headers = getAuthHeaders()
  const res = await fetch(`${AUCTION_API_BASE}${path}`, { headers })
  if (res.status === 401) { window.localStorage.removeItem("accessToken"); return null }
  if (!res.ok) throw new Error(res.statusText || `HTTP ${res.status}`)
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export async function apiPost(path, body) {
  const headers = getAuthHeaders()
  const res = await fetch(`${AUCTION_API_BASE}${path}`, {
    method: "POST", headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) throw new Error("Unauthorized")
  if (res.status === 403) throw new Error("Forbidden")
  if (!res.ok) {
    const text = await res.text()
    let msg = `HTTP ${res.status}`
    try { msg = JSON.parse(text).message || msg } catch {}
    throw new Error(msg)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export async function apiDelete(path) {
  const headers = getAuthHeaders()
  const res = await fetch(`${AUCTION_API_BASE}${path}`, { method: "DELETE", headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  return text ? JSON.parse(text) : null
}
