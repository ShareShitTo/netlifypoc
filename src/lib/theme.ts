export type ThemeKey =
  | "sunrise-default"
  | "midnight-ink"
  | "slate-contrast"
  | "paper-studio"
  | "obsidian-luxe"
  | "retro-8bit"
  | "hacker-green"
  | "console-amber"
  | "operator-blue"
  | "crt-violet"
  | "geocities-neon"
  | "geocities-starry"
  | "y2k-clouds-gif"
  | "neon-stars-gif";

export type ThemeGroup = "Core" | "Modern" | "Terminal" | "Nostalgia";

export type ThemeDefinition = {
  key: ThemeKey;
  label: string;
  description: string;
  mode: "light" | "dark";
  group: ThemeGroup;
};

export const THEME_STORAGE_KEY = "netlifypoc.theme";
export const DEFAULT_THEME: ThemeKey = "sunrise-default";

export const THEMES: ThemeDefinition[] = [
  {
    key: "sunrise-default",
    label: "Sunrise Default",
    description: "Warm, editorial, modern baseline",
    mode: "light",
    group: "Core",
  },
  {
    key: "midnight-ink",
    label: "Midnight Ink",
    description: "Deep navy dark mode with cool accents",
    mode: "dark",
    group: "Core",
  },
  {
    key: "slate-contrast",
    label: "Slate Contrast",
    description: "Neutral dark mode with high readability",
    mode: "dark",
    group: "Core",
  },
  {
    key: "paper-studio",
    label: "Paper Studio",
    description: "High-clarity editorial palette with crisp modern type",
    mode: "light",
    group: "Modern",
  },
  {
    key: "obsidian-luxe",
    label: "Obsidian Luxe",
    description: "Premium dark palette with restrained amber highlights",
    mode: "dark",
    group: "Modern",
  },
  {
    key: "retro-8bit",
    label: "Retro 8-bit",
    description: "Pixel-era arcade palette and typography",
    mode: "dark",
    group: "Nostalgia",
  },
  {
    key: "hacker-green",
    label: "Hacker Green",
    description: "Terminal-inspired phosphor green style",
    mode: "dark",
    group: "Terminal",
  },
  {
    key: "console-amber",
    label: "Console Amber",
    description: "Monochrome amber CRT-inspired look",
    mode: "dark",
    group: "Terminal",
  },
  {
    key: "operator-blue",
    label: "Operator Blue",
    description: "Cobalt console aesthetic with cool monitor glow",
    mode: "dark",
    group: "Terminal",
  },
  {
    key: "crt-violet",
    label: "CRT Violet",
    description: "Purple phosphor terminal vibe with scanline texture",
    mode: "dark",
    group: "Terminal",
  },
  {
    key: "geocities-neon",
    label: "Geocities Neon",
    description: "Playful old-web neon with tiled background",
    mode: "light",
    group: "Nostalgia",
  },
  {
    key: "geocities-starry",
    label: "Geocities Starry",
    description: "Sparkly cosmic throwback aesthetic",
    mode: "dark",
    group: "Nostalgia",
  },
  {
    key: "y2k-clouds-gif",
    label: "Y2K Clouds GIF",
    description: "Soft animated cloud-loop nostalgia with pastel overlays",
    mode: "light",
    group: "Nostalgia",
  },
  {
    key: "neon-stars-gif",
    label: "Neon Stars GIF",
    description: "Animated starfield ambience with restrained neon accents",
    mode: "dark",
    group: "Nostalgia",
  },
];

const THEME_SET = new Set<ThemeKey>(THEMES.map((theme) => theme.key));

export function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === "string" && THEME_SET.has(value as ThemeKey);
}

export function applyTheme(theme: ThemeKey) {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.theme = theme;
}

export function getStoredTheme(): ThemeKey {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (isThemeKey(raw)) {
    return raw;
  }
  return DEFAULT_THEME;
}

export function setTheme(theme: ThemeKey) {
  applyTheme(theme);
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function initializeTheme(): ThemeKey {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}
