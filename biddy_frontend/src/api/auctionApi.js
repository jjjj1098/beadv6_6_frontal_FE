import { mockRequest } from "./client"

export function placeBid(productId, amount) {
  // POST /auctions/:id/bids
  return mockRequest(`/auctions/${productId}/bids`, {
    data: { productId, currentBid: amount, success: true },
  })
}

export function createAuctionProduct(payload) {
  // POST /auctions
  return mockRequest("/auctions", { data: { id: `a_${Date.now()}`, type: "auction", ...payload } })
}

export function fetchBidHistory(productId) {
  return mockRequest(`/auctions/${productId}/bids`, { data: [] })
}
