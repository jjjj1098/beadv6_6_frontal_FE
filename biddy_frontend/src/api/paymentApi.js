import { mockRequest } from "./client"
import { wallet } from "./mockData"

export function fetchWallet() {
  return mockRequest("/wallet", { data: wallet })
}

// Mock only. Do NOT call a real payment provider here yet.
export function pay({ orderId, amount }) {
  // POST /payments
  return mockRequest("/payments", { data: { orderId, amount, status: "paid", mock: true } })
}

// Mock only. Real charge/top-up integration comes later.
export function chargeDeposit(amount) {
  // POST /wallet/charge
  return mockRequest("/wallet/charge", { data: { amount, status: "charged", mock: true } })
}
