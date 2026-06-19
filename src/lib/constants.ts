import type {
  FontSizeLevel,
  MealMeta,
  MealRelation,
  PaperSize,
  Scheme,
  SlotMeta,
  TimeSlot,
} from "@/types";

export const SLOT_LIST: SlotMeta[] = [
  { key: "morning", label: "早晨", time: "07:00", emoji: "☀️" },
  { key: "noon", label: "中午", time: "12:00", emoji: "🌞" },
  { key: "evening", label: "晚上", time: "19:00", emoji: "🌙" },
];

export const MEAL_LIST: MealMeta[] = [
  { key: "before", label: "饭前服用", emoji: "🍚" },
  { key: "after", label: "饭后服用", emoji: "🍲" },
  { key: "empty", label: "空腹服用", emoji: "💧" },
  { key: "any", label: "随时可服", emoji: "🕐" },
];

export const FREQUENCY_PRESETS: string[] = [
  "每日 1 次",
  "每日 2 次",
  "每日 3 次",
  "隔日 1 次",
  "每周 1 次",
  "必要时服用",
];

export const GROUP_PRESETS: string[] = [
  "降压药",
  "降糖药",
  "心血管药",
  "骨关节药",
  "维生素",
  "其他",
];

export const PAPER_META: Record<
  PaperSize,
  { label: string; width: number; height: number; cols: number; maxWidth: string }
> = {
  A4: { label: "A4 纸", width: 595, height: 842, cols: 2, maxWidth: "max-w-3xl" },
  A5: { label: "A5 纸", width: 420, height: 595, cols: 1, maxWidth: "max-w-md" },
  label: { label: "标签纸", width: 595, height: 842, cols: 3, maxWidth: "max-w-3xl" },
};

export const FONT_SIZE_LABEL: Record<FontSizeLevel, string> = {
  large: "大字",
  xlarge: "超大字",
  xxlarge: "特号字",
};

export function slotMeta(key: TimeSlot): SlotMeta {
  return SLOT_LIST.find((s) => s.key === key) ?? SLOT_LIST[0];
}

export function mealMeta(key: MealRelation): MealMeta {
  return MEAL_LIST.find((m) => m.key === key) ?? MEAL_LIST[3];
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const SAMPLE_SCHEME: Scheme = {
  id: "sample-001",
  name: "爷爷的日常用药",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  medicines: [
    {
      id: "m-1",
      name: "氨氯地平片",
      frequency: "每日 1 次",
      mealRelation: "after",
      slots: ["morning"],
      dosage: "1 片（5mg）",
      notes: "服药后避免起身过快，注意监测血压",
      group: "降压药",
    },
    {
      id: "m-2",
      name: "二甲双胍缓释片",
      frequency: "每日 2 次",
      mealRelation: "after",
      slots: ["morning", "evening"],
      dosage: "1 片（500mg）",
      notes: "随餐服用，勿嚼碎",
      group: "降糖药",
    },
    {
      id: "m-3",
      name: "阿司匹林肠溶片",
      frequency: "每日 1 次",
      mealRelation: "empty",
      slots: ["morning"],
      dosage: "半片（50mg）",
      notes: "空腹温水送服，注意是否有黑便",
      group: "心血管药",
    },
    {
      id: "m-4",
      name: "钙尔奇 D 片",
      frequency: "每日 1 次",
      mealRelation: "after",
      slots: ["noon"],
      dosage: "1 片",
      notes: "午饭后嚼服，多喝水",
      group: "维生素",
    },
  ],
};

export const DEFAULT_SETTINGS = {
  highContrast: false,
  fontSize: "large" as FontSizeLevel,
  showIcons: true,
  paperSize: "A4" as PaperSize,
  pocketMode: false,
};
