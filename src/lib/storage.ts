import type { Scheme, Settings } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

const KEY_SCHEMES = "medlabel:schemes";
const KEY_SETTINGS = "medlabel:settings";
const KEY_CURRENT = "medlabel:current";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadSchemes(): Scheme[] {
  if (typeof window === "undefined") return [];
  return safeParse<Scheme[]>(window.localStorage.getItem(KEY_SCHEMES), []);
}

export function saveSchemes(schemes: Scheme[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_SCHEMES, JSON.stringify(schemes));
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const saved = safeParse<Partial<Settings>>(
    window.localStorage.getItem(KEY_SETTINGS),
    {},
  );
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    checklistGroupMode: saved.checklistGroupMode ?? DEFAULT_SETTINGS.checklistGroupMode,
    checklistOrientation: saved.checklistOrientation ?? DEFAULT_SETTINGS.checklistOrientation,
  };
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
}

export function loadCurrentId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY_CURRENT);
}

export function saveCurrentId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) {
    window.localStorage.setItem(KEY_CURRENT, id);
  } else {
    window.localStorage.removeItem(KEY_CURRENT);
  }
}
