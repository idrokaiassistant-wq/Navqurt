/**
 * Telegram WebApp API Integration
 * Handles Telegram Mini App initialization and utilities
 */

// Telegram WebApp types
interface TelegramWebApp {
    initData: string
    initDataUnsafe: {
        user?: {
            id: number
            first_name?: string
            last_name?: string
            username?: string
            language_code?: string
            is_premium?: boolean
        }
        auth_date: number
        hash: string
    }
    version: string
    platform: string
    colorScheme: 'light' | 'dark'
    themeParams: {
        bg_color?: string
        text_color?: string
        hint_color?: string
        link_color?: string
        button_color?: string
        button_text_color?: string
    }
    isExpanded: boolean
    viewportHeight: number
    viewportStableHeight: number
    headerColor: string
    backgroundColor: string
    BackButton: {
        isVisible: boolean
        onClick: (callback: () => void) => void
        offClick: (callback: () => void) => void
        show: () => void
        hide: () => void
    }
    MainButton: {
        text: string
        color: string
        textColor: string
        isVisible: boolean
        isActive: boolean
        isProgressVisible: boolean
        setText: (text: string) => void
        onClick: (callback: () => void) => void
        offClick: (callback: () => void) => void
        show: () => void
        hide: () => void
        enable: () => void
        disable: () => void
        showProgress: (leaveActive?: boolean) => void
        hideProgress: () => void
        setParams: (params: {
            text?: string
            color?: string
            text_color?: string
            is_active?: boolean
            is_visible?: boolean
        }) => void
    }
    HapticFeedback: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
        notificationOccurred: (type: 'error' | 'success' | 'warning') => void
        selectionChanged: () => void
    }
    CloudStorage: {
        setItem: (key: string, value: string, callback?: (error: Error | null, success: boolean) => void) => void
        getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void
        getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => void
        removeItem: (key: string, callback?: (error: Error | null, success: boolean) => void) => void
        removeItems: (keys: string[], callback?: (error: Error | null, success: boolean) => void) => void
        getKeys: (callback: (error: Error | null, keys: string[]) => void) => void
    }
    ready: () => void
    expand: () => void
    close: () => void
    enableClosingConfirmation: () => void
    disableClosingConfirmation: () => void
    onEvent: (eventType: string, eventHandler: () => void) => void
    offEvent: (eventType: string, eventHandler: () => void) => void
    sendData: (data: string) => void
    openLink: (url: string, options?: { try_instant_view?: boolean }) => void
    openTelegramLink: (url: string) => void
    openInvoice: (url: string, callback?: (status: string) => void) => void
    showPopup: (params: {
        title?: string
        message: string
        buttons?: Array<{
            id?: string
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
            text?: string
        }>
    }, callback?: (buttonId: string) => void) => void
    showAlert: (message: string, callback?: () => void) => void
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
    showScanQrPopup: (params: {
        text?: string
    }, callback?: (data: string) => void) => void
    closeScanQrPopup: () => void
    readTextFromClipboard: (callback?: (text: string) => void) => void
    requestWriteAccess: (callback?: (granted: boolean) => void) => void
    requestContact: (callback?: (granted: boolean) => void) => void
}

declare global {
    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp
        }
    }
}

/**
 * Get Telegram WebApp instance
 */
export function getTelegramWebApp(): TelegramWebApp | null {
    if (typeof window === 'undefined') {
        return null
    }
    
    return window.Telegram?.WebApp || null
}

/**
 * Initialize Telegram WebApp
 * Call this in useEffect when component mounts
 */
export function initTelegramWebApp(): TelegramWebApp | null {
    const tg = getTelegramWebApp()
    
    if (!tg) {
        console.warn('Telegram WebApp not available - running outside Telegram')
        return null
    }
    
    // Expand WebApp to full height
    tg.expand()
    
    // Ready signal
    tg.ready()
    
    // Apply Telegram theme colors if available
    if (tg.themeParams) {
        applyTelegramTheme(tg.themeParams)
    }
    
    // Listen for theme changes
    tg.onEvent('themeChanged', () => {
        if (tg.themeParams) {
            applyTelegramTheme(tg.themeParams)
        }
    })
    
    // Listen for viewport changes
    tg.onEvent('viewportChanged', () => {
        // Update viewport height CSS variable
        document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`)
        document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`)
    })
    
    // Set initial viewport height
    document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`)
    document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`)
    
    return tg
}

/**
 * Apply Telegram theme colors to CSS variables
 */
function applyTelegramTheme(themeParams: TelegramWebApp['themeParams']) {
    if (themeParams.bg_color) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color)
    }
    if (themeParams.text_color) {
        document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color)
    }
    if (themeParams.hint_color) {
        document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color)
    }
    if (themeParams.link_color) {
        document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color)
    }
    if (themeParams.button_color) {
        document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color)
    }
    if (themeParams.button_text_color) {
        document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color)
    }
}

/**
 * Get current user info from Telegram
 */
export function getTelegramUser() {
    const tg = getTelegramWebApp()
    return tg?.initDataUnsafe?.user || null
}

/**
 * Check if running inside Telegram
 */
export function isTelegramWebApp(): boolean {
    return typeof window !== 'undefined' && !!window.Telegram?.WebApp
}
