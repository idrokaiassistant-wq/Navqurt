"use client"

import { useState, useEffect } from "react"
import { timeAgo, formatPrice } from "@/lib/date-utils"
import { Package, TrendingDown, TrendingUp, DollarSign, AlertTriangle, Plus, Edit2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StockItem {
    id: string
    name: string
    current: number
    unit: string
    minRequired: number
    price: number
    updatedAt: string
}

interface StockMovement {
    id: string
    type: string
    itemId: string
    amount: number
    price: number | null
    date: string
    note?: string | null
    stockItem: StockItem
}

export default function WarehousePage() {
    const [stockItems, setStockItems] = useState<StockItem[]>([])
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddItemOpen, setIsAddItemOpen] = useState(false)
    const [isAddMovementOpen, setIsAddMovementOpen] = useState(false)
    const [isEditItemOpen, setIsEditItemOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
    const [movementType, setMovementType] = useState<'in' | 'out'>('in')
    const [newItem, setNewItem] = useState({ name: '', current: 0, unit: 'kg', minRequired: 0, price: 0 })
    const [newMovement, setNewMovement] = useState({ itemId: '', amount: 0, price: 0, note: '' })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [itemsRes, movementsRes] = await Promise.all([
                fetch("/api/admin/warehouse/items", { cache: "no-store" }),
                fetch("/api/admin/warehouse/movements", { cache: "no-store" })
            ])
            if (itemsRes.ok) {
                const data = await itemsRes.json()
                setStockItems(Array.isArray(data) ? data : [])
            }
            if (movementsRes.ok) {
                const data = await movementsRes.json()
                setMovements(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error("Failed to fetch warehouse data:", error)
        } finally {
            setLoading(false)
        }
    }

    const addStockItem = async (item: Omit<StockItem, 'id' | 'updatedAt'>) => {
        try {
            const res = await fetch("/api/admin/warehouse/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item)
            })
            if (res.ok) {
                await fetchData()
            }
        } catch (error) {
            console.error("Failed to add stock item:", error)
        }
    }

    const updateStockItem = async (id: string, updates: Partial<StockItem>) => {
        try {
            const res = await fetch(`/api/admin/warehouse/items/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            })
            if (res.ok) {
                await fetchData()
            }
        } catch (error) {
            console.error("Failed to update stock item:", error)
        }
    }

    const deleteStockItem = async (id: string) => {
        if (!confirm("Mahsulotni o&apos;chirmoqchimisiz?")) return
        try {
            const res = await fetch(`/api/admin/warehouse/items/${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                await fetchData()
            }
        } catch (error) {
            console.error("Failed to delete stock item:", error)
        }
    }

    const addMovement = async (movement: { type: string; itemId: string; amount: number; price: number | null; note: string }) => {
        try {
            const res = await fetch("/api/admin/warehouse/movements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(movement)
            })
            if (res.ok) {
                await fetchData()
            }
        } catch (error) {
            console.error("Failed to add movement:", error)
        }
    }

    const lowStockItems = stockItems.filter(item => item.current <= item.minRequired)
    const totalStock = stockItems.reduce((acc, item) => item.unit === 'kg' ? acc + item.current : acc, 0)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthMovements = movements.filter(m => new Date(m.date) >= startOfMonth)
    const thisMonthIn = thisMonthMovements.filter(m => m.type === 'IN').reduce((acc, m) => m.stockItem?.unit === 'kg' ? acc + m.amount : acc, 0)
    const thisMonthOut = thisMonthMovements.filter(m => m.type === 'OUT').reduce((acc, m) => m.stockItem?.unit === 'kg' ? acc + m.amount : acc, 0)
    const totalExpenses = thisMonthMovements.filter(m => m.type === 'IN' && m.price).reduce((acc, m) => acc + (m.price || 0), 0)

    const handleAddItem = () => {
        if (newItem.name) {
            addStockItem(newItem)
            setNewItem({ name: '', current: 0, unit: 'kg', minRequired: 0, price: 0 })
            setIsAddItemOpen(false)
        }
    }

    const handleEditItem = () => {
        if (selectedItem) {
            updateStockItem(selectedItem.id, selectedItem)
            setIsEditItemOpen(false)
            setSelectedItem(null)
        }
    }

    const handleAddMovement = () => {
        if (newMovement.itemId && newMovement.amount > 0) {
            addMovement({
                type: movementType === 'in' ? 'IN' : 'OUT',
                itemId: newMovement.itemId,
                amount: newMovement.amount,
                price: movementType === 'in' ? newMovement.price : null,
                note: newMovement.note
            })
            setNewMovement({ itemId: '', amount: 0, price: 0, note: '' })
            setIsAddMovementOpen(false)
        }
    }

    const openEditModal = (item: StockItem) => {
        setSelectedItem({ ...item })
        setIsEditItemOpen(true)
    }

    if (loading) {
        return <div className="text-white">Yuklanmoqda...</div>
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">Omborxona</h1>
                    <p className="text-slate-400 text-sm md:text-base">Mahsulot qoldiqlari va xarajatlarni boshqaring</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {/* Add Stock Item */}
                    <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-500 hover:bg-blue-600 text-sm px-3 py-2">
                                <Plus className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Mahsulot qo&apos;shish</span>
                                <span className="sm:hidden">Qo&apos;shish</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-[95vw] sm:max-w-md mx-auto">
                            <DialogHeader>
                                <DialogTitle>Yangi mahsulot qo&apos;shish</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Nomi</Label>
                                    <Input
                                        className="bg-slate-800 border-slate-700"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Miqdori</Label>
                                        <Input
                                            type="number"
                                            className="bg-slate-800 border-slate-700"
                                            value={newItem.current}
                                            onChange={(e) => setNewItem({ ...newItem, current: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Birlik</Label>
                                        <select
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
                                            value={newItem.unit}
                                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="dona">dona</option>
                                            <option value="rulon">rulon</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Minimum</Label>
                                        <Input
                                            type="number"
                                            className="bg-slate-800 border-slate-700"
                                            value={newItem.minRequired}
                                            onChange={(e) => setNewItem({ ...newItem, minRequired: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Narx (1 birlik)</Label>
                                        <Input
                                            type="number"
                                            className="bg-slate-800 border-slate-700"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleAddItem} className="w-full bg-blue-500 hover:bg-blue-600">
                                    Qo&apos;shish
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Add Movement */}
                    <Dialog open={isAddMovementOpen} onOpenChange={setIsAddMovementOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800 text-sm px-3 py-2">
                                <TrendingUp className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Kirim/Chiqim</span>
                                <span className="sm:hidden">Kirim</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-[95vw] sm:max-w-md mx-auto">
                            <DialogHeader>
                                <DialogTitle>Kirim yoki Chiqim qo&apos;shish</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setMovementType('in')}
                                        className={movementType === 'in' ? 'bg-emerald-500' : 'bg-slate-700'}
                                    >
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Kirim
                                    </Button>
                                    <Button
                                        onClick={() => setMovementType('out')}
                                        className={movementType === 'out' ? 'bg-rose-500' : 'bg-slate-700'}
                                    >
                                        <TrendingDown className="h-4 w-4 mr-2" />
                                        Chiqim
                                    </Button>
                                </div>
                                <div>
                                    <Label>Mahsulot</Label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
                                        value={newMovement.itemId}
                                        onChange={(e) => setNewMovement({ ...newMovement, itemId: e.target.value })}
                                    >
                                        <option value="">Tanlang...</option>
                                        {stockItems.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} ({item.current} {item.unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>Miqdor</Label>
                                    <Input
                                        type="number"
                                        className="bg-slate-800 border-slate-700"
                                        value={newMovement.amount}
                                        onChange={(e) => setNewMovement({ ...newMovement, amount: Number(e.target.value) })}
                                    />
                                </div>
                                {movementType === 'in' && (
                                    <div>
                                        <Label>Narx (jami)</Label>
                                        <Input
                                            type="number"
                                            className="bg-slate-800 border-slate-700"
                                            value={newMovement.price}
                                            onChange={(e) => setNewMovement({ ...newMovement, price: Number(e.target.value) })}
                                        />
                                    </div>
                                )}
                                <div>
                                    <Label>Izoh</Label>
                                    <Input
                                        className="bg-slate-800 border-slate-700"
                                        value={newMovement.note}
                                        onChange={(e) => setNewMovement({ ...newMovement, note: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleAddMovement} className={`w-full ${movementType === 'in' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                                    {movementType === 'in' ? 'Kirim qo&apos;shish' : 'Chiqim qo&apos;shish'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-blue-500 p-3 rounded-xl">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{totalStock} kg</div>
                    <div className="text-slate-400 text-sm">Jami qurt qoldig&apos;i</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-emerald-500 p-3 rounded-xl">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{thisMonthIn} kg</div>
                    <div className="text-slate-400 text-sm">Bu oy kirim</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-amber-500 p-3 rounded-xl">
                            <TrendingDown className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{thisMonthOut} kg</div>
                    <div className="text-slate-400 text-sm">Bu oy chiqim</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-rose-500 p-3 rounded-xl">
                            <DollarSign className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatPrice(totalExpenses)}</div>
                    <div className="text-slate-400 text-sm">Bu oy xarajat</div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    <span className="text-amber-400">{lowStockItems.length} ta mahsulot kam qolgan! Yaqin orada olib kelish kerak.</span>
                </div>
            )}

            {/* Current Stock */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-xl font-bold text-white mb-4">Joriy qoldiq</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="text-left text-slate-400 font-medium px-4 py-3">Mahsulot</th>
                                <th className="text-left text-slate-400 font-medium px-4 py-3">Qoldiq</th>
                                <th className="text-left text-slate-400 font-medium px-4 py-3">Minimum</th>
                                <th className="text-left text-slate-400 font-medium px-4 py-3">Narx</th>
                                <th className="text-left text-slate-400 font-medium px-4 py-3">Yangilangan</th>
                                <th className="text-left text-slate-400 font-medium px-4 py-3">Holat</th>
                                <th className="text-right text-slate-400 font-medium px-4 py-3">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockItems.map((item) => (
                                <tr key={item.id} className="border-b border-slate-800 last:border-0">
                                    <td className="px-4 py-3">
                                        <span className="text-white font-medium">{item.name}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-white">{item.current} {item.unit}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-slate-400">{item.minRequired} {item.unit}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-white">{formatPrice(item.price)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-slate-400 text-sm">{timeAgo(item.updatedAt)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs ${item.current > item.minRequired
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-amber-500/20 text-amber-400"
                                            }`}>
                                            {item.current > item.minRequired ? "Yetarli" : "Kam qolgan"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteStockItem(item.id)}
                                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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

            {/* Recent Movements */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-xl font-bold text-white mb-4">So&apos;nggi kirim-chiqim</h2>
                {movements.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">Hali kirim-chiqim yo&apos;q</p>
                ) : (
                    <div className="space-y-3">
                        {movements.slice(0, 10).map((movement) => (
                            <div key={movement.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${movement.type === "IN" ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                                        {movement.type === "IN" ? (
                                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-rose-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">
                                            {movement.type === "IN" ? "Kirim" : "Chiqim"}: {movement.stockItem?.name || "Noma'lum"}
                                        </div>
                                        <div className="text-slate-400 text-sm">{timeAgo(movement.date)}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-medium ${movement.type === "IN" ? "text-emerald-400" : "text-rose-400"}`}>
                                        {movement.type === "IN" ? "+" : "-"}{movement.amount} {movement.stockItem?.unit || ""}
                                    </div>
                                    {movement.price && (
                                        <div className="text-slate-400 text-sm">{formatPrice(movement.price)}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Item Modal */}
            <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-[95vw] sm:max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle>Mahsulotni tahrirlash</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4">
                            <div>
                                <Label>Nomi</Label>
                                <Input
                                    className="bg-slate-800 border-slate-700"
                                    value={selectedItem.name}
                                    onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Miqdori</Label>
                                    <Input
                                        type="number"
                                        className="bg-slate-800 border-slate-700"
                                        value={selectedItem.current}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, current: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>Minimum</Label>
                                    <Input
                                        type="number"
                                        className="bg-slate-800 border-slate-700"
                                        value={selectedItem.minRequired}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, minRequired: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Narx (1 birlik)</Label>
                                <Input
                                    type="number"
                                    className="bg-slate-800 border-slate-700"
                                    value={selectedItem.price}
                                    onChange={(e) => setSelectedItem({ ...selectedItem, price: Number(e.target.value) })}
                                />
                            </div>
                            <Button onClick={handleEditItem} className="w-full bg-blue-500 hover:bg-blue-600">
                                Saqlash
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
