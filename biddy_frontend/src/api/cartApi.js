import { mockRequest } from "./client"
import { cartItems } from "./mockData"

export function fetchCart() {
  return mockRequest("/cart", { data: cartItems })
}

export function addToCart(productId, qty = 1) {
  // POST /cart
  return mockRequest("/cart", { data: { productId, qty, success: true } })
}

export function updateCartItem(itemId, qty) {
  // PATCH /cart/:itemId
  return mockRequest(`/cart/${itemId}`, { data: { itemId, qty, success: true } })
}

export function removeCartItem(itemId) {
  // DELETE /cart/:itemId
  return mockRequest(`/cart/${itemId}`, { data: { itemId, success: true } })
}
