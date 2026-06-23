import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import ProductCard from "../components/ProductCard"
import AuctionCard from "../components/AuctionCard"
import { fetchProducts } from "../api/productApi"
import { CATEGORIES } from "../api/mockData"

const SALE_TYPES = [
  { key: "all", label: "전체" },
  { key: "normal", label: "일반 판매" },
  { key: "auction", label: "경매" },
]

export default function ProductListPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("전체")
  const [saleType, setSaleType] = useState("all")
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchProducts({ search, category, saleType }).then((data) => {
      if (active) {
        setItems(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [search, category, saleType])

  const empty = useMemo(() => !loading && items.length === 0, [loading, items])

  return (
    <PageContainer noPadX>
      <Header />

      {/* Search */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 ring-1 ring-border">
          <Search size={18} className="text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="어떤 상품을 찾고 계신가요?"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Sale type filter */}
      <div className="flex gap-2 px-4 pt-3">
        {SALE_TYPES.map((t) => {
          const active = saleType === t.key
          return (
            <button
              key={t.key}
              onClick={() => setSaleType(t.key)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                active ? "bg-dark text-dark-foreground" : "bg-card text-muted-foreground ring-1 ring-border"
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Category filter */}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
        {CATEGORIES.map((c) => {
          const active = category === c
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-teal text-teal-foreground" : "bg-card text-muted-foreground ring-1 ring-border"
              }`}
            >
              {c}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div className="mt-4 px-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <p className="text-sm font-medium text-foreground">검색 결과가 없습니다</p>
            <p className="text-xs text-muted-foreground">다른 키워드나 필터를 시도해 보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((p) =>
              p.type === "auction" ? (
                <AuctionCard key={p.id} product={p} />
              ) : (
                <ProductCard key={p.id} product={p} />
              ),
            )}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
