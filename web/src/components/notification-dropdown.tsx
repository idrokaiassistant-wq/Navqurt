"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { apiGet, apiPatch } from "@/lib/api-client"
import { timeAgo } from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"

interface Notification {
    id: string
    title: string
    message: string
    type: 'order' | 'stock' | 'system'
    read: boolean
    createdAt: string
    link?: string
}

interface NotificationDropdownProps {
    className?: string
    buttonClassName?: string
    badgeClassName?: string
}

export function NotificationDropdown({
    className,
    buttonClassName,
    badgeClassName
}: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const { readNotificationIds, markNotificationAsRead } = useStore()

    // Filter notifications based on read status from store
    const filteredNotifications = notifications.map(n => ({
        ...n,
        read: readNotificationIds.includes(n.id) || n.read
    }))

    const unreadCount = filteredNotifications.filter(n => !n.read).length

    useEffect(() => {
        if (open) {
            fetchNotifications()
        }
    }, [open])

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchNotifications = async () => {
        try {
            const data = await apiGet<{ notifications: Notification[] }>("/api/admin/notifications")
            setNotifications(data.notifications || [])
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await apiPatch(`/api/admin/notifications/${id}/read`, {})
            markNotificationAsRead(id)
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await apiPatch("/api/admin/notifications/read-all", {})
            filteredNotifications.forEach(n => {
                if (!n.read) {
                    markNotificationAsRead(n.id)
                }
            })
        } catch (error) {
            console.error("Failed to mark all as read:", error)
        }
    }

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'order':
                return '📦'
            case 'stock':
                return '📊'
            case 'system':
                return '🔔'
            default:
                return '🔔'
        }
    }

    const getNotificationColor = (type: Notification['type']) => {
        switch (type) {
            case 'order':
                return 'text-blue-500'
            case 'stock':
                return 'text-amber-500'
            case 'system':
                return 'text-green-500'
            default:
                return 'text-gray-500'
        }
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "p-2 relative text-sidebar-foreground/70 cursor-pointer hover:text-sidebar-foreground transition-colors",
                        buttonClassName
                    )}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span
                            className={cn(
                                "absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center pointer-events-none font-medium",
                                badgeClassName
                            )}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className={cn(
                    "w-80 max-h-[400px] overflow-y-auto",
                    className
                )}
            >
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Xabarnomalar</span>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            Hammasini o&apos;qilgan deb belgilash
                        </button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Yuklanmoqda...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Xabarnomalar yo&apos;q
                    </div>
                ) : (
                    <div className="py-1">
                        {filteredNotifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                                    !notification.read && "bg-accent/50"
                                )}
                                onClick={() => {
                                    if (!notification.read) {
                                        markAsRead(notification.id)
                                    }
                                    if (notification.link) {
                                        window.location.href = notification.link
                                    }
                                    setOpen(false)
                                }}
                            >
                                <div className="flex items-start gap-2 w-full">
                                    <span className={cn(
                                        "text-lg mt-0.5",
                                        getNotificationColor(notification.type)
                                    )}>
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn(
                                                "text-sm font-medium truncate",
                                                !notification.read && "font-semibold"
                                            )}>
                                                {notification.title}
                                            </p>
                                            {!notification.read && (
                                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {timeAgo(notification.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
