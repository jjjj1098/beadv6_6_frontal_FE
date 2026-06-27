import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Heart } from "lucide-react"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import { fetchLikedProducts, unlikeProduct } from "../api/productApi"

export default function LikedProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLikedProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleUnlike = async (e, productId) => {
    e.stopPropagation()
    await unlikeProduct(productId)
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  return (
    <PageContainer>
      <Header showBack title="찜 목록" showCart />
      <div className="mx-auto w-full max-w-md pt-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Heart size={40} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">찜한 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="flex cursor-pointer items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border"
              >
                <img
                  src={product.image || "/images/placeholder.png"}
                  alt={product.title}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{product.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                  <p className="text-sm font-bold text-teal mt-1">
                    {Number(product.price).toLocaleString()}원
                  </p>
                </div>
                <button
                  onClick={(e) => handleUnlike(e, product.id)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ring-border"
                  aria-label="찜 취소"
                >
                  <Heart size={18} className="fill-teal text-teal" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
