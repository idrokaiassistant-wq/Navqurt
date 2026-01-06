"use client"

import { useState } from "react"
import { User, Lock, Bell, Palette } from "lucide-react"

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile")

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Sozlamalar</h1>
                <p className="text-slate-400">Tizim sozlamalarini boshqaring</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-4">
                {[
                    { id: "profile", label: "Profil", icon: User },
                    { id: "security", label: "Xavfsizlik", icon: Lock },
                    { id: "notifications", label: "Bildirishnomalar", icon: Bell },
                    { id: "appearance", label: "Ko&apos;rinish", icon: Palette },
                ].map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
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
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Ism</label>
                                <input
                                    type="text"
                                    defaultValue="Admin Navqurt"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    defaultValue="admin@navqurt.uz"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl w-fit transition-colors">
                                Saqlash
                            </button>
                        </div>
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
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Yangi parol</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl w-fit transition-colors">
                                Yangilash
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Bildirishnoma sozlamalari</h3>
                        {[
                            { label: "Yangi buyurtmalar", enabled: true },
                            { label: "Yetkazilgan buyurtmalar", enabled: true },
                            { label: "Yangi mijozlar", enabled: false },
                            { label: "Tizim yangilanishlari", enabled: true },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                                <span className="text-white">{item.label}</span>
                                <button className={`w-12 h-6 rounded-full transition-colors ${item.enabled ? "bg-blue-500" : "bg-slate-700"
                                    }`}>
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${item.enabled ? "translate-x-6" : "translate-x-0.5"
                                        }`} />
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
                            <button className="w-12 h-6 rounded-full bg-blue-500">
                                <div className="w-5 h-5 bg-white rounded-full translate-x-6" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
