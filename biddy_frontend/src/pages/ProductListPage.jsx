import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Clock, Gavel, Heart } from "lucide-react"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import StatusBadge from "../components/StatusBadge"
import PriceText from "../components/PriceText"
import { fetchProducts, deleteProduct } from "../api/productApi"
import { fetchAuctionFeed, fetchMyWatches, findAuctionByProductId } from "../api/auctionApi"
import { useAuth } from "../contexts/AuthContext"
import { timeLeft } from "../lib/format"

const SALE_TYPES = [
  { key: "all", label: "전체" },
  { key: "normal", label: "일반(NORMAL)" },
  { key: "auction", label: "경매(AUCTION)" },
]

function AuctionCard({ auction, productName, isWatched, onClick }) {
  const isLive = auction.status === "LIVE"
  const remaining = isLive ? timeLeft(new Date(auction.endsAt).getTime()) : null

  return (
    <div onClick={onClick} className="cursor-pointer rounded-xl bg-card p-3 ring-1 ring-border">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{productName || auction.auctionId}</span>
            <StatusBadge variant={isLive ? "auction" : "neutral"}>
              {isLive ? "경매중" : "종료"}
            </StatusBadge>
            {isWatched && <Heart size={14} className="shrink-0 fill-red-500 text-red-500" />}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            현재 {auction.currentBid?.toLocaleString()}원 · 시작가 {auction.startPrice?.toLocaleString()}원
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <span className="flex items-center gap-0.5"><Gavel size={10} /> {auction.bidCount}회</span>
            <span className="flex items-center gap-0.5"><Heart size={10} /> {auction.watcherCount}</span>
            {isLive && remaining && !remaining.ended && (
              <span className="flex items-center gap-0.5"><Clock size={10} /> {remaining.text}</span>
            )}
          </div>
        </div>
        <PriceText value={auction.currentBid} size="sm" className={isLive ? "text-teal" : "text-foreground"} />
      </div>
    </div>
  )
}

function AuctionFeedInline() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [watchedIds, setWatchedIds] = useState(new Set())
  const [productNames, setProductNames] = useState({})
  const [statusFilter, setStatusFilter] = useState("")
  const [sort, setSort] = useState("latest")

  useEffect(() => {
    if (!isAuthenticated) return
    fetchMyWatches().then((data) => {
      if (data?.content) setWatchedIds(new Set(data.content.map((w) => w.auctionId)))
    }).catch(() => {})
  }, [isAuthenticated])

  useEffect(() => {
    fetchProducts({ saleType: "auction" })
      .then((products) => {
        const map = {}
        products.forEach((p) => { map[p.id] = p.title })
        setProductNames(map)
      }).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchAuctionFeed({ status: statusFilter || undefined, sort })
      .then((data) => { setAuctions(data?.content || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [statusFilter, sort])

  return (
    <>
      {/* 상태 + 정렬 한 줄 */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <div className="flex gap-1">
          {[["", "전체"], ["LIVE", "진행중"], ["ENDED", "종료"]].map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === val ? "bg-teal text-teal-foreground" : "bg-card text-muted-foreground ring-1 ring-border"
              }`}>{label}</button>
          ))}
        </div>
        <div className="ml-auto">
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="rounded-lg bg-card px-2 py-1.5 text-xs font-medium text-foreground ring-1 ring-border outline-none">
            <option value="latest">최신순</option>
            <option value="ending">마감임박</option>
            <option value="price">높은가격</option>
            <option value="priceAsc">낮은가격</option>
          </select>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">불러오는 중...</p>
        ) : auctions.length === 0 ? (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">경매가 없습니다</p>
        ) : (
          auctions.map((a) => (
            <AuctionCard key={a.auctionId} auction={a} productName={productNames[a.productId]}
              isWatched={watchedIds.has(a.auctionId)}
              onClick={() => navigate(`/auctions/${a.auctionId}`)} />
          ))
        )}
      </div>
    </>
  )
}

export default function ProductListPage() {
  const navigate = useNavigate()
  const [saleType, setSaleType] = useState("all")
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleDelete = async (id) => {
    if (!confirm("이 상품을 삭제할까요?")) return
    try { await deleteProduct(id); load() }
    catch (err) { alert("삭제 실패: " + err.message) }
  }

  const load = () => {
    if (saleType === "auction") return
    setLoading(true)
    setError(null)
    fetchProducts({ saleType })
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [saleType])

  return (
    <PageContainer noPadX>
      <Header />

      <div className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">상품 목록</h2>
          {saleType !== "auction" && (
            <button
              onClick={load}
              className="rounded-lg bg-card px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border"
            >
              새로고침
            </button>
          )}
        </div>

        <div className="mt-3 flex gap-2 sm:w-80">
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

      {saleType === "auction" ? (
        <AuctionFeedInline />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">id: {p.id}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={async () => {
                      if (p.type === "auction") {
                        const auction = await findAuctionByProductId(p.id)
                        if (auction) { navigate(`/auctions/${auction.auctionId}`); return }
                        setSaleType("auction"); return
                      }
                      navigate(`/products/${p.id}`)
                    }}
                    className="flex-1 rounded-lg bg-card py-1.5 text-xs font-semibold text-foreground ring-1 ring-border"
                  >상세</button>
                  <button
                    onClick={() => navigate(`/products/${p.id}/edit`)}
                    className="flex-1 rounded-lg bg-card py-1.5 text-xs font-semibold text-foreground ring-1 ring-border"
                  >수정</button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="flex-1 rounded-lg bg-red-500 py-1.5 text-xs font-semibold text-white"
                  >삭제</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <button
        onClick={() => navigate("/products/create")}
        aria-label="상품 등록"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-teal-foreground shadow-lg shadow-teal/30 transition-transform hover:scale-105"
      >
        <Plus size={26} />
      </button>
    </PageContainer>
  )
}
