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
  Medicine,
  Caregiver,
  HandoverRecord,
  HandoverItemKey,
} from "@/types";
import {
  DEFAULT_SETTINGS,
  SAMPLE_SCHEME,
  uid,
  HANDOVER_ITEMS,
} from "@/lib/constants";
import {
  loadCurrentId,
  loadSchemes,
  loadSettings,
  saveCurrentId,
  saveSchemes,
  saveSettings,
} from "@/lib/storage";

interface MedState {
  medicines: Medicine[];
  caregivers: Caregiver[];
  handoverRecords: HandoverRecord[];
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

  addCaregiver: () => void;
  updateCaregiver: (id: string, patch: Partial<Caregiver>) => void;
  removeCaregiver: (id: string) => void;
  toggleCaregiverSlot: (id: string, slot: TimeSlot) => void;

  getHandoverRecord: (date: string, slot: TimeSlot) => HandoverRecord | undefined;
  updateHandoverRecord: (date: string, slot: TimeSlot, patch: Partial<HandoverRecord>) => void;
  toggleHandoverItem: (date: string, slot: TimeSlot, item: HandoverItemKey) => void;
  setHandoverCaregiver: (date: string, slot: TimeSlot, caregiverId: string | null) => void;
  setHandoverNote: (date: string, slot: TimeSlot, note: string) => void;

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

function createEmptyCaregiver(): Caregiver {
  return {
    id: uid(),
    name: "",
    relation: "",
    phone: "",
    slots: [],
    note: "",
  };
}

function createEmptyHandoverItems(): Record<HandoverItemKey, boolean> {
  const items = {} as Record<HandoverItemKey, boolean>;
  for (const h of HANDOVER_ITEMS) {
    items[h.key] = false;
  }
  return items;
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

function migrateSchemeFields(s: Scheme): Scheme {
  return {
    ...s,
    caregivers: s.caregivers ?? [],
    handoverRecords: s.handoverRecords ?? [],
    medicines: s.medicines.map(migrateMedicineFields),
  };
}

const initialSettings = loadSettings();
applySettingsToDom(initialSettings);

const persistedSchemes = loadSchemes().map(migrateSchemeFields);
const initialCurrentId = loadCurrentId();
const initialScheme =
  persistedSchemes.find((s) => s.id === initialCurrentId) ?? null;

const initialMedicines = (
  initialScheme?.medicines ?? SAMPLE_SCHEME.medicines
).map(migrateMedicineFields);
const initialCaregivers =
  initialScheme?.caregivers ?? SAMPLE_SCHEME.caregivers;
const initialHandoverRecords =
  initialScheme?.handoverRecords ?? SAMPLE_SCHEME.handoverRecords;
const initialName = initialScheme?.name ?? "新建方案";

export const useMedStore = create<MedState>((set, get) => ({
  medicines: initialMedicines,
  caregivers: initialCaregivers,
  handoverRecords: initialHandoverRecords,
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

  addCaregiver: () => {
    set((s) => ({ caregivers: [...s.caregivers, createEmptyCaregiver()], dirty: true }));
  },

  updateCaregiver: (id, patch) => {
    set((s) => ({
      caregivers: s.caregivers.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
      dirty: true,
    }));
  },

  removeCaregiver: (id) => {
    set((s) => ({
      caregivers: s.caregivers.filter((c) => c.id !== id),
      dirty: true,
    }));
  },

  toggleCaregiverSlot: (id, slot) => {
    set((s) => ({
      caregivers: s.caregivers.map((c) => {
        if (c.id !== id) return c;
        const has = c.slots.includes(slot);
        return {
          ...c,
          slots: has ? c.slots.filter((x) => x !== slot) : [...c.slots, slot],
        };
      }),
      dirty: true,
    }));
  },

  getHandoverRecord: (date, slot) => {
    return get().handoverRecords.find(
      (r) => r.date === date && r.slot === slot,
    );
  },

  updateHandoverRecord: (date, slot, patch) => {
    set((s) => {
      const existing = s.handoverRecords.find(
        (r) => r.date === date && r.slot === slot,
      );
      let records: HandoverRecord[];
      if (existing) {
        records = s.handoverRecords.map((r) =>
          r.date === date && r.slot === slot
            ? { ...r, ...patch, updatedAt: Date.now() }
            : r,
        );
      } else {
        const newRecord: HandoverRecord = {
          date,
          slot,
          caregiverId: null,
          items: createEmptyHandoverItems(),
          note: "",
          updatedAt: Date.now(),
          ...patch,
        };
        records = [...s.handoverRecords, newRecord];
      }
      return { handoverRecords: records, dirty: true };
    });
  },

  toggleHandoverItem: (date, slot, item) => {
    const record = get().getHandoverRecord(date, slot);
    const currentItems = record?.items ?? createEmptyHandoverItems();
    const newItems = { ...currentItems, [item]: !currentItems[item] };
    get().updateHandoverRecord(date, slot, { items: newItems });
  },

  setHandoverCaregiver: (date, slot, caregiverId) => {
    get().updateHandoverRecord(date, slot, { caregiverId });
  },

  setHandoverNote: (date, slot, note) => {
    get().updateHandoverRecord(date, slot, { note });
  },

  newScheme: () => {
    set({
      medicines: [createEmptyMedicine()],
      caregivers: [],
      handoverRecords: [],
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
      caregivers: SAMPLE_SCHEME.caregivers.map((c) => ({ ...c, id: uid() })),
      handoverRecords: [],
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
          ? {
              ...s,
              medicines: state.medicines,
              caregivers: state.caregivers,
              handoverRecords: state.handoverRecords,
              updatedAt: now,
            }
          : s,
      );
    } else {
      id = uid();
      schemes = [
        {
          id,
          name: trimmed,
          medicines: state.medicines,
          caregivers: state.caregivers,
          handoverRecords: state.handoverRecords,
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
    const migrated = migrateSchemeFields(scheme);
    set({
      medicines: migrated.medicines.map((m) => ({ ...m })),
      caregivers: migrated.caregivers.map((c) => ({ ...c })),
      handoverRecords: migrated.handoverRecords.map((r) => ({ ...r })),
      currentName: migrated.name,
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
