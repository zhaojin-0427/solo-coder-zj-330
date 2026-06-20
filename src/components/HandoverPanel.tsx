import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SLOT_LIST, HANDOVER_ITEMS } from "@/lib/constants";
import { slotTheme, formatDate, getDayOfWeek } from "@/lib/format";
import { useMedStore } from "@/store/useMedStore";
import type { TimeSlot, HandoverItemKey } from "@/types";

interface HandoverSlotCardProps {
  date: string;
  slot: TimeSlot;
}

function HandoverSlotCard({ date, slot }: HandoverSlotCardProps) {
  const theme = slotTheme(slot);
  const meta = SLOT_LIST.find((s) => s.key === slot)!;
  const showIcons = useMedStore((s) => s.settings.showIcons);
  const caregivers = useMedStore((s) => s.caregivers);
  const getHandoverRecord = useMedStore((s) => s.getHandoverRecord);
  const toggleHandoverItem = useMedStore((s) => s.toggleHandoverItem);
  const setHandoverCaregiver = useMedStore((s) => s.setHandoverCaregiver);
  const setHandoverNote = useMedStore((s) => s.setHandoverNote);

  const record = useMemo(
    () => getHandoverRecord(date, slot),
    [getHandoverRecord, date, slot],
  );

  const assignedCaregiver = useMemo(() => {
    if (!record?.caregiverId) return null;
    return caregivers.find((c) => c.id === record.caregiverId) || null;
  }, [record, caregivers]);

  const suggestedCaregivers = useMemo(() => {
    return caregivers.filter((c) => c.slots.includes(slot));
  }, [caregivers, slot]);

  const completedCount = useMemo(() => {
    if (!record) return 0;
    return Object.values(record.items).filter(Boolean).length;
  }, [record]);

  const totalItems = HANDOVER_ITEMS.length;
  const isAllDone = completedCount === totalItems;

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
            <p className={cn("text-xs font-bold", theme.text)}>{meta.time} 交接</p>
          </div>
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-sm font-black", theme.chip)}>
          {completedCount}/{totalItems}
        </span>
      </div>

      <div className="space-y-2 p-3">
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-bold text-paper-muted">
            {showIcons && <UserCheck size={12} />}
            当值照护者
          </label>
          <div className="flex flex-wrap gap-1">
            {caregivers.length === 0 ? (
              <p className="text-xs italic text-paper-muted">
                请先在「照护者」中添加家庭成员
              </p>
            ) : (
              caregivers.map((c) => {
                const isSelected = record?.caregiverId === c.id;
                const isSuggested = c.slots.includes(slot);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setHandoverCaregiver(
                        date,
                        slot,
                        isSelected ? null : c.id,
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-bold transition",
                      isSelected
                        ? "border-transparent bg-amber text-white shadow-sm"
                        : isSuggested
                          ? "border-amber/40 bg-amber-tint/30 text-amber-deep hover:border-amber"
                          : "border-paper-line bg-white text-paper-muted hover:border-amber",
                    )}
                  >
                    {c.name || "未命名"}
                    {isSuggested && showIcons && <span>⭐</span>}
                  </button>
                );
              })
            )}
          </div>
          {suggestedCaregivers.length > 0 && !assignedCaregiver && (
            <p className="mt-1 text-[0.65rem] text-paper-muted">
              ⭐ 为该时段常用照护者
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-paper-muted">
            交接项目
          </label>
          <div className="space-y-1.5">
            {HANDOVER_ITEMS.map((item) => {
              const isChecked = record?.items[item.key] ?? false;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleHandoverItem(date, slot, item.key as HandoverItemKey)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition",
                    isChecked
                      ? "bg-green-100 text-green-800"
                      : "bg-paper-shade/50 text-paper-ink hover:bg-amber-tint/30",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 text-xs font-black",
                      isChecked
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-paper-line text-paper-muted/30",
                    )}
                  >
                    {isChecked ? "✓" : "□"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-tight">
                      {showIcons && <span className="mr-1">{item.emoji}</span>}
                      {item.label}
                    </p>
                    <p className="text-[0.65rem] text-paper-muted/80">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-bold text-paper-muted">
            {showIcons && <MessageSquare size={12} />}
            交接备注
          </label>
          <textarea
            value={record?.note ?? ""}
            onChange={(e) => setHandoverNote(date, slot, e.target.value)}
            placeholder="记录特殊情况或需要注意的事项..."
            rows={2}
            className="w-full resize-y rounded-lg border-2 border-paper-line bg-paper/50 px-2 py-1.5 text-sm text-paper-ink outline-none transition focus:border-amber"
          />
        </div>

        {isAllDone && (
          <div className="rounded-lg bg-green-100 px-3 py-2 text-center">
            <p className="text-sm font-black text-green-700">
              ✓ 本时段交接已完成
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HandoverPanel() {
  const [dateOffset, setDateOffset] = useState(0);
  const showIcons = useMedStore((s) => s.settings.showIcons);

  const currentDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dateOffset);
    return d.toISOString().split("T")[0];
  }, [dateOffset]);

  const isToday = dateOffset === 0;

  return (
    <section className="app-surface flex h-full flex-col bg-paper-shade/40">
      <header className="border-b border-paper-line bg-paper/80 px-4 py-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-black text-paper-ink">
              交接清单
            </h2>
            <p className="text-xs text-paper-muted">
              按日期查看早/中/晚交接状态
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-white/80 p-0.5">
          <button
            type="button"
            onClick={() => setDateOffset((d) => d - 1)}
            className="rounded-md px-2.5 py-1.5 text-sm font-bold text-paper-muted transition hover:bg-amber-tint hover:text-amber-deep"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-1 items-center justify-center gap-2">
            {showIcons && <Calendar size={16} className="text-amber-deep" />}
            <span className="text-sm font-black text-paper-ink">
              {formatDate(currentDate)}
            </span>
            <span className="text-sm font-bold text-paper-muted">
              {getDayOfWeek(currentDate)}
            </span>
            {isToday && (
              <span className="rounded-full bg-amber px-2 py-0.5 text-[0.6rem] font-black text-white">
                今天
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDateOffset((d) => d + 1)}
            className="rounded-md px-2.5 py-1.5 text-sm font-bold text-paper-muted transition hover:bg-amber-tint hover:text-amber-deep"
          >
            <ChevronRight size={18} />
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={() => setDateOffset(0)}
              className="rounded-md bg-amber px-3 py-1.5 text-xs font-black text-zinc-900 transition hover:bg-amber-soft"
            >
              今天
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {SLOT_LIST.map((s) => (
          <HandoverSlotCard key={s.key} date={currentDate} slot={s.key} />
        ))}

        <div className="rounded-2xl border-2 border-dashed border-paper-line bg-white/50 p-3">
          <p className="text-sm font-semibold text-paper-muted">
            💡 交接提示
          </p>
          <ul className="mt-1 space-y-1 text-xs text-paper-muted">
            <li>• 每位照护者完成本时段工作后，请勾选对应的交接项</li>
            <li>• 如有特殊情况或需要下一班注意的事项，请填写在备注中</li>
            <li>• 所有交接记录随方案保存在本地，不上传任何隐私数据</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
