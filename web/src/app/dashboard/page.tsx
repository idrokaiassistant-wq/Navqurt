import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Users, DollarSign, TrendingUp } from "lucide-react"

const stats = [
    {
        title: "Jami buyurtmalar",
        value: "1,234",
        change: "+12%",
        icon: ShoppingCart,
        color: "text-blue-600 bg-blue-100",
    },
    {
        title: "Mijozlar",
        value: "856",
        change: "+8%",
        icon: Users,
        color: "text-green-600 bg-green-100",
    },
    {
        title: "Daromad",
        value: "45.2M so'm",
        change: "+23%",
        icon: DollarSign,
        color: "text-yellow-600 bg-yellow-100",
    },
    {
        title: "O'sish",
        value: "+18%",
        change: "Bu oy",
        icon: TrendingUp,
        color: "text-purple-600 bg-purple-100",
    },
]

const recentOrders = [
    { id: "#1234", customer: "Alisher Karimov", product: "iPhone 15 Pro", amount: "12.5M", status: "Yetkazildi" },
    { id: "#1235", customer: "Nilufar Rahimova", product: "MacBook Air M3", amount: "18.9M", status: "Jarayonda" },
    { id: "#1236", customer: "Sardor Toshev", product: "AirPods Pro 2", amount: "2.8M", status: "Kutilmoqda" },
    { id: "#1237", customer: "Madina Azimova", product: "iPad Pro 12.9", amount: "15.2M", status: "Yetkazildi" },
    { id: "#1238", customer: "Jasur Xolmatov", product: "Apple Watch Ultra", amount: "9.5M", status: "Jarayonda" },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                    Boshqaruv paneli
                </h1>
                <p className="text-zinc-500 mt-1">
                    Xush kelibsiz! Bugungi statistika va so'nggi buyurtmalar.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-500">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.color}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-green-600 mt-1">
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>So'nggi buyurtmalar</CardTitle>
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
                                    <th className="pb-3 font-medium">Holat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b last:border-0">
                                        <td className="py-4 font-medium">{order.id}</td>
                                        <td className="py-4">{order.customer}</td>
                                        <td className="py-4">{order.product}</td>
                                        <td className="py-4">{order.amount}</td>
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
