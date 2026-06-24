import { apiRequest } from "./client"

export function fetchCart() {
  return apiRequest("/cart/list")
}

export function addToCart(productId) {
  return apiRequest("/cart/item", {
    method: "POST",
    body: JSON.stringify({ productId }),
  })
}

export function removeCartItem(itemId) {
  return apiRequest(`/cart/delete?cartId=${itemId}`, {
    method: "DELETE",
  })
}

export function cleanCart() {
  return apiRequest("/cart/clean", {
    method: "DELETE",
  })
}
