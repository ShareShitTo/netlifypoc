import { useEffect, useState } from "react";
import {
  type ThemeGroup,
  THEME_STORAGE_KEY,
  THEMES,
  getStoredTheme,
  isThemeKey,
  setTheme,
  type ThemeKey,
} from "@/lib/theme";

const GROUP_ORDER: ThemeGroup[] = ["Core", "Modern", "Terminal", "Nostalgia"];

export function ThemeSelector() {
  const [selected, setSelected] = useState<ThemeKey>(() => getStoredTheme());

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    themes: THEMES.filter((theme) => theme.group === group),
  })).filter((entry) => entry.themes.length > 0);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }
      if (isThemeKey(event.newValue)) {
        setSelected(event.newValue);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-3 py-1.5 text-xs backdrop-blur">
      <span className="hidden text-muted-foreground sm:inline">Theme</span>
      <select
        value={selected}
        onChange={(event) => {
          const value = event.target.value;
          if (!isThemeKey(value)) {
            return;
          }
          setSelected(value);
          setTheme(value);
        }}
        className="max-w-[11.5rem] bg-transparent text-xs text-foreground outline-none"
      >
        {grouped.map((entry) => (
          <optgroup key={entry.group} label={entry.group}>
            {entry.themes.map((theme) => (
              <option key={theme.key} value={theme.key}>
                {theme.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
