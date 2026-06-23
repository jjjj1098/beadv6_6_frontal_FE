import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Gavel } from "lucide-react"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import ImageUploader from "../components/ImageUploader"
import { Field, TextInput, TextArea, Select } from "../components/FormField"
import { CATEGORIES } from "../api/mockData"
import { createAuctionProduct } from "../api/auctionApi"

const CONDITIONS = ["새 상품", "거의 새것", "사용감 적음", "사용감 있음"]

export default function AuctionProductCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: "",
    category: "취미",
    description: "",
    startPrice: "",
    buyNowPrice: "",
    bidUnit: "",
    startAt: "",
    endAt: "",
    condition: "사용감 적음",
  })
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await createAuctionProduct({
      ...form,
      startPrice: Number(form.startPrice),
      buyNowPrice: form.buyNowPrice ? Number(form.buyNowPrice) : null,
      bidUnit: Number(form.bidUnit),
    })
    setSubmitting(false)
    navigate("/products")
  }

  return (
    <PageContainer withTabBar={false}>
      <Header showBack title="경매 등록" showCart={false} />

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-soft px-3.5 py-3 text-sm text-amber">
        <Gavel size={18} />
        시작가부터 입찰을 받아 마감 시점 최고가에 판매됩니다.
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4 pb-28">
        <Field label="상품 이미지" required hint="최대 5장">
          <ImageUploader />
        </Field>

        <Field label="상품명" required>
          <TextInput value={form.title} onChange={update("title")} placeholder="상품명을 입력하세요" required />
        </Field>

        <Field label="카테고리" required>
          <Select value={form.category} onChange={update("category")} options={CATEGORIES.filter((c) => c !== "전체")} />
        </Field>

        <Field label="상품 설명" required>
          <TextArea
            value={form.description}
            onChange={update("description")}
            rows={4}
            placeholder="상품의 상태, 구성품 등을 자세히 적어주세요."
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="시작가" required>
            <TextInput value={form.startPrice} onChange={update("startPrice")} type="number" inputMode="numeric" placeholder="0" required />
          </Field>
          <Field label="즉시구매가" hint="선택">
            <TextInput value={form.buyNowPrice} onChange={update("buyNowPrice")} type="number" inputMode="numeric" placeholder="미설정" />
          </Field>
        </div>

        <Field label="입찰 단위" required>
          <TextInput value={form.bidUnit} onChange={update("bidUnit")} type="number" inputMode="numeric" placeholder="예: 5000" required />
        </Field>

        <div className="grid grid-cols-1 gap-4">
          <Field label="경매 시작 시간" required>
            <TextInput value={form.startAt} onChange={update("startAt")} type="datetime-local" required />
          </Field>
          <Field label="경매 마감 시간" required>
            <TextInput value={form.endAt} onChange={update("endAt")} type="datetime-local" required />
          </Field>
        </div>

        <Field label="상품 상태" required>
          <Select value={form.condition} onChange={update("condition")} options={CONDITIONS} />
        </Field>
      </form>

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-border bg-card px-4 py-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber font-semibold text-amber-foreground disabled:opacity-50"
        >
          <Gavel size={18} />
          {submitting ? "등록 중..." : "경매 등록하기"}
        </button>
      </div>
    </PageContainer>
  )
}
