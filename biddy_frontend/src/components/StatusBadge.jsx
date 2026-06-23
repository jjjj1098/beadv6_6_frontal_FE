// Reusable pill badge. `variant` controls the color scheme.
export default function StatusBadge({ children, variant = "neutral", className = "" }) {
  const variants = {
    normal: "bg-teal-soft text-teal",
    auction: "bg-amber-soft text-amber",
    teal: "bg-teal text-teal-foreground",
    amber: "bg-amber text-amber-foreground",
    neutral: "bg-muted text-muted-foreground",
    dark: "bg-dark text-dark-foreground",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
