import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const customers = [
    { id: 1, name: "Alisher Karimov", email: "alisher@mail.uz", orders: 12, spent: "45.2M" },
    { id: 2, name: "Nilufar Rahimova", email: "nilufar@mail.uz", orders: 8, spent: "32.8M" },
    { id: 3, name: "Sardor Toshev", email: "sardor@mail.uz", orders: 15, spent: "56.1M" },
    { id: 4, name: "Madina Azimova", email: "madina@mail.uz", orders: 6, spent: "28.5M" },
    { id: 5, name: "Jasur Xolmatov", email: "jasur@mail.uz", orders: 9, spent: "38.9M" },
    { id: 6, name: "Dilshod Nazarov", email: "dilshod@mail.uz", orders: 11, spent: "42.3M" },
    { id: 7, name: "Zarina Umarova", email: "zarina@mail.uz", orders: 4, spent: "18.7M" },
    { id: 8, name: "Bobur Saidov", email: "bobur@mail.uz", orders: 7, spent: "35.6M" },
]

export default function CustomersPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                    Mijozlar
                </h1>
                <p className="text-zinc-500 mt-1">
                    Barcha mijozlarni ko'ring va boshqaring
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Mijozlar ro'yxati</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-zinc-500">
                                    <th className="pb-3 font-medium">Mijoz</th>
                                    <th className="pb-3 font-medium">Email</th>
                                    <th className="pb-3 font-medium">Buyurtmalar</th>
                                    <th className="pb-3 font-medium">Jami xarid</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b last:border-0 hover:bg-zinc-50">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback className="bg-zinc-200 text-zinc-700">
                                                        {customer.name.split(" ").map(n => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-zinc-500">{customer.email}</td>
                                        <td className="py-4">{customer.orders} ta</td>
                                        <td className="py-4 font-medium">{customer.spent}</td>
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
