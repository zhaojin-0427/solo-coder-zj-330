import type {
  FontSizeLevel,
  MealMeta,
  MealRelation,
  PaperSize,
  Scheme,
  SlotMeta,
  TimeSlot,
  ChecklistGroupMode,
  ChecklistOrientation,
  HandoverItemKey,
  Caregiver,
  HandoverRecord,
} from "@/types";

export interface HandoverItemMeta {
  key: HandoverItemKey;
  label: string;
  emoji: string;
  description: string;
}

export const HANDOVER_ITEMS: HandoverItemMeta[] = [
  { key: "prepared", label: "已备药", emoji: "💊", description: "药品已准备好，摆放到对应时段" },
  { key: "reminded", label: "已提醒", emoji: "🔔", description: "已提醒老人按时服药" },
  { key: "observed", label: "已观察不适", emoji: "👁️", description: "观察服药后是否有不适反应" },
  { key: "contacted", label: "已联系医生/家属", emoji: "📞", description: "如有异常已联系医生或家属" },
];

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

export function handoverItemMeta(key: HandoverItemKey): HandoverItemMeta {
  return HANDOVER_ITEMS.find((h) => h.key === key) ?? HANDOVER_ITEMS[0];
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const SAMPLE_CAREGIVERS: Caregiver[] = [
  {
    id: "c-1",
    name: "大儿子",
    relation: "儿子",
    phone: "138-0000-1111",
    slots: ["morning"],
    note: "负责早晨送药和测血压",
  },
  {
    id: "c-2",
    name: "大儿媳",
    relation: "儿媳",
    phone: "138-0000-2222",
    slots: ["noon"],
    note: "中午送饭和提醒服药",
  },
  {
    id: "c-3",
    name: "小女儿",
    relation: "女儿",
    phone: "139-0000-3333",
    slots: ["evening"],
    note: "晚上陪护和观察夜间情况",
  },
];

function getSampleExpiryDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
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
      startDate: new Date().toISOString().split("T")[0],
      courseDays: 30,
      enableChecklist: true,
      completedSlots: {},
      stockQuantity: 8,
      singleDoseUnit: "片",
      singleDoseAmount: 1,
      packageSpec: "每盒 30 片（5mg/片）",
      refillThreshold: 10,
      purchaseLocation: "社区卫生服务中心 / 同济堂大药房",
      purchaseContact: "社区医院：027-8888-1111",
      expiryDate: getSampleExpiryDate(14),
      enableStock: true,
      consumedDoses: {},
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
      startDate: new Date().toISOString().split("T")[0],
      courseDays: 30,
      enableChecklist: true,
      completedSlots: {},
      stockQuantity: 52,
      singleDoseUnit: "片",
      singleDoseAmount: 1,
      packageSpec: "每盒 60 片（500mg/片）",
      refillThreshold: 15,
      purchaseLocation: "市人民医院门诊药房",
      purchaseContact: "慢病门诊：027-8888-2222",
      expiryDate: getSampleExpiryDate(8),
      enableStock: true,
      consumedDoses: {},
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
      startDate: new Date().toISOString().split("T")[0],
      courseDays: 30,
      enableChecklist: true,
      completedSlots: {},
      stockQuantity: 3,
      singleDoseUnit: "片",
      singleDoseAmount: 0.5,
      packageSpec: "每瓶 100 片（100mg/片）",
      refillThreshold: 10,
      purchaseLocation: "同仁堂药店（解放大道店）",
      purchaseContact: "药店电话：027-8888-3333",
      expiryDate: getSampleExpiryDate(3),
      enableStock: true,
      consumedDoses: {},
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
      startDate: new Date().toISOString().split("T")[0],
      courseDays: 30,
      enableChecklist: true,
      completedSlots: {},
      stockQuantity: 25,
      singleDoseUnit: "片",
      singleDoseAmount: 1,
      packageSpec: "每瓶 60 片",
      refillThreshold: 15,
      purchaseLocation: "京东健康 · 次日达",
      purchaseContact: "线上购买，凭处方",
      expiryDate: getSampleExpiryDate(20),
      enableStock: true,
      consumedDoses: {},
    },
  ],
  caregivers: SAMPLE_CAREGIVERS,
  handoverRecords: [],
};

export const DEFAULT_SETTINGS = {
  highContrast: false,
  fontSize: "large" as FontSizeLevel,
  showIcons: true,
  paperSize: "A4" as PaperSize,
  pocketMode: false,
  checklistGroupMode: "byDrug" as ChecklistGroupMode,
  checklistOrientation: "landscape" as ChecklistOrientation,
};
