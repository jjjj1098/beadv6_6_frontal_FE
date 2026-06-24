import { Link, useNavigate } from "react-router-dom"
import { Package, User, ShoppingCart, ClipboardList, Wallet, ShieldCheck, LogOut, LogIn, UserPlus } from "lucide-react"
import PageContainer from "../components/PageContainer"
import { useAuth } from "../contexts/AuthContext"

const menuItems = [
  { to: "/products", label: "상품 목록", icon: Package, desc: "등록된 상품을 둘러보세요" },
  { to: "/mypage", label: "마이페이지", icon: User, desc: "내 정보와 활동 내역" },
  { to: "/cart", label: "장바구니", icon: ShoppingCart, desc: "담아둔 상품 확인" },
  { to: "/orders", label: "주문 내역", icon: ClipboardList, desc: "주문/거래 내역 조회" },
  { to: "/wallet", label: "지갑", icon: Wallet, desc: "잔액 및 거래 내역" },
]

export default function MainPage() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <PageContainer className="flex flex-col">
      <main className="flex flex-col gap-6 py-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-extrabold tracking-tight text-dark">
              Bid<span className="text-teal">dy</span>
            </p>
            {isAuthenticated ? (
              <>
                <h1 className="mt-3 text-2xl font-extrabold text-foreground">
                  안녕하세요{user?.id ? `, 회원님` : ""} 👋
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">오늘도 좋은 거래 되세요.</p>
              </>
            ) : (
              <>
                <h1 className="mt-3 text-2xl font-extrabold text-foreground">중고 거래의 시작, Biddy</h1>
                <p className="mt-1 text-sm text-muted-foreground">로그인하고 상품을 둘러보세요.</p>
              </>
            )}
          </div>

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          )}
        </div>

        {isAuthenticated ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {menuItems.map(({ to, label, icon: Icon, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col gap-2 rounded-xl border border-border p-4 hover:border-teal hover:bg-teal-soft transition-colors"
                >
                  <Icon size={22} className="text-teal" />
                  <span className="font-semibold text-foreground">{label}</span>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </Link>
              ))}
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-3 rounded-xl bg-dark px-4 py-4 text-white hover:opacity-90 transition-opacity"
              >
                <ShieldCheck size={20} />
                <div>
                  <p className="font-semibold">관리자 페이지</p>
                  <p className="text-xs text-white/70">회원/탈퇴 승인 등 관리 기능</p>
                </div>
              </Link>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal font-semibold text-teal-foreground"
            >
              <LogIn size={18} />
              로그인
            </Link>
            <Link
              to="/signup"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <UserPlus size={18} />
              회원가입
            </Link>
          </div>
        )}
      </main>
    </PageContainer>
  )
}