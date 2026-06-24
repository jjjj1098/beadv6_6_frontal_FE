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