export const API_BASE_URL = "/api"

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
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: getAuthHeaders(headers),
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "요청 처리 중 오류가 발생했습니다.")
  }

  return data
}

// Simulates an async API response with a small delay.
// Replace the body of this function with a real `fetch` call when the backend is ready:
//
//   const res = await fetch(`${API_BASE_URL}${path}`, { method, headers: getAuthHeaders(), body: ... })
//   return res.json()
//
export function mockRequest(path, { data, delay = 350 } = {}) {
  return new Promise((resolve) => {
    // eslint-disable-next-line no-console
    console.log("[v0] mock API call:", path)
    setTimeout(() => resolve(structuredClone(data)), delay)
  })
}
