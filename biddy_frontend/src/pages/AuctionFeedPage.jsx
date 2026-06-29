import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, Gavel, Heart, Users } from "lucide-react"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import StatusBadge from "../components/StatusBadge"
import PriceText from "../components/PriceText"
import { fetchAuctionFeed, fetchMyWatches } from "../api/auctionApi"
import { useAuth } from "../contexts/AuthContext"
import { timeLeft } from "../lib/format"

function AuctionCard({ auction, isWatched, onClick }) {
  const isLive = auction.status === "LIVE"
  const remaining = isLive ? timeLeft(new Date(auction.endsAt).getTime()) : null

  return (
    <div onClick={onClick} className="cursor-pointer overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-700 to-gray-900">
        <div className="flex h-full items-center justify-center">
          <Gavel size={40} className="text-white/20" />
        </div>
        {isLive && remaining && !remaining.ended && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white">
            <Clock size={11} /> {remaining.text} 남음
          </div>
        )}
        <StatusBadge variant={isLive ? "auction" : "neutral"} className="absolute top-2 left-2">
          {isLive ? "경매중" : "종료"}
        </StatusBadge>
        <div className={`absolute top-2 right-2 flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
          isWatched ? "bg-red-500 text-white" : "bg-black/40 text-white"
        }`}>
          <Heart size={11} className={isWatched ? "fill-white" : ""} /> {auction.watcherCount}
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-muted-foreground">ID: {auction.auctionId}</p>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">현재 입찰가</span>
          <PriceText value={auction.currentBid} size="sm" className={isLive ? "text-teal" : "text-foreground"} />
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>시작가 {auction.startPrice?.toLocaleString()}원</span>
          <span className="flex items-center gap-1"><Gavel size={10} /> {auction.bidCount}회</span>
        </div>
      </div>
    </div>
  )
}

export default function AuctionFeedPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [watchedIds, setWatchedIds] = useState(new Set())
  const [statusFilter, setStatusFilter] = useState("")
  const [sort, setSort] = useState("latest")

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken")
    if (!token) return
    fetchMyWatches().then((data) => {
      if (data?.content) setWatchedIds(new Set(data.content.map((w) => w.auctionId)))
    }).catch(() => {})
  }, [isAuthenticated])

  useEffect(() => {
    setLoading(true)
    fetchAuctionFeed({ status: statusFilter || undefined, sort })
      .then((data) => { setAuctions(data?.content || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [statusFilter, sort])

  return (
    <PageContainer>
      <Header title="경매" showBack />

      <div className="flex gap-2 px-4 pt-3">
        {[["", "전체"], ["LIVE", "진행중"], ["ENDED", "종료"]].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold ${
              statusFilter === val ? "bg-dark text-dark-foreground" : "bg-card text-foreground ring-1 ring-border"
            }`}>{label}</button>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 pt-2">
        <div className="flex gap-2">
          {/* 빈 공간 — 상태 필터가 위에 있으므로 */}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="rounded-lg bg-card px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border">
          <option value="latest">최신순</option>
          <option value="ending">마감임박</option>
          <option value="price">높은가격</option>
          <option value="priceAsc">낮은가격</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 px-4 pt-3">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : auctions.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">경매가 없습니다</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pt-3 pb-4">
          {auctions.map((a) => (
            <AuctionCard key={a.auctionId} auction={a} isWatched={watchedIds.has(a.auctionId)}
              onClick={() => navigate(`/auctions/${a.auctionId}`)} />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

export function AuctionFeedInline() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [watchedIds, setWatchedIds] = useState(new Set())
  const [statusFilter, setStatusFilter] = useState("")
  const [sort, setSort] = useState("latest")

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken")
    if (!token) return
    fetchMyWatches().then((data) => {
      if (data?.content) setWatchedIds(new Set(data.content.map((w) => w.auctionId)))
    }).catch(() => {})
  }, [isAuthenticated])

  useEffect(() => {
    setLoading(true)
    fetchAuctionFeed({ status: statusFilter || undefined, sort })
      .then((data) => { setAuctions(data?.content || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [statusFilter, sort])

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[["", "전체"], ["LIVE", "진행중"], ["ENDED", "종료"]].map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                statusFilter === val ? "bg-teal text-teal-foreground" : "bg-card text-foreground ring-1 ring-border"
              }`}>{label}</button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="rounded-lg bg-card px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border">
          <option value="latest">최신순</option>
          <option value="ending">마감임박</option>
          <option value="price">높은가격</option>
          <option value="priceAsc">낮은가격</option>
        </select>
      </div>

      {loading ? (
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : auctions.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">경매가 없습니다</div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {auctions.map((a) => (
            <AuctionCard key={a.auctionId} auction={a} isWatched={watchedIds.has(a.auctionId)}
              onClick={() => navigate(`/auctions/${a.auctionId}`)} />
          ))}
        </div>
      )}
    </>
  )
}
