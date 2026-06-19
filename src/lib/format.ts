import type { TimeSlot } from "@/types";
import { slotMeta } from "@/lib/constants";

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
