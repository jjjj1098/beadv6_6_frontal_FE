import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Clock, Gavel, Heart, Trophy, Users, ShieldCheck } from "lucide-react"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import StatusBadge from "../components/StatusBadge"
import PriceText from "../components/PriceText"
import { useAuth } from "../contexts/AuthContext"
import { fetchAuctionDetail, placeBid, fetchBidHistory, toggleWatch, closeAuction } from "../api/auctionApi"
import { fetchProductById } from "../api/productApi"
import useAuctionWebSocket from "../hooks/useAuctionWebSocket"
import { formatKRW, timeLeft } from "../lib/format"

function BidHistoryModal({ auctionId, open, onClose }) {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchBidHistory(auctionId)
      .then((data) => { setBids(data?.content || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [auctionId, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-card p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">입찰 내역</h3>
          <button onClick={onClose} className="text-sm text-muted-foreground">닫기</button>
        </div>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">로딩 중...</div>
        ) : bids.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">입찰 내역이 없습니다</div>
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {bids.map((bid, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">입찰자 #{bid.bidder?.bidderId || "?"}</p>
                  <p className="text-xs text-muted-foreground">
                    {bid.bidAt ? new Date(bid.bidAt).toLocaleString("ko-KR") : ""}
                  </p>
                </div>
                <PriceText value={bid.amount} size="sm" className="text-teal" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuctionDetailPage() {
  const { auctionId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [auction, setAuction] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [remaining, setRemaining] = useState(null)
  const [bidAmount, setBidAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [bidError, setBidError] = useState(null)
  const [bidSuccess, setBidSuccess] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [watching, setWatching] = useState(false)
  const [closing, setClosing] = useState(false)

  const ws = useAuctionWebSocket(auctionId)

  useEffect(() => {
    if (!auction || !ws.lastMessage) return
    if (ws.currentBid !== null) {
      setAuction((prev) => prev ? {
        ...prev, currentBid: ws.currentBid, bidCount: ws.bidCount ?? prev.bidCount,
      } : prev)
      setBidAmount(String(ws.currentBid + (auction.minIncrement || 0)))
    }
    if (ws.status === "ENDED") {
      setAuction((prev) => prev ? { ...prev, status: "ENDED" } : prev)
    }
  }, [ws.lastMessage])

  const loadAuction = useCallback(() => {
    setLoading(true)
    fetchAuctionDetail(auctionId)
      .then((data) => {
        setAuction(data)
        setWatching(!!data.isWatching)
        setBidAmount(String((data.currentBid || 0) + (data.minIncrement || 0)))
        setLoading(false)
        if (data.productId) {
          fetchProductById(data.productId)
            .then(setProduct)
            .catch(() => {})
        }
      })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [auctionId])

  useEffect(() => { loadAuction() }, [loadAuction])

  useEffect(() => {
    if (!auction || auction.status !== "LIVE") return
    const t = setInterval(() => setRemaining(timeLeft(new Date(auction.endsAt).getTime())), 1000)
    setRemaining(timeLeft(new Date(auction.endsAt).getTime()))
    return () => clearInterval(t)
  }, [auction])

  const handleBid = async () => {
    if (!isAuthenticated) { navigate("/login"); return }
    setBidError(null); setBidSuccess(null); setSubmitting(true)
    const amount = Number(bidAmount)
    if (!amount || amount <= 0) { setBidError("입찰 금액을 입력하세요"); setSubmitting(false); return }
    try {
      const result = await placeBid(auctionId, amount)
      setBidSuccess(`입찰 성공! ${formatKRW(result.currentBid)}`)
      loadAuction()
    } catch (err) { setBidError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleClose = async () => {
    if (!confirm("경매를 즉시 종료하시겠습니까?")) return
    setClosing(true)
    try { await closeAuction(auctionId); loadAuction() }
    catch (err) { alert(err.message) }
    finally { setClosing(false) }
  }

  const handleWatch = async () => {
    if (!isAuthenticated) { navigate("/login"); return }
    try {
      const result = await toggleWatch(auctionId)
      setWatching(result.watching)
      setAuction((prev) => prev ? { ...prev, watcherCount: result.watcherCount } : prev)
    } catch (err) { console.error("관심 등록 실패:", err) }
  }

  if (loading) {
    return (
      <PageContainer noPadX>
        <Header showBack title="경매 상세" />
        <div className="px-4 pt-4">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" />
          <div className="mt-4 h-6 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </PageContainer>
    )
  }

  if (error || !auction) {
    return (
      <PageContainer noPadX>
        <Header showBack title="경매 상세" />
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm text-red-500">{error || "경매를 찾을 수 없습니다"}</p>
          <button onClick={() => navigate("/")} className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-teal-foreground">목록으로</button>
        </div>
      </PageContainer>
    )
  }

  const isLive = auction.status === "LIVE"
  const minBid = (auction.currentBid || 0) + (auction.minIncrement || 0)

  return (
    <PageContainer noPadX>
      <Header showBack title="경매 상세" right={
        <div className="flex items-center gap-1">
          {isLive && (
            <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
              ws.connected ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${ws.connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              {ws.connected ? "LIVE" : "OFF"}
            </span>
          )}
          <button onClick={handleWatch} className="grid h-9 w-9 place-items-center rounded-full hover:bg-graydark">
            <Heart size={18} className={watching ? "fill-red-500 text-red-500" : "text-dark-foreground"} />
          </button>
        </div>
      } />
      <div className="mx-auto w-full max-w-md">

      {/* Image */}
      <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900">
        {product?.image && product.image !== "/images/placeholder.png" ? (
          <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <Gavel size={64} className="text-white/20" />
            <p className="text-sm text-white/40">{product?.title || auction.auctionId}</p>
          </div>
        )}
      </div>

      <div className="px-4 pb-28">
        {/* Status + Remaining */}
        <div className="mt-3 flex items-center gap-2">
          <StatusBadge variant={isLive ? "auction" : "neutral"}>{isLive ? "경매중" : "종료"}</StatusBadge>
          {remaining && isLive && (
            <StatusBadge variant={remaining.urgent ? "amber" : "dark"}>
              <Clock size={12} /> {remaining.ended ? "마감" : remaining.text + " 남음"}
            </StatusBadge>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-2 text-lg font-bold text-foreground text-balance">
          {product?.title || `상품 #${auction.productId}`}
        </h1>

        {/* Auction Info Block */}
        <div className="mt-3 rounded-2xl bg-dark p-4 text-dark-foreground">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">현재 입찰가</span>
            <span className="flex items-center gap-1 text-xs text-white/70"><Gavel size={12} /> 입찰 {auction.bidCount}회</span>
          </div>
          <PriceText value={auction.currentBid} size="xl" className="mt-1 block text-teal" />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white/10 py-2">
              <p className="text-[11px] text-white/60">시작가</p>
              <p className="text-sm font-semibold">{formatKRW(auction.startPrice)}</p>
            </div>
            <div className="rounded-lg bg-white/10 py-2">
              <p className="text-[11px] text-white/60">최소 단위</p>
              <p className="text-sm font-semibold">{formatKRW(auction.minIncrement)}</p>
            </div>
            <div className="rounded-lg bg-white/10 py-2">
              <p className="text-[11px] text-white/60">관심</p>
              <p className="flex items-center justify-center gap-1 text-sm font-semibold"><Users size={12} /> {auction.watcherCount}</p>
            </div>
          </div>
          {isLive && remaining && (
            <div className={`mt-3 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold ${
              remaining.urgent ? "bg-amber text-amber-foreground" : "bg-white/10 text-white"
            }`}>
              <Clock size={15} /> {remaining.ended ? "경매 마감" : `남은 시간 ${remaining.text}`}
            </div>
          )}
        </div>

        {/* Product Description */}
        {product?.description && (
          <section className="mt-4">
            <h2 className="text-sm font-semibold text-foreground">상품 설명</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </section>
        )}

        {/* Seller Card */}
        {product?.seller && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-dark text-dark-foreground font-bold">
              {product.seller.name?.slice(0, 1) || "판"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{product.seller.name}</p>
              <p className="text-xs text-muted-foreground">{product.category} · {product.brand}</p>
            </div>
            <ShieldCheck size={20} className="text-teal" />
          </div>
        )}

        {/* Top Bidder */}
        {auction.topBidder && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-teal text-teal-foreground font-bold"><Trophy size={18} /></div>
            <div>
              <p className="text-sm font-semibold text-foreground">최고 입찰자</p>
              <p className="text-xs text-muted-foreground">입찰자 #{auction.topBidder.bidderId}</p>
            </div>
            <PriceText value={auction.topBidder.amount} size="sm" className="ml-auto text-teal" />
          </div>
        )}

        {/* Info Rows */}
        <div className="mt-3 space-y-2">
          {[
            ["경매 ID", auction.auctionId],
            ["카테고리", product?.category || "-"],
            ["브랜드", product?.brand || "-"],
            ["종료 시각", new Date(auction.endsAt).toLocaleString("ko-KR")],
          ].map(([label, val], i) => (
            <div key={i} className="flex justify-between rounded-xl bg-card px-3 py-2.5 ring-1 ring-border">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-medium text-foreground">{val}</span>
            </div>
          ))}
        </div>

        <button onClick={() => setShowHistory(true)}
          className="mt-3 w-full rounded-xl bg-card py-3 text-center text-sm font-semibold text-foreground ring-1 ring-border">
          입찰 내역 보기
        </button>

        {/* Seller Close Button */}
        {isLive && user && String(user.id) === String(auction.sellerId) && (
          <button onClick={handleClose} disabled={closing}
            className="mt-3 w-full rounded-xl bg-red-500 py-3 text-center text-sm font-bold text-white disabled:opacity-50">
            {closing ? "종료 처리 중..." : "경매 즉시 종료"}
          </button>
        )}

        {/* Result */}
        {!isLive && auction.winnerId && (
          <div className="mt-3 rounded-2xl bg-teal/10 p-4 ring-1 ring-teal/30">
            <div className="flex items-center gap-2"><Trophy size={18} className="text-teal" /><span className="text-sm font-bold text-teal">낙찰 완료</span></div>
            <p className="mt-1 text-sm text-foreground">낙찰자 #{auction.winnerId}</p>
            <PriceText value={auction.currentBid} size="lg" className="mt-1 block text-teal" />
          </div>
        )}
        {!isLive && !auction.winnerId && (
          <div className="mt-3 rounded-2xl bg-muted p-4 text-center">
            <p className="text-sm font-semibold text-muted-foreground">유찰된 경매입니다</p>
          </div>
        )}
      </div>

      {/* Sticky Bid Bar */}
      {isLive && (
        <div className="fixed bottom-0 inset-x-0 z-20 border-t border-border bg-card px-4 py-3">
          <div className="mx-auto max-w-screen-xl">
            {bidError && <p className="mb-2 text-center text-xs font-medium text-red-500">{bidError}</p>}
            {bidSuccess && <p className="mb-2 text-center text-xs font-medium text-teal">{bidSuccess}</p>}
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`최소 ${formatKRW(minBid)}`}
                  className="w-full rounded-xl bg-muted px-4 py-3 text-sm font-medium text-foreground outline-none ring-1 ring-border focus:ring-teal" />
                <p className="mt-1 text-xs text-muted-foreground">최소 입찰가: {formatKRW(minBid)}</p>
              </div>
              <button onClick={handleBid} disabled={submitting || (remaining && remaining.ended)}
                className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-teal px-6 font-semibold text-teal-foreground disabled:opacity-50">
                <Gavel size={18} /> {submitting ? "처리중..." : "입찰"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BidHistoryModal auctionId={auctionId} open={showHistory} onClose={() => setShowHistory(false)} />
      </div>
    </PageContainer>
  )
}
