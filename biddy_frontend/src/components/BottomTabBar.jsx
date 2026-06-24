import { NavLink } from "react-router-dom"
import { Home, Package, PlusCircle, ShoppingCart, Wallet } from "lucide-react"

const tabs = [
  { to: "/", label: "홈", icon: Home },
  { to: "/products", label: "상품", icon: Package },
  { to: "/cart", label: "장바구니", icon: ShoppingCart },
  { to: "/products/create", label: "등록", icon: PlusCircle },
  { to: "/wallet", label: "지갑", icon: Wallet },
]

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-border bg-card">
      <ul className="flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/products"}
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
