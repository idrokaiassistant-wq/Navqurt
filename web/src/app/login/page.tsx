import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-zinc-950 px-4">
            <Card className="w-full max-w-sm shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Admin Kirish</CardTitle>
                    <CardDescription className="text-center">
                        "Navqurt" tizimiga kirish uchun ma'lumotlaringizni kiriting.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="admin@navqurt.uz" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Parol</Label>
                        <Input id="password" type="password" required />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full bg-zinc-900 hover:bg-zinc-800">Tizimga kirish</Button>
                </CardFooter>
            </Card>
        </div>
    )
}