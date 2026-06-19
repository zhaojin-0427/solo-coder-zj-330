import type { TimeSlot, Medicine, ChecklistCell } from "@/types";
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
