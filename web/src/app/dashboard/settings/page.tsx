"use client"

import { useState, useEffect } from "react"
import { User, Lock, Bell, Palette, Check, AlertCircle } from "lucide-react"
import { useStore } from "@/lib/store"
import { apiGet, apiPatch, handleApiError } from "@/lib/api-client"
import { STORAGE_KEYS, DEFAULT_NOTIFICATIONS } from "@/lib/constants"

type AdminProfile = {
    id: string
    email: string
    name: string | null
    createdAt: string
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile")
    const { theme, toggleTheme } = useStore()

    // Profile state
    const [profileForm, setProfileForm] = useState({ name: "", email: "" })
    const [profileLoading, setProfileLoading] = useState(true)
    const [profileSaving, setProfileSaving] = useState(false)

    // Security state
    const [securityForm, setSecurityForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
    const [securitySaving, setSecuritySaving] = useState(false)

    // Messages
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    // Notifications state (localStorage based)
    const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)

    useEffect(() => {
        loadProfile()
        // Load notifications from localStorage
        try {
            const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
            if (savedNotifications) {
                setNotifications(JSON.parse(savedNotifications))
            }
        } catch {
            // Ignore localStorage parse errors
        }
    }, [])

    const loadProfile = async () => {
        try {
            const data = await apiGet<AdminProfile>("/api/admin/settings")
            setProfileForm({ name: data.name || "", email: data.email })
        } catch (error) {
            const errorMessage = handleApiError(error)
            setErrorMessage(errorMessage)
        } finally {
            setProfileLoading(false)
        }
    }

    const handleProfileSave = async () => {
        setProfileSaving(true)
        setSuccessMessage("")
        setErrorMessage("")
        try {
            await apiPatch<{ message?: string }>("/api/admin/settings", {
                name: profileForm.name,
                email: profileForm.email
            })
            setSuccessMessage("Profil muvaffaqiyatli saqlandi")
            await loadProfile()
        } catch (error) {
            const errorMessage = handleApiError(error)
            setErrorMessage(errorMessage)
        } finally {
            setProfileSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        if (securityForm.newPassword !== securityForm.confirmPassword) {
            setErrorMessage("Yangi parollar mos kelmayapti")
            return
        }
        if (securityForm.newPassword.length < 6) {
            setErrorMessage("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
            return
        }

        setSecuritySaving(true)
        setSuccessMessage("")
        setErrorMessage("")
        try {
            await apiPatch<{ message?: string }>("/api/admin/settings", {
                currentPassword: securityForm.currentPassword,
                newPassword: securityForm.newPassword
            })
            setSuccessMessage("Parol muvaffaqiyatli yangilandi")
            setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (error) {
            const errorMessage = handleApiError(error)
            setErrorMessage(errorMessage)
        } finally {
            setSecuritySaving(false)
        }
    }

    const toggleNotification = (key: keyof typeof notifications) => {
        const updated = { ...notifications, [key]: !notifications[key] }
        setNotifications(updated)
        try {
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated))
        } catch {
            // Ignore localStorage errors (e.g., quota exceeded)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Sozlamalar</h1>
                <p className="text-slate-400">Tizim sozlamalarini boshqaring</p>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-400">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-rose-500/20 border border-rose-500/50 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-400" />
                    <span className="text-rose-400">{errorMessage}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-4">
                {[
                    { id: "profile", label: "Profil", icon: User },
                    { id: "security", label: "Xavfsizlik", icon: Lock },
                    { id: "notifications", label: "Bildirishnomalar", icon: Bell },
                    { id: "appearance", label: "Ko'rinish", icon: Palette },
                ].map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id)
                                setSuccessMessage("")
                                setErrorMessage("")
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === tab.id
                                ? "bg-slate-800 text-white"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                {activeTab === "profile" && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white">Profil ma&apos;lumotlari</h3>
                        {profileLoading ? (
                            <p className="text-slate-400">Yuklanmoqda...</p>
                        ) : (
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Ism</label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={handleProfileSave}
                                    disabled={profileSaving}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl w-fit transition-colors"
                                >
                                    {profileSaving ? "Saqlanmoqda..." : "Saqlash"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "security" && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white">Parolni o&apos;zgartirish</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Joriy parol</label>
                                <input
                                    type="password"
                                    value={securityForm.currentPassword}
                                    onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Yangi parol</label>
                                <input
                                    type="password"
                                    value={securityForm.newPassword}
                                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Yangi parolni tasdiqlang</label>
                                <input
                                    type="password"
                                    value={securityForm.confirmPassword}
                                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={handlePasswordChange}
                                disabled={securitySaving}
                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl w-fit transition-colors"
                            >
                                {securitySaving ? "Yangilanmoqda..." : "Yangilash"}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Bildirishnoma sozlamalari</h3>
                        {[
                            { key: "newOrders" as const, label: "Yangi buyurtmalar" },
                            { key: "deliveredOrders" as const, label: "Yetkazilgan buyurtmalar" },
                            { key: "newCustomers" as const, label: "Yangi mijozlar" },
                            { key: "systemUpdates" as const, label: "Tizim yangilanishlari" },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                                <span className="text-white">{item.label}</span>
                                <button
                                    onClick={() => toggleNotification(item.key)}
                                    className={`w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? "bg-blue-500" : "bg-slate-700"}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifications[item.key] ? "translate-x-6" : "translate-x-0.5"}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "appearance" && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Ko&apos;rinish sozlamalari</h3>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-white">Qorong&apos;u rejim</span>
                            <button
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-blue-500" : "bg-slate-700"}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-0.5"}`} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
