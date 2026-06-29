import { apiGet, apiPost, mockRequest } from "./client"

export async function fetchAuctionFeed({ status, sort = "latest", page = 0, size = 20 } = {}) {
  const params = new URLSearchParams({ sort, page, size })
  if (status) params.set("status", status)
  return apiGet(`/auctions?${params}`)
}

export async function fetchAuctionDetail(auctionId) {
  return apiGet(`/auctions/${auctionId}`)
}

export async function placeBid(auctionId, amount) {
  return apiPost(`/auctions/${auctionId}/bids`, { amount })
}

export async function fetchBidHistory(auctionId, page = 0, size = 50) {
  return apiGet(`/auctions/${auctionId}/bids?page=${page}&size=${size}`)
}

export async function fetchAuctionResult(auctionId) {
  return apiGet(`/auctions/${auctionId}/result`)
}

export async function toggleWatch(auctionId) {
  return apiPost(`/auctions/${auctionId}/watch`)
}

export async function fetchMyWatches(page = 0, size = 200) {
  return apiGet(`/members/me/watches?page=${page}&size=${size}`)
}

export async function fetchMyBids(page = 0, size = 200) {
  return apiGet(`/members/me/bids?page=${page}&size=${size}`)
}

export async function closeAuction(auctionId) {
  return apiPost(`/auctions/${auctionId}/close`)
}

export async function findAuctionByProductId(productId) {
  const data = await apiGet(`/auctions?page=0&size=100`)
  const match = data?.content?.find((a) => String(a.productId) === String(productId))
  return match || null
}

// 경매 상품 등록은 Product API 사용
export function createAuctionProduct(payload) {
  return mockRequest("/auctions", { data: { id: `a_${Date.now()}`, type: "auction", ...payload } })
}
