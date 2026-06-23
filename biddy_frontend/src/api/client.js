// Lightweight API client wrapper.
// Right now it only simulates network latency over mock data, but it is shaped
// so that swapping to a real `fetch` later is trivial.

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
