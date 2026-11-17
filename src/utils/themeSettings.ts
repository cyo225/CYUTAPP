import type { AppSettings, FontSizeScale, ThemeAccent } from '../types';

export const SETTINGS_STORAGE_KEY = 'cyut_app_settings';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  colorMode: 'dark',
  accentTheme: 'ocean', // 預設主題色彩：海洋藍 (Ocean Blue)
  fontSize: 'standard',
  notifications: {
    masterEnabled: true,
    academicAlerts: true,
    merchantPromoAlerts: true,
    classReminder15m: true,
    socialAlerts: true,
  },
};

export interface AccentThemeOption {
  id: ThemeAccent;
  name: string;
  nameEn: string;
  swatch: string;
  isDefault?: boolean;
  description: string;
}

export const ACCENT_THEME_OPTIONS: AccentThemeOption[] = [
  {
    id: 'ocean',
    name: '海洋藍',
    nameEn: 'Ocean Blue',
    swatch: '#0EA5E9',
    isDefault: true,
    description: '系統預設 · 清爽沉穩智慧校園藍',
  },
  {
    id: 'lavender',
    name: '薰衣草紫',
    nameEn: 'Lavender Purple',
    swatch: '#8B5CF6',
    description: '優雅知性設計美學紫調',
  },
  {
    id: 'forest',
    name: '森林綠',
    nameEn: 'Forest Green',
    swatch: '#10B981',
    description: '自然護眼朝陽校園綠意',
  },
  {
    id: 'gold',
    name: '暖金',
    nameEn: 'Warm Gold',
    swatch: '#F59E0B',
    description: '活力陽光溫暖金琥珀色',
  },
  {
    id: 'crimson',
    name: '熱情紅',
    nameEn: 'Crimson Red',
    swatch: '#E50914',
    description: '經典高對比劇院熱情紅',
  },
];

export const FONT_SIZE_OPTIONS: {
  id: FontSizeScale;
  label: string;
  px: number;
  desc: string;
}[] = [
  { id: 'standard', label: '標準', px: 16, desc: '預設舒適比例 (16px)' },
  { id: 'medium', label: '微調放大', px: 17.5, desc: '強化閱讀清晰度 (17.5px)' },
  { id: 'large', label: '大字體', px: 19, desc: '護眼大字好點擊 (19px)' },
];

export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_APP_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      colorMode: parsed.colorMode === 'light' ? 'light' : 'dark',
      accentTheme:
        parsed.accentTheme &&
        ['ocean', 'lavender', 'forest', 'gold', 'crimson'].includes(parsed.accentTheme)
          ? parsed.accentTheme
          : DEFAULT_APP_SETTINGS.accentTheme,
      fontSize:
        parsed.fontSize && ['standard', 'medium', 'large'].includes(parsed.fontSize)
          ? parsed.fontSize
          : DEFAULT_APP_SETTINGS.fontSize,
      notifications: {
        masterEnabled: parsed.notifications?.masterEnabled ?? true,
        academicAlerts: parsed.notifications?.academicAlerts ?? true,
        merchantPromoAlerts: parsed.notifications?.merchantPromoAlerts ?? true,
        classReminder15m: parsed.notifications?.classReminder15m ?? true,
        socialAlerts: parsed.notifications?.socialAlerts ?? true,
      },
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function applySettingsToDocument(settings: AppSettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // 1. Dark / Light Mode class for Tailwind @custom-variant dark
  if (settings.colorMode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // 2. Accent Theme attribute
  root.setAttribute('data-accent', settings.accentTheme);

  // 3. Global Font Size Scale on <html> (scales all rem utilities proportionally)
  const sizeSpec = FONT_SIZE_OPTIONS.find((f) => f.id === settings.fontSize) || FONT_SIZE_OPTIONS[0];
  root.style.fontSize = `${sizeSpec.px}px`;

  // 4. Sync <meta name="theme-color"> for PWA status bar
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', settings.colorMode === 'dark' ? '#0B0F17' : '#F8FAFC');
  }
}
