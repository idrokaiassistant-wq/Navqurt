"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Edit2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/lib/date-utils"
import { apiGet, apiPost, apiPatch, apiDelete, handleApiError } from "@/lib/api-client"

type ApiRegion = {
    id: string
    name: string
    deliveryPrice: number
    minFreeDelivery: number | null
    isActive: boolean
}

export default function RegionsPage() {
    const [regions, setRegions] = useState<ApiRegion[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [query, setQuery] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newRegion, setNewRegion] = useState({
        name: "",
        deliveryPrice: "",
        minFreeDelivery: "",
        isActive: true
    })

    // Edit state
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editRegion, setEditRegion] = useState<ApiRegion | null>(null)
    const [editForm, setEditForm] = useState({
        name: "",
        deliveryPrice: "",
        minFreeDelivery: "",
        isActive: true
    })

    const load = async () => {
        try {
            setLoading(true)
            setError("")
            const data = await apiGet<{ regions: ApiRegion[] }>("/api/admin/regions?includeInactive=true")
            setRegions(data.regions ?? [])
        } catch (e) {
            const errorMessage = handleApiError(e)
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    const filtered = regions.filter((r) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return r.name.toLowerCase().includes(q)
    })

    const handleAdd = async () => {
        try {
            const payload = {
                name: newRegion.name.trim(),
                deliveryPrice: Number(newRegion.deliveryPrice) || 0,
                minFreeDelivery: newRegion.minFreeDelivery ? Number(newRegion.minFreeDelivery) : null,
                isActive: newRegion.isActive
            }
            await apiPost<{ region: ApiRegion }>("/api/admin/regions", payload)
            setNewRegion({
                name: "",
                deliveryPrice: "",
                minFreeDelivery: "",
                isActive: true
            })
            setIsAddOpen(false)
            await load()
        } catch (e) {
            const errorMessage = handleApiError(e)
            setError(errorMessage)
        }
    }

    const openEditModal = (region: ApiRegion) => {
        setEditRegion(region)
        setEditForm({
            name: region.name,
            deliveryPrice: region.deliveryPrice.toString(),
            minFreeDelivery: region.minFreeDelivery?.toString() || "",
            isActive: region.isActive
        })
        setIsEditOpen(true)
    }

    const handleEdit = async () => {
        if (!editRegion) return
        try {
            const payload = {
                name: editForm.name.trim(),
                deliveryPrice: Number(editForm.deliveryPrice) || 0,
                minFreeDelivery: editForm.minFreeDelivery ? Number(editForm.minFreeDelivery) : null,
                isActive: editForm.isActive
            }
            await apiPatch<{ region: ApiRegion }>(`/api/admin/regions/${editRegion.id}`, payload)
            setEditRegion(null)
            setEditForm({
                name: "",
                deliveryPrice: "",
                minFreeDelivery: "",
                isActive: true
            })
            setIsEditOpen(false)
            await load()
        } catch (e) {
            const errorMessage = handleApiError(e)
            setError(errorMessage)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" regionini o'chirmoqchimisiz?`)) return
        try {
            await apiDelete<{ message: string }>(`/api/admin/regions/${id}`)
            await load()
        } catch (e) {
            const errorMessage = handleApiError(e)
            setError(errorMessage)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Regionlar</h1>
                    <p className="text-muted-foreground">Yetkazib berish regionlarini boshqaring</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            className="bg-input border border-input rounded-xl py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-500 hover:bg-blue-600">
                                <Plus className="h-5 w-5 mr-2" />
                                Yangi region
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Yangi region</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Nomi *</Label>
                                    <Input
                                        value={newRegion.name}
                                        onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Yetkazib berish narxi (so&apos;m) *</Label>
                                    <Input
                                        type="number"
                                        value={newRegion.deliveryPrice}
                                        onChange={(e) => setNewRegion({ ...newRegion, deliveryPrice: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Minimal bepul yetkazib berish (so&apos;m) - ixtiyoriy</Label>
                                    <Input
                                        type="number"
                                        placeholder="Masalan: 50000"
                                        value={newRegion.minFreeDelivery}
                                        onChange={(e) => setNewRegion({ ...newRegion, minFreeDelivery: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Agar bo&apos;sh qoldirilsa, bepul yetkazib berish bo&apos;lmaydi</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActiveNew"
                                        checked={newRegion.isActive}
                                        onChange={(e) => setNewRegion({ ...newRegion, isActive: e.target.checked })}
                                        className="w-4 h-4 rounded border-input bg-input"
                                    />
                                    <Label htmlFor="isActiveNew" className="cursor-pointer">Faol</Label>
                                </div>
                                <Button onClick={handleAdd} className="w-full bg-blue-500 hover:bg-blue-600">
                                    Qo&apos;shish
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {error && (
                <div className="bg-card border border-rose-500/30 rounded-2xl p-5 text-rose-400">
                    {error}
                </div>
            )}

            {loading && !error && (
                <div className="bg-card border border-border rounded-2xl p-5 text-muted-foreground">
                    Yuklanmoqda...
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="bg-card border border-border rounded-2xl p-5 text-muted-foreground">
                    Region topilmadi
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-muted-foreground font-medium px-5 py-4">Region</th>
                                    <th className="text-left text-muted-foreground font-medium px-5 py-4">Yetkazib berish narxi</th>
                                    <th className="text-left text-muted-foreground font-medium px-5 py-4">Minimal bepul yetkazib berish</th>
                                    <th className="text-left text-muted-foreground font-medium px-5 py-4">Holat</th>
                                    <th className="text-right text-muted-foreground font-medium px-5 py-4">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((region) => (
                                    <tr key={region.id} className="border-b border-border last:border-0 hover:bg-accent transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="text-foreground font-medium">{region.name}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-foreground">{formatPrice(region.deliveryPrice)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-muted-foreground">
                                                {region.minFreeDelivery ? formatPrice(region.minFreeDelivery) : "—"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs ${
                                                region.isActive 
                                                    ? "bg-emerald-500/20 text-emerald-400" 
                                                    : "bg-muted text-muted-foreground"
                                            }`}>
                                                {region.isActive ? "Faol" : "Nofaol"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    onClick={() => openEditModal(region)}
                                                    title="Tahrirlash"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    onClick={() => handleDelete(region.id, region.name)}
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
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Regionni tahrirlash</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nomi *</Label>
                            <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Yetkazib berish narxi (so&apos;m) *</Label>
                            <Input
                                type="number"
                                value={editForm.deliveryPrice}
                                onChange={(e) => setEditForm({ ...editForm, deliveryPrice: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Minimal bepul yetkazib berish (so&apos;m) - ixtiyoriy</Label>
                            <Input
                                type="number"
                                placeholder="Masalan: 50000"
                                value={editForm.minFreeDelivery}
                                onChange={(e) => setEditForm({ ...editForm, minFreeDelivery: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Agar bo&apos;sh qoldirilsa, bepul yetkazib berish bo&apos;lmaydi</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActiveEdit"
                                checked={editForm.isActive}
                                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                className="w-4 h-4 rounded border-input bg-input"
                            />
                            <Label htmlFor="isActiveEdit" className="cursor-pointer">Faol</Label>
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
