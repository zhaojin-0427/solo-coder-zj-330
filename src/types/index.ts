export type TimeSlot = "morning" | "noon" | "evening";

export type MealRelation = "before" | "after" | "empty" | "any";

export type PaperSize = "A4" | "A5" | "label";

export type FontSizeLevel = "large" | "xlarge" | "xxlarge";

export type ChecklistGroupMode = "byDrug" | "byDate";

export type ChecklistOrientation = "portrait" | "landscape";

export interface Medicine {
  id: string;
  name: string;
  frequency: string;
  mealRelation: MealRelation;
  slots: TimeSlot[];
  dosage: string;
  notes: string;
  group: string;
  startDate: string;
  courseDays: number;
  enableChecklist: boolean;
  completedSlots: Record<string, TimeSlot[]>;
}

export interface Scheme {
  id: string;
  name: string;
  medicines: Medicine[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  highContrast: boolean;
  fontSize: FontSizeLevel;
  showIcons: boolean;
  paperSize: PaperSize;
  pocketMode: boolean;
  checklistGroupMode: ChecklistGroupMode;
  checklistOrientation: ChecklistOrientation;
}

export interface ChecklistCell {
  medicineId: string;
  medicineName: string;
  dosage: string;
  date: string;
  dayOfWeek: string;
  slot: TimeSlot;
  isInCourse: boolean;
  isCompleted: boolean;
  isMissed: boolean;
}

export interface DateSlotKey {
  date: string;
  slot: TimeSlot;
}

export interface SlotMeta {
  key: TimeSlot;
  label: string;
  time: string;
  emoji: string;
}

export interface MealMeta {
  key: MealRelation;
  label: string;
  emoji: string;
}
