import { mockRequest } from "./client"
import { orders } from "./mockData"

export function fetchOrders() {
  return mockRequest("/orders", { data: orders })
}

export function createOrder(payload) {
  // POST /orders  (Authorization header attached via client.getAuthHeaders)
  return mockRequest("/orders", {
    data: { id: `o_${Date.now()}`, status: "paid", createdAt: new Date().toISOString(), ...payload },
  })
}
