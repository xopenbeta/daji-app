import { useAtom } from "jotai";
import { defaultAppSettings, appSettingsAtom } from "../store/appSettings";
import { AppSettings } from "@/types/index";
import { setAppTheme } from "../utils/theme";
import { toast } from "sonner";
import i18n from "@/i18n";

// appConfig的数据不重要，用不着放在文件里
const APP_SETTINGS_STORAGE_KEY = 'daji-app-settings'

// 从localStorage读取应用设置数据
export const loadAppSettingsFromStorage = (): AppSettings => {
  try {
    const settingsStr = localStorage.getItem(APP_SETTINGS_STORAGE_KEY)
    const parsedSettings = JSON.parse(settingsStr || '{}');
    
    // 确保 ai 配置存在且完整
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

// 保存应用设置数据到localStorage
export const saveAppSettingsToStorage = (settings: AppSettings) => {
  localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function useAppSettings() {
  const [appSettings, setAppSettings] = useAtom(appSettingsAtom);

  function initAppSettings() {
    // 从localStorage读取应用设置
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
      if (updates.theme) { // 如果theme有改动
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
