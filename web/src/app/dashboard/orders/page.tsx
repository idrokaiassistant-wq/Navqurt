"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { timeAgo } from "@/lib/date-utils"

interface Order {
    id: string
    userId: string
    totalAmount: number
    deliveryFee: number
    status: string
    createdAt: string
    user: {
        fullName?: string
        phone?: string
    }
    items: unknown[]
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

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/admin/orders")
            if (res.ok) {
                const data = await res.json()
                setOrders(data)
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                await fetchOrders()
            }
        } catch (error) {
            console.error("Failed to update order status:", error)
        }
    }

    if (loading) {
        return <div className="text-white">Yuklanmoqda...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Buyurtmalar</h1>
                    <p className="text-slate-400">Barcha buyurtmalarni boshqaring</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="text-left text-slate-400 font-medium px-5 py-4">Buyurtma</th>
                                <th className="text-left text-slate-400 font-medium px-5 py-4">Mijoz</th>
                                <th className="text-left text-slate-400 font-medium px-5 py-4">Holat</th>
                                <th className="text-left text-slate-400 font-medium px-5 py-4">Vaqt</th>
                                <th className="text-right text-slate-400 font-medium px-5 py-4">Summa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                                        Buyurtmalar topilmadi
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const statusInfo = statusMap[order.status] || { label: order.status, color: "bg-gray-500" }
                                    return (
                                        <tr key={order.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="text-white font-medium">#{order.id.slice(0, 8)}</div>
                                                <div className="text-slate-400 text-sm">{order.items.length} ta mahsulot</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                        {order.user.fullName?.charAt(0) || "?"}
                                                    </div>
                                                    <div>
                                                        <div className="text-white">{order.user.fullName || "Noma&apos;lum"}</div>
                                                        {order.user.phone && (
                                                            <div className="text-slate-400 text-xs">{order.user.phone}</div>
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
                                                <div className="flex items-center gap-1 text-slate-400 text-sm">
                                                    <Clock className="h-4 w-4" />
                                                    {timeAgo(order.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className="text-white font-semibold">
                                                    {(order.totalAmount + order.deliveryFee).toLocaleString()} so&apos;m
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
