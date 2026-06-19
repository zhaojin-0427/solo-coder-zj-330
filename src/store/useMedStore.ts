import { create } from "zustand";
import type {
  Scheme,
  Settings,
  TimeSlot,
  MealRelation,
  PaperSize,
  FontSizeLevel,
  ChecklistGroupMode,
  ChecklistOrientation,
} from "@/types";
import {
  DEFAULT_SETTINGS,
  SAMPLE_SCHEME,
  uid,
} from "@/lib/constants";
import {
  loadCurrentId,
  loadSchemes,
  loadSettings,
  saveCurrentId,
  saveSchemes,
  saveSettings,
} from "@/lib/storage";
import type { Medicine } from "@/types";

interface MedState {
  medicines: Medicine[];
  schemes: Scheme[];
  settings: Settings;
  currentName: string;
  dirty: boolean;
  previewOpen: boolean;
  schemeDrawerOpen: boolean;

  addMedicine: () => void;
  updateMedicine: (id: string, patch: Partial<Medicine>) => void;
  removeMedicine: (id: string) => void;
  moveMedicine: (id: string, dir: -1 | 1) => void;
  toggleSlot: (id: string, slot: TimeSlot) => void;
  setMeal: (id: string, meal: MealRelation) => void;
  toggleChecklistSlot: (medicineId: string, date: string, slot: TimeSlot) => void;
  clearCompletedSlots: (medicineId: string) => void;

  newScheme: () => void;
  loadSample: () => void;
  saveCurrent: (name: string) => void;
  loadScheme: (scheme: Scheme) => void;
  deleteScheme: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  setFontSize: (size: FontSizeLevel) => void;
  setPaper: (paper: PaperSize) => void;
  toggleContrast: () => void;
  toggleIcons: () => void;
  setChecklistGroupMode: (mode: ChecklistGroupMode) => void;
  setChecklistOrientation: (orientation: ChecklistOrientation) => void;

  setPreviewOpen: (open: boolean) => void;
  setSchemeDrawerOpen: (open: boolean) => void;
}

function createEmptyMedicine(): Medicine {
  const today = new Date().toISOString().split("T")[0];
  return {
    id: uid(),
    name: "",
    frequency: "每日 1 次",
    mealRelation: "after",
    slots: ["morning"],
    dosage: "",
    notes: "",
    group: "其他",
    startDate: today,
    courseDays: 7,
    enableChecklist: true,
    completedSlots: {},
  };
}

function applySettingsToDom(settings: Settings): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.fontSize = settings.fontSize;
  root.dataset.contrast = settings.highContrast ? "high" : "normal";
}

function migrateMedicineFields(m: Medicine): Medicine {
  const today = new Date().toISOString().split("T")[0];
  return {
    ...m,
    startDate: m.startDate ?? today,
    courseDays: m.courseDays ?? 7,
    enableChecklist: m.enableChecklist ?? true,
    completedSlots: m.completedSlots ?? {},
  };
}

const initialSettings = loadSettings();
applySettingsToDom(initialSettings);

const persistedSchemes = loadSchemes();
const initialCurrentId = loadCurrentId();
const initialScheme =
  persistedSchemes.find((s) => s.id === initialCurrentId) ?? null;

const initialMedicines = (
  initialScheme?.medicines ?? SAMPLE_SCHEME.medicines
).map(migrateMedicineFields);
const initialName = initialScheme?.name ?? "新建方案";

export const useMedStore = create<MedState>((set, get) => ({
  medicines: initialMedicines,
  schemes: persistedSchemes,
  settings: initialSettings,
  currentName: initialName,
  dirty: !initialScheme,
  previewOpen: false,
  schemeDrawerOpen: false,

  addMedicine: () => {
    set((s) => ({ medicines: [...s.medicines, createEmptyMedicine()], dirty: true }));
  },

  updateMedicine: (id, patch) => {
    set((s) => ({
      medicines: s.medicines.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      dirty: true,
    }));
  },

  removeMedicine: (id) => {
    set((s) => ({
      medicines: s.medicines.filter((m) => m.id !== id),
      dirty: true,
    }));
  },

  moveMedicine: (id, dir) => {
    const list = [...get().medicines];
    const idx = list.findIndex((m) => m.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    set({ medicines: list, dirty: true });
  },

  toggleSlot: (id, slot) => {
    set((s) => ({
      medicines: s.medicines.map((m) => {
        if (m.id !== id) return m;
        const has = m.slots.includes(slot);
        return {
          ...m,
          slots: has ? m.slots.filter((x) => x !== slot) : [...m.slots, slot],
        };
      }),
      dirty: true,
    }));
  },

  setMeal: (id, meal) => {
    set((s) => ({
      medicines: s.medicines.map((m) =>
        m.id === id ? { ...m, mealRelation: meal } : m,
      ),
      dirty: true,
    }));
  },

  newScheme: () => {
    set({
      medicines: [createEmptyMedicine()],
      currentName: "新建方案",
      dirty: true,
    });
    saveCurrentId(null);
  },

  loadSample: () => {
    set({
      medicines: SAMPLE_SCHEME.medicines.map((m) =>
        migrateMedicineFields({ ...m, id: uid() }),
      ),
      currentName: SAMPLE_SCHEME.name,
      dirty: true,
    });
    saveCurrentId(null);
  },

  saveCurrent: (name) => {
    const state = get();
    const now = Date.now();
    const trimmed = name.trim() || "未命名方案";
    const existing = state.schemes.find((s) => s.name === trimmed);
    let schemes: Scheme[];
    let id: string;
    if (existing) {
      id = existing.id;
      schemes = state.schemes.map((s) =>
        s.id === id
          ? { ...s, medicines: state.medicines, updatedAt: now }
          : s,
      );
    } else {
      id = uid();
      schemes = [
        {
          id,
          name: trimmed,
          medicines: state.medicines,
          createdAt: now,
          updatedAt: now,
        },
        ...state.schemes,
      ];
    }
    saveSchemes(schemes);
    saveCurrentId(id);
    set({ schemes, currentName: trimmed, dirty: false });
  },

  loadScheme: (scheme) => {
    set({
      medicines: scheme.medicines.map((m) => migrateMedicineFields({ ...m })),
      currentName: scheme.name,
      dirty: false,
    });
    saveCurrentId(scheme.id);
  },

  deleteScheme: (id) => {
    const schemes = get().schemes.filter((s) => s.id !== id);
    saveSchemes(schemes);
    if (get().schemes.length === 0 || loadCurrentId() === id) {
      saveCurrentId(null);
    }
    set({ schemes });
  },

  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    saveSettings(next);
    applySettingsToDom(next);
    set({ settings: next });
  },

  setFontSize: (size) => get().updateSettings({ fontSize: size }),
  setPaper: (paper) => get().updateSettings({ paperSize: paper }),
  toggleContrast: () =>
    get().updateSettings({ highContrast: !get().settings.highContrast }),
  toggleIcons: () =>
    get().updateSettings({ showIcons: !get().settings.showIcons }),

  toggleChecklistSlot: (medicineId, date, slot) => {
    set((s) => ({
      medicines: s.medicines.map((m) => {
        if (m.id !== medicineId) return m;
        const completed = m.completedSlots[date] || [];
        const has = completed.includes(slot);
        return {
          ...m,
          completedSlots: {
            ...m.completedSlots,
            [date]: has
              ? completed.filter((x) => x !== slot)
              : [...completed, slot],
          },
        };
      }),
      dirty: true,
    }));
  },

  clearCompletedSlots: (medicineId) => {
    set((s) => ({
      medicines: s.medicines.map((m) =>
        m.id === medicineId ? { ...m, completedSlots: {} } : m,
      ),
      dirty: true,
    }));
  },

  setChecklistGroupMode: (mode) =>
    get().updateSettings({ checklistGroupMode: mode }),

  setChecklistOrientation: (orientation) =>
    get().updateSettings({ checklistOrientation: orientation }),

  setPreviewOpen: (open) => set({ previewOpen: open }),
  setSchemeDrawerOpen: (open) => set({ schemeDrawerOpen: open }),
}));

export { DEFAULT_SETTINGS };
