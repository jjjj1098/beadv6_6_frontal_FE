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

export async function apiRequest(path, { method = "GET", body, headers = {} } = {}) {
  const url = `${API_BASE_URL}${path}`
  console.log("[apiRequest] →", method, url, "origin:", window.location.origin)

  const res = await fetch(url, {
    method,
    mode: "cors",
    credentials: "omit",
    headers: getAuthHeaders(headers),
    body: body ? JSON.stringify(body) : undefined,
  })

  console.log("[apiRequest] ←", res.status, [...res.headers.entries()])

  const text = await res.text()
  console.log("[apiRequest] body:", text)

  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "요청 처리 중 오류가 발생했습니다.")
  }

  return data
}
export function mockRequest(path, { data, delay = 350 } = {}) {
  return new Promise((resolve) => {
    console.log("[v0] mock API call:", path)
    setTimeout(() => resolve(structuredClone(data)), delay)
  })
}
