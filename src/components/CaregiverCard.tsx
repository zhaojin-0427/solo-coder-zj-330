import { Trash2, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SLOT_LIST } from "@/lib/constants";
import { slotTheme } from "@/lib/format";
import { useMedStore } from "@/store/useMedStore";
import type { Caregiver } from "@/types";

interface CaregiverCardProps {
  caregiver: Caregiver;
  index: number;
  total: number;
}

export default function CaregiverCard({
  caregiver,
  index,
}: CaregiverCardProps) {
  const updateCaregiver = useMedStore((s) => s.updateCaregiver);
  const removeCaregiver = useMedStore((s) => s.removeCaregiver);
  const toggleCaregiverSlot = useMedStore((s) => s.toggleCaregiverSlot);
  const showIcons = useMedStore((s) => s.settings.showIcons);

  return (
    <div className="animate-fade-up rounded-2xl border border-paper-line bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber text-sm font-bold text-white">
            {index + 1}
          </span>
          <span className="text-sm font-bold text-paper-muted">
            照护者
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeCaregiver(caregiver.id)}
          aria-label="删除照护者"
          className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-bold text-paper-muted">
            姓名
          </label>
          <input
            value={caregiver.name}
            onChange={(e) =>
              updateCaregiver(caregiver.id, { name: e.target.value })
            }
            placeholder="例如：大儿子"
            className="w-full rounded-xl border-2 border-paper-line bg-paper/50 px-3 py-2 text-base font-bold text-paper-ink outline-none transition focus:border-amber"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-paper-muted">
            关系
          </label>
          <input
            value={caregiver.relation}
            onChange={(e) =>
              updateCaregiver(caregiver.id, { relation: e.target.value })
            }
            placeholder="例如：儿子"
            className="w-full rounded-xl border-2 border-paper-line bg-paper/50 px-3 py-2 text-base font-semibold text-paper-ink outline-none transition focus:border-amber"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="mb-1 flex items-center gap-1 text-sm font-bold text-paper-muted">
          {showIcons && <Phone size={14} />}
          联系电话
        </label>
        <input
          value={caregiver.phone}
          onChange={(e) =>
            updateCaregiver(caregiver.id, { phone: e.target.value })
          }
          placeholder="例如：138-0000-1234"
          className="w-full rounded-xl border-2 border-paper-line bg-paper/50 px-3 py-2 font-mono text-base font-semibold text-paper-ink outline-none transition focus:border-amber"
        />
      </div>

      <label className="mb-1 block text-sm font-bold text-paper-muted">
        常用照护时段（可多选）
      </label>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SLOT_LIST.map((s) => {
          const active = caregiver.slots.includes(s.key);
          const theme = slotTheme(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleCaregiverSlot(caregiver.id, s.key)}
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

      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-bold text-paper-muted">
          {showIcons && <User size={14} />}
          备注
        </label>
        <textarea
          value={caregiver.note}
          onChange={(e) =>
            updateCaregiver(caregiver.id, { note: e.target.value })
          }
          placeholder="例如：负责早晨送药和测血压"
          rows={2}
          className="w-full resize-y rounded-xl border-2 border-paper-line bg-paper/50 px-3 py-2 text-sm text-paper-ink outline-none transition focus:border-amber"
        />
      </div>
    </div>
  );
}
