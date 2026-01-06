
"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { formatPrice } from "@/lib/date-utils"

type ApiCustomer = {
    id: string
    telegramId: string
    fullName: string | null
    phone: string | null
    createdAt: string
    totalOrders: number
    totalSpent: number
}

export default function CustomersPage() {
    const [query, setQuery] = useState("")
    const [customers, setCustomers] = useState<ApiCustomer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                setLoading(true)
                setError("")
                const res = await fetch("/api/admin/customers", { cache: "no-store" })
                const data = await res.json()
                if (!res.ok) throw new Error(data?.error ?? "Xatolik")
                if (mounted) setCustomers(data.customers ?? [])
            } catch (e) {
                if (mounted) setError(String(e))
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => {
            mounted = false
        }
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return customers
        return customers.filter((c) => {
            const name = (c.fullName ?? "").toLowerCase()
            const phone = (c.phone ?? "").toLowerCase()
            const tg = (c.telegramId ?? "").toLowerCase()
            return name.includes(q) || phone.includes(q) || tg.includes(q)
        })
    }, [customers, query])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Mijozlar</h1>
                    <p className="text-slate-400">Barcha mijozlarni ko&apos;ring</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Mijoz qidirish... (ism/telefon/telegramId)"
                        className="bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="text-left text-slate-400 font-medium px-5 py-4">Mijoz</th>
                                <th className="text-left text-slate-400 font-medium px-5 py-4">Buyurtmalar</th>
                                <th className="text-left text-slate-400 font-medium px-5 py-4">Jami xarid</th>
                                <th className="text-left text-slate-400 font-medium px-5 py-4">Telegram ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {error && (
                                <tr>
                                    <td className="px-5 py-4 text-rose-400" colSpan={4}>
                                        {error}
                                    </td>
                                </tr>
                            )}
                            {loading && !error && (
                                <tr>
                                    <td className="px-5 py-4 text-slate-400" colSpan={4}>
                                        Yuklanmoqda...
                                    </td>
                                </tr>
                            )}
                            {!loading && !error && filtered.length === 0 && (
                                <tr>
                                    <td className="px-5 py-4 text-slate-400" colSpan={4}>
                                        Mijoz topilmadi
                                    </td>
                                </tr>
                            )}
                            {filtered.map((customer, index) => (
                                <tr key={index} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {(customer.fullName ?? customer.phone ?? customer.telegramId ?? "?").charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{customer.fullName ?? "—"}</div>
                                                <div className="text-slate-400 text-sm">{customer.phone ?? "—"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-white">{customer.totalOrders} ta</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-emerald-400 font-semibold">{formatPrice(customer.totalSpent)}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-slate-400">{customer.telegramId}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
