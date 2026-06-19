import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FREQUENCY_PRESETS,
  GROUP_PRESETS,
  MEAL_LIST,
  SLOT_LIST,
} from "@/lib/constants";
import { slotTheme } from "@/lib/format";
import { useMedStore } from "@/store/useMedStore";
import type { Medicine } from "@/types";

interface MedicineCardProps {
  medicine: Medicine;
  index: number;
  total: number;
}

export default function MedicineCard({
  medicine,
  index,
  total,
}: MedicineCardProps) {
  const updateMedicine = useMedStore((s) => s.updateMedicine);
  const removeMedicine = useMedStore((s) => s.removeMedicine);
  const moveMedicine = useMedStore((s) => s.moveMedicine);
  const toggleSlot = useMedStore((s) => s.toggleSlot);
  const setMeal = useMedStore((s) => s.setMeal);
  const showIcons = useMedStore((s) => s.settings.showIcons);

  return (
    <div className="animate-fade-up rounded-2xl border border-paper-line bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber text-sm font-bold text-white">
          {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => moveMedicine(medicine.id, -1)}
            disabled={index === 0}
            aria-label="上移"
            className="rounded-lg p-1.5 text-paper-muted transition hover:bg-amber-tint hover:text-amber-deep disabled:opacity-30"
          >
            <ChevronUp size={18} />
          </button>
          <button
            type="button"
            onClick={() => moveMedicine(medicine.id, 1)}
            disabled={index === total - 1}
            aria-label="下移"
            className="rounded-lg p-1.5 text-paper-muted transition hover:bg-amber-tint hover:text-amber-deep disabled:opacity-30"
          >
            <ChevronDown size={18} />
          </button>
          <button
            type="button"
            onClick={() => removeMedicine(medicine.id)}
            aria-label="删除药品"
            className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <label className="mb-1 block text-sm font-bold text-paper-muted">
        药品名称
      </label>
      <input
        value={medicine.name}
        onChange={(e) => updateMedicine(medicine.id, { name: e.target.value })}
        placeholder="例如：氨氯地平片"
        className="mb-3 w-full rounded-xl border-2 border-paper-line bg-paper/50 px-3 py-2 text-lg font-bold text-paper-ink outline-none transition focus:border-amber"
      />

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-bold text-paper-muted">
            服用频次
          </label>
          <select
            value={
              FREQUENCY_PRESETS.includes(medicine.frequency)
                ? medicine.frequency
                : "__custom"
            }
            onChange={(e) =>
              e.target.value === "__custom"
                ? updateMedicine(medicine.id, { frequency: "自定义" })
                : updateMedicine(medicine.id, { frequency: e.target.value })
            }
            className="w-full rounded-xl border-2 border-paper-line bg-paper/50 px-2 py-2 font-semibold text-paper-ink outline-none focus:border-amber"
          >
            {FREQUENCY_PRESETS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
            <option value="__custom">自定义…</option>
          </select>
          {!FREQUENCY_PRESETS.includes(medicine.frequency) && (
            <input
              value={medicine.frequency}
              onChange={(e) =>
                updateMedicine(medicine.id, { frequency: e.target.value })
              }
              placeholder="自定义频次"
              className="mt-1.5 w-full rounded-lg border border-paper-line bg-paper/50 px-2 py-1 text-sm outline-none focus:border-amber"
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-paper-muted">
            分组
          </label>
          <select
            value={medicine.group}
            onChange={(e) =>
              updateMedicine(medicine.id, { group: e.target.value })
            }
            className="w-full rounded-xl border-2 border-paper-line bg-paper/50 px-2 py-2 font-semibold text-paper-ink outline-none focus:border-amber"
          >
            {GROUP_PRESETS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="mb-1 block text-sm font-bold text-paper-muted">
        饭前 / 饭后
      </label>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {MEAL_LIST.map((m) => {
          const active = medicine.mealRelation === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMeal(medicine.id, m.key)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition",
                active
                  ? "bg-amber text-white shadow-sm"
                  : "bg-paper-shade text-paper-ink hover:bg-amber-tint",
              )}
            >
              {showIcons && <span aria-hidden>{m.emoji}</span>}
              {m.label}
            </button>
          );
        })}
      </div>

      <label className="mb-1 block text-sm font-bold text-paper-muted">
        服药时段（可多选）
      </label>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SLOT_LIST.map((s) => {
          const active = medicine.slots.includes(s.key);
          const theme = slotTheme(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSlot(medicine.id, s.key)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border-2 px-2.5 py-1.5 text-sm font-bold transition",
                active
                  ? `${theme.chip} border-transparent text-white shadow-sm`
                  : "border-paper-line bg-white text-paper-muted hover:border-amber",
              )}
            >
              {showIcons && <span aria-hidden>{s.emoji}</span>}
              {s.label} {s.time}
            </button>
          );
        })}
      </div>

      <label className="mb-1 block text-sm font-bold text-paper-muted">
        单次剂量
      </label>
      <input
        value={medicine.dosage}
        onChange={(e) => updateMedicine(medicine.id, { dosage: e.target.value })}
        placeholder="例如：1 片（5mg）"
        className="mb-3 w-full rounded-xl border-2 border-paper-line bg-paper/50 px-3 py-2 font-semibold text-paper-ink outline-none focus:border-amber"
      />

      <label className="mb-1 block text-sm font-bold text-paper-muted">
        注意事项
      </label>
      <textarea
        value={medicine.notes}
        onChange={(e) => updateMedicine(medicine.id, { notes: e.target.value })}
        placeholder="例如：服药后避免起身过快"
        rows={2}
        className="w-full resize-y rounded-xl border-2 border-paper-line bg-paper/50 px-3 py-2 text-base text-paper-ink outline-none focus:border-amber"
      />
    </div>
  );
}
