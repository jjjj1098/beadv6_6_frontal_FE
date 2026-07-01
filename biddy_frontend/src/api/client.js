const DEFAULT_API_BASE_URL = "/api"

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "")

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "")

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

// 회원 닉네임 캐시
const nicknameCache = {}

export async function fetchNickname(memberId) {
  if (!memberId) return null
  if (nicknameCache[memberId]) return nicknameCache[memberId]
  try {
    const res = await fetch(`${API_BASE_URL}/members/${memberId}/nickname`, { headers: getAuthHeaders() })
    if (res.ok) {
      const text = await res.text()
      if (text) {
        const data = JSON.parse(text)
        const name = data.nickname || data.name || null
        if (name) { nicknameCache[memberId] = name; return name }
      }
    }
  } catch {}
  return null
}

export async function fetchNicknames(memberIds) {
  const unique = [...new Set(memberIds.filter(Boolean))]
  const results = {}
  await Promise.all(unique.map(async (id) => {
    const name = await fetchNickname(id)
    results[id] = name || `회원 #${id}`
  }))
  return results
}

// Auction Service 전용 API (Gateway 경유, /api/v1 prefix)
const AUCTION_API_BASE = (import.meta.env.VITE_AUCTION_API_BASE_URL || `${API_ORIGIN}/api/v1`).replace(/\/$/, "")

export async function apiGet(path) {
  const headers = getAuthHeaders()
  const res = await fetch(`${AUCTION_API_BASE}${path}`, { headers })
  if (!res.ok) {
    const text = await res.text()
    let msg = res.statusText || `HTTP ${res.status}`
    try { msg = JSON.parse(text).message || msg } catch {}
    throw new Error(msg)
  }
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
