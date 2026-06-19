import { cn } from "@/lib/utils";
import { mealMeta, slotMeta } from "@/lib/constants";
import { slotTheme } from "@/lib/format";
import type { Medicine, Settings } from "@/types";

interface StickerLabelProps {
  medicine: Medicine;
  settings: Settings;
  className?: string;
  compact?: boolean;
}

export default function StickerLabel({
  medicine,
  settings,
  className,
  compact = false,
}: StickerLabelProps) {
  const showIcons = settings.showIcons;
  const meal = mealMeta(medicine.mealRelation);
  const dominantSlot = medicine.slots[0];

  return (
    <div
      className={cn(
        "paper-surface relative flex flex-col overflow-hidden rounded-2xl border-2 border-paper-line bg-white shadow-sticker print-shadow-none",
        compact ? "p-3" : "p-4 sm:p-5",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-2",
          dominantSlot ? slotTheme(dominantSlot).bar : "bg-amber",
        )}
      />

      <div className="mb-1 flex items-center justify-between gap-2 pt-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-tint px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wide text-amber-deep">
          {medicine.group || "未分组"}
        </span>
        <span className="text-[0.7rem] font-semibold text-paper-muted">
          {medicine.frequency}
        </span>
      </div>

      <h3
        className={cn(
          "font-serif font-black leading-tight text-paper-ink",
          compact ? "text-2xl" : "text-3xl sm:text-4xl",
        )}
      >
        {medicine.name || "药品名称"}
      </h3>

      {medicine.dosage && (
        <p
          className={cn(
            "mt-1 font-bold text-amber-deep",
            compact ? "text-base" : "text-lg",
          )}
        >
          每次 {medicine.dosage}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="hc-invert inline-flex items-center gap-1.5 rounded-lg bg-paper-shade px-2.5 py-1 text-sm font-semibold text-paper-ink">
          {showIcons && <span aria-hidden>{meal.emoji}</span>}
          {meal.label}
        </span>

        <div className="flex flex-wrap gap-1.5">
          {medicine.slots.length === 0 ? (
            <span className="text-sm italic text-paper-muted">未设置时段</span>
          ) : (
            medicine.slots.map((slot) => {
              const theme = slotTheme(slot);
              const meta = slotMeta(slot);
              return (
                <span
                  key={slot}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-bold text-white",
                    theme.chip,
                  )}
                >
                  {showIcons && <span aria-hidden>{meta.emoji}</span>}
                  {meta.label} {meta.time}
                </span>
              );
            })
          )}
        </div>
      </div>

      {medicine.notes && (
        <div className="mt-3 rounded-xl border border-dashed border-amber-soft bg-amber-tint/40 p-2.5">
          <p className="text-[0.7rem] font-bold uppercase tracking-wider text-amber-deep">
            注意
          </p>
          <p
            className={cn(
              "mt-0.5 font-medium leading-relaxed text-paper-ink",
              compact ? "text-sm" : "text-base",
            )}
          >
            {medicine.notes}
          </p>
        </div>
      )}

      <div className="mt-3 cut-line h-0.5 w-full opacity-50" />
      <p className="mt-1 text-[0.6rem] text-paper-muted">
        沿虚线裁剪贴于药盒
      </p>
    </div>
  );
}
