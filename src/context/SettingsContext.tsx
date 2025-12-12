"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// 1. Define Types
interface SettingsState {
  theme: "dark" | "light"; // For future expansion
  developerMode: boolean; // Enables debug logs
}

interface SettingsContextType extends SettingsState {
  toggleTheme: () => void;
  setDeveloperMode: (enabled: boolean) => void;
}

// 2. Default Values
const defaultSettings: SettingsState = {
  theme: "dark",
  developerMode: false,
};

// 3. Create Context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// 4. Provider Component
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ocr-settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("ocr-settings", JSON.stringify(settings));
  }, [settings]);

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark",
    }));
  };

  const setDeveloperMode = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, developerMode: enabled }));
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        toggleTheme,
        setDeveloperMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// 5. Custom Hook for easy access
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
