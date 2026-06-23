import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Heart } from "lucide-react"
import StatusBadge from "./StatusBadge"
import PriceText from "./PriceText"

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(product.liked)

  return (
    <button
      onClick={() => navigate(`/products/${product.id}`)}
      className="group flex w-full flex-col overflow-hidden rounded-2xl bg-card text-left shadow-sm ring-1 ring-border transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute left-2 top-2">
          <StatusBadge variant="normal">일반 판매</StatusBadge>
        </div>
        <span
          role="button"
          tabIndex={0}
          aria-label="찜하기"
          onClick={(e) => {
            e.stopPropagation()
            setLiked((v) => !v)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation()
              setLiked((v) => !v)
            }
          }}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-card/90 shadow-sm"
        >
          <Heart size={16} className={liked ? "fill-teal text-teal" : "text-muted-foreground"} />
        </span>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{product.title}</h3>
        <PriceText value={product.price} size="md" className="text-foreground" />
        <span className="text-xs text-muted-foreground">{product.status}</span>
      </div>
    </button>
  )
}
