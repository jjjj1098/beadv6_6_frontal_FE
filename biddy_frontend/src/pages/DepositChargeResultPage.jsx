import { useEffect, useRef, useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import PageContainer from "../components/PageContainer"
import { chargeDeposit } from "../api/paymentApi"
import { formatKRW } from "../lib/format"
import { PENDING_DEPOSIT_STORAGE } from "../lib/tossPayments"

function ResultLayout({ icon, title, description, actionLabel, onAction }) {
  return (
    <PageContainer withTabBar={false} className="flex min-h-screen items-center">
      <div className="w-full py-12 text-center">
        {icon}
        <h1 className="mt-5 text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <button
          type="button"
          onClick={onAction}
          className="mt-8 h-12 w-full rounded-xl bg-teal font-semibold text-teal-foreground"
        >
          {actionLabel}
        </button>
      </div>
    </PageContainer>
  )
}

export function DepositChargeSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requested = useRef(false)
  const [state, setState] = useState({ status: "processing", amount: 0, message: "" })

  useEffect(() => {
    if (requested.current) return
    requested.current = true

    const paymentKey = searchParams.get("paymentKey")
    const orderId = searchParams.get("orderId")
    const amount = Number(searchParams.get("amount"))
    let pending = null
    try {
      pending = JSON.parse(window.localStorage.getItem(PENDING_DEPOSIT_STORAGE) || "null")
    } catch {
      window.localStorage.removeItem(PENDING_DEPOSIT_STORAGE)
    }
    const completedKey = orderId ? `biddy.deposit.completed.${orderId}` : ""

    if (completedKey && window.localStorage.getItem(completedKey)) {
      setState({ status: "success", amount, message: "" })
      return
    }

    if (!paymentKey || !orderId || !Number.isSafeInteger(amount) || amount <= 0) {
      setState({ status: "error", amount: 0, message: "결제 승인 정보가 올바르지 않습니다." })
      return
    }

    if (!pending || pending.orderId !== orderId || Number(pending.amount) !== amount) {
      setState({ status: "error", amount, message: "요청한 충전 정보와 결제 결과가 일치하지 않습니다." })
      return
    }

    chargeDeposit({ amount, paymentKey, orderId })
      .then(() => {
        window.localStorage.setItem(completedKey, "true")
        window.localStorage.removeItem(PENDING_DEPOSIT_STORAGE)
        setState({ status: "success", amount, message: "" })
      })
      .catch((error) => {
        setState({ status: "error", amount, message: error.message })
      })
  }, [searchParams])

  if (state.status === "processing") {
    return (
      <PageContainer withTabBar={false} className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-muted border-t-teal" />
          <p className="mt-4 text-sm font-medium text-foreground">충전 결과를 확인하고 있어요</p>
        </div>
      </PageContainer>
    )
  }

  if (state.status === "error") {
    return (
      <ResultLayout
        icon={<XCircle className="mx-auto h-14 w-14 text-red-500" />}
        title="예치금 충전을 완료하지 못했습니다"
        description={state.message}
        actionLabel="지갑으로 돌아가기"
        onAction={() => navigate("/wallet", { replace: true })}
      />
    )
  }

  return (
    <ResultLayout
      icon={<CheckCircle2 className="mx-auto h-14 w-14 text-teal" />}
      title="예치금 충전 완료"
      description={`${formatKRW(state.amount)}이 예치금에 반영되었습니다.`}
      actionLabel="충전 내역 확인하기"
      onAction={() => navigate("/wallet", { replace: true })}
    />
  )
}

export function DepositChargeFailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const message = searchParams.get("message") || "결제가 취소되었거나 처리 중 오류가 발생했습니다."

  useEffect(() => {
    window.localStorage.removeItem(PENDING_DEPOSIT_STORAGE)
  }, [])

  return (
    <ResultLayout
      icon={<XCircle className="mx-auto h-14 w-14 text-red-500" />}
      title="결제가 완료되지 않았습니다"
      description={message}
      actionLabel="다시 충전하기"
      onAction={() => navigate("/wallet", { replace: true })}
    />
  )
}
