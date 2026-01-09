"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Search, Trash2, Edit2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiGet, apiPost, apiPatch, apiDelete, handleApiError } from "@/lib/api-client"

type ApiCategory = {
    id: string
    name: string
    color: string | null
    createdAt: string
    _count?: {
        products: number
    }
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<ApiCategory[]>([])
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

    const [query, setQuery] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newCategory, setNewCategory] = useState({ name: "", color: "" })

    // Edit state
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editCategory, setEditCategory] = useState<ApiCategory | null>(null)
    const [editForm, setEditForm] = useState({ name: "", color: "" })

    const load = async (page: number = 1) => {
        setLoading(true)
        setError("")
        try {
            const data = await apiGet<{ categories: ApiCategory[], pagination: typeof pagination }>(`/api/admin/categories?page=${page}&limit=50`)
            setCategories(data.categories ?? [])
            if (data.pagination) {
                setPagination(data.pagination)
            }
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

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return categories
        return categories.filter((c) => c.name.toLowerCase().includes(q))
    }, [categories, query])

    const handleAdd = async () => {
        try {
            const payload = {
                name: newCategory.name.trim(),
                color: newCategory.color.trim() || null,
            }
            await apiPost<{ category: ApiCategory }>("/api/admin/categories", payload)
            setNewCategory({ name: "", color: "" })
            setIsAddOpen(false)
            await load(pagination.page)
        } catch (e) {
            const errorMessage = handleApiError(e)
            setError(errorMessage)
        }
    }

    const openEditModal = (cat: ApiCategory) => {
        setEditCategory(cat)
        setEditForm({ name: cat.name, color: cat.color ?? "" })
        setIsEditOpen(true)
    }

    const handleEdit = async () => {
        if (!editCategory) return
        try {
            const payload = {
                name: editForm.name.trim(),
                color: editForm.color.trim() || null,
            }
            await apiPatch<{ category: ApiCategory }>(`/api/admin/categories/${editCategory.id}`, payload)
            setEditCategory(null)
            setEditForm({ name: "", color: "" })
            setIsEditOpen(false)
            await load(pagination.page)
        } catch (e) {
            const errorMessage = handleApiError(e)
            setError(errorMessage)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Kategoriyalar</h1>
                    <p className="text-muted-foreground">Mahsulot kategoriyalarini boshqaring</p>
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
                                Yangi kategoriya
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Yangi kategoriya</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Nomi</Label>
                                    <Input
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Rang class (ixtiyoriy)</Label>
                                    <Input
                                        placeholder="masalan: bg-blue-500"
                                        value={newCategory.color}
                                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {error && (
                    <div className="bg-card border border-rose-500/30 rounded-2xl p-5 text-rose-400 col-span-full">
                        {error}
                    </div>
                )}
                {loading && !error && (
                    <div className="bg-card border border-border rounded-2xl p-5 text-muted-foreground col-span-full">
                        Yuklanmoqda...
                    </div>
                )}
                {!loading && !error && filtered.length === 0 && (
                    <div className="bg-card border border-border rounded-2xl p-5 text-muted-foreground col-span-full">
                        Kategoriya topilmadi
                    </div>
                )}
                {filtered.map((cat) => (
                    <div key={cat.id} className="bg-card border border-border rounded-2xl p-5 hover:border-input transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${cat.color ?? "bg-muted"} rounded-xl flex items-center justify-center`}>
                                    <span className="text-foreground text-xl">📁</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">{cat.name}</h3>
                                    <p className="text-muted-foreground text-sm">
                                        {cat._count?.products ?? 0} ta mahsulot
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                    onClick={() => openEditModal(cat)}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    onClick={async () => {
                                        if (!confirm(`"${cat.name}" kategoriyasini o'chirmoqchimisiz?`)) return
                                        try {
                                            await apiDelete<{ message: string }>(`/api/admin/categories/${cat.id}`)
                                            await load(pagination.page)
                                        } catch (e) {
                                            const errorMessage = handleApiError(e)
                                            setError(errorMessage)
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <span className="text-muted-foreground">Yaratilgan</span>
                            <span className="text-foreground font-semibold">{new Date(cat.createdAt).toLocaleDateString("uz-UZ")}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {!loading && !error && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-2xl">
                    <div className="text-sm text-muted-foreground">
                        {pagination.total} ta kategoriyadan {(pagination.page - 1) * pagination.limit + 1}-
                        {Math.min(pagination.page * pagination.limit, pagination.total)} tasi ko'rsatilmoqda
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => load(pagination.page - 1)}
                            disabled={!pagination.hasPreviousPage}
                        >
                            Oldingi
                        </Button>
                        <span className="text-sm text-muted-foreground px-3">
                            {pagination.page} / {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => load(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                        >
                            Keyingi
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kategoriyani tahrirlash</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nomi</Label>
                            <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Rang class (ixtiyoriy)</Label>
                            <Input
                                placeholder="masalan: bg-blue-500"
                                value={editForm.color}
                                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
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
