import { useMemo, useState } from "react";
import { CalendarDays, Layers, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateChecklistCells,
  groupCellsByDrug,
  groupCellsByDate,
  getMissedCount,
  formatDate,
  getDayOfWeek,
  slotTheme,
  addDays,
} from "@/lib/format";
import { SLOT_LIST } from "@/lib/constants";
import { useMedStore } from "@/store/useMedStore";
import type {
  Medicine,
  Settings,
  ChecklistCell,
  ChecklistGroupMode,
  ChecklistOrientation,
} from "@/types";

interface ChecklistViewProps {
  medicines: Medicine[];
  settings: Settings;
}

export default function ChecklistView({
  medicines,
  settings,
}: ChecklistViewProps) {
  const toggleChecklistSlot = useMedStore((s) => s.toggleChecklistSlot);
  const setChecklistGroupMode = useMedStore((s) => s.setChecklistGroupMode);
  const setChecklistOrientation = useMedStore((s) => s.setChecklistOrientation);
  const showIcons = settings.showIcons;

  const [weekOffset, setWeekOffset] = useState(0);

  const weekStartDate = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);
    return today.toISOString().split("T")[0];
  }, [weekOffset]);

  const cells = useMemo(() => {
    return generateChecklistCells(medicines, weekStartDate);
  }, [medicines, weekStartDate]);

  const missedCount = useMemo(() => getMissedCount(cells), [cells]);

  const weekDates = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(weekStartDate, i));
    }
    return dates;
  }, [weekStartDate]);

  const activeMedicines = medicines.filter((m) => m.enableChecklist);

  if (activeMedicines.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-paper-muted">暂无启用核对清单的药品</p>
        <p className="mt-1 text-sm text-paper-muted/70">
          请在药品录入中开启「启用核对」开关
        </p>
      </div>
    );
  }

  const renderCheckCell = (cell: ChecklistCell) => {
    const theme = slotTheme(cell.slot);
    const isCompleted = cell.isCompleted;
    const isMissed = cell.isMissed;
    const isInCourse = cell.isInCourse;

    if (!isInCourse) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-paper-shade/30 text-paper-muted/40">
          —
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() =>
          toggleChecklistSlot(cell.medicineId, cell.date, cell.slot)
        }
        className={cn(
          "flex h-full w-full items-center justify-center border-2 transition-all duration-200",
          isCompleted
            ? `${theme.chip} border-transparent`
            : isMissed
              ? "border-red-500 bg-red-50 text-red-600 animate-pulse"
              : `border-paper-line bg-white hover:border-amber`,
        )}
      >
        {isCompleted ? (
          <span className="text-lg font-black">✓</span>
        ) : isMissed ? (
          <span className="text-lg font-black">!</span>
        ) : (
          <span className="text-lg text-paper-muted/50">□</span>
        )}
      </button>
    );
  };

  const renderByDrug = () => {
    const grouped = groupCellsByDrug(cells);
    const medicineMap = new Map(medicines.map((m) => [m.id, m]));

    return (
      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([medId, medCells]) => {
          const medicine = medicineMap.get(medId);
          if (!medicine) return null;

          const cellsByDate = new Map<string, ChecklistCell[]>();
          for (const cell of medCells) {
            if (!cellsByDate.has(cell.date)) cellsByDate.set(cell.date, []);
            cellsByDate.get(cell.date)!.push(cell);
          }

          const medMissed = medCells.filter((c) => c.isMissed).length;

          return (
            <div key={medId} className="overflow-hidden rounded-xl border border-paper-line">
              <div className="flex items-center justify-between border-b border-paper-line bg-amber-soft/30 px-4 py-2">
                <div>
                  <h4 className="font-serif text-base font-black text-paper-ink">
                    {medicine.name}
                  </h4>
                  <p className="text-xs font-bold text-paper-muted">
                    {medicine.dosage} · {medicine.frequency}
                  </p>
                </div>
                {medMissed > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-black text-red-600">
                    漏服 {medMissed} 次
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-paper-shade/30">
                      <th className="border border-paper-line px-2 py-1.5 text-xs font-bold text-paper-muted">
                        日期
                      </th>
                      {SLOT_LIST.map((slot) => (
                        <th
                          key={slot.key}
                          className={cn(
                            "border border-paper-line px-2 py-1.5 text-xs font-bold",
                            slotTheme(slot.key).chip,
                          )}
                        >
                          {showIcons && <span className="mr-1">{slot.emoji}</span>}
                          {slot.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weekDates.map((date) => {
                      const dayCells = cellsByDate.get(date) || [];
                      const dayMissed = dayCells.filter((c) => c.isMissed).length;
                      return (
                        <tr key={date}>
                          <td
                            className={cn(
                              "border border-paper-line px-2 py-1 text-sm font-bold text-paper-ink",
                              dayMissed > 0 && "bg-red-50",
                            )}
                          >
                            <div>{formatDate(date)}</div>
                            <div className="text-xs font-normal text-paper-muted">
                              {getDayOfWeek(date)}
                            </div>
                          </td>
                          {SLOT_LIST.map((slot) => {
                            const cell = dayCells.find((c) => c.slot === slot.key);
                            return (
                              <td
                                key={slot.key}
                                className="border border-paper-line p-0.5"
                                style={{ width: "60px", height: "48px" }}
                              >
                                {cell ? (
                                  renderCheckCell(cell)
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-paper-shade/30 text-paper-muted/40">
                                    —
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderByDate = () => {
    const grouped = groupCellsByDate(cells);
    const medicineMap = new Map(medicines.map((m) => [m.id, m]));

    return (
      <div className="space-y-4">
        {weekDates.map((date) => {
          const dayCells = grouped.get(date) || [];
          const dayMissed = dayCells.filter((c) => c.isMissed).length;
          const cellsBySlot = new Map<string, ChecklistCell[]>();
          for (const cell of dayCells) {
            if (!cellsBySlot.has(cell.slot)) cellsBySlot.set(cell.slot, []);
            cellsBySlot.get(cell.slot)!.push(cell);
          }

          return (
            <div key={date} className="overflow-hidden rounded-xl border border-paper-line">
              <div
                className={cn(
                  "flex items-center justify-between border-b border-paper-line px-4 py-2",
                  dayMissed > 0 ? "bg-red-50" : "bg-amber-soft/30",
                )}
              >
                <div>
                  <h4 className="font-serif text-base font-black text-paper-ink">
                    {formatDate(date)}
                  </h4>
                  <p className="text-xs font-bold text-paper-muted">
                    {getDayOfWeek(date)}
                  </p>
                </div>
                {dayMissed > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-black text-red-600">
                    漏服 {dayMissed} 次
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-paper-shade/30">
                      <th className="border border-paper-line px-2 py-1.5 text-xs font-bold text-paper-muted">
                        药品
                      </th>
                      {SLOT_LIST.map((slot) => (
                        <th
                          key={slot.key}
                          className={cn(
                            "border border-paper-line px-2 py-1.5 text-xs font-bold",
                            slotTheme(slot.key).chip,
                          )}
                        >
                          {showIcons && <span className="mr-1">{slot.emoji}</span>}
                          {slot.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeMedicines.map((medicine) => {
                      const medCellsForDate = dayCells.filter(
                        (c) => c.medicineId === medicine.id,
                      );
                      return (
                        <tr key={medicine.id}>
                          <td className="border border-paper-line px-2 py-1 text-sm font-bold text-paper-ink">
                            <div>{medicine.name}</div>
                            <div className="text-xs font-normal text-paper-muted">
                              {medicine.dosage}
                            </div>
                          </td>
                          {SLOT_LIST.map((slot) => {
                            const cell = medCellsForDate.find(
                              (c) => c.slot === slot.key,
                            );
                            return (
                              <td
                                key={slot.key}
                                className="border border-paper-line p-0.5"
                                style={{ width: "60px", height: "48px" }}
                              >
                                {cell ? (
                                  renderCheckCell(cell)
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-paper-shade/30 text-paper-muted/40">
                                    —
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper-shade/40 p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-white/80 p-0.5">
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w - 1)}
              className="rounded-md px-3 py-1.5 text-sm font-bold text-paper-muted transition hover:bg-amber-tint hover:text-amber-deep"
            >
              ← 上周
            </button>
            <span className="px-3 py-1.5 text-sm font-black text-paper-ink">
              {formatDate(weekStartDate)} ~{" "}
              {formatDate(addDays(weekStartDate, 6))}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w + 1)}
              className="rounded-md px-3 py-1.5 text-sm font-bold text-paper-muted transition hover:bg-amber-tint hover:text-amber-deep"
            >
              下周 →
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="rounded-md bg-amber px-3 py-1.5 text-sm font-black text-zinc-900 transition hover:bg-amber-soft"
            >
              本周
            </button>
          </div>

          {missedCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-black text-red-600">
              ⚠️ 漏服 {missedCount} 次
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-white/80 p-0.5">
            <span className="px-2 text-xs font-bold text-paper-muted">
              <CalendarDays size={14} className="inline mr-1" />
              分组
            </span>
            <button
              type="button"
              onClick={() => setChecklistGroupMode("byDrug")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold transition",
                settings.checklistGroupMode === "byDrug"
                  ? "bg-amber text-zinc-900"
                  : "text-paper-muted hover:bg-amber-tint hover:text-amber-deep",
              )}
            >
              <Layers size={12} />
              按药品
            </button>
            <button
              type="button"
              onClick={() => setChecklistGroupMode("byDate")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold transition",
                settings.checklistGroupMode === "byDate"
                  ? "bg-amber text-zinc-900"
                  : "text-paper-muted hover:bg-amber-tint hover:text-amber-deep",
              )}
            >
              <Calendar size={12} />
              按日期
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-white/80 p-0.5">
            <span className="px-2 text-xs font-bold text-paper-muted">
              排版
            </span>
            <button
              type="button"
              onClick={() => setChecklistOrientation("portrait")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold transition",
                settings.checklistOrientation === "portrait"
                  ? "bg-amber text-zinc-900"
                  : "text-paper-muted hover:bg-amber-tint hover:text-amber-deep",
              )}
            >
              A4 纵向
            </button>
            <button
              type="button"
              onClick={() => setChecklistOrientation("landscape")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold transition",
                settings.checklistOrientation === "landscape"
                  ? "bg-amber text-zinc-900"
                  : "text-paper-muted hover:bg-amber-tint hover:text-amber-deep",
              )}
            >
              A4 横向
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 rounded-xl border-2 border-dashed border-amber-soft bg-amber-tint/20 p-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-morning text-white font-black">
            ✓
          </span>
          <span className="font-bold text-paper-ink">已服用</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-6 w-6 items-center justify-center rounded border-2 border-paper-line bg-white text-paper-muted/50 font-black">
            □
          </span>
          <span className="font-bold text-paper-ink">待服用</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-6 w-6 items-center justify-center rounded border-2 border-red-500 bg-red-50 text-red-600 font-black animate-pulse">
            !
          </span>
          <span className="font-bold text-red-600">漏服提醒</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-paper-shade/30 text-paper-muted/40">
            —
          </span>
          <span className="font-bold text-paper-ink">疗程外</span>
        </div>
      </div>

      {settings.checklistGroupMode === "byDrug"
        ? renderByDrug()
        : renderByDate()}
    </div>
  );
}
