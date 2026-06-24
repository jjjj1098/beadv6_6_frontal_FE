import { apiRequest } from "./client"

// 테스트용 임시 ID (로그인 붙기 전까지)
export const TEST_USER_ID = "33333333-3333-3333-3333-333333333333"

// 백엔드(name/saleType) → 화면(title/type) 변환
function toView(p) {
  return {
    id: p.id,
    title: p.name,
    type: p.saleType === "AUCTION" ? "auction" : "normal",
    saleType: p.saleType,
    category: p.category,
    price: p.price,
    status: p.status,
    stock: p.stock,
    description: p.description,
    brand: p.brand,
    sellerId: p.sellerId,
    regDt: p.regDt,
    image: "/images/placeholder.png",
    liked: false,
  }
}

// 화면 → 백엔드(create) 변환
function toCreatePayload(form) {
  return {
    name: form.title,
    description: form.description,
    price: form.price,
    stock: form.stock,
    status: form.status,
    category: form.category,
    brand: form.brand ?? "",
    saleType: form.type === "auction" ? "AUCTION" : "NORMAL",
    sellerId: form.sellerId ?? TEST_USER_ID,
    creatorId: form.creatorId ?? TEST_USER_ID,
  }
}

// 화면 → 백엔드(update) 변환 (update는 saleType/sellerId 없음, modifierId 있음)
function toUpdatePayload(form) {
  return {
    name: form.title,
    description: form.description,
    price: form.price,
    stock: form.stock,
    status: form.status,
    category: form.category,
    brand: form.brand ?? "",
    modifierId: form.modifierId ?? TEST_USER_ID,
  }
}

// 목록 조회 (전체 / NORMAL / AUCTION)
export async function fetchProducts({ saleType = "all" } = {}) {
  const query =
    saleType === "all" ? "" : `?saleType=${saleType === "auction" ? "AUCTION" : "NORMAL"}`
  const list = await apiRequest(`/products${query}`)
  return (list || []).map(toView)
}

// 단일 조회
export async function fetchProductById(id) {
  const p = await apiRequest(`/products/${id}`)
  return p ? toView(p) : null
}

// 일반 상품 등록
export async function createNormalProduct(form) {
  const created = await apiRequest("/products", {
    method: "POST",
    body: toCreatePayload({ ...form, type: "normal" }),
  })
  return toView(created)
}

// 경매 상품 등록 (→ 백엔드에서 Kafka 발행됨)
export async function createAuctionProduct(form) {
  const created = await apiRequest("/products", {
    method: "POST",
    body: toCreatePayload({ ...form, type: "auction" }),
  })
  return toView(created)
}

// 상품 수정
export async function updateProduct(id, form) {
  const updated = await apiRequest(`/products/${id}`, {
    method: "PUT",
    body: toUpdatePayload(form),
  })
  return toView(updated)
}

// 상품 삭제
export async function deleteProduct(id) {
  await apiRequest(`/products/${id}`, { method: "DELETE" })
  return true
}