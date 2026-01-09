"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Plus, Edit2, Trash2, Upload, X, Image as ImageIcon, PlusCircle, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { apiGet, apiPost, apiPatch, apiDelete, apiPostFormData, handleApiError } from "@/lib/api-client"
import { formatPrice } from "@/lib/date-utils"
import { logError } from "@/lib/logger"

interface Category {
    id: string
    name: string
    color: string | null
}

interface Variant {
    id: string
    type: string
    priceDelta: number
}

interface Product {
    id: string
    name: string
    description?: string
    image?: string // Cloudinary URL or external URL
    imagePublicId?: string // Cloudinary public_id for deletion
    price: number
    weight: number
    isActive: boolean
    createdAt: string
    categoryIds?: string[]
    categoryNames?: string[]
    variants?: Variant[]
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
    })
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        weight: "",
        categoryIds: [] as string[],
        image: "",
        imagePublicId: ""
    })
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchProducts = useCallback(async (page: number = 1) => {
        try {
            setLoading(true)
            const data = await apiGet<{ products: Product[], pagination: typeof pagination }>(`/api/admin/products?page=${page}&limit=50`)
            setProducts(data.products ?? [])
            if (data.pagination) {
                setPagination(data.pagination)
            }
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to fetch products:", errorMessage)
            alert(errorMessage)
        }
    }, [])

    const fetchCategories = useCallback(async () => {
        try {
            const data = await apiGet<{ categories: Category[] }>("/api/admin/categories")
            setCategories(data.categories ?? [])
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to fetch categories:", errorMessage)
        }
    }, [])

    useEffect(() => {
        fetchProducts(1)
        fetchCategories()
    }, [fetchProducts, fetchCategories])

    const handleImageUpload = async (file: File) => {
        setUploading(true)
        try {
            const formDataUpload = new FormData()
            formDataUpload.append("file", file)

            const data = await apiPostFormData<{ url: string; public_id: string }>(
                "/api/admin/upload",
                formDataUpload
            )

            setFormData(prev => ({
                ...prev,
                image: data.url,
                imagePublicId: data.public_id
            }))
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to upload image:", errorMessage)
            alert(`Rasm yuklashda xatolik: ${errorMessage}`)
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveImage = async () => {
        if (formData.imagePublicId) {
            try {
                await apiPost<{ message: string }>("/api/admin/upload/delete", {
                    public_id: formData.imagePublicId
                })
            } catch (error) {
                logError("Failed to delete image:", handleApiError(error))
            }
        }
        setFormData(prev => ({ ...prev, image: "", imagePublicId: "" }))
    }

    const handleAdd = async () => {
        try {
            await apiPost<{ data: Product }>("/api/admin/products", formData)
            await fetchProducts(pagination.page)
            setIsAddOpen(false)
            setFormData({ name: "", description: "", price: "", weight: "", categoryIds: [], image: "", imagePublicId: "" })
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to add product:", errorMessage)
            alert(errorMessage)
        }
    }

    const handleEdit = async () => {
        if (!selectedProduct) return
        try {
            await apiPatch<{ data: Product }>(`/api/admin/products/${selectedProduct.id}`, formData)
            await fetchProducts(pagination.page)
            setIsEditOpen(false)
            setSelectedProduct(null)
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to edit product:", errorMessage)
            alert(errorMessage)
        }
    }

    const handleDelete = async (id: string) => {
        const product = products.find(p => p.id === id)
        if (!confirm("Mahsulotni o'chirmoqchimisiz?")) return

        // Delete image from Cloudinary if exists
        if (product?.imagePublicId) {
            try {
                await apiPost<{ message: string }>("/api/admin/upload/delete", {
                    public_id: product.imagePublicId
                })
            } catch (error) {
                logError("Failed to delete image:", handleApiError(error))
            }
        }

        try {
            await apiDelete<{ message: string }>(`/api/admin/products/${id}`)
            await fetchProducts(pagination.page)
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to delete product:", errorMessage)
            alert(errorMessage)
        }
    }

    const [productVariants, setProductVariants] = useState<Variant[]>([])
    const [newVariant, setNewVariant] = useState({ type: "", priceDelta: "" })
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null)
    const [editVariantPriceDelta, setEditVariantPriceDelta] = useState("")

    const TASTE_TYPES = ["ODDIY", "ACHCHIQ", "QALAMPIRLI", "RAYHONLI", "SHOKOLADLI"]
    const TASTE_TYPE_LABELS: Record<string, string> = {
        ODDIY: "Oddiy",
        ACHCHIQ: "Achchiq",
        QALAMPIRLI: "Qalampirli",
        RAYHONLI: "Rayhonli",
        SHOKOLADLI: "Shokoladli"
    }

    const fetchVariants = async (productId: string) => {
        try {
            const data = await apiGet<{ variants: Variant[] }>(`/api/admin/products/${productId}/variants`)
            setProductVariants(data.variants ?? [])
        } catch (error) {
            logError("Failed to fetch variants:", error)
        }
    }

    const openEditModal = async (product: Product) => {
        setSelectedProduct(product)
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            weight: product.weight.toString(),
            categoryIds: product.categoryIds || [],
            image: product.image || "",
            imagePublicId: product.imagePublicId || ""
        })
        setProductVariants(product.variants || [])
        setNewVariant({ type: "", priceDelta: "" })
        setEditingVariant(null)
        setIsEditOpen(true)
    }

    const handleAddVariant = async () => {
        if (!selectedProduct || !newVariant.type) return

        try {
            const payload = {
                type: newVariant.type,
                priceDelta: Number(newVariant.priceDelta) || 0
            }
            await apiPost<{ variant: Variant }>(`/api/admin/products/${selectedProduct.id}/variants`, payload)
            await fetchVariants(selectedProduct.id)
            setNewVariant({ type: "", priceDelta: "" })
        } catch (error) {
            const errorMessage = handleApiError(error)
            alert(errorMessage)
        }
    }

    const handleUpdateVariant = async (variantId: string) => {
        if (!selectedProduct) return

        try {
            const payload = {
                priceDelta: Number(editVariantPriceDelta) || 0
            }
            await apiPatch<{ variant: Variant }>(`/api/admin/variants/${variantId}`, payload)
            await fetchVariants(selectedProduct.id)
            setEditingVariant(null)
            setEditVariantPriceDelta("")
        } catch (error) {
            const errorMessage = handleApiError(error)
            alert(errorMessage)
        }
    }

    const handleDeleteVariant = async (variantId: string) => {
        if (!confirm("Bu variantni o'chirmoqchimisiz?")) return
        if (!selectedProduct) return

        try {
            await apiDelete<{ message: string }>(`/api/admin/variants/${variantId}`)
            await fetchVariants(selectedProduct.id)
        } catch (error) {
            const errorMessage = handleApiError(error)
            alert(errorMessage)
        }
    }

    const toggleCategory = (categoryId: string) => {
        setFormData(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId]
        }))
    }

    if (loading) {
        return <div className="text-foreground">Yuklanmoqda...</div>
    }

    // ProductForm JSX - inline render qilamiz fokus yo'qolmasligi uchun
    const productFormJSX = (
        <div className="space-y-4">
            {/* Image Upload */}
            <div>
                <Label>Mahsulot rasmi</Label>
                <div className="mt-2">
                    {formData.image ? (
                        <div className="relative w-full h-40 bg-secondary rounded-xl overflow-hidden">
                            <Image
                                src={formData.image}
                                alt="Product"
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 bg-secondary border-2 border-dashed border-input rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(file)
                                }}
                            />
                            {uploading ? (
                                <div className="text-muted-foreground">Yuklanmoqda...</div>
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-muted-foreground text-sm">Rasm yuklash uchun bosing</span>
                                    <span className="text-muted-foreground/70 text-xs mt-1">Ma&apos;lumotlar bazasida (DB) doimiy saqlanadi</span>
                                </>
                            )}
                        </label>
                    )}
                </div>
            </div>

            <div>
                <Label>Nomi</Label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    autoComplete="off"
                />
            </div>
            <div>
                <Label>Tavsif</Label>
                <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    autoComplete="off"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Narx (so&apos;m)</Label>
                    <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        autoComplete="off"
                    />
                </div>
                <div>
                    <Label>Og&apos;irlik (g)</Label>
                    <Input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        autoComplete="off"
                    />
                </div>
            </div>
            <div>
                <Label>Kategoriyalar</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${formData.categoryIds.includes(cat.id)
                                ? "bg-blue-500 text-white"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                    {categories.length === 0 && (
                        <span className="text-muted-foreground text-sm">Kategoriyalar mavjud emas</span>
                    )}
                </div>
            </div>

            {/* Variants Section */}
            <div className="border-t border-border pt-4">
                <Label>Variantlar</Label>
                <div className="mt-2 space-y-3">
                    {/* Existing Variants */}
                    {productVariants.map((variant) => (
                        <div key={variant.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-white font-medium">{TASTE_TYPE_LABELS[variant.type] || variant.type}</span>
                                <span className={`text-sm ${variant.priceDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {variant.priceDelta >= 0 ? '+' : ''}{formatPrice(variant.priceDelta)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {editingVariant?.id === variant.id ? (
                                    <>
                                        <Input
                                            type="number"
                                            className="w-32 text-sm"
                                            value={editVariantPriceDelta}
                                            onChange={(e) => setEditVariantPriceDelta(e.target.value)}
                                            placeholder="Narx farqi"
                                        />
                                        <button
                                            onClick={() => handleUpdateVariant(variant.id)}
                                            className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingVariant(null)
                                                setEditVariantPriceDelta("")
                                            }}
                                            className="p-1.5 bg-muted text-foreground rounded hover:bg-accent"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setEditingVariant(variant)
                                                setEditVariantPriceDelta(variant.priceDelta.toString())
                                            }}
                                            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded"
                                            title="Tahrirlash"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteVariant(variant.id)}
                                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded"
                                            title="O'chirish"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add New Variant */}
                    <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg border border-input border-dashed">
                        <select
                            className="flex-1 text-sm"
                            value={newVariant.type}
                            onChange={(e) => setNewVariant({ ...newVariant, type: e.target.value })}
                        >
                            <option value="">Variant tanlang...</option>
                            {TASTE_TYPES.filter(type => !productVariants.find(v => v.type === type)).map(type => (
                                <option key={type} value={type}>{TASTE_TYPE_LABELS[type]}</option>
                            ))}
                        </select>
                        <Input
                            type="number"
                            className="w-32 text-sm"
                            value={newVariant.priceDelta}
                            onChange={(e) => setNewVariant({ ...newVariant, priceDelta: e.target.value })}
                            placeholder="Narx farqi"
                        />
                        <button
                            onClick={handleAddVariant}
                            disabled={!newVariant.type}
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Qo'shish"
                        >
                            <PlusCircle className="h-4 w-4" />
                        </button>
                    </div>

                    {productVariants.length === 0 && TASTE_TYPES.length === 0 && (
                        <span className="text-muted-foreground text-sm">Variantlar mavjud emas</span>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">Mahsulotlar</h1>
                    <p className="text-muted-foreground text-sm md:text-base">Barcha mahsulotlarni boshqaring</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <button
                                onClick={() => setFormData({ name: "", description: "", price: "", weight: "", categoryIds: [], image: "", imagePublicId: "" })}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 text-sm rounded-xl flex items-center gap-2 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Qo&apos;shish</span>
                                <span className="sm:hidden">+</span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-md mx-auto">
                            <DialogHeader>
                                <DialogTitle>Yangi mahsulot</DialogTitle>
                            </DialogHeader>
                            {productFormJSX}
                            <Button onClick={handleAdd} className="w-full bg-blue-500 hover:bg-blue-600">
                                Qo&apos;shish
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                        {/* Product Image */}
                        <div className="relative w-full h-40 bg-secondary">
                            {product.image && product.image.trim() !== "" ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-foreground mb-2">
                                {product.price.toLocaleString()} <span className="text-sm text-muted-foreground">so&apos;m</span>
                            </p>
                            <div className="text-sm text-muted-foreground mb-3">
                                Og&apos;irlik: <span className="text-foreground">{product.weight}g</span>
                            </div>
                            {product.categoryNames && product.categoryNames.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {product.categoryNames.map((name, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-muted rounded-lg text-xs text-muted-foreground">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-2xl">
                    <div className="text-sm text-muted-foreground">
                        {pagination.total} ta mahsulotdan {(pagination.page - 1) * pagination.limit + 1}-
                        {Math.min(pagination.page * pagination.limit, pagination.total)} tasi ko&apos;rsatilmoqda
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => fetchProducts(pagination.page - 1)}
                            disabled={!pagination.hasPreviousPage}
                        >
                            Oldingi
                        </Button>
                        <span className="text-sm text-muted-foreground px-3">
                            {pagination.page} / {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => fetchProducts(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                        >
                            Keyingi
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle>Mahsulotni tahrirlash</DialogTitle>
                    </DialogHeader>
                    {productFormJSX}
                    <Button onClick={handleEdit} className="w-full bg-blue-500 hover:bg-blue-600">
                        Saqlash
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    )
}
