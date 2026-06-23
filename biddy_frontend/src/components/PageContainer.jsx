// Centers content into a phone-width column and pads for the fixed header / tab bar.
export default function PageContainer({ children, className = "", noPadX = false, withTabBar = true }) {
  return (
    <div className="min-h-full bg-background flex justify-center">
      <div
        className={`w-full max-w-md bg-background min-h-screen ${withTabBar ? "pb-24" : "pb-6"} ${
          noPadX ? "" : "px-4"
        } ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
