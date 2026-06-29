import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Heart } from "lucide-react"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import { fetchProducts, deleteProduct } from "../api/productApi"
import { fetchMemberNickname } from "../api/memberApi"
import { useAuth } from "../contexts/AuthContext"

const SALE_TYPES = [
  { key: "all", label: "전체" },
  { key: "normal", label: "일반(NORMAL)" },
  { key: "auction", label: "경매(AUCTION)" },
]

export default function ProductListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saleType, setSaleType] = useState("all")
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const products = await fetchProducts({ saleType })
      const productsWithNickname = await Promise.all(
        products.map(async (p) => {
          const nickname = await fetchMemberNickname(p.sellerId)
          return { ...p, sellerNickname: nickname || "알 수 없음" }
        })
      )
      setItems(productsWithNickname)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [saleType])

  const handleDelete = async (id) => {
    if (!confirm("이 상품을 삭제할까요?")) return
    try {
      await deleteProduct(id)
      load()
    } catch (err) {
      alert("삭제 실패: " + err.message)
    }
  }

  return (
    <PageContainer noPadX>
      <Header />

      <div className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">상품 목록</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/liked")}
              className="flex items-center gap-1 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Heart size={13} className="fill-white" />
              찜 목록
            </button>
            <button
              onClick={load}
              className="rounded-lg bg-card px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border"
            >
              새로고침
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-2 lg:w-80">
          {SALE_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setSaleType(t.key)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                saleType === t.key
                  ? "bg-dark text-dark-foreground"
                  : "bg-card text-muted-foreground ring-1 ring-border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 px-4 pb-24 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">불러오는 중...</p>
        ) : error ? (
          <p className="col-span-full py-10 text-center text-sm text-red-500">에러: {error}</p>
        ) : items.length === 0 ? (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">상품이 없습니다.</p>
        ) : (
          items.map((p) => (
            <div key={p.id} className="rounded-xl bg-card p-3 ring-1 ring-border">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{p.title}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      p.type === "auction" ? "bg-amber-soft text-amber" : "bg-teal-soft text-teal"
                    }`}>{p.saleType}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.category} · {Number(p.price).toLocaleString()}원 · 재고 {p.stock} · 상태 {p.status}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">판매자: {p.sellerNickname}</p>
                </div>
              </div>

              <div className={`mt-2 grid gap-2 ${Number(p.sellerId) === Number(user?.id) ? "grid-cols-3" : "grid-cols-1"}`}>
                <button
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="h-10 rounded-xl bg-card text-xs font-semibold text-foreground ring-1 ring-border"
                >상세</button>
                {Number(p.sellerId) === Number(user?.id) && (
                  <>
                    <button
                      onClick={() => navigate(`/products/${p.id}/edit`)}
                      className="h-10 rounded-xl bg-card text-xs font-semibold text-foreground ring-1 ring-border"
                    >수정</button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="h-10 rounded-xl bg-red-500 text-xs font-semibold text-white"
                    >삭제</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => navigate("/products/create")}
        aria-label="상품 등록"
        className="fixed bottom-20 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-teal-foreground shadow-lg shadow-teal/30 transition-transform hover:scale-105 lg:bottom-6 lg:right-6"
      >
        <Plus size={26} />
      </button>
    </PageContainer>
  )
}
