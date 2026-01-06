import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const orders = [
    { id: "#1234", customer: "Alisher Karimov", product: "iPhone 15 Pro", amount: "12.5M", status: "Yetkazildi", date: "2026-01-05" },
    { id: "#1235", customer: "Nilufar Rahimova", product: "MacBook Air M3", amount: "18.9M", status: "Jarayonda", date: "2026-01-05" },
    { id: "#1236", customer: "Sardor Toshev", product: "AirPods Pro 2", amount: "2.8M", status: "Kutilmoqda", date: "2026-01-04" },
    { id: "#1237", customer: "Madina Azimova", product: "iPad Pro 12.9", amount: "15.2M", status: "Yetkazildi", date: "2026-01-04" },
    { id: "#1238", customer: "Jasur Xolmatov", product: "Apple Watch Ultra", amount: "9.5M", status: "Jarayonda", date: "2026-01-03" },
    { id: "#1239", customer: "Dilshod Nazarov", product: "Samsung Galaxy S24", amount: "11.2M", status: "Yetkazildi", date: "2026-01-03" },
    { id: "#1240", customer: "Zarina Umarova", product: "Sony WH-1000XM5", amount: "3.5M", status: "Kutilmoqda", date: "2026-01-02" },
    { id: "#1241", customer: "Bobur Saidov", product: "Dell XPS 15", amount: "22.8M", status: "Jarayonda", date: "2026-01-02" },
]

export default function OrdersPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                    Buyurtmalar
                </h1>
                <p className="text-zinc-500 mt-1">
                    Barcha buyurtmalarni boshqaring
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Buyurtmalar ro'yxati</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-zinc-500">
                                    <th className="pb-3 font-medium">ID</th>
                                    <th className="pb-3 font-medium">Mijoz</th>
                                    <th className="pb-3 font-medium">Mahsulot</th>
                                    <th className="pb-3 font-medium">Summa</th>
                                    <th className="pb-3 font-medium">Sana</th>
                                    <th className="pb-3 font-medium">Holat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b last:border-0 hover:bg-zinc-50">
                                        <td className="py-4 font-medium">{order.id}</td>
                                        <td className="py-4">{order.customer}</td>
                                        <td className="py-4">{order.product}</td>
                                        <td className="py-4">{order.amount}</td>
                                        <td className="py-4 text-zinc-500">{order.date}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "Yetkazildi"
                                                    ? "bg-green-100 text-green-700"
                                                    : order.status === "Jarayonda"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
