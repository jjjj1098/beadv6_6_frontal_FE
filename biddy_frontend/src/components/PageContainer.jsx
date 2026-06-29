// Hybrid layout frame:
// - mobile: phone-app width, so the UI keeps the previous mobile-web-app feel
// - tablet/desktop: wider web layout, so product/admin pages can use more space
const WIDTH_BY_VARIANT = {
  hybrid: "max-w-md lg:max-w-6xl",
  mobile: "max-w-md",
  wide: "max-w-6xl",
}

export default function PageContainer({
  children,
  className = "",
  noPadX = false,
  withTabBar = true,
  variant = "hybrid",
}) {
  const widthClass = WIDTH_BY_VARIANT[variant] ?? WIDTH_BY_VARIANT.hybrid
  const bottomPaddingClass = withTabBar ? "pb-24 lg:pb-10" : "pb-6 lg:pb-10"

  return (
    <div className="min-h-full bg-background flex justify-center">
      <div
        className={`w-full ${widthClass} bg-background min-h-screen ${bottomPaddingClass} ${
          noPadX ? "" : "px-4"
        } ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
