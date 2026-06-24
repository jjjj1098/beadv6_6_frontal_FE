import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import ImageUploader from "../components/ImageUploader"
import { Field, TextInput, TextArea, Select } from "../components/FormField"
import { CATEGORIES } from "../api/mockData"
import { createNormalProduct } from "../api/productApi"

const CONDITIONS = ["새 상품", "거의 새것", "사용감 적음", "사용감 있음"]

// 테스트용 임시 ID (원래는 로그인 JWT에서 옴)
const TEST_USER_ID = "33333333-3333-3333-3333-333333333333"

export default function NormalProductCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: "",
    category: "전자기기",
    description: "",
    price: "",
    stock: "1",
    condition: "거의 새것",
  })
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setSubmitting(true)
    try {
      await createNormalProduct({
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        status: form.condition,
        brand: "",
        sellerId: TEST_USER_ID,
        creatorId: TEST_USER_ID,
      })
      alert("등록 성공!")
      navigate("/products")
    } catch (err) {
      alert("등록 실패: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer withTabBar={false}>
      <Header showBack title="일반 판매 등록" showCart={false} />

      {/* 등록 버튼 (탭바에 안 가리게 폼 위쪽에 배치) */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-3 h-12 w-full rounded-xl bg-teal font-semibold text-teal-foreground disabled:opacity-50"
      >
        {submitting ? "등록 중..." : "상품 등록하기"}
      </button>

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
          <Field label="판매 가격" required>
            <TextInput value={form.price} onChange={update("price")} type="number" inputMode="numeric" placeholder="0" required />
          </Field>
          <Field label="재고 수량" required>
            <TextInput value={form.stock} onChange={update("stock")} type="number" inputMode="numeric" placeholder="1" required />
          </Field>
        </div>

        <Field label="상품 상태" required>
          <Select value={form.condition} onChange={update("condition")} options={CONDITIONS} />
        </Field>
      </form>
    </PageContainer>
  )
}