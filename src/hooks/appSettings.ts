import { useAtom } from "jotai";
import { defaultAppSettings, appSettingsAtom } from "../store/appSettings";
import { AppSettings } from "@/types/index";
import { setAppTheme } from "../utils/theme";
import { toast } from "sonner";
import i18n from "@/i18n";

// appConfig data is not critical, no need to store in file
const APP_SETTINGS_STORAGE_KEY = 'daji-app-settings'

// Load app settings data from localStorage
export const loadAppSettingsFromStorage = (): AppSettings => {
  try {
    const settingsStr = localStorage.getItem(APP_SETTINGS_STORAGE_KEY)
    const parsedSettings = JSON.parse(settingsStr || '{}');
    
    // Ensure AI configuration exists and is complete
    const aiSettings = {
      ...defaultAppSettings.ai,
      ...(parsedSettings.ai || {})
    };

    return {
      ...defaultAppSettings,
      ...parsedSettings,
      ai: aiSettings
    } as AppSettings;
  } catch (error) {
    console.error('Failed to load app settings from localStorage:', error)
    return defaultAppSettings
  }
}

// Save app settings data to localStorage
export const saveAppSettingsToStorage = (settings: AppSettings) => {
  localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function useAppSettings() {
  const [appSettings, setAppSettings] = useAtom(appSettingsAtom);

  function initAppSettings() {
    // Load app settings from localStorage
    let appSettings = loadAppSettingsFromStorage();
    setAppSettings(appSettings);
    setAppTheme(appSettings.theme);
    if (appSettings.language) {
      i18n.changeLanguage(appSettings.language);
    }
    return appSettings;
  }

  function updateAppSettings(updates: Partial<AppSettings>) {
    setAppSettings((currentSettings) => {
      const updatedSettings = { ...(currentSettings ?? defaultAppSettings), ...updates };
      saveAppSettingsToStorage(updatedSettings);
      if (updates.theme) { // If theme has changed
        setAppTheme(updates.theme);
      }
      if (updates.language) {
        i18n.changeLanguage(updates.language);
      }
      return updatedSettings;
    });
  }

  function resetAppSettings() {
    setAppSettings(defaultAppSettings);
    saveAppSettingsToStorage(defaultAppSettings);
    setAppTheme(defaultAppSettings.theme);
  }

  return {
    appSettings,
    initAppSettings,
    updateAppSettings,
    resetAppSettings
  };
}
