import { Routes, Route, Navigate } from "react-router-dom"
import BottomTabBar from "./components/BottomTabBar"
import ProtectedRoute from "./components/ProtectedRoute"
import { useAuth } from "./contexts/AuthContext"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ProductListPage from "./pages/ProductListPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import ProductCreateTypePage from "./pages/ProductCreateTypePage"
import NormalProductCreatePage from "./pages/NormalProductCreatePage"
import AuctionProductCreatePage from "./pages/AuctionProductCreatePage"
import CartPage from "./pages/CartPage"
import OrderPage from "./pages/OrderPage"
import WalletPage from "./pages/WalletPage"

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/products" : "/login"} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/create"
          element={
            <ProtectedRoute>
              <ProductCreateTypePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/create/normal"
          element={
            <ProtectedRoute>
              <NormalProductCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/create/auction"
          element={
            <ProtectedRoute>
              <AuctionProductCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/products" : "/login"} replace />} />
      </Routes>
      {isAuthenticated && <BottomTabBar />}
    </>
  )
}
