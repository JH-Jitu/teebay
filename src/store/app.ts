

import { APP_CONFIG } from "@/src/config/app";
import type { AppSettings, AppState } from "@/src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";

interface AppStore extends AppState {
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  resetSettings: () => void;

  
  toggleTheme: () => void;
  setLanguage: (language: AppSettings["language"]) => void;
  setCurrency: (currency: AppSettings["currency"]) => void;
  togglePushNotifications: () => void;
  toggleBiometricAuth: () => void;
  toggleAutoLogin: () => void;
}

const defaultSettings: AppSettings = {
  theme: "system",
  language: "en",
  currency: "USD",
  pushNotificationsEnabled: true,
  biometricAuthEnabled: false,
  autoLoginEnabled: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      
      isInitialized: false,
      isOnline: true,
      settings: defaultSettings,
      lastActiveDate: new Date().toISOString(),

      
      updateSettings: (newSettings: Partial<AppSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          lastActiveDate: new Date().toISOString(),
        }));
      },

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
      },

      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      },

      resetSettings: () => {
        set({
          settings: defaultSettings,
          lastActiveDate: new Date().toISOString(),
        });
      },

      
      toggleTheme: () => {
        const { settings } = get();
        const newTheme =
          settings.theme === "light"
            ? "dark"
            : settings.theme === "dark"
            ? "system"
            : "light";

        get().updateSettings({ theme: newTheme });
      },

      setLanguage: (language: AppSettings["language"]) => {
        get().updateSettings({ language });
      },

      setCurrency: (currency: AppSettings["currency"]) => {
        get().updateSettings({ currency });
      },

      togglePushNotifications: () => {
        const { settings } = get();
        get().updateSettings({
          pushNotificationsEnabled: !settings.pushNotificationsEnabled,
        });
      },

      toggleBiometricAuth: () => {
        const { settings } = get();
        get().updateSettings({
          biometricAuthEnabled: !settings.biometricAuthEnabled,
        });
      },

      toggleAutoLogin: () => {
        const { settings } = get();
        get().updateSettings({
          autoLoginEnabled: !settings.autoLoginEnabled,
        });
      },
    })),
    {
      name: APP_CONFIG.STORAGE.SETTINGS_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        lastActiveDate: state.lastActiveDate,
      }),
    }
  )
);


useAppStore.subscribe(
  (state) => state.settings.theme,
  (theme) => {
    console.log("Theme changed to:", theme);
    
  }
);

useAppStore.subscribe(
  (state) => state.settings.language,
  (language) => {
    console.log("Language changed to:", language);
    
  }
);

useAppStore.subscribe(
  (state) => state.isOnline,
  (isOnline, previousIsOnline) => {
    if (isOnline !== previousIsOnline) {
      console.log("Network status changed:", { isOnline });
      
    }
  }
);


export const useAppSettings = () => useAppStore((state) => state.settings);
export const useAppStatus = () =>
  useAppStore((state) => ({
    isInitialized: state.isInitialized,
    isOnline: state.isOnline,
    lastActiveDate: state.lastActiveDate,
  }));

export const useAppActions = () =>
  useAppStore((state) => ({
    updateSettings: state.updateSettings,
    setOnlineStatus: state.setOnlineStatus,
    setInitialized: state.setInitialized,
    resetSettings: state.resetSettings,
    toggleTheme: state.toggleTheme,
    setLanguage: state.setLanguage,
    setCurrency: state.setCurrency,
    togglePushNotifications: state.togglePushNotifications,
    toggleBiometricAuth: state.toggleBiometricAuth,
    toggleAutoLogin: state.toggleAutoLogin,
  }));
