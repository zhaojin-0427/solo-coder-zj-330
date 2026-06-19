export type TimeSlot = "morning" | "noon" | "evening";

export type MealRelation = "before" | "after" | "empty" | "any";

export type PaperSize = "A4" | "A5" | "label";

export type FontSizeLevel = "large" | "xlarge" | "xxlarge";

export interface Medicine {
  id: string;
  name: string;
  frequency: string;
  mealRelation: MealRelation;
  slots: TimeSlot[];
  dosage: string;
  notes: string;
  group: string;
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
