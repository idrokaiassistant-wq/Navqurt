import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'

export function timeAgo(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return formatDistanceToNow(d, { addSuffix: true, locale: uz })
}

export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function formatPrice(price: number): string {
    return price.toLocaleString('uz-UZ') + " so'm"
}
