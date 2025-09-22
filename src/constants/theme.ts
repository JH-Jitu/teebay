

import { Platform } from "react-native";





export const Colors = {
  light: {
    
    primary: "#2563EB",
    primaryHover: "#1D4ED8",
    primaryLight: "#E6F4FE",

    
    secondary: "#7C3AED",
    secondaryHover: "#6D28D9",
    secondaryLight: "#F3E8FF",

    
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    backgroundTertiary: "#F3F4F6",

    
    text: "#11181C",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    textInverse: "#FFFFFF",

    
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    
    border: "#E5E7EB",
    borderLight: "#F3F4F6",
    borderDark: "#D1D5DB",

    
    surface: "#FFFFFF",
    surfaceSecondary: "#F9FAFB",

    
    tabIconDefault: "#6B7280",
    tabIconSelected: "#2563EB",
    tint: "#2563EB",
    icon: "#6B7280",
  },
  dark: {
    
    primary: "#3B82F6",
    primaryHover: "#2563EB",
    primaryLight: "#1E293B",

    
    secondary: "#8B5CF6",
    secondaryHover: "#7C3AED",
    secondaryLight: "#2D1B69",

    
    background: "#0F172A",
    backgroundSecondary: "#1E293B",
    backgroundTertiary: "#334155",

    
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    textInverse: "#0F172A",

    
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",

    
    border: "#334155",
    borderLight: "#475569",
    borderDark: "#1E293B",

    
    surface: "#1E293B",
    surfaceSecondary: "#334155",

    
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#3B82F6",
    tint: "#3B82F6",
    icon: "#94A3B8",
  },
} as const;





export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;





export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
  "4xl": 96,
} as const;





export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
} as const;





export const Shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;





export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;





export const ComponentThemes = {
  button: {
    primary: {
      light: {
        backgroundColor: Colors.light.primary,
        backgroundColorPressed: Colors.light.primaryHover,
        textColor: Colors.light.textInverse,
        borderColor: Colors.light.primary,
      },
      dark: {
        backgroundColor: Colors.dark.primary,
        backgroundColorPressed: Colors.dark.primaryHover,
        textColor: Colors.dark.textInverse,
        borderColor: Colors.dark.primary,
      },
    },
    secondary: {
      light: {
        backgroundColor: Colors.light.secondary,
        backgroundColorPressed: Colors.light.secondaryHover,
        textColor: Colors.light.textInverse,
        borderColor: Colors.light.secondary,
      },
      dark: {
        backgroundColor: Colors.dark.secondary,
        backgroundColorPressed: Colors.dark.secondaryHover,
        textColor: Colors.dark.textInverse,
        borderColor: Colors.dark.secondary,
      },
    },
    ghost: {
      light: {
        backgroundColor: "transparent",
        backgroundColorPressed: Colors.light.backgroundSecondary,
        textColor: Colors.light.primary,
        borderColor: "transparent",
      },
      dark: {
        backgroundColor: "transparent",
        backgroundColorPressed: Colors.dark.backgroundSecondary,
        textColor: Colors.dark.primary,
        borderColor: "transparent",
      },
    },
    destructive: {
      light: {
        backgroundColor: Colors.light.error,
        backgroundColorPressed: "#DC2626",
        textColor: Colors.light.textInverse,
        borderColor: Colors.light.error,
      },
      dark: {
        backgroundColor: Colors.dark.error,
        backgroundColorPressed: "#DC2626",
        textColor: Colors.dark.textInverse,
        borderColor: Colors.dark.error,
      },
    },
  },
  input: {
    default: {
      light: {
        backgroundColor: Colors.light.background,
        borderColor: Colors.light.border,
        borderColorFocused: Colors.light.primary,
        textColor: Colors.light.text,
        placeholderColor: Colors.light.textMuted,
      },
      dark: {
        backgroundColor: Colors.dark.background,
        borderColor: Colors.dark.border,
        borderColorFocused: Colors.dark.primary,
        textColor: Colors.dark.text,
        placeholderColor: Colors.dark.textMuted,
      },
    },
    filled: {
      light: {
        backgroundColor: Colors.light.backgroundSecondary,
        borderColor: "transparent",
        borderColorFocused: Colors.light.primary,
        textColor: Colors.light.text,
        placeholderColor: Colors.light.textMuted,
      },
      dark: {
        backgroundColor: Colors.dark.backgroundSecondary,
        borderColor: "transparent",
        borderColorFocused: Colors.dark.primary,
        textColor: Colors.dark.text,
        placeholderColor: Colors.dark.textMuted,
      },
    },
    focused: {
      light: {
        backgroundColor: Colors.light.background,
        borderColor: Colors.light.primary,
        textColor: Colors.light.text,
        placeholderColor: Colors.light.textMuted,
      },
      dark: {
        backgroundColor: Colors.dark.background,
        borderColor: Colors.dark.primary,
        textColor: Colors.dark.text,
        placeholderColor: Colors.dark.textMuted,
      },
    },
    error: {
      light: {
        backgroundColor: Colors.light.background,
        borderColor: Colors.light.error,
        textColor: Colors.light.text,
        placeholderColor: Colors.light.textMuted,
      },
      dark: {
        backgroundColor: Colors.dark.background,
        borderColor: Colors.dark.error,
        textColor: Colors.dark.text,
        placeholderColor: Colors.dark.textMuted,
      },
    },
  },
  card: {
    default: {
      light: {
        backgroundColor: Colors.light.surface,
        borderColor: Colors.light.border,
        shadowColor: "#000000",
        shadowOpacity: 0.1,
      },
      dark: {
        backgroundColor: Colors.dark.surface,
        borderColor: Colors.dark.border,
        shadowColor: "#000000",
        shadowOpacity: 0.3,
      },
    },
    elevated: {
      light: {
        backgroundColor: Colors.light.surface,
        borderColor: "transparent",
        shadowColor: "#000000",
        shadowOpacity: 0.15,
      },
      dark: {
        backgroundColor: Colors.dark.surface,
        borderColor: "transparent",
        shadowColor: "#000000",
        shadowOpacity: 0.4,
      },
    },
    outlined: {
      light: {
        backgroundColor: "transparent",
        borderColor: Colors.light.border,
        shadowColor: "transparent",
        shadowOpacity: 0,
      },
      dark: {
        backgroundColor: "transparent",
        borderColor: Colors.dark.border,
        shadowColor: "transparent",
        shadowOpacity: 0,
      },
    },
  },
} as const;





export const Animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    easeInOut: "ease-in-out",
    easeIn: "ease-in",
    easeOut: "ease-out",
    linear: "linear",
  },
} as const;





export const Fonts = Platform.select({
  ios: {
        sans: "system-ui",
        serif: "ui-serif",
        rounded: "ui-rounded",
        mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "'Menlo', 'Monaco', 'Courier New', monospace",
  },
});





export const createThemedStyles = <T extends Record<string, any>>(
  styles: (colors: typeof Colors.light | typeof Colors.dark) => T,
  colorScheme: "light" | "dark"
): T => {
  return styles(Colors[colorScheme]);
};

export const getThemeColor = (
  path: string,
  colorScheme: "light" | "dark"
): string => {
  const colors = Colors[colorScheme];
  const keys = path.split(".");
  let value: any = colors;

  for (const key of keys) {
    value = value?.[key];
  }

  return value || Colors[colorScheme].text;
};

export const getComponentTheme = <
  K extends keyof typeof ComponentThemes,
  V extends keyof (typeof ComponentThemes)[K]
>(
  component: K,
  variant: V,
  colorScheme: "light" | "dark"
) => {
  return ComponentThemes[component][variant][colorScheme];
};





export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  IconSizes,
  ComponentThemes,
  Animation,
  Fonts,
  createThemedStyles,
  getThemeColor,
  getComponentTheme,
};
