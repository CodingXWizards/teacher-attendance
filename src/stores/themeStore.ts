import { create } from "zustand";
import { Appearance } from "react-native";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  isDark: boolean;
  rootClasses: string;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  applyRootTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "system",
  resolvedTheme: (Appearance.getColorScheme() as "light" | "dark") || "light",
  isDark: (Appearance.getColorScheme() as "light" | "dark") === "dark",
  rootClasses:
    (Appearance.getColorScheme() as "light" | "dark") === "dark"
      ? "dark"
      : "light",

  setTheme: (theme: Theme) => {
    const systemColorScheme = Appearance.getColorScheme();
    const resolvedTheme: "light" | "dark" =
      theme === "system"
        ? (systemColorScheme as "light" | "dark") || "light"
        : theme;

    set({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === "dark",
      rootClasses: resolvedTheme === "dark" ? "dark" : "light",
    });

    // Apply root theme immediately (like document.documentElement.classList)
    get().applyRootTheme();
  },

  toggleTheme: () => {
    const { theme } = get();
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    get().setTheme(newTheme);
  },

  applyRootTheme: () => {
    const { rootClasses } = get();
    // This simulates applying root classes like in web
    console.log(`Root theme applied: ${rootClasses}`);
    // In a real app, you might want to trigger a global update here
  },
}));

// Listen to system theme changes
Appearance.addChangeListener(({ colorScheme }) => {
  const { theme } = useThemeStore.getState();
  if (theme === "system") {
    const resolvedTheme: "light" | "dark" =
      (colorScheme as "light" | "dark") || "light";
    useThemeStore.setState({
      resolvedTheme,
      isDark: resolvedTheme === "dark",
      rootClasses: resolvedTheme === "dark" ? "dark" : "light",
    });
    // Apply root theme when system changes
    useThemeStore.getState().applyRootTheme();
  }
});
