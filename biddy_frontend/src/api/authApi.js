import { apiRequest } from "./client"

export function login({ email, password }) {
  return apiRequest("/members/login", {
    method: "POST",
    body: { email, password },
  })
}

export function signup({ email, password, nickname, phone }) {
  return apiRequest("/members/signup", {
    method: "POST",
    body: { email, password, nickname, phone },
  })
}

export function logoutRequest() {
  return apiRequest("/members/logout", {
    method: "POST",
  })
}

export function sendVerificationEmail(email) {
  return apiRequest("/members/email/send", {
    method: "POST",
    body: { email },
  })
}

export function verifyEmail({ email, token }) {
  return apiRequest(`/members/email/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`, {
    method: "GET",
  })
}