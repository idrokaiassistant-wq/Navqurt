"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield, User, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SplashScreen } from "@/components/splash-screen"

export default function LoginPage() {
    const router = useRouter()
    const [showSplash, setShowSplash] = useState(true)
    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const result = await signIn("credentials", {
                email: login.includes("@") ? login : `${login}@navqurt.uz`,
                password,
                redirect: false
            })

            if (result?.error) {
                setError(result.error)
            } else {
                router.push("/dashboard")
                router.refresh()
            }
        } catch {
            setError("Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    // Show splash screen first
    if (showSplash) {
        return <SplashScreen onComplete={() => setShowSplash(false)} />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col animate-fade-in">
            {/* Back Button */}
            <div className="p-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Orqaga</span>
                </Link>
            </div>

            {/* Login Card */}
            <div className="flex-1 flex items-center justify-center px-4 pb-20">
                <div className="w-full max-w-md animate-slide-up">
                    {/* Glass Card */}
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                        {/* Shield Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center border border-slate-600/30">
                                <Shield className="w-10 h-10 text-slate-300" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
                            <p className="text-slate-400">Boshqaruv paneliga kirish</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error Message */}
                            {error && (
                                <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl animate-shake">
                                    {error}
                                </div>
                            )}

                            {/* Login Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Login
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={login}
                                        onChange={(e) => setLogin(e.target.value)}
                                        placeholder="admin"
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Parol
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-600/80 hover:bg-slate-600 border border-slate-500/30 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Kirish...
                                    </span>
                                ) : (
                                    "Kirish"
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-slate-500 text-sm mt-6">
                        © 2026 Navqurt. Barcha huquqlar himoyalangan.
                    </p>
                </div>
            </div>
        </div>
    )
}