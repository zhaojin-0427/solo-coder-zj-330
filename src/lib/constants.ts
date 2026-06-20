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
  SymptomType,
  SeverityLevel,
  DurationUnit,
  ObservationRecord,
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

export interface SymptomMeta {
  key: SymptomType;
  label: string;
  emoji: string;
}

export const SYMPTOM_LIST: SymptomMeta[] = [
  { key: "dizziness", label: "头晕", emoji: "💫" },
  { key: "nausea", label: "恶心", emoji: "🤢" },
  { key: "headache", label: "头痛", emoji: "🤕" },
  { key: "stomachache", label: "腹痛", emoji: "🫄" },
  { key: "fatigue", label: "乏力", emoji: "😮‍💨" },
  { key: "rash", label: "皮疹", emoji: "🔴" },
  { key: "palpitation", label: "心慌", emoji: "💓" },
  { key: "drowsiness", label: "嗜睡", emoji: "😴" },
  { key: "insomnia", label: "失眠", emoji: "🌙" },
  { key: "constipation", label: "便秘", emoji: "🚫" },
  { key: "diarrhea", label: "腹泻", emoji: "💧" },
  { key: "dry_mouth", label: "口干", emoji: "👄" },
  { key: "appetite_loss", label: "食欲减退", emoji: "🍽️" },
  { key: "weight_change", label: "体重变化", emoji: "⚖️" },
  { key: "other", label: "其他", emoji: "📝" },
];

export interface SeverityMeta {
  key: SeverityLevel;
  label: string;
  emoji: string;
  bg: string;
  text: string;
  border: string;
  ring: string;
  dot: string;
}

export const SEVERITY_LIST: SeverityMeta[] = [
  {
    key: "mild",
    label: "轻微",
    emoji: "🟢",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-300",
    ring: "ring-green-200",
    dot: "bg-green-500",
  },
  {
    key: "moderate",
    label: "中度",
    emoji: "🟡",
    bg: "bg-amber-50",
    text: "text-amber-deep",
    border: "border-amber-300",
    ring: "ring-amber-200",
    dot: "bg-amber",
  },
  {
    key: "severe",
    label: "严重",
    emoji: "🔴",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-400",
    ring: "ring-red-200",
    dot: "bg-red-500",
  },
];

export interface DurationUnitMeta {
  key: DurationUnit;
  label: string;
  short: string;
}

export const DURATION_UNIT_LIST: DurationUnitMeta[] = [
  { key: "minutes", label: "分钟", short: "分钟" },
  { key: "hours", label: "小时", short: "小时" },
  { key: "days", label: "天", short: "天" },
];

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

export function symptomMeta(key: SymptomType): SymptomMeta {
  return SYMPTOM_LIST.find((s) => s.key === key) ?? SYMPTOM_LIST[14];
}

export function severityMeta(key: SeverityLevel): SeverityMeta {
  return SEVERITY_LIST.find((s) => s.key === key) ?? SEVERITY_LIST[0];
}

export function durationUnitMeta(key: DurationUnit): DurationUnitMeta {
  return DURATION_UNIT_LIST.find((d) => d.key === key) ?? DURATION_UNIT_LIST[1];
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

function getSampleObservationRecords(): ObservationRecord[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  return [
    {
      id: "obs-1",
      date: twoDaysAgo.toISOString().split("T")[0],
      timeSlot: "morning",
      medicineId: "m-1",
      symptomTypes: ["dizziness", "fatigue"],
      severity: "mild",
      duration: { value: 2, unit: "hours" },
      stoppedMedication: false,
      consultedDoctor: false,
      treatment: "躺下休息片刻后缓解",
      notes: "服药后起身时感到轻微头晕，已提醒下次慢起",
      createdAt: twoDaysAgo.getTime(),
      updatedAt: twoDaysAgo.getTime(),
    },
    {
      id: "obs-2",
      date: yesterday.toISOString().split("T")[0],
      timeSlot: "morning",
      medicineId: "m-1",
      symptomTypes: ["dizziness"],
      severity: "mild",
      duration: { value: 30, unit: "minutes" },
      stoppedMedication: false,
      consultedDoctor: false,
      treatment: "坐著休息，喝了杯温水",
      notes: "比前天情况好转，继续观察",
      createdAt: yesterday.getTime(),
      updatedAt: yesterday.getTime(),
    },
    {
      id: "obs-3",
      date: yesterday.toISOString().split("T")[0],
      timeSlot: "evening",
      medicineId: "m-2",
      symptomTypes: ["nausea", "stomachache"],
      severity: "moderate",
      duration: { value: 1, unit: "hours" },
      stoppedMedication: false,
      consultedDoctor: true,
      treatment: "饭后立即服用，喝些姜茶缓解",
      notes: "昨天开始服用二甲双胍后胃部不适，已电话咨询社区医生，建议改为饭后立即服用",
      createdAt: yesterday.getTime(),
      updatedAt: yesterday.getTime(),
    },
  ];
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
  observationRecords: getSampleObservationRecords(),
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
