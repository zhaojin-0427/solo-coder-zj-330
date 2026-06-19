import { cn } from "@/lib/utils";
import { SLOT_LIST, mealMeta } from "@/lib/constants";
import { slotTheme } from "@/lib/format";
import { useMedStore } from "@/store/useMedStore";
import type { Medicine, Settings, TimeSlot } from "@/types";

interface TimeCardProps {
  slot: TimeSlot;
  medicines: Medicine[];
  settings: Settings;
}

function TimeCard({ slot, medicines, settings }: TimeCardProps) {
  const theme = slotTheme(slot);
  const meta = SLOT_LIST.find((s) => s.key === slot)!;
  const showIcons = settings.showIcons;

  return (
    <div
      className={cn(
        "paper-surface overflow-hidden rounded-2xl border-2 bg-white shadow-panel",
        theme.border,
      )}
    >
      <div className={cn("flex items-center justify-between px-3 py-2", theme.bg)}>
        <div className="flex items-center gap-2">
          {showIcons && <span className="text-2xl" aria-hidden>{meta.emoji}</span>}
          <div>
            <p className={cn("font-serif text-lg font-black leading-none", theme.text)}>
              {meta.label}
            </p>
            <p className={cn("text-xs font-bold", theme.text)}>{meta.time} 服药</p>
          </div>
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-sm font-black", theme.chip)}>
          {medicines.length}
        </span>
      </div>

      <div className="divide-y divide-paper-line">
        {medicines.length === 0 ? (
          <p className="px-3 py-4 text-sm italic text-paper-muted">
            这个时段没有药品
          </p>
        ) : (
          medicines.map((m) => {
            const meal = mealMeta(m.mealRelation);
            return (
              <div key={m.id} className="px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-lg font-black text-paper-ink">
                    {m.name || "未命名药品"}
                  </p>
                  <span className="shrink-0 text-sm font-bold text-amber-deep">
                    {m.dosage || "—"}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-paper-shade px-1.5 py-0.5 text-xs font-semibold text-paper-muted">
                    {m.group}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-paper-shade px-1.5 py-0.5 text-xs font-semibold text-paper-ink">
                    {showIcons && <span aria-hidden>{meal.emoji}</span>}
                    {meal.label}
                  </span>
                  {m.notes && (
                    <span className="text-xs text-paper-muted">· {m.notes}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function TimeCardPanel() {
  const medicines = useMedStore((s) => s.medicines);
  const settings = useMedStore((s) => s.settings);

  return (
    <section className="app-surface flex h-full flex-col bg-paper-shade/40">
      <header className="border-b border-paper-line bg-paper/80 px-4 py-3 backdrop-blur">
        <h2 className="font-serif text-lg font-black text-paper-ink">
          时段卡
        </h2>
        <p className="text-xs text-paper-muted">
          按颜色区分的服药时段一览
        </p>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {SLOT_LIST.map((s) => (
          <TimeCard
            key={s.key}
            slot={s.key}
            medicines={medicines.filter((m) => m.slots.includes(s.key))}
            settings={settings}
          />
        ))}

        <div className="rounded-2xl border-2 border-dashed border-paper-line bg-white/50 p-3 text-center">
          <p className="text-sm font-semibold text-paper-muted">
            全天共 {medicines.length} 种药品
          </p>
          <p className="mt-0.5 text-xs text-paper-muted">
            提示：早中晚颜色便于老人快速分辨
          </p>
        </div>
      </div>
    </section>
  );
}
