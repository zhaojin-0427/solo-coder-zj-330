import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { SLOT_LIST, mealMeta } from "@/lib/constants";
import {
  slotTheme,
  formatDate,
  getDayOfWeek,
  isDateInCourse,
  computeStockStatus,
} from "@/lib/format";
import { useMedStore } from "@/store/useMedStore";
import type {
  Medicine,
  Settings,
  TimeSlot,
  Caregiver,
  HandoverRecord,
} from "@/types";

interface PocketCardProps {
  name: string;
  medicines: Medicine[];
  settings: Settings;
  caregivers?: Caregiver[];
  handoverRecords?: HandoverRecord[];
}

export default function PocketCard({
  name,
  medicines,
  settings,
  caregivers = [],
  handoverRecords = [],
}: PocketCardProps) {
  const showIcons = settings.showIcons;
  const toggleChecklistSlot = useMedStore((s) => s.toggleChecklistSlot);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const todayCaregivers = useMemo(() => {
    const map = new Map<TimeSlot, Caregiver[]>();
    for (const slot of SLOT_LIST.map((s) => s.key)) {
      const slotCaregivers = caregivers.filter((c) => c.slots.includes(slot));
      map.set(slot, slotCaregivers);
    }
    return map;
  }, [caregivers]);

  const hasCaregivers = caregivers.length > 0;

  const todayChecklist = useMemo(() => {
    return medicines
      .filter((m) => m.enableChecklist && isDateInCourse(today, m.startDate, m.courseDays))
      .flatMap((m) =>
        m.slots.map((slot) => ({
          medicineId: m.id,
          medicineName: m.name,
          dosage: m.dosage,
          slot,
          isCompleted: (m.completedSlots[today] || []).includes(slot),
        })),
      );
  }, [medicines, today]);

  const groupBySlot = useMemo(() => {
    const map = new Map<TimeSlot, typeof todayChecklist>();
    for (const item of todayChecklist) {
      if (!map.has(item.slot)) map.set(item.slot, []);
      map.get(item.slot)!.push(item);
    }
    return map;
  }, [todayChecklist]);

  const refillSummary = useMemo(() => {
    const items: { name: string; status: "critical" | "low" | "expiring" | "expired" }[] = [];
    for (const m of medicines) {
      if (!m.enableStock) continue;
      const computed = computeStockStatus(m);
      if (computed.needRefill) {
        if (computed.isCritical || computed.isExpired) {
          items.push({ name: m.name, status: computed.isExpired ? "expired" : "critical" });
        } else if (computed.isLow) {
          items.push({ name: m.name, status: "low" });
        } else if (computed.isExpiring) {
          items.push({ name: m.name, status: "expiring" });
        }
      }
    }
    return items.slice(0, 6);
  }, [medicines]);

  const hasRefillItems = refillSummary.length > 0;

  return (
    <div className="paper-surface mx-auto w-full max-w-md overflow-hidden rounded-2xl border-2 border-paper-ink bg-white shadow-sticker print-shadow-none">
      <div className="flex items-center justify-between bg-amber px-3 py-2 text-white">
        <div>
          <p className="text-[0.6rem] font-bold uppercase tracking-widest opacity-90">
            随身服药卡
          </p>
          <h3 className="font-serif text-lg font-black leading-tight">
            {name || "服药方案"}
          </h3>
        </div>
        <span className="text-2xl">💊</span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-paper-line">
        {SLOT_LIST.map((s) => {
          const theme = slotTheme(s.key);
          const list = medicines.filter((m) => m.slots.includes(s.key));
          return (
            <div key={s.key} className={cn("min-h-0", theme.bg)}>
              <div
                className={cn(
                  "flex items-center justify-center gap-1 px-1 py-1.5 text-center",
                  theme.chip,
                )}
              >
                {showIcons && <span aria-hidden>{s.emoji}</span>}
                <span className="text-xs font-black">{s.label}</span>
              </div>
              <ul className="space-y-1 px-1.5 py-1.5">
                {list.length === 0 ? (
                  <li className="py-2 text-center text-[0.65rem] italic text-paper-muted">
                    无
                  </li>
                ) : (
                  list.map((m) => {
                    const meal = mealMeta(m.mealRelation);
                    return (
                      <li
                        key={m.id}
                        className={cn(
                          "rounded-md bg-white/80 px-1 py-1 text-paper-ink shadow-sm",
                        )}
                      >
                        <p className="text-[0.8rem] font-black leading-tight">
                          {m.name || "未命名"}
                        </p>
                        <p className="text-[0.65rem] font-bold text-amber-deep">
                          {m.dosage || "—"}
                        </p>
                        <p className="text-[0.6rem] text-paper-muted">
                          {showIcons ? `${meal.emoji} ` : ""}
                          {meal.label.replace("服用", "")}
                        </p>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="border-t-2 border-dashed border-paper-line bg-paper/40 px-3 py-1.5">
        <p className="text-[0.6rem] font-bold uppercase tracking-wider text-amber-deep">
          重要提醒
        </p>
        <p className="text-[0.7rem] leading-tight text-paper-ink">
          按时段服药，勿漏服勿加倍。如有不适请及时联系家人或医生。
        </p>
      </div>

      {hasCaregivers && (
        <div className="border-t-2 border-dashed border-paper-line bg-green-50 px-3 py-2">
          <p className="mb-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-green-700">
            今日照护联系人
          </p>
          <div className="space-y-1">
            {SLOT_LIST.map((slot) => {
              const list = todayCaregivers.get(slot.key) || [];
              if (list.length === 0) return null;
              const theme = slotTheme(slot.key);
              return (
                <div key={slot.key} className="flex items-start gap-1.5">
                  <span
                    className={cn(
                      "mt-0.5 flex-shrink-0 rounded px-1 text-[0.55rem] font-black",
                      theme.chip,
                    )}
                  >
                    {slot.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    {list.map((c, i) => (
                      <div
                        key={c.id}
                        className={cn(
                          "flex items-baseline justify-between gap-2",
                          i > 0 && "mt-0.5",
                        )}
                      >
                        <span className="truncate text-[0.7rem] font-bold text-paper-ink">
                          {c.name || "未命名"}
                          {c.relation && (
                            <span className="ml-1 text-[0.6rem] font-normal text-paper-muted">
                              ({c.relation})
                            </span>
                          )}
                        </span>
                        <span className="flex-shrink-0 font-mono text-[0.65rem] font-bold text-amber-deep">
                          {c.phone || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {todayChecklist.length > 0 && (
        <div className="border-t-2 border-dashed border-paper-line bg-amber-soft/30 px-3 py-2">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[0.6rem] font-bold uppercase tracking-wider text-amber-deep">
              今日服药核对
            </p>
            <p className="text-[0.55rem] font-bold text-paper-muted">
              {formatDate(today)} {getDayOfWeek(today)}
            </p>
          </div>
          <div className="space-y-1">
            {SLOT_LIST.map((slot) => {
              const items = groupBySlot.get(slot.key) || [];
              if (items.length === 0) return null;
              const theme = slotTheme(slot.key);
              return (
                <div key={slot.key}>
                  <div
                    className={cn(
                      "mb-0.5 inline-flex items-center gap-0.5 rounded px-1 py-0.5",
                      theme.chip,
                    )}
                  >
                    {showIcons && (
                      <span className="text-[0.6rem]" aria-hidden>
                        {slot.emoji}
                      </span>
                    )}
                    <span className="text-[0.55rem] font-black">
                      {slot.label} {slot.time}
                    </span>
                  </div>
                  <div className="space-y-0.5 pl-1">
                    {items.map((item) => (
                      <button
                        key={`${item.medicineId}-${item.slot}`}
                        type="button"
                        onClick={() =>
                          toggleChecklistSlot(
                            item.medicineId,
                            today,
                            item.slot,
                          )
                        }
                        className={cn(
                          "flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left transition",
                          item.isCompleted
                            ? "bg-green-100 text-green-700"
                            : "bg-white/80 text-paper-ink hover:bg-amber-tint/50",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-[0.6rem] font-black",
                            item.isCompleted
                              ? "border-green-600 bg-green-600 text-white"
                              : "border-paper-line text-paper-muted/50",
                          )}
                        >
                          {item.isCompleted ? "✓" : "□"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.65rem] font-bold leading-tight">
                            {item.medicineName}
                          </p>
                          {item.dosage && (
                            <p className="truncate text-[0.55rem] text-paper-muted">
                              {item.dosage}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasRefillItems && (
        <div className="border-t-2 border-dashed border-paper-line bg-red-50 px-3 py-2">
          <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-wider text-red-600">
            📌 近期需补药
          </p>
          <div className="flex flex-wrap gap-1">
            {refillSummary.map((item) => (
              <span
                key={item.name}
                className={cn(
                  "rounded px-1.5 py-0.5 text-[0.65rem] font-black text-white",
                  item.status === "critical"
                    ? "bg-red-500"
                    : item.status === "expired"
                      ? "bg-red-700"
                      : item.status === "low"
                        ? "bg-amber"
                        : "bg-orange-500",
                )}
              >
                {item.name}
                {item.status === "expired" && "（弃）"}
              </span>
            ))}
          </div>
          <p className="mt-1 text-[0.55rem] font-bold text-paper-muted">
            详见「补药清单」打印页
          </p>
        </div>
      )}
    </div>
  );
}
