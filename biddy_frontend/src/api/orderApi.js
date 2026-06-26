import { apiRequest } from "./client"

export function fetchOrders() {
  return apiRequest("/order/list")
}

export function createOrder(payload) {
  return apiRequest("/order/create", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function startPaymentProcessing(orderId) {
  return apiRequest(`/orders/${orderId}/payment-processing`, {
    method: "PATCH",
  })
}

export function completeOrder(orderId) {
  return apiRequest(`/order/complete?orderId=${orderId}`, {
    method: "PUT",
  })
}
