import { apiRequest, mockRequest } from "./client"

const TRANSACTION_LABELS = {
  CHARGE: "예치금 충전",
  WITHDRAW: "예치금 출금",
  PAYMENT: "예치금 결제",
  CANCEL: "결제 취소",
  REFUND: "환불",
  SETTLEMENT: "정산 지급",
  ADJUSTMENT: "예치금 조정",
}

function unwrapApiResponse(response) {
  if (response && typeof response === "object" && "success" in response) {
    if (!response.success) {
      throw new Error(response.message || "요청 처리 중 오류가 발생했습니다.")
    }
    return response.data
  }

  return response
}

function mapTransaction(transaction) {
  const amount = Number(transaction.amount || 0)

  return {
    id: transaction.id,
    type: transaction.type,
    title: TRANSACTION_LABELS[transaction.type] || transaction.reason || "예치금 거래",
    amount: Math.abs(amount),
    signedAmount: amount,
    balanceAfter: transaction.balanceAfter,
    reason: transaction.reason,
    referenceType: transaction.referenceType,
    referenceId: transaction.referenceId,
    createdAt: transaction.createdAt,
    kind: amount >= 0 ? "in" : "out",
  }
}

export async function fetchDepositBalance() {
  return unwrapApiResponse(await apiRequest("/payments/deposits/balance"))
}

export async function fetchDepositTransactions() {
  const transactions = unwrapApiResponse(await apiRequest("/payments/deposits/transactions"))
  return Array.isArray(transactions) ? transactions.map(mapTransaction) : []
}

export async function fetchWallet() {
  const [balance, transactions] = await Promise.all([fetchDepositBalance(), fetchDepositTransactions()])

  return {
    userId: balance?.userId,
    balance: balance?.balance ?? 0,
    updatedAt: balance?.updatedAt,
    transactions,
  }
}

export async function chargeDeposit({ amount, paymentKey, orderId }) {
  return unwrapApiResponse(
    await apiRequest("/payments/deposits/charge", {
      method: "POST",
      body: {
        amount,
        paymentKey,
        orderId,
      },
    }),
  )
}

// Mock only. Do NOT call a real payment provider here yet.
export function pay({ orderId, amount }) {
  // POST /payments
  return mockRequest("/payments", { data: { orderId, amount, status: "paid", mock: true } })
}
