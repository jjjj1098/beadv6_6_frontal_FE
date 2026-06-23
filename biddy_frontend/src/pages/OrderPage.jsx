import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Package } from "lucide-react"
import Header from "../components/Header"
import PageContainer from "../components/PageContainer"
import StatusBadge from "../components/StatusBadge"
import { fetchOrders } from "../api/orderApi"
import { formatKRW, formatDate } from "../lib/format"

const ORDER_STATUS = {
  paid: { label: "결제 완료", variant: "teal" },
  shipping: { label: "배송 중", variant: "amber" },
  delivered: { label: "배송 완료", variant: "dark" },
  cancelled: { label: "취소됨", variant: "neutral" },
}

export default function OrderPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchOrders().then((data) => {
      if (active) {
        setOrders(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <Header title="주문 내역" />
      <PageContainer>
        {loading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">불러오는 중...</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">아직 주문 내역이 없어요</p>
            <Link
              to="/products"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              상품 보러가기
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3 py-4">
            {orders.map((order) => {
              const status = ORDER_STATUS[order.status] || ORDER_STATUS.paid
              return (
                <li key={order.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                    <StatusBadge variant={status.variant}>{status.label}</StatusBadge>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <img
                      src={order.image || "/placeholder.svg"}
                      alt={order.title}
                      className="h-16 w-16 flex-shrink-0 rounded-lg border border-border object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <p className="truncate text-sm font-medium text-foreground">{order.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">주문번호 {order.id}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">결제 금액</span>
                    <span className="text-sm font-bold text-foreground">{formatKRW(order.amount)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </PageContainer>
    </>
  )
}
