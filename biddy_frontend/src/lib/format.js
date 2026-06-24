export function formatKRW(value) {
  if (value == null || Number.isNaN(value)) return "-"
  return new Intl.NumberFormat("ko-KR").format(value) + "원"
}

// Formats a date-ish value (timestamp, ISO string, or "YYYY-MM-DD HH:mm") for display.
export function formatDate(value) {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d)
}

export function formatDateTime(value) {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d)
}

// Returns a human readable "남은 시간" string from a future timestamp.
export function timeLeft(endAt) {
  const diff = endAt - Date.now()
  if (diff <= 0) return { text: "마감", urgent: true, ended: true }

  const totalMin = Math.floor(diff / 60000)
  const days = Math.floor(totalMin / (60 * 24))
  const hours = Math.floor((totalMin % (60 * 24)) / 60)
  const mins = totalMin % 60

  let text
  if (days > 0) text = `${days}일 ${hours}시간`
  else if (hours > 0) text = `${hours}시간 ${mins}분`
  else text = `${mins}분`

  return { text, urgent: diff <= 60 * 60 * 1000, ended: false }
}
