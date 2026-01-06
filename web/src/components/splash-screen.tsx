"use client"

import { useState, useEffect } from "react"
import { Shield } from "lucide-react"

interface SplashScreenProps {
    onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setTimeout(onComplete, 300)
                    return 100
                }
                return prev + 2
            })
        }, 30)

        return () => clearInterval(interval)
    }, [onComplete])

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center z-50">
            {/* Animated Logo */}
            <div className="relative mb-8">
                {/* Outer ring animation */}
                <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-blue-500/20 animate-ping" />
                <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-blue-500/30 animate-pulse" />

                {/* Shield icon */}
                <div className="w-32 h-32 bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 rounded-full flex items-center justify-center animate-pulse">
                    <Shield className="w-16 h-16 text-blue-400" />
                </div>
            </div>

            {/* App Name */}
            <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
                Navqurt
            </h1>
            <p className="text-slate-400 mb-8 animate-fade-in">
                Admin Panel
            </p>

            {/* Progress Bar */}
            <div className="w-64 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Loading Text */}
            <p className="text-slate-500 text-sm mt-4">
                Yuklanmoqda... {progress}%
            </p>
        </div>
    )
}
