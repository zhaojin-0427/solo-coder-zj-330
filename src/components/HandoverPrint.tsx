import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  SLOT_LIST,
  HANDOVER_ITEMS,
  handoverItemMeta,
} from "@/lib/constants";
import {
  slotTheme,
  formatDate,
  getDayOfWeek,
  addDays,
} from "@/lib/format";
import type {
  Settings,
  Caregiver,
  HandoverRecord,
  TimeSlot,
} from "@/types";

interface HandoverPrintProps {
  settings: Settings;
  caregivers: Caregiver[];
  handoverRecords: HandoverRecord[];
  schemeName: string;
}

export default function HandoverPrint({
  settings,
  caregivers,
  handoverRecords,
  schemeName,
}: HandoverPrintProps) {
  const showIcons = settings.showIcons;
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStartDate = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);
    return today.toISOString().split("T")[0];
  }, [weekOffset]);

  const weekDates = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(weekStartDate, i));
    }
    return dates;
  }, [weekStartDate]);

  const getRecord = (date: string, slot: TimeSlot) => {
    return handoverRecords.find((r) => r.date === date && r.slot === slot);
  };

  const getCaregiverName = (caregiverId: string | null | undefined) => {
    if (!caregiverId) return "—";
    const c = caregivers.find((c) => c.id === caregiverId);
    return c?.name || "—";
  };

  const getSlotCaregivers = (slot: TimeSlot) => {
    return caregivers.filter((c) => c.slots.includes(slot));
  };

  return (
    <div className="w-full print:text-[12px]">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper-shade/40 p-3">
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
              {formatDate(weekStartDate)} ~ {formatDate(addDays(weekStartDate, 6))}
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
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-paper-ink bg-amber-tint/30 p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-black text-paper-ink">
                {schemeName || "服药方案"} — 交接清单
              </h3>
              <p className="text-sm text-paper-muted">
                {formatDate(weekStartDate)} ~ {formatDate(addDays(weekStartDate, 6))}
                （共 7 天）
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-paper-muted">打印日期</p>
              <p className="text-sm font-black text-paper-ink">
                {formatDate(new Date().toISOString().split("T")[0])}
              </p>
            </div>
          </div>
        </div>

        {caregivers.length > 0 && (
          <div className="border border-paper-line bg-white">
            <div className="border-b border-paper-line bg-paper-shade/50 px-3 py-2">
              <h4 className="text-sm font-black text-paper-ink">
                📋 照护者通讯录
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
              {caregivers.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-paper-line bg-paper/30 p-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-black text-paper-ink">
                      {c.name || "未命名"}
                    </p>
                    <span className="text-xs font-bold text-paper-muted">
                      {c.relation || "—"}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-amber-deep">
                    {c.phone || "无电话"}
                  </p>
                  {c.slots.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {c.slots.map((s) => {
                        const theme = slotTheme(s);
                        return (
                          <span
                            key={s}
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[0.6rem] font-bold",
                              theme.chip,
                            )}
                          >
                            {showIcons && (
                              <span className="mr-0.5">
                                {SLOT_LIST.find((x) => x.key === s)?.emoji}
                              </span>
                            )}
                            {SLOT_LIST.find((x) => x.key === s)?.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {c.note && (
                    <p className="mt-1 text-[0.65rem] text-paper-muted">
                      {c.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border border-paper-line bg-white">
          <div className="border-b border-paper-line bg-paper-shade/50 px-3 py-2">
            <h4 className="text-sm font-black text-paper-ink">
              📝 每日交接记录
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-soft/30">
                  <th className="border border-paper-line px-2 py-2 text-left font-black text-paper-ink">
                    日期
                  </th>
                  {SLOT_LIST.map((s) => {
                    const theme = slotTheme(s.key);
                    return (
                      <th
                        key={s.key}
                        className={cn(
                          "border border-paper-line px-2 py-2 font-black",
                          theme.chip,
                        )}
                      >
                        {showIcons && <span className="mr-1">{s.emoji}</span>}
                        {s.label} {s.time}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {weekDates.map((date) => (
                  <tr key={date}>
                    <td className="border border-paper-line bg-paper-shade/20 px-2 py-1.5 align-top">
                      <p className="font-black text-paper-ink">
                        {formatDate(date)}
                      </p>
                      <p className="text-xs text-paper-muted">
                        {getDayOfWeek(date)}
                      </p>
                    </td>
                    {SLOT_LIST.map((s) => {
                      const record = getRecord(date, s.key);
                      const slotCaregivers = getSlotCaregivers(s.key);
                      const caregiverName = getCaregiverName(
                        record?.caregiverId,
                      );
                      const completedItems = record
                        ? Object.values(record.items).filter(Boolean).length
                        : 0;
                      const totalItems = HANDOVER_ITEMS.length;
                      return (
                        <td
                          key={s.key}
                          className="border border-paper-line px-2 py-1.5 align-top"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-paper-muted">
                                当值：
                              </span>
                              <span className="text-xs font-black text-amber-deep">
                                {record?.caregiverId
                                  ? caregiverName
                                  : slotCaregivers.length > 0
                                    ? slotCaregivers[0].name
                                    : "—"}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              {HANDOVER_ITEMS.map((item) => {
                                const meta = handoverItemMeta(item.key);
                                const isChecked =
                                  record?.items[item.key] ?? false;
                                return (
                                  <div
                                    key={item.key}
                                    className="flex items-center gap-1"
                                  >
                                    <span
                                      className={cn(
                                        "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-[0.6rem] font-black",
                                        isChecked
                                          ? "border-green-600 bg-green-600 text-white"
                                          : "border-paper-line text-paper-muted/30",
                                      )}
                                    >
                                      {isChecked ? "✓" : "□"}
                                    </span>
                                    <span
                                      className={cn(
                                        "text-xs",
                                        isChecked
                                          ? "text-green-700 font-bold"
                                          : "text-paper-ink",
                                      )}
                                    >
                                      {showIcons && (
                                        <span className="mr-0.5">
                                          {meta.emoji}
                                        </span>
                                      )}
                                      {meta.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="text-right">
                              <span className="text-[0.6rem] font-bold text-paper-muted">
                                {completedItems}/{totalItems} 完成
                              </span>
                            </div>
                            {record?.note && (
                              <div className="rounded bg-amber-tint/30 p-1">
                                <p className="text-[0.65rem] text-paper-ink">
                                  📝 {record.note}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-paper-line bg-white p-3">
            <h4 className="mb-2 text-sm font-black text-paper-ink">
              📌 重要提示
            </h4>
            <ul className="space-y-1 text-xs text-paper-ink">
              <li>• 请按时提醒老人服药，勿漏服勿加倍</li>
              <li>• 服药后注意观察是否有不适反应</li>
              <li>• 如有异常及时联系医生或家属</li>
              <li>• 交接时请当面清点药品数量</li>
            </ul>
          </div>
          <div className="border border-paper-line bg-white p-3">
            <h4 className="mb-2 text-sm font-black text-paper-ink">
              ✍️ 交接签名
            </h4>
            <div className="space-y-3 pt-2">
              <div className="border-b border-dashed border-paper-line pb-1">
                <p className="text-xs text-paper-muted">早晨交班签名：</p>
              </div>
              <div className="border-b border-dashed border-paper-line pb-1">
                <p className="text-xs text-paper-muted">中午交班签名：</p>
              </div>
              <div className="border-b border-dashed border-paper-line pb-1">
                <p className="text-xs text-paper-muted">晚上交班签名：</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
