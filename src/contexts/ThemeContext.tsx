import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

interface Colors {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceElevated: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Primary colors
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;

  // Secondary colors
  secondary: string;
  secondaryContainer: string;
  onSecondary: string;
  onSecondaryContainer: string;

  // Status colors
  success: string;
  successContainer: string;
  error: string;
  errorContainer: string;
  warning: string;
  warningContainer: string;
  info: string;
  infoContainer: string;

  // Border and divider colors
  border: string;
  divider: string;
  outline: string;

  // Overlay colors
  overlay: string;
  backdrop: string;

  // Shadow colors
  shadow: string;

  // Special colors
  disabled: string;
  disabledContainer: string;
  ripple: string;
}

const lightColors: Colors = {
  // Background colors
  background: "#ffffff",
  surface: "#f8fafc",
  surfaceVariant: "#f1f5f9",
  surfaceElevated: "#ffffff",

  // Text colors
  text: "#1f2937",
  textSecondary: "#6b7280",
  textTertiary: "#9ca3af",
  textInverse: "#ffffff",

  // Primary colors
  primary: "#6366f1",
  primaryContainer: "#e0e7ff",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#1e1b4b",

  // Secondary colors
  secondary: "#8b5cf6",
  secondaryContainer: "#f3f4f6",
  onSecondary: "#ffffff",
  onSecondaryContainer: "#1f2937",

  // Status colors
  success: "#10b981",
  successContainer: "#dcfce7",
  error: "#ef4444",
  errorContainer: "#fee2e2",
  warning: "#f59e0b",
  warningContainer: "#fef3c7",
  info: "#3b82f6",
  infoContainer: "#dbeafe",

  // Border and divider colors
  border: "#e5e7eb",
  divider: "#f3f4f6",
  outline: "#d1d5db",

  // Overlay colors
  overlay: "rgba(0, 0, 0, 0.15)",
  backdrop: "rgba(0, 0, 0, 0.4)",

  // Shadow colors
  shadow: "rgba(0, 0, 0, 0.1)",

  // Special colors
  disabled: "#9ca3af",
  disabledContainer: "#f3f4f6",
  ripple: "rgba(0, 0, 0, 0.1)",
};

const darkColors: Colors = {
  // Background colors
  background: "#0f172a",
  surface: "#1e293b",
  surfaceVariant: "#334155",
  surfaceElevated: "#1e293b",

  // Text colors
  text: "#f8fafc",
  textSecondary: "#cbd5e1",
  textTertiary: "#94a3b8",
  textInverse: "#0f172a",

  // Primary colors
  primary: "#818cf8",
  primaryContainer: "#3730a3",
  onPrimary: "#1e1b4b",
  onPrimaryContainer: "#e0e7ff",

  // Secondary colors
  secondary: "#a78bfa",
  secondaryContainer: "#4c1d95",
  onSecondary: "#1f2937",
  onSecondaryContainer: "#f3f4f6",

  // Status colors
  success: "#34d399",
  successContainer: "#065f46",
  error: "#f87171",
  errorContainer: "#7f1d1d",
  warning: "#fbbf24",
  warningContainer: "#92400e",
  info: "#60a5fa",
  infoContainer: "#1e3a8a",

  // Border and divider colors
  border: "#334155",
  divider: "#475569",
  outline: "#64748b",

  // Overlay colors
  overlay: "rgba(255, 255, 255, 0.1)",
  backdrop: "rgba(0, 0, 0, 0.6)",

  // Shadow colors
  shadow: "rgba(0, 0, 0, 0.3)",

  // Special colors
  disabled: "#64748b",
  disabledContainer: "#334155",
  ripple: "rgba(255, 255, 255, 0.1)",
};

interface ThemeContextType {
  colors: Colors;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  // Determine if we should use dark mode
  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark");

  // Get the appropriate colors based on the current theme
  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  // Update theme when system color scheme changes
  useEffect(() => {
    if (themeMode === "system") {
      // Force re-render when system theme changes
      // This is handled automatically by the isDark calculation
    }
  }, [systemColorScheme, themeMode]);

  return (
    <ThemeContext.Provider
      value={{
        colors,
        themeMode,
        isDark,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
