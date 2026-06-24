import { loadTossPayments } from "@tosspayments/tosspayments-sdk"

const CUSTOMER_KEY_STORAGE = "biddy.toss.customerKey"
export const PENDING_DEPOSIT_STORAGE = "biddy.deposit.pending"

function getCustomerKey() {
  const stored = window.localStorage.getItem(CUSTOMER_KEY_STORAGE)
  if (stored) return stored

  const customerKey = `biddy-${crypto.randomUUID()}`
  window.localStorage.setItem(CUSTOMER_KEY_STORAGE, customerKey)
  return customerKey
}

function createOrderId() {
  return `deposit-${Date.now()}-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`
}

export async function requestDepositPayment(amount) {
  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY
  if (!clientKey) {
    throw new Error("토스 클라이언트 키가 설정되지 않았습니다.")
  }

  const orderId = createOrderId()
  window.localStorage.setItem(
    PENDING_DEPOSIT_STORAGE,
    JSON.stringify({
      orderId,
      amount,
      createdAt: new Date().toISOString(),
    }),
  )

  const tossPayments = await loadTossPayments(clientKey)
  const payment = tossPayments.payment({ customerKey: getCustomerKey() })

  await payment.requestPayment({
    method: "CARD",
    amount: {
      currency: "KRW",
      value: amount,
    },
    orderId,
    orderName: `Biddy 예치금 ${amount.toLocaleString("ko-KR")}원 충전`,
    successUrl: `${window.location.origin}/wallet/charge/success`,
    failUrl: `${window.location.origin}/wallet/charge/fail`,
    card: {
      flowMode: "DEFAULT",
      useEscrow: false,
    },
  })
}
