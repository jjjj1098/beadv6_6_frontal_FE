import { NavLink, useLocation } from "react-router-dom"
import { Home, ClipboardList, PlusCircle, ShoppingCart, Wallet } from "lucide-react"

const tabs = [
  { to: "/", label: "상품", icon: Home },
  { to: "/cart", label: "장바구니", icon: ShoppingCart },
  { to: "/products/create", label: "등록", icon: PlusCircle },
  { to: "/orders", label: "거래내역", icon: ClipboardList },
  { to: "/wallet", label: "지갑", icon: Wallet },
]

export default function BottomTabBar() {
  const location = useLocation()
  const hiddenRoutes = [
    "/login",
    "/signup",
    "/admin",
    "/payments/success",
    "/payments/fail",
    "/wallet/charge/success",
    "/wallet/charge/fail",
  ]
  const visibleRoutes = ["/", "/cart", "/orders", "/wallet", "/mypage"]
  const isCreateRoute = location.pathname === "/products/create"

  if (hiddenRoutes.some((route) => location.pathname.startsWith(route))) {
    return null
  }

  if (!visibleRoutes.includes(location.pathname) && !isCreateRoute) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-border bg-card lg:hidden">
      <ul className="flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? "text-teal" : "text-muted-foreground"
                }`
              }
            >
              <Icon size={22} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
