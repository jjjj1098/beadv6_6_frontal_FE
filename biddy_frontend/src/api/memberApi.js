import { apiRequest } from "./client"

export function getMyInfo() {
  return apiRequest("/members/me")
}

export function updateNickname(nickname) {
  return apiRequest("/members/me/nickname", {
    method: "PATCH",
    body: { nickname },
  })
}

export function updatePassword({ currentPassword, newPassword }) {
  return apiRequest("/members/me/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  })
}

export function withdrawMember() {
  return apiRequest("/members/me", {
    method: "DELETE",
  })
}

// sellerId로 닉네임 조회
export async function fetchMemberNickname(memberId) {
  try {
    const res = await apiRequest(`/members/${memberId}/nickname`)
    return res?.nickname ?? null
  } catch {
    return null
  }
}