"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Product {
    id: string
    name: string
    description?: string
    price: number
    weight: number
    isActive: boolean
    createdAt: string
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [formData, setFormData] = useState({ name: "", description: "", price: "", weight: "" })

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/admin/products")
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (error) {
            console.error("Failed to fetch products:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                await fetchProducts()
                setIsAddOpen(false)
                setFormData({ name: "", description: "", price: "", weight: "" })
            }
        } catch (error) {
            console.error("Failed to add product:", error)
        }
    }

    const handleEdit = async () => {
        if (!selectedProduct) return
        try {
            const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                await fetchProducts()
                setIsEditOpen(false)
                setSelectedProduct(null)
            }
        } catch (error) {
            console.error("Failed to edit product:", error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Mahsulotni o&apos;chirmoqchimisiz?")) return
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
            if (res.ok) {
                await fetchProducts()
            }
        } catch (error) {
            console.error("Failed to delete product:", error)
        }
    }

    const openEditModal = (product: Product) => {
        setSelectedProduct(product)
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            weight: product.weight.toString()
        })
        setIsEditOpen(true)
    }

    if (loading) {
        return <div className="text-white">Yuklanmoqda...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Mahsulotlar</h1>
                    <p className="text-slate-400">Barcha mahsulotlarni boshqaring</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
                                <Plus className="h-5 w-5" />
                                Qo&apos;shish
                            </button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-white">
                            <DialogHeader>
                                <DialogTitle>Yangi mahsulot</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Nomi</Label>
                                    <Input
                                        className="bg-slate-800 border-slate-700"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Tavsif</Label>
                                    <Input
                                        className="bg-slate-800 border-slate-700"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Narx (so&apos;m)</Label>
                                        <Input
                                            type="number"
                                            className="bg-slate-800 border-slate-700"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Og&apos;irlik (g)</Label>
                                        <Input
                                            type="number"
                                            className="bg-slate-800 border-slate-700"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        />
                                    </div>
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
                {products.map((product) => (
                    <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">📦</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openEditModal(product)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                        <p className="text-2xl font-bold text-white mb-3">
                            {product.price.toLocaleString()} <span className="text-sm text-slate-400">so&apos;m</span>
                        </p>
                        <div className="text-sm text-slate-400">
                            Og&apos;irlik: <span className="text-white">{product.weight}g</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Mahsulotni tahrirlash</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nomi</Label>
                            <Input
                                className="bg-slate-800 border-slate-700"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Tavsif</Label>
                            <Input
                                className="bg-slate-800 border-slate-700"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Narx (so&apos;m)</Label>
                                <Input
                                    type="number"
                                    className="bg-slate-800 border-slate-700"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Og&apos;irlik (g)</Label>
                                <Input
                                    type="number"
                                    className="bg-slate-800 border-slate-700"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                />
                            </div>
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
