
"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { Search, Plus, Edit2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/lib/date-utils"
import { apiGet, apiPost, apiPatch, apiDelete, handleApiError } from "@/lib/api-client"

type ApiCustomer = {
    id: string
    telegramId: string
    fullName: string | null
    phone: string | null
    regionId: string | null
    address: string | null
    createdAt: string
    totalOrders: number
    totalSpent: number
}

type ApiRegion = {
    id: string
    name: string
}

export default function CustomersPage() {
    const [query, setQuery] = useState("")
    const [customers, setCustomers] = useState<ApiCustomer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
    })

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newCustomer, setNewCustomer] = useState({
        telegramId: "",
        fullName: "",
        phone: "",
        regionId: "",
        address: ""
    })

    // Edit state
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editCustomer, setEditCustomer] = useState<ApiCustomer | null>(null)
    const [editForm, setEditForm] = useState({
        fullName: "",
        phone: "",
        regionId: "",
        address: ""
    })

    // Regions state
    const [regions, setRegions] = useState<ApiRegion[]>([])
    const [loadingRegions, setLoadingRegions] = useState(false)

    const mountedRef = useRef(true)

    const fetchCustomers = async (page: number = 1) => {
        try {
            setLoading(true)
            setError("")
            const data = await apiGet<{ customers: ApiCustomer[], pagination: typeof pagination }>(`/api/admin/customers?page=${page}&limit=50`)
            if (mountedRef.current) {
                setCustomers(data.customers ?? [])
                if (data.pagination) {
                    setPagination(data.pagination)
                }
            }
        } catch (e) {
            if (mountedRef.current) {
                const errorMessage = handleApiError(e)
                setError(errorMessage)
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false)
            }
        }
    }

    const fetchRegions = async () => {
        try {
            setLoadingRegions(true)
            const data = await apiGet<{ regions: ApiRegion[] }>("/api/admin/regions")
            setRegions(data.regions ?? [])
        } catch (e) {
            // Silently fail - regions are optional
        } finally {
            setLoadingRegions(false)
        }
    }

    useEffect(() => {
        mountedRef.current = true
        void fetchCustomers()
        void fetchRegions()
        return () => {
            mountedRef.current = false
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

    const handleAdd = async () => {
        try {
            const payload = {
                telegramId: newCustomer.telegramId.trim(),
                fullName: newCustomer.fullName.trim() || null,
                phone: newCustomer.phone.trim() || null,
                regionId: newCustomer.regionId || null,
                address: newCustomer.address.trim() || null,
            }
            await apiPost<{ customer: ApiCustomer }>("/api/admin/customers", payload)
            setNewCustomer({
                telegramId: "",
                fullName: "",
                phone: "",
                regionId: "",
                address: ""
            })
            setIsAddOpen(false)
            await fetchCustomers(pagination.page)
        } catch (e) {
            const errorMessage = handleApiError(e)
            setError(errorMessage)
        }
    }

    const openEditModal = (customer: ApiCustomer) => {
        setEditCustomer(customer)
        setEditForm({
            fullName: customer.fullName || "",
            phone: customer.phone || "",
            regionId: customer.regionId || "",
            address: customer.address || ""
        })
        setIsEditOpen(true)
    }

    const handleEdit = async () => {
        if (!editCustomer) return
        try {
            const payload = {
                fullName: editForm.fullName.trim() || null,
                phone: editForm.phone.trim() || null,
                regionId: editForm.regionId || null,
                address: editForm.address.trim() || null,
            }
            await apiPatch<{ customer: ApiCustomer }>(`/api/admin/customers/${editCustomer.id}`, payload)
            setEditCustomer(null)
            setEditForm({
                fullName: "",
                phone: "",
                regionId: "",
                address: ""
            })
            setIsEditOpen(false)
            await fetchCustomers(pagination.page)
        } catch (e) {
            const errorMessage = handleApiError(e)
            setError(errorMessage)
        }
    }

    const handleDelete = async (id: string, telegramId: string) => {
        if (!confirm(`Telegram ID: ${telegramId} bo'lgan mijozni o'chirmoqchimisiz?`)) return
        try {
            await apiDelete<{ message: string }>(`/api/admin/customers/${id}`)
            await fetchCustomers(pagination.page)
        } catch (e) {
            const errorMessage = handleApiError(e)
            setError(errorMessage)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Mijozlar</h1>
                    <p className="text-muted-foreground">Barcha mijozlarni ko&apos;ring</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Mijoz qidirish... (ism/telefon/telegramId)"
                            className="bg-input border border-input rounded-xl py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-500 hover:bg-blue-600">
                                <Plus className="h-5 w-5 mr-2" />
                                Yangi mijoz
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Yangi mijoz</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Telegram ID *</Label>
                                    <Input
                                        placeholder="123456789"
                                        type="number"
                                        value={newCustomer.telegramId}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, telegramId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Ism</Label>
                                    <Input
                                        placeholder="To'liq ism"
                                        value={newCustomer.fullName}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Telefon</Label>
                                    <Input
                                        placeholder="+998901234567"
                                        value={newCustomer.phone}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Region</Label>
                                    <select
                                        className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
                                        value={newCustomer.regionId}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, regionId: e.target.value })}
                                    >
                                        <option value="">Region tanlang</option>
                                        {regions.map((region) => (
                                            <option key={region.id} value={region.id}>
                                                {region.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>Manzil</Label>
                                    <textarea
                                        className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500 resize-none"
                                        placeholder="To'liq manzil"
                                        rows={3}
                                        value={newCustomer.address}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleAdd} className="w-full bg-blue-500 hover:bg-blue-600">
                                    Qo&apos;shish
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left text-muted-foreground font-medium px-5 py-4">Mijoz</th>
                                <th className="text-left text-muted-foreground font-medium px-5 py-4">Buyurtmalar</th>
                                <th className="text-left text-muted-foreground font-medium px-5 py-4">Jami xarid</th>
                                <th className="text-left text-muted-foreground font-medium px-5 py-4">Telegram ID</th>
                                <th className="text-left text-muted-foreground font-medium px-5 py-4">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {error && (
                                <tr>
                                    <td className="px-5 py-4 text-rose-400" colSpan={5}>
                                        {error}
                                    </td>
                                </tr>
                            )}
                            {loading && !error && (
                                <tr>
                                    <td className="px-5 py-4 text-muted-foreground" colSpan={5}>
                                        Yuklanmoqda...
                                    </td>
                                </tr>
                            )}
                            {!loading && !error && filtered.length === 0 && (
                                <tr>
                                    <td className="px-5 py-4 text-muted-foreground" colSpan={5}>
                                        Mijoz topilmadi
                                    </td>
                                </tr>
                            )}
                            {filtered.map((customer) => (
                                <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-accent transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {(customer.fullName ?? customer.phone ?? customer.telegramId ?? "?").charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-foreground font-medium">{customer.fullName ?? "—"}</div>
                                                <div className="text-muted-foreground text-sm">{customer.phone ?? "—"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-foreground">{customer.totalOrders} ta</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-emerald-400 font-semibold">{formatPrice(customer.totalSpent)}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-muted-foreground">{customer.telegramId}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                onClick={() => openEditModal(customer)}
                                                title="Tahrirlash"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                onClick={() => handleDelete(customer.id, customer.telegramId)}
                                                title="O'chirish"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && !error && pagination.totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-border flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            {pagination.total} ta mijozdan {(pagination.page - 1) * pagination.limit + 1}-
                            {Math.min(pagination.page * pagination.limit, pagination.total)} tasi ko'rsatilmoqda
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => fetchCustomers(pagination.page - 1)}
                                disabled={!pagination.hasPreviousPage}
                            >
                                Oldingi
                            </Button>
                            <span className="text-sm text-muted-foreground px-3">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => fetchCustomers(pagination.page + 1)}
                                disabled={!pagination.hasNextPage}
                            >
                                Keyingi
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Mijozni tahrirlash</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Ism</Label>
                            <Input
                                placeholder="To'liq ism"
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Telefon</Label>
                            <Input
                                placeholder="+998901234567"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Region</Label>
                            <select
                                className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
                                value={editForm.regionId}
                                onChange={(e) => setEditForm({ ...editForm, regionId: e.target.value })}
                            >
                                <option value="">Region tanlang</option>
                                {regions.map((region) => (
                                    <option key={region.id} value={region.id}>
                                        {region.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Manzil</Label>
                            <textarea
                                className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500 resize-none"
                                placeholder="To'liq manzil"
                                rows={3}
                                value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleEdit} className="w-full bg-blue-500 hover:bg-blue-600">
                            Saqlash
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
