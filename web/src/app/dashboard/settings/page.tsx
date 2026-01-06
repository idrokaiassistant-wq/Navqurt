import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                    Sozlamalar
                </h1>
                <p className="text-zinc-500 mt-1">
                    Tizim sozlamalarini boshqaring
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profil ma'lumotlari</CardTitle>
                        <CardDescription>
                            Admin hisobingiz haqidagi ma'lumotlar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Ism</Label>
                            <Input id="name" defaultValue="Admin Navqurt" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue="admin@navqurt.uz" />
                        </div>
                        <Button>Saqlash</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Parolni o'zgartirish</CardTitle>
                        <CardDescription>
                            Xavfsizlik uchun parolingizni yangilang
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="current">Joriy parol</Label>
                            <Input id="current" type="password" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new">Yangi parol</Label>
                            <Input id="new" type="password" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm">Yangi parolni tasdiqlang</Label>
                            <Input id="confirm" type="password" />
                        </div>
                        <Button>Parolni yangilash</Button>
                    </CardContent>
                </Card>

                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600">Xavfli zona</CardTitle>
                        <CardDescription>
                            Bu amallar qaytarib bo'lmaydi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive">Hisobni o'chirish</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
