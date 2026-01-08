"use client"

import { useEffect, useState, useCallback } from "react"
import { ClipboardList, TrendingUp, Users, Package, Clock } from "lucide-react"
import { timeAgo, formatPrice } from "@/lib/date-utils"
import { apiGet, handleApiError } from "@/lib/api-client"
import { logError } from "@/lib/logger"

const statusMap: Record<string, { label: string; color: string }> = {
    NEW: { label: "Yangi", color: "bg-emerald-500" },
    CONFIRMED: { label: "Tasdiqlangan", color: "bg-blue-500" },
    PREPARING: { label: "Tayyorlanmoqda", color: "bg-amber-500" },
    ON_DELIVERY: { label: "Yo'lda", color: "bg-purple-500" },
    DELIVERED: { label: "Yetkazildi", color: "bg-slate-500" },
    CANCELED: { label: "Bekor qilindi", color: "bg-rose-500" }
}

export default function DashboardPage() {
    const [stats, setStats] = useState({
        todayOrders: 0,
        todaySales: 0,
        newCustomers: 0,
        totalProducts: 0
    })
    interface Order {
        id: string
        createdAt: string
        totalAmount: number
        deliveryFee: number
        status: string
        user?: { fullName?: string }
        items?: Array<unknown>
    }

    interface Customer {
        id: string
        createdAt: string
    }

    const [recentOrders, setRecentOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = useCallback(async () => {
        try {
            const [ordersData, productsData, customersData] = await Promise.all([
                apiGet<{ orders: Order[] }>("/api/admin/orders"),
                apiGet<{ products: unknown[] }>("/api/admin/products"),
                apiGet<{ customers: Customer[] }>("/api/admin/customers")
            ])

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const orders: Order[] = ordersData.orders || []
            const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today)
            const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount + o.deliveryFee, 0)
            
            setStats(prev => ({ ...prev, todayOrders: todayOrders.length, todaySales }))
            setRecentOrders(orders.slice(0, 5))

            const products = productsData.products || []
            setStats(prev => ({ ...prev, totalProducts: products.length }))

            const customers: Customer[] = customersData.customers || []
            const newCustomers = customers.filter((c) => new Date(c.createdAt) >= today)
            setStats(prev => ({ ...prev, newCustomers: newCustomers.length }))
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to fetch dashboard data:", errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    const statsData = [
        {
            value: stats.todayOrders.toString(),
            label: "Bugungi buyurtmalar",
            change: "",
            positive: true,
            icon: ClipboardList,
            iconBg: "bg-blue-500",
        },
        {
            value: formatPrice(stats.todaySales),
            label: "Jami savdo (bugun)",
            change: "",
            positive: true,
            icon: TrendingUp,
            iconBg: "bg-emerald-500",
        },
        {
            value: stats.newCustomers.toString(),
            label: "Yangi mijozlar",
            change: "",
            positive: true,
            icon: Users,
            iconBg: "bg-amber-500",
        },
        {
            value: stats.totalProducts.toString(),
            label: "Mahsulotlar",
            change: "",
            positive: true,
            icon: Package,
            iconBg: "bg-rose-500",
        },
    ]

    if (loading) {
        return <div className="text-white">Yuklanmoqda...</div>
    }
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statsData.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={index}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.iconBg} p-3 rounded-xl`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                {stat.change && (
                                    <span className={`text-sm font-medium flex items-center gap-1 ${stat.positive ? "text-emerald-400" : "text-rose-400"
                                        }`}>
                                        <span>{stat.positive ? "↑" : "↓"}</span>
                                        {stat.change}
                                    </span>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">
                                {stat.value}
                            </div>
                            <div className="text-slate-400 text-sm">
                                {stat.label}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Recent Orders */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-white">So&apos;ngi buyurtmalar</h2>
                    <p className="text-slate-400 text-sm">Bugungi faol buyurtmalar</p>
                </div>
                <div className="space-y-4">
                    {recentOrders.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">Hali buyurtmalar yo&apos;q</div>
                    ) : (
                        recentOrders.map((order) => {
                            const statusInfo = statusMap[order.status] || { label: order.status, color: "bg-gray-500" }
                            return (
                                <div key={order.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-semibold">
                                            {order.user?.fullName?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{order.user?.fullName || "Noma'lum"}</div>
                                            <div className="text-slate-400 text-sm">
                                                #{order.id.slice(0, 8)} • {order.items?.length || 0} ta mahsulot
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`${statusInfo.color} text-white text-xs px-3 py-1 rounded-full`}>
                                            {statusInfo.label}
                                        </span>
                                        <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                                            <Clock className="h-3 w-3" />
                                            {timeAgo(order.createdAt)}
                                        </div>
                                        <div className="text-white font-semibold text-sm mt-1">
                                            {formatPrice(order.totalAmount + order.deliveryFee)}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
