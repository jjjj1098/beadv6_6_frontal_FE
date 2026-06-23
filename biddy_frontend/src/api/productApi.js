import { mockRequest } from "./client"
import { products } from "./mockData"

export function fetchProducts({ search = "", category = "전체", saleType = "all" } = {}) {
  let result = products
  if (saleType !== "all") result = result.filter((p) => p.type === saleType)
  if (category && category !== "전체") result = result.filter((p) => p.category === category)
  if (search) {
    const q = search.toLowerCase()
    result = result.filter((p) => p.title.toLowerCase().includes(q))
  }
  return mockRequest("/products", { data: result })
}

export function fetchProductById(id) {
  const product = products.find((p) => p.id === id) || null
  return mockRequest(`/products/${id}`, { data: product })
}

export function createNormalProduct(payload) {
  // POST /products  (Authorization header attached via client.getAuthHeaders)
  return mockRequest("/products", { data: { id: `p_${Date.now()}`, type: "normal", ...payload } })
}

export function toggleLike(id) {
  return mockRequest(`/products/${id}/like`, { data: { id, success: true } })
}
