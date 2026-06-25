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
