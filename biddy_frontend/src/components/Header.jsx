import { useNavigate } from "react-router-dom"
import { ChevronLeft, ShoppingCart, Bell, LogOut } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

export default function Header({ title, showBack = false, showCart = true, right = null }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-dark text-dark-foreground">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <div className="flex items-center gap-2 min-w-0">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              aria-label="뒤로 가기"
              className="-ml-2 grid h-9 w-9 place-items-center rounded-full hover:bg-graydark"
            >
              <ChevronLeft size={22} />
            </button>
          ) : (
            <span className="text-xl font-extrabold tracking-tight">
              Bid<span className="text-teal">dy</span>
            </span>
          )}
          {title && <h1 className="truncate text-base font-semibold">{title}</h1>}
        </div>

        <div className="flex items-center gap-1">
          {right}
          {showCart && (
            <>
              <button
                onClick={() => navigate("/")}
                aria-label="알림"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-graydark"
              >
                <Bell size={20} />
              </button>
              <button
                onClick={() => navigate("/cart")}
                aria-label="장바구니"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-graydark"
              >
                <ShoppingCart size={20} />
              </button>
              <button
                onClick={logout}
                aria-label="로그아웃"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-graydark"
              >
                <LogOut size={19} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
