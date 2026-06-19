import { cn } from "@/lib/utils";
import { SLOT_LIST, mealMeta } from "@/lib/constants";
import { slotTheme } from "@/lib/format";
import type { Medicine, Settings } from "@/types";

interface PocketCardProps {
  name: string;
  medicines: Medicine[];
  settings: Settings;
}

export default function PocketCard({
  name,
  medicines,
  settings,
}: PocketCardProps) {
  const showIcons = settings.showIcons;

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
    </div>
  );
}
