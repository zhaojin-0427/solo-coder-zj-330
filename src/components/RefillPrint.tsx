import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Medicine, Settings, StockStatus, Caregiver } from "@/types";
import {
  computeStockStatus,
  STOCK_STATUS_META,
  formatDate,
  type StockComputed,
} from "@/lib/format";
import { SLOT_LIST } from "@/lib/constants";

interface RefillRow {
  medicine: Medicine;
  computed: StockComputed;
  status: StockStatus;
  meta: typeof STOCK_STATUS_META[StockStatus];
  priority: number;
}

function getPriority(status: StockStatus): number {
  switch (status) {
    case "expired":
      return 0;
    case "critical":
      return 1;
    case "low":
      return 2;
    case "expiring":
      return 3;
    default:
      return 99;
  }
}

function getRefillList(medicines: Medicine[]): RefillRow[] {
  const list: RefillRow[] = [];
  for (const m of medicines) {
    if (!m.enableStock) continue;
    const computed = computeStockStatus(m);
    if (!computed.needRefill) continue;
    list.push({
      medicine: m,
      computed,
      status: computed.stockStatus,
      meta: STOCK_STATUS_META[computed.stockStatus],
      priority: getPriority(computed.stockStatus),
    });
  }
  list.sort((a, b) => a.priority - b.priority);
  return list;
}

function getAllStockList(medicines: Medicine[]): RefillRow[] {
  const list: RefillRow[] = [];
  for (const m of medicines) {
    if (!m.enableStock) continue;
    const computed = computeStockStatus(m);
    list.push({
      medicine: m,
      computed,
      status: computed.stockStatus,
      meta: STOCK_STATUS_META[computed.stockStatus],
      priority: getPriority(computed.stockStatus),
    });
  }
  list.sort((a, b) => a.priority - b.priority);
  return list;
}

function getStatusBadgeClass(status: StockStatus): string {
  switch (status) {
    case "critical":
      return "bg-red-500 text-white";
    case "low":
      return "bg-amber text-white";
    case "expiring":
      return "bg-orange-500 text-white";
    case "expired":
      return "bg-red-700 text-white";
    default:
      return "bg-green-600 text-white";
  }
}

function getStatusLabel(status: StockStatus): string {
  return STOCK_STATUS_META[status].label;
}

interface RefillPrintProps {
  settings: Settings;
  medicines: Medicine[];
  schemeName: string;
  caregivers?: Caregiver[];
}

export default function RefillPrint({
  settings,
  medicines,
  schemeName,
  caregivers = [],
}: RefillPrintProps) {
  const showIcons = settings.showIcons;
  const [viewMode, setViewMode] = useState<"purchaselist" | "pocketcard">("purchaselist");

  const refillList = useMemo(() => getRefillList(medicines), [medicines]);
  const allStockList = useMemo(() => getAllStockList(medicines), [medicines]);
  const today = useMemo(() => formatDate(new Date().toISOString().split("T")[0]), []);

  const criticalCount = refillList.filter((r) => r.status === "critical").length;
  const lowCount = refillList.filter((r) => r.status === "low").length;
  const expiringCount = refillList.filter((r) => r.status === "expiring").length;
  const expiredCount = refillList.filter((r) => r.status === "expired").length;

  if (allStockList.length === 0) {
    return (
      <div className="py-10 text-center text-paper-muted">
        <p className="font-serif text-lg font-bold text-paper-ink">暂无库存数据</p>
        <p className="mt-1 text-sm">请在药品录入中开启「库存与补药提醒」</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-1 rounded-lg bg-paper-shade/50 p-0.5 print:hidden">
        <button
          type="button"
          onClick={() => setViewMode("purchaselist")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-bold transition",
            viewMode === "purchaselist" ? "bg-amber text-zinc-900" : "text-paper-muted",
          )}
        >
          📋 A4 采购表
        </button>
        <button
          type="button"
          onClick={() => setViewMode("pocketcard")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-bold transition",
            viewMode === "pocketcard" ? "bg-amber text-zinc-900" : "text-paper-muted",
          )}
        >
          🎫 随身补药卡
        </button>
      </div>

      {viewMode === "purchaselist" ? (
        <div className="space-y-5">
          <div className="border-b-2 border-paper-line pb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-deep">
                  家庭药品采购清单
                </p>
                <h3 className="font-serif text-2xl font-black text-paper-ink">
                  {schemeName || "服药方案"}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-paper-muted">生成日期</p>
                <p className="text-lg font-black text-paper-ink">{today}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {refillList.length === 0 ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-black text-green-700">
                  ✅ 库存状态良好，无需采购
                </span>
              ) : (
                <>
                  {criticalCount > 0 && (
                    <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-black text-white">
                      🚨 立即采购 {criticalCount}
                    </span>
                  )}
                  {lowCount > 0 && (
                    <span className="rounded-full bg-amber px-3 py-1 text-sm font-black text-white">
                      ⚠️ 建议采购 {lowCount}
                    </span>
                  )}
                  {expiringCount > 0 && (
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-black text-white">
                      📅 临近过期 {expiringCount}
                    </span>
                  )}
                  {expiredCount > 0 && (
                    <span className="rounded-full bg-red-700 px-3 py-1 text-sm font-black text-white">
                      ❌ 已过期 {expiredCount} 请丢弃
                    </span>
                  )}
                </>
              )}
              <span className="ml-auto text-sm font-bold text-paper-muted">
                共管理 {allStockList.length} 种药品
              </span>
            </div>
          </div>

          {refillList.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-2 font-serif text-lg font-black text-paper-ink">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                需要采购 / 处理的药品
                <span className="ml-auto text-sm font-bold text-paper-muted">
                  勾选已采购
                </span>
              </h4>
              <div className="overflow-hidden rounded-xl border-2 border-paper-line">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-amber text-white">
                      <th className="w-10 px-2 py-2 text-center font-black">□</th>
                      <th className="px-3 py-2 font-black">药品名称</th>
                      <th className="px-3 py-2 font-black">状态</th>
                      <th className="px-3 py-2 font-black">剩余</th>
                      <th className="px-3 py-2 font-black">建议采购量</th>
                      <th className="px-3 py-2 font-black">规格 / 剂量</th>
                      <th className="px-3 py-2 font-black">购药地点</th>
                      <th className="px-3 py-2 font-black">有效期</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-line">
                    {refillList.map((row, idx) => {
                      const m = row.medicine;
                      const c = row.computed;
                      const suggestDays = Math.max(30, m.refillThreshold * 3);
                      const needed = Math.ceil(
                        Math.max(0, suggestDays * c.dailyConsumption - m.stockQuantity),
                      );
                      return (
                        <tr
                          key={m.id}
                          className={cn(
                            idx % 2 === 0 ? "bg-white" : "bg-paper-shade/30",
                            (c.isExpired || c.isCritical) && "bg-red-50/70",
                          )}
                        >
                          <td className="px-2 py-2 text-center">☐</td>
                          <td className="px-3 py-2">
                            <p className="font-black text-paper-ink">{m.name}</p>
                            <p className="text-xs text-paper-muted">{m.group}</p>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={cn(
                                "inline-block rounded px-2 py-0.5 text-xs font-black",
                                getStatusBadgeClass(row.status),
                              )}
                            >
                              {showIcons && `${row.meta.emoji} `}
                              {getStatusLabel(row.status)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {c.remainingDays >= 0 ? (
                              <p className="font-bold text-paper-ink">
                                <span
                                  className={cn(
                                    "text-lg",
                                    c.remainingDays <= m.refillThreshold
                                      ? "text-red-600"
                                      : "text-amber-deep",
                                  )}
                                >
                                  {c.remainingDays}
                                </span>{" "}
                                天
                              </p>
                            ) : (
                              <p className="text-paper-muted">—</p>
                            )}
                            <p className="text-[0.65rem] text-paper-muted">
                              当前 {m.stockQuantity} {m.singleDoseUnit}
                            </p>
                          </td>
                          <td className="px-3 py-2">
                            {needed > 0 ? (
                              <p className="font-black text-amber-deep">
                                {needed} {m.singleDoseUnit}
                              </p>
                            ) : c.isExpired ? (
                              <p className="font-bold text-red-700">请丢弃</p>
                            ) : c.isExpiring ? (
                              <p className="font-bold text-orange-600">
                                换新批号
                              </p>
                            ) : null}
                            <p className="text-[0.65rem] text-paper-muted">
                              预估 30 天用量
                            </p>
                          </td>
                          <td className="px-3 py-2">
                            <p className="font-semibold text-paper-ink">
                              {m.packageSpec || "—"}
                            </p>
                            <p className="text-[0.65rem] text-paper-muted">
                              {m.dosage} × {m.slots.length}次/日
                            </p>
                          </td>
                          <td className="px-3 py-2">
                            <p className="font-semibold text-paper-ink">
                              {m.purchaseLocation || "—"}
                            </p>
                            {m.purchaseContact && (
                              <p className="text-[0.65rem] text-paper-muted">
                                📞 {m.purchaseContact}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <p
                              className={cn(
                                "font-bold",
                                c.isExpired
                                  ? "text-red-700"
                                  : c.isExpiring
                                    ? "text-orange-600"
                                    : "text-paper-ink",
                              )}
                            >
                              {formatDate(m.expiryDate)}
                            </p>
                            {c.isExpired ? (
                              <p className="text-[0.65rem] font-bold text-red-600">
                                已过期 {Math.abs(c.daysToExpiry)} 天
                              </p>
                            ) : c.isExpiring ? (
                              <p className="text-[0.65rem] font-bold text-orange-500">
                                剩 {c.daysToExpiry} 天
                              </p>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 flex items-center gap-2 font-serif text-lg font-black text-paper-ink">
              <span className="h-3 w-3 rounded-full bg-green-600" />
              全部药品库存总览
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {allStockList.map((row) => {
                const m = row.medicine;
                const c = row.computed;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-xl border-2 p-3",
                      c.isExpired
                        ? "border-red-300 bg-red-50"
                        : c.isCritical
                          ? "border-red-200 bg-red-50/50"
                          : c.isLow
                            ? "border-amber-soft bg-amber-tint/30"
                            : c.isExpiring
                              ? "border-orange-200 bg-orange-50"
                              : "border-green-200 bg-green-50/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2.5 w-2.5 rounded-full", row.meta.dot)} />
                          <p className="font-black text-paper-ink">{m.name}</p>
                        </div>
                        <p className="text-xs text-paper-muted">
                          {m.group} · {m.packageSpec || "未填写规格"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded px-2 py-0.5 text-xs font-black",
                          getStatusBadgeClass(row.status),
                        )}
                      >
                        {getStatusLabel(row.status)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-white/70 p-1.5">
                        <p className="font-bold text-paper-muted">当前库存</p>
                        <p className="text-base font-black text-paper-ink">
                          {m.stockQuantity}
                          <span className="ml-0.5 text-[0.65rem] font-bold text-paper-muted">
                            {m.singleDoseUnit}
                          </span>
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/70 p-1.5">
                        <p className="font-bold text-paper-muted">可用天数</p>
                        <p
                          className={cn(
                            "text-base font-black",
                            c.remainingDays >= 0 && c.remainingDays <= m.refillThreshold
                              ? "text-red-600"
                              : "text-amber-deep",
                          )}
                        >
                          {c.remainingDays >= 0 ? `${c.remainingDays}天` : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/70 p-1.5">
                        <p className="font-bold text-paper-muted">有效期至</p>
                        <p
                          className={cn(
                            "text-[0.75rem] font-black",
                            c.isExpired
                              ? "text-red-700"
                              : c.isExpiring
                                ? "text-orange-600"
                                : "text-paper-ink",
                          )}
                        >
                          {formatDate(m.expiryDate).slice(0, 6)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border-2 border-dashed border-paper-line bg-paper-shade/30 p-4">
            <h5 className="font-black text-paper-ink">📝 采购备忘</h5>
            <div className="mt-2 space-y-2">
              <div className="h-6 border-b border-dashed border-paper-line" />
              <div className="h-6 border-b border-dashed border-paper-line" />
              <div className="h-6 border-b border-dashed border-paper-line" />
              <div className="h-6" />
            </div>
            {caregivers.length > 0 && (
              <div className="mt-3 border-t border-paper-line pt-3">
                <p className="text-xs font-bold text-paper-muted">紧急联系人</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs">
                  {caregivers.slice(0, 3).map((c) => (
                    <span key={c.id} className="font-bold text-paper-ink">
                      {c.name}（{c.relation}）：{c.phone || "—"}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-paper-ink bg-white shadow-sticker print-shadow-none">
            <div className="bg-red-500 px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest opacity-90">
                    紧急补药随身卡
                  </p>
                  <h4 className="font-serif text-xl font-black leading-tight">
                    {schemeName || "服药方案"}
                  </h4>
                </div>
                <span className="text-3xl">🚨</span>
              </div>
              <p className="mt-1 text-xs opacity-90">
                生成日期：{today} · 请尽快采购
              </p>
            </div>

            {refillList.length === 0 ? (
              <div className="bg-green-50 px-4 py-6 text-center">
                <p className="text-3xl mb-2">✅</p>
                <p className="font-black text-green-700">库存状态良好</p>
                <p className="text-xs text-green-600">暂无需要采购的药品</p>
              </div>
            ) : (
              <div className="divide-y divide-paper-line">
                {refillList.slice(0, 6).map((row) => {
                  const m = row.medicine;
                  const c = row.computed;
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "px-4 py-2.5",
                        (c.isExpired || c.isCritical) && "bg-red-50",
                        c.isLow && !c.isCritical && "bg-amber-tint/20",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[0.6rem] font-black",
                                getStatusBadgeClass(row.status),
                              )}
                            >
                              {c.isExpired
                                ? "丢弃"
                                : c.isCritical
                                  ? "急购"
                                  : c.isLow
                                    ? "采购"
                                    : "换新"}
                            </span>
                            <p className="truncate text-sm font-black text-paper-ink">
                              {m.name}
                            </p>
                          </div>
                          <p className="mt-0.5 text-[0.65rem] text-paper-muted">
                            {m.dosage}
                            {m.packageSpec && ` · ${m.packageSpec}`}
                          </p>
                          {m.purchaseLocation && (
                            <p className="mt-0.5 truncate text-[0.65rem] text-amber-deep">
                              📍 {m.purchaseLocation}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {c.remainingDays >= 0 && (
                            <p
                              className={cn(
                                "text-sm font-black",
                                c.remainingDays <= 3 ? "text-red-600" : "text-amber-deep",
                              )}
                            >
                              剩{c.remainingDays}天
                            </p>
                          )}
                          <p className="text-[0.6rem] font-bold text-paper-muted">
                            库存 {m.stockQuantity}
                            {m.singleDoseUnit}
                          </p>
                          {(c.isExpiring || c.isExpired) && (
                            <p
                              className={cn(
                                "text-[0.6rem] font-bold",
                                c.isExpired ? "text-red-600" : "text-orange-500",
                              )}
                            >
                              效期 {formatDate(m.expiryDate).slice(0, 6)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {refillList.length > 6 && (
                  <div className="px-4 py-2 bg-paper-shade/40 text-center">
                    <p className="text-xs font-bold text-paper-muted">
                      还有 {refillList.length - 6} 项需采购，详见 A4 清单
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="border-t-2 border-dashed border-paper-line bg-amber-tint/40 px-4 py-2">
              <p className="text-[0.65rem] font-black uppercase tracking-wider text-amber-deep">
                📌 近期需补药摘要
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {refillList.length === 0 ? (
                  <span className="text-xs font-bold text-green-700">暂无</span>
                ) : (
                  refillList.slice(0, 8).map((row) => (
                    <span
                      key={row.medicine.id}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[0.7rem] font-black",
                        getStatusBadgeClass(row.status),
                      )}
                    >
                      {row.medicine.name}
                    </span>
                  ))
                )}
              </div>
            </div>

            {caregivers.length > 0 && (
              <div className="border-t-2 border-dashed border-paper-line bg-green-50 px-4 py-2">
                <p className="text-[0.65rem] font-black uppercase tracking-wider text-green-700">
                  紧急联系
                </p>
                <div className="mt-1 space-y-0.5">
                  {caregivers.slice(0, 2).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-baseline justify-between gap-2"
                    >
                      <span className="text-[0.7rem] font-bold text-paper-ink">
                        {c.name}
                        {c.relation && (
                          <span className="ml-0.5 text-[0.6rem] font-normal text-paper-muted">
                            ({c.relation})
                          </span>
                        )}
                        {c.slots.length > 0 && (
                          <span className="ml-1 text-[0.55rem] text-green-700">
                            · {c.slots.map((s) => SLOT_LIST.find((x) => x.key === s)?.label).join("/")}
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[0.7rem] font-bold text-amber-deep">
                        {c.phone || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-paper-line bg-paper-shade/40 px-4 py-1.5 text-center">
              <p className="text-[0.6rem] font-bold text-paper-muted">
                凭此卡购药 · 如有疑问请先联系家属
              </p>
            </div>
          </div>

          <p className="text-xs text-paper-muted print:hidden">
            提示：此卡尺寸为名片大小，可打印后剪下随身携带。
          </p>
        </div>
      )}
    </div>
  );
}
