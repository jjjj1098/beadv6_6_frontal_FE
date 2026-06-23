import { useEffect, useState } from "react"
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import { fetchWallet, chargeDeposit } from "../api/paymentApi"
import { formatKRW } from "../lib/format"

const CHARGE_OPTIONS = [50000, 100000, 300000, 500000]

export default function WalletPage() {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [charging, setCharging] = useState(null)

  useEffect(() => {
    let active = true
    fetchWallet().then((data) => {
      if (active) {
        setWallet(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  async function handleCharge(amount) {
    setCharging(amount)
    await chargeDeposit(amount)
    setWallet((prev) =>
      prev
        ? {
            ...prev,
            balance: prev.balance + amount,
            charges: [
              { id: `ch_${Date.now()}`, amount, method: "토스페이", date: "방금 전" },
              ...prev.charges,
            ],
          }
        : prev,
    )
    setCharging(null)
  }

  if (loading || !wallet) {
    return (
      <>
        <Header title="내 지갑" />
        <PageContainer>
          <div className="py-20 text-center text-sm text-muted-foreground">불러오는 중...</div>
        </PageContainer>
      </>
    )
  }

  const history = [
    ...wallet.charges.map((c) => ({ ...c, kind: "charge" })),
    ...wallet.payments.map((p) => ({ ...p, kind: "payment" })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <>
      <Header title="내 지갑" />
      <PageContainer>
        <div className="py-4">
          {/* Balance card */}
          <div className="rounded-2xl bg-dark p-5 text-dark-foreground">
            <div className="flex items-center gap-2 text-sm opacity-80">
              <WalletIcon className="h-4 w-4" />
              보유 예치금
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">{formatKRW(wallet.balance)}</p>
            <p className="mt-1 text-xs opacity-70">경매 입찰 및 즉시 구매에 사용할 수 있어요</p>
          </div>

          {/* Charge options */}
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-foreground">예치금 충전</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {CHARGE_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleCharge(amount)}
                  disabled={charging != null}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground transition-colors hover:border-teal hover:text-teal disabled:opacity-50"
                >
                  {charging === amount ? (
                    "충전 중..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      {formatKRW(amount)}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-foreground">거래 내역</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {history.map((item) => {
                const isCharge = item.kind === "charge"
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <span
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                        isCharge ? "bg-teal-soft text-teal" : "bg-amber-soft text-amber"
                      }`}
                    >
                      {isCharge ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {isCharge ? `예치금 충전 (${item.method})` : item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 text-sm font-bold ${isCharge ? "text-teal" : "text-foreground"}`}
                    >
                      {isCharge ? "+" : "-"}
                      {formatKRW(item.amount)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
