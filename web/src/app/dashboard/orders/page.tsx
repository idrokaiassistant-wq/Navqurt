"use client"

import { useEffect, useState, useCallback } from "react"
import { Clock, Search, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { timeAgo, formatPrice } from "@/lib/date-utils"
import { apiGet, apiPatch, handleApiError } from "@/lib/api-client"
import { logError } from "@/lib/logger"

interface OrderItem {
    id: string
    quantity: number
    price: number
    product: {
        id: string
        name: string
        image?: string | null
    }
    variant?: {
        id: string
        type: string
        priceDelta: number
    } | null
}

interface Order {
    id: string
    userId: string
    totalAmount: number
    deliveryFee: number
    status: string
    comment?: string | null
    createdAt: string
    user: {
        fullName?: string | null
        phone?: string | null
        telegramId?: string
        address?: string | null
    }
    region?: {
        id: string
        name: string
        deliveryPrice: number
    } | null
    items: OrderItem[]
}

interface OrderDetails extends Order {
    items: OrderItem[]
}

const statusMap: Record<string, { label: string; color: string }> = {
    NEW: { label: "Yangi", color: "bg-emerald-500" },
    CONFIRMED: { label: "Tasdiqlangan", color: "bg-blue-500" },
    PREPARING: { label: "Tayyorlanmoqda", color: "bg-amber-500" },
    ON_DELIVERY: { label: "Yo&apos;lda", color: "bg-purple-500" },
    DELIVERED: { label: "Yetkazildi", color: "bg-slate-500" },
    CANCELED: { label: "Bekor qilindi", color: "bg-rose-500" }
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
    })
    const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState("")

    const fetchOrders = useCallback(async (page: number = 1) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "50"
            })
            if (statusFilter) {
                params.append("status", statusFilter)
            }
            const data = await apiGet<{ orders: Order[], pagination: typeof pagination }>(`/api/admin/orders?${params.toString()}`)
            setOrders(data.orders ?? [])
            if (data.pagination) {
                setPagination(data.pagination)
            }
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to fetch orders:", errorMessage)
        }
    }, [statusFilter])

    useEffect(() => {
        fetchOrders(1)
    }, [statusFilter, fetchOrders])

    const fetchOrderDetails = async (orderId: string) => {
        try {
            setDetailsLoading(true)
            const data = await apiGet<{ order: OrderDetails }>(`/api/admin/orders/${orderId}`)
            setSelectedOrder(data.order)
            setIsDetailsOpen(true)
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to fetch order details:", errorMessage)
        } finally {
            setDetailsLoading(false)
        }
    }

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await apiPatch<Order>(`/api/admin/orders/${orderId}`, { status: newStatus })
            await fetchOrders(pagination.page)
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus })
            }
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to update order status:", errorMessage)
        }
    }

    const filteredOrders = orders.filter(order => {
        if (searchQuery.trim() === "") return true
        const query = searchQuery.toLowerCase()
        const orderId = order.id.toLowerCase()
        const userName = (order.user.fullName || "").toLowerCase()
        const userPhone = (order.user.phone || "").toLowerCase()
        return orderId.includes(query) || userName.includes(query) || userPhone.includes(query)
    })

    if (loading) {
        return <div className="text-foreground">Yuklanmoqda...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Buyurtmalar</h1>
                    <p className="text-muted-foreground">Barcha buyurtmalarni boshqaring</p>
                </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Qidirish... (ID, ism, telefon)"
                        className="bg-input border border-input rounded-xl py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="bg-input border border-input rounded-xl py-2 px-4 text-foreground focus:outline-none focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Barcha holatlar</option>
                    {Object.entries(statusMap).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                    ))}
                </select>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left text-muted-foreground font-medium px-5 py-4">Buyurtma</th>
                                <th className="text-left text-muted-foreground font-medium px-5 py-4">Mijoz</th>
                                <th className="text-left text-muted-foreground font-medium px-5 py-4">Holat</th>
                                <th className="text-left text-muted-foreground font-medium px-5 py-4">Vaqt</th>
                                <th className="text-right text-muted-foreground font-medium px-5 py-4">Summa</th>
                                <th className="text-right text-muted-foreground font-medium px-5 py-4">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                                        Buyurtmalar topilmadi
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const statusInfo = statusMap[order.status] || { label: order.status, color: "bg-gray-500" }
                                    return (
                                        <tr key={order.id} className="border-b border-border last:border-0 hover:bg-accent transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="text-foreground font-medium">#{order.id.slice(0, 8)}</div>
                                                <div className="text-muted-foreground text-sm">{order.items.length} ta mahsulot</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-foreground text-sm font-medium">
                                                        {order.user.fullName?.charAt(0) || "?"}
                                                    </div>
                                                    <div>
                                                        <div className="text-foreground">{order.user.fullName || "Noma&apos;lum"}</div>
                                                        {order.user.phone && (
                                                            <div className="text-muted-foreground text-xs">{order.user.phone}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`${statusInfo.color} text-white text-xs px-3 py-1 rounded-full border-none outline-none cursor-pointer`}
                                                >
                                                    {Object.entries(statusMap).map(([key, val]) => (
                                                        <option key={key} value={key}>{val.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                                    <Clock className="h-4 w-4" />
                                                    {timeAgo(order.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className="text-foreground font-semibold">
                                                    {formatPrice(order.totalAmount + order.deliveryFee)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => fetchOrderDetails(order.id)}
                                                    className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Tafsilotlarni ko'rish"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && pagination.totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-border flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            {pagination.total} ta buyurtmadan {(pagination.page - 1) * pagination.limit + 1}-
                            {Math.min(pagination.page * pagination.limit, pagination.total)} tasi ko&apos;rsatilmoqda
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => fetchOrders(pagination.page - 1)}
                                disabled={!pagination.hasPreviousPage}
                            >
                                Oldingi
                            </Button>
                            <span className="text-sm text-muted-foreground px-3">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => fetchOrders(pagination.page + 1)}
                                disabled={!pagination.hasNextPage}
                            >
                                Keyingi
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Buyurtma tafsilotlari</DialogTitle>
                    </DialogHeader>
                    {detailsLoading ? (
                        <div className="text-center text-muted-foreground py-8">Yuklanmoqda...</div>
                    ) : selectedOrder ? (
                        <div className="space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Buyurtma ID</div>
                                    <div className="text-foreground font-medium">#{selectedOrder.id.slice(0, 8)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Holat</div>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                        className={`${statusMap[selectedOrder.status]?.color || "bg-gray-500"} text-white text-sm px-3 py-1 rounded-full border-none outline-none cursor-pointer mt-1`}
                                    >
                                        {Object.entries(statusMap).map(([key, val]) => (
                                            <option key={key} value={key}>{val.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Vaqt</div>
                                    <div className="text-foreground">{new Date(selectedOrder.createdAt).toLocaleString("uz-UZ")}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Jami summa</div>
                                    <div className="text-foreground font-semibold text-lg">{formatPrice(selectedOrder.totalAmount + selectedOrder.deliveryFee)}</div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="border-t border-border pt-4">
                                <h3 className="text-lg font-semibold text-foreground mb-3">Mijoz ma&apos;lumotlari</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Ism</div>
                                        <div className="text-foreground">{selectedOrder.user.fullName || "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Telefon</div>
                                        <div className="text-foreground">{selectedOrder.user.phone || "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Telegram ID</div>
                                        <div className="text-foreground">{selectedOrder.user.telegramId || "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Region</div>
                                        <div className="text-foreground">{selectedOrder.region?.name || "—"}</div>
                                    </div>
                                    {selectedOrder.user.address && (
                                        <div className="col-span-2">
                                            <div className="text-sm text-muted-foreground">Manzil</div>
                                            <div className="text-foreground">{selectedOrder.user.address}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="border-t border-border pt-4">
                                <h3 className="text-lg font-semibold text-foreground mb-3">Mahsulotlar</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {item.product.image && (
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                                        <Image
                                                            src={item.product.image}
                                                            alt={item.product.name}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-foreground font-medium">{item.product.name}</div>
                                                    {item.variant && (
                                                        <div className="text-sm text-muted-foreground">Variant: {item.variant.type}</div>
                                                    )}
                                                    <div className="text-sm text-muted-foreground">Miqdor: {item.quantity} ta</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-foreground font-semibold">{formatPrice(item.price)}</div>
                                                {item.variant && item.variant.priceDelta !== 0 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.variant.priceDelta > 0 ? "+" : ""}{formatPrice(item.variant.priceDelta)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t border-border pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Mahsulotlar jami:</span>
                                        <span>{formatPrice(selectedOrder.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Yetkazib berish:</span>
                                        <span>{formatPrice(selectedOrder.deliveryFee)}</span>
                                    </div>
                                    <div className="flex justify-between text-foreground font-semibold text-lg pt-2 border-t border-border">
                                        <span>Jami:</span>
                                        <span>{formatPrice(selectedOrder.totalAmount + selectedOrder.deliveryFee)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Comment */}
                            {selectedOrder.comment && (
                                <div className="border-t border-border pt-4">
                                    <div className="text-sm text-muted-foreground mb-2">Izoh</div>
                                    <div className="text-foreground bg-secondary p-3 rounded-lg">{selectedOrder.comment}</div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    )
}
