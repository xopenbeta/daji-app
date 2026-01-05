import { AppSettings } from "@/types/index"

// Used to store the current system theme listener
let systemThemeListener: ((event: MediaQueryListEvent) => void) | null = null

export const setAppTheme = (theme: AppSettings['theme']) => {
    // Apply theme to document
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    
    // Clear previous listener
    if (systemThemeListener) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', systemThemeListener)
        systemThemeListener = null
    }
    
    if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const systemTheme = mediaQuery.matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
        
        // Add system theme change listener
        systemThemeListener = (event: MediaQueryListEvent) => {
            root.classList.remove('light', 'dark')
            root.classList.add(event.matches ? 'dark' : 'light')
            console.log('System theme automatically switched to:', event.matches ? 'dark' : 'light')
        }
        
        mediaQuery.addEventListener('change', systemThemeListener)
    } else {
        root.classList.add(theme)
    }
}
