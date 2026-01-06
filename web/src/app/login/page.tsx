"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
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
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false
            })

            if (result?.error) {
                setError(result.error)
            } else {
                router.push("/dashboard")
                router.refresh()
            }
        } catch (err) {
            setError("Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-zinc-950 px-4">
            <Card className="w-full max-w-sm shadow-lg">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Admin Kirish</CardTitle>
                        <CardDescription className="text-center">
                            "Navqurt" tizimiga kirish uchun ma'lumotlaringizni kiriting.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@navqurt.uz"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Parol</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full bg-zinc-900 hover:bg-zinc-800"
                            disabled={loading}
                        >
                            {loading ? "Kirish..." : "Tizimga kirish"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}