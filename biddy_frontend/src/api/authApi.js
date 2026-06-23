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
