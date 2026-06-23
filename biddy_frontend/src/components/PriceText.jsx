import { formatKRW } from "../lib/format"

// Color is inherited from the parent (or passed via className) so callers can
// freely use text-teal / text-foreground without specificity conflicts.
export default function PriceText({ value, size = "md", className = "" }) {
  const sizes = {
    sm: "text-sm font-semibold",
    md: "text-base font-bold",
    lg: "text-xl font-bold",
    xl: "text-2xl font-extrabold",
  }
  return <span className={`${sizes[size]} ${className}`}>{formatKRW(value)}</span>
}
