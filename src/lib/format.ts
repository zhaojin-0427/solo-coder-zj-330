import type { TimeSlot, Medicine, ChecklistCell, StockStatus } from "@/types";
import { slotMeta, SLOT_LIST } from "@/lib/constants";

interface SlotTheme {
  label: string;
  time: string;
  emoji: string;
  bg: string;
  text: string;
  border: string;
  chip: string;
  bar: string;
  ring: string;
}

const THEMES: Record<TimeSlot, SlotTheme> = {
  morning: {
    label: "晨",
    time: "07:00",
    emoji: "☀️",
    bg: "bg-morning-soft",
    text: "text-morning-ink",
    border: "border-morning",
    chip: "bg-morning text-white",
    bar: "bg-morning",
    ring: "ring-morning",
  },
  noon: {
    label: "午",
    time: "12:00",
    emoji: "🌞",
    bg: "bg-noon-soft",
    text: "text-noon-ink",
    border: "border-noon",
    chip: "bg-noon text-white",
    bar: "bg-noon",
    ring: "ring-noon",
  },
  evening: {
    label: "晚",
    time: "19:00",
    emoji: "🌙",
    bg: "bg-evening-soft",
    text: "text-evening-ink",
    border: "border-evening",
    chip: "bg-evening text-white",
    bar: "bg-evening",
    ring: "ring-evening",
  },
};

export function slotTheme(slot: TimeSlot): SlotTheme {
  return THEMES[slot];
}

export function shortSlot(slot: TimeSlot): string {
  return slotMeta(slot).label;
}

export function formatTime(time: string): string {
  return time.replace(":", "：");
}

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

export function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr);
  return WEEKDAYS[date.getDay()];
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function getDateRange(startDate: string, days: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(addDays(startDate, i));
  }
  return dates;
}

export function isDateInCourse(date: string, startDate: string, courseDays: number): boolean {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setDate(end.getDate() + courseDays - 1);
  return d >= start && d <= end;
}

export function isDatePast(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

export function generateChecklistCells(
  medicines: Medicine[],
  weekStartDate?: string
): ChecklistCell[] {
  const cells: ChecklistCell[] = [];
  const startDate = weekStartDate || new Date().toISOString().split("T")[0];
  const weekDates = getDateRange(startDate, 7);

  for (const medicine of medicines) {
    if (!medicine.enableChecklist) continue;

    for (const date of weekDates) {
      const inCourse = isDateInCourse(date, medicine.startDate, medicine.courseDays);
      const completedForDate = medicine.completedSlots[date] || [];
      const isPast = isDatePast(date);

      for (const slot of medicine.slots) {
        const isCompleted = completedForDate.includes(slot);
        const isMissed = isPast && inCourse && !isCompleted;

        cells.push({
          medicineId: medicine.id,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          date,
          dayOfWeek: getDayOfWeek(date),
          slot,
          isInCourse: inCourse,
          isCompleted,
          isMissed,
        });
      }
    }
  }

  return cells;
}

export function groupCellsByDrug(cells: ChecklistCell[]): Map<string, ChecklistCell[]> {
  const map = new Map<string, ChecklistCell[]>();
  for (const cell of cells) {
    const key = cell.medicineId;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(cell);
  }
  return map;
}

export function groupCellsByDate(cells: ChecklistCell[]): Map<string, ChecklistCell[]> {
  const map = new Map<string, ChecklistCell[]>();
  for (const cell of cells) {
    const key = cell.date;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(cell);
  }
  return map;
}

export function getWeekDates(referenceDate?: string): string[] {
  const start = referenceDate || new Date().toISOString().split("T")[0];
  return getDateRange(start, 7);
}

export function getMissedCount(cells: ChecklistCell[]): number {
  return cells.filter((c) => c.isMissed).length;
}

export interface StockComputed {
  dailyConsumption: number;
  remainingDays: number;
  stockStatus: StockStatus;
  daysToExpiry: number;
  isExpiring: boolean;
  isExpired: boolean;
  isCritical: boolean;
  isLow: boolean;
  isNormal: boolean;
  needRefill: boolean;
  effectiveStock: number;
  totalConsumed: number;
}

export function computeStockStatus(medicine: Medicine): StockComputed {
  const dailyConsumption = computeDailyConsumption(medicine);
  const remainingDays = computeRemainingDays(medicine);
  const daysToExpiry = getDaysToExpiry(medicine.expiryDate);
  const totalConsumed = getTotalConsumed(medicine);
  const effectiveStock = Math.max(0, (medicine.stockQuantity || 0) - totalConsumed);

  const isExpired = daysToExpiry < 0;
  const isExpiring = daysToExpiry >= 0 && daysToExpiry <= 30;

  let stockStatus: StockStatus;
  if (!medicine.enableStock) {
    stockStatus = "normal";
  } else if (isExpired) {
    stockStatus = "expired";
  } else if (remainingDays < 0) {
    stockStatus = "normal";
  } else if (remainingDays <= 0) {
    stockStatus = "critical";
  } else if (remainingDays <= (medicine.refillThreshold || 7)) {
    stockStatus = "low";
  } else if (isExpiring && remainingDays > (medicine.refillThreshold || 7)) {
    stockStatus = "expiring";
  } else {
    stockStatus = "normal";
  }

  return {
    dailyConsumption,
    remainingDays,
    stockStatus,
    daysToExpiry,
    isExpiring,
    isExpired,
    isCritical: stockStatus === "critical",
    isLow: stockStatus === "low",
    isNormal: stockStatus === "normal",
    needRefill: stockStatus === "critical" || stockStatus === "low" || stockStatus === "expired" || stockStatus === "expiring",
    effectiveStock,
    totalConsumed,
  };
}

export function parseSingleDoseAmount(dosage: string): number {
  if (!dosage) return 1;
  const cnMap: Record<string, number> = {
    "半": 0.5, "1/2": 0.5, "½": 0.5, "零点五": 0.5, "零點五": 0.5,
    "一": 1, "两": 2, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10,
  };
  for (const cn of Object.keys(cnMap).sort((a, b) => b.length - a.length)) {
    if (dosage.includes(cn)) return cnMap[cn];
  }
  const match = dosage.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const val = parseFloat(match[1]);
    if (val > 0) return val;
  }
  return 1;
}

export function getSingleDoseAmount(medicine: Medicine): number {
  if (medicine.singleDoseAmount && medicine.singleDoseAmount > 0) return medicine.singleDoseAmount;
  return parseSingleDoseAmount(medicine.dosage);
}

export function getTotalConsumed(medicine: Medicine): number {
  if (!medicine.consumedDoses) return 0;
  return Object.values(medicine.consumedDoses).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0);
}

export function computeDailyConsumption(medicine: Medicine): number {
  const slotsPerDay = (medicine.slots || []).length;
  if (slotsPerDay <= 0) return 0;
  const singleDose = getSingleDoseAmount(medicine);
  return slotsPerDay * singleDose;
}

export function computeRemainingDays(medicine: Medicine): number {
  if (!medicine.enableStock) return -1;
  const daily = computeDailyConsumption(medicine);
  if (daily <= 0) return -1;
  const stock = (medicine.stockQuantity || 0) - getTotalConsumed(medicine);
  if (stock <= 0) return 0;
  return Math.floor(stock / daily);
}

export function getDaysToExpiry(expiryDate: string): number {
  if (!expiryDate) return 9999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export const STOCK_STATUS_META: Record<StockStatus, { label: string; bg: string; text: string; ring: string; dot: string; emoji: string }> = {
  normal: {
    label: "库存正常",
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-200",
    dot: "bg-green-500",
    emoji: "✅",
  },
  low: {
    label: "即将不足",
    bg: "bg-amber-50",
    text: "text-amber-deep",
    ring: "ring-amber-soft",
    dot: "bg-amber",
    emoji: "⚠️",
  },
  critical: {
    label: "库存不足",
    bg: "bg-red-50",
    text: "text-red-600",
    ring: "ring-red-200",
    dot: "bg-red-500",
    emoji: "🚨",
  },
  expiring: {
    label: "临近过期",
    bg: "bg-orange-50",
    text: "text-orange-600",
    ring: "ring-orange-200",
    dot: "bg-orange-500",
    emoji: "📅",
  },
  expired: {
    label: "已过期",
    bg: "bg-red-100",
    text: "text-red-700",
    ring: "ring-red-300",
    dot: "bg-red-600",
    emoji: "❌",
  },
};
