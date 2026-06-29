import { apiRequest } from "./client"

export function getAllMembers() {
  return apiRequest("/admin/members")
}

export function getPendingWithdrawals() {
  return apiRequest("/admin/withdrawals")
}

export function approveWithdrawal(memberId) {
  return apiRequest(`/admin/withdrawals/${memberId}/approve`, {
    method: "POST",
  })
}

export function banMember(memberId) {
  return apiRequest(`/admin/members/${memberId}/ban`, {
    method: "POST",
  })
}

function unwrapApiResponse(response) {
  if (response && typeof response === "object" && "success" in response) {
    if (!response.success) {
      throw new Error(response.message || "요청 처리 중 오류가 발생했습니다.")
    }
    return response.data
  }
  return response
}

// 특정 회원의 예치금 조회 (관리자)
// adjustMemberDeposit과 동일하게 조회 대상 회원을 userId 쿼리 파라미터로 전달한다
// (경로에 memberId를 직접 끼워 넣는 방식의 엔드포인트는 존재하지 않아 조회가 실패하고 있었음)
export async function getMemberDeposit(memberId) {
  return unwrapApiResponse(await apiRequest(`/payments/deposits/balance?userId=${memberId}`))
}

// 특정 회원의 예치금 강제 조정 (관리자)
export async function adjustMemberDeposit(memberId, { amount, reason }) {
  return unwrapApiResponse(
    await apiRequest("/payments/deposits/adjust", {
      method: "PATCH",
      body: {
        userId: memberId,
        amount,
        reason,
      },
    }),
  )
}