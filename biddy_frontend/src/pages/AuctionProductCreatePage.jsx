import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Gavel } from "lucide-react"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import { createAuctionProduct } from "../api/productApi"

function defaultEndsAt() {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 16)
}

export default function AuctionProductCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: "",
    category: "한정판 굿즈",
    description: "",
    startPrice: "",
    minIncrement: "500",
    stock: "1",
    status: "ACTIVE",
    brand: "",
    endsAt: defaultEndsAt(),
  })
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.title) { alert("상품명을 입력하세요"); return }
    if (!form.startPrice) { alert("시작가를 입력하세요"); return }
    setSubmitting(true)
    try {
      await createAuctionProduct({
        ...form,
        price: Number(form.startPrice),
        startPrice: Number(form.startPrice),
        minIncrement: Number(form.minIncrement),
        stock: Number(form.stock),
        startsAt: new Date().toISOString().slice(0, 19),
        endsAt: form.endsAt,
      })
      alert("경매 상품 등록 성공!")
      navigate("/")
    } catch (err) {
      alert("등록 실패: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <Header showBack title="경매 상품 등록" showCart={false} />
      <div className="mx-auto w-full max-w-md">

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-soft px-3.5 py-3 text-sm text-amber">
        <Gavel size={18} />
        등록 시 Kafka로 경매 등록 이벤트가 발행됩니다.
      </div>

      <div className="flex flex-col gap-3 pt-4 pb-28">
        <label className="text-sm font-semibold text-foreground">상품명 *</label>
        <input value={form.title} onChange={update("title")} placeholder="상품명" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />

        <label className="text-sm font-semibold text-foreground">설명</label>
        <textarea value={form.description} onChange={update("description")} rows={3} placeholder="상품 설명" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">시작가 *</label>
            <input value={form.startPrice} onChange={update("startPrice")} type="number" placeholder="5000" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">최소 입찰 단위</label>
            <input value={form.minIncrement} onChange={update("minIncrement")} type="number" placeholder="500" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />
          </div>
        </div>

        <label className="text-sm font-semibold text-foreground">경매 종료일시</label>
        <input value={form.endsAt} onChange={update("endsAt")} type="datetime-local" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />

        <label className="text-sm font-semibold text-foreground">카테고리</label>
        <input value={form.category} onChange={update("category")} className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />

        <label className="text-sm font-semibold text-foreground">브랜드</label>
        <input value={form.brand} onChange={update("brand")} placeholder="브랜드" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal font-semibold text-teal-foreground disabled:opacity-50"
        >
          <Gavel size={18} />
          {submitting ? "등록 중..." : "경매 상품 등록"}
        </button>
      </div>
      </div>
    </PageContainer>
  )
}
