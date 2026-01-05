import { setAppTheme } from '@/utils/theme';
import { useEffect } from 'react';
import { useAtom } from "jotai";
import { appSettingsAtom, defaultAppSettings } from "@/store/appSettings";

export function useAppTheme() {
    const [appSettings] = useAtom(appSettingsAtom);

    // Apply theme on initialization and theme change
    useEffect(() => {
        const theme = appSettings?.theme || defaultAppSettings.theme;
        setAppTheme(theme);
        console.log('Apply theme:', theme);
    }, [appSettings?.theme]);

    // Listen for window focus and page visibility changes, re-check and apply theme
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                const theme = appSettings?.theme || defaultAppSettings.theme;
                // Re-apply theme when page becomes visible
                setAppTheme(theme);
            }
        };

        const handleWindowFocus = () => {
            const theme = appSettings?.theme || defaultAppSettings.theme;
            // Re-apply theme when window gains focus
            setAppTheme(theme);
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleWindowFocus);

        // Cleanup function
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [appSettings?.theme]); // Dependency on theme setting
}
