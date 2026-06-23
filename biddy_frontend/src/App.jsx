import { Routes, Route, Navigate } from "react-router-dom"
import BottomTabBar from "./components/BottomTabBar"
import ProductListPage from "./pages/ProductListPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import ProductCreateTypePage from "./pages/ProductCreateTypePage"
import NormalProductCreatePage from "./pages/NormalProductCreatePage"
import AuctionProductCreatePage from "./pages/AuctionProductCreatePage"
import CartPage from "./pages/CartPage"
import OrderPage from "./pages/OrderPage"
import WalletPage from "./pages/WalletPage"

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/create" element={<ProductCreateTypePage />} />
        <Route path="/products/create/normal" element={<NormalProductCreatePage />} />
        <Route path="/products/create/auction" element={<AuctionProductCreatePage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
      <BottomTabBar />
    </>
  )
}
