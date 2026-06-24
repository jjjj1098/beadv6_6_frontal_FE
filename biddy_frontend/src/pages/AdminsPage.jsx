import { useEffect, useState } from "react"
import PageContainer from "../components/PageContainer"
import { getAllMembers, getPendingWithdrawals, approveWithdrawal, banMember } from "../api/adminApi"

const TABS = [
  { key: "withdrawals", label: "탈퇴 관리" },
  { key: "members", label: "회원 관리" },
]

export default function AdminPage() {
  const [tab, setTab] = useState("withdrawals")
  const [members, setMembers] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadMembers = () => {
    setLoading(true)
    setError("")
    getAllMembers()
      .then(setMembers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  const loadWithdrawals = () => {
    setLoading(true)
    setError("")
    getPendingWithdrawals()
      .then(setWithdrawals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (tab === "withdrawals") loadWithdrawals()
    else loadMembers()
  }, [tab])

  const handleApprove = async (memberId) => {
    if (!window.confirm("탈퇴를 승인하시겠습니까?")) return
    try {
      await approveWithdrawal(memberId)
      loadWithdrawals()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleBan = async (memberId) => {
    if (!window.confirm("이 회원을 추방하시겠습니까?")) return
    try {
      await banMember(memberId)
      loadMembers()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <PageContainer className="flex flex-col gap-5 py-6" withTabBar={false}>
      <header>
        <span className="mb-1 inline-block rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
          ADMIN
        </span>
        <h1 className="text-2xl font-extrabold text-foreground">관리자 페이지</h1>
      </header>

      <div className="flex gap-2 border-b border-border pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              tab === t.key ? "bg-teal text-teal-foreground" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}

      {!loading && tab === "withdrawals" && (
        <div className="flex flex-col gap-2">
          {withdrawals.length === 0 && <p className="text-sm text-muted-foreground">대기 중인 탈퇴 요청이 없습니다.</p>}
          {withdrawals.map((w) => (
            <div key={w.memberId} className="flex items-center justify-between rounded-xl bg-card p-3 ring-1 ring-border">
              <div>
                <p className="text-sm font-semibold text-foreground">회원 ID: {w.memberId}</p>
                <p className="text-xs text-muted-foreground">
                  요청일: {w.requestedAt ? new Date(w.requestedAt).toLocaleString() : "-"}
                </p>
              </div>
              <button
                onClick={() => handleApprove(w.memberId)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                승인
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "members" && (
        <div className="flex flex-col gap-2">
          {members.length === 0 && <p className="text-sm text-muted-foreground">회원이 없습니다.</p>}
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl bg-card p-3 ring-1 ring-border">
              <div>
                <p className="text-sm font-semibold text-foreground">{m.nickname}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              <button
                onClick={() => handleBan(m.id)}
                className="rounded-lg bg-card px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200"
              >
                추방
              </button>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}