import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Gavel } from "lucide-react"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import ImageUploader from "../components/ImageUploader"
import { createAuctionProduct, uploadProductImages } from "../api/productApi"

export default function AuctionProductCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: "",
    category: "한정판 굿즈",
    description: "",
    price: "",
    stock: "1",
    condition: "거의 새것",
    brand: "",
    startPrice: "",
    minIncrement: "",
    startsAt: "",
    endsAt: "",
  })
  const [imageFiles, setImageFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const created = await createAuctionProduct({
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        status: form.condition,
        brand: form.brand,
        startPrice: form.startPrice ? Number(form.startPrice) : undefined,
        minIncrement: form.minIncrement ? Number(form.minIncrement) : undefined,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
      })
      if (imageFiles.length > 0) {
        await uploadProductImages(created.id, imageFiles)
      }
      alert("경매 상품 등록 성공!")
      navigate("/products")
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
        등록 시 saleType=AUCTION → Kafka로 경매 등록 이벤트가 발행됩니다.
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber font-semibold text-amber-foreground disabled:opacity-50"
      >
        <Gavel size={18} />
        {submitting ? "등록 중..." : "경매 상품 등록 (Kafka 발행)"}
      </button>

      <div className="flex flex-col gap-3 pt-4 pb-28">
        <label className="text-sm font-semibold text-foreground">상품 이미지 <span className="text-xs text-muted-foreground">(최대 5장)</span></label>
        <ImageUploader onFilesChange={setImageFiles} />

        <label className="text-sm font-semibold text-foreground">상품명</label>
        <input value={form.title} onChange={update("title")} placeholder="상품명" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />

        <label className="text-sm font-semibold text-foreground">설명</label>
        <textarea value={form.description} onChange={update("description")} rows={3} placeholder="상품 설명" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">시작가(price)</label>
            <input value={form.price} onChange={update("price")} type="number" placeholder="0" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">재고</label>
            <input value={form.stock} onChange={update("stock")} type="number" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />
          </div>
        </div>

        <label className="text-sm font-semibold text-foreground">카테고리</label>
        <input value={form.category} onChange={update("category")} className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />

        <label className="text-sm font-semibold text-foreground">브랜드</label>
        <input value={form.brand} onChange={update("brand")} placeholder="브랜드" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">경매 시작가</label>
            <input value={form.startPrice} onChange={update("startPrice")} type="number" placeholder="0" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">입찰 단위</label>
            <input value={form.minIncrement} onChange={update("minIncrement")} type="number" placeholder="500" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />
          </div>
        </div>

        <label className="text-sm font-semibold text-foreground">경매 시작일시</label>
        <input value={form.startsAt} onChange={update("startsAt")} type="datetime-local" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />

        <label className="text-sm font-semibold text-foreground">경매 종료일시</label>
        <input value={form.endsAt} onChange={update("endsAt")} type="datetime-local" className="rounded-lg bg-card px-3 py-2.5 ring-1 ring-border" />
      </div>
      </div>
    </PageContainer>
  )
}