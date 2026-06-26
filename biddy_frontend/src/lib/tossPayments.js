import { loadTossPayments } from "@tosspayments/tosspayments-sdk"

const CUSTOMER_KEY_STORAGE = "biddy.toss.customerKey"
export const PENDING_DEPOSIT_STORAGE = "biddy.deposit.pending"
export const PENDING_ORDER_PAYMENT_PREFIX = "biddy.order.payment.pending."

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

async function createPaymentClient() {
  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY
  if (!clientKey) {
    throw new Error("토스 클라이언트 키가 설정되지 않았습니다.")
  }

  const tossPayments = await loadTossPayments(clientKey)
  return tossPayments.payment({ customerKey: getCustomerKey() })
}

export async function requestDepositPayment(amount) {
  const orderId = createOrderId()
  window.localStorage.setItem(
    PENDING_DEPOSIT_STORAGE,
    JSON.stringify({
      orderId,
      amount,
      createdAt: new Date().toISOString(),
    }),
  )

  const payment = await createPaymentClient()

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

export async function requestOrderPayment({ orderId, amount, orderName, cartItemIds }) {
  const payment = await createPaymentClient()
  const tossOrderId = `order-${orderId}-${Date.now()}-${crypto.randomUUID().replaceAll("-", "").slice(0, 8)}`

  window.localStorage.setItem(
    `${PENDING_ORDER_PAYMENT_PREFIX}${tossOrderId}`,
    JSON.stringify({
      orderId,
      tossOrderId,
      amount,
      cartItemIds,
      createdAt: new Date().toISOString(),
    }),
  )

  await payment.requestPayment({
    method: "CARD",
    amount: {
      currency: "KRW",
      value: amount,
    },
    orderId: tossOrderId,
    orderName,
    successUrl: `${window.location.origin}/payments/success`,
    failUrl: `${window.location.origin}/payments/fail`,
    card: {
      flowMode: "DEFAULT",
      useEscrow: false,
    },
  })
}
