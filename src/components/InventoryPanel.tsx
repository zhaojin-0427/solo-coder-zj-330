import { useMemo } from "react";
import { Package, AlertTriangle, AlertCircle, CalendarCheck, CalendarX, CheckCircle2, MapPin, Phone, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMedStore } from "@/store/useMedStore";
import type { Medicine, StockStatus, Settings } from "@/types";
import {
  computeStockStatus,
  STOCK_STATUS_META,
  formatDate,
  type StockComputed,
} from "@/lib/format";

interface StockRow {
  medicine: Medicine;
  computed: StockComputed;
  status: StockStatus;
  meta: typeof STOCK_STATUS_META[StockStatus];
}

function groupByStatus(medicines: Medicine[]) {
  const groups: Record<StockStatus, StockRow[]> = {
    normal: [],
    low: [],
    critical: [],
    expiring: [],
    expired: [],
  };

  for (const m of medicines) {
    if (!m.enableStock) continue;
    const computed = computeStockStatus(m);
    const row: StockRow = {
      medicine: m,
      computed,
      status: computed.stockStatus,
      meta: STOCK_STATUS_META[computed.stockStatus],
    };
    groups[computed.stockStatus].push(row);
  }

  return groups;
}

const STATUS_ORDER: StockStatus[] = ["critical", "low", "expiring", "expired", "normal"];

const STATUS_HEADER: Record<StockStatus, { icon: typeof AlertTriangle; title: string; accent: string }> = {
  critical: {
    icon: AlertCircle,
    title: "库存不足，立即补货",
    accent: "text-red-600 border-red-200 bg-red-50",
  },
  low: {
    icon: AlertTriangle,
    title: "即将不足，建议补货",
    accent: "text-amber-deep border-amber-soft bg-amber-tint/40",
  },
  expiring: {
    icon: CalendarCheck,
    title: "临近过期（30天内）",
    accent: "text-orange-600 border-orange-200 bg-orange-50",
  },
  expired: {
    icon: CalendarX,
    title: "已过期，请丢弃",
    accent: "text-red-700 border-red-300 bg-red-100",
  },
  normal: {
    icon: CheckCircle2,
    title: "库存正常",
    accent: "text-green-700 border-green-200 bg-green-50",
  },
};

function StockItemCard({ row, settings }: { row: StockRow; settings: Settings }) {
  const { medicine, computed, meta } = row;
  const showIcons = settings.showIcons;

  return (
    <div
      className={cn(
        "animate-fade-up rounded-2xl border-2 bg-white/80 p-3 shadow-sm backdrop-blur-sm transition hover:shadow-md",
        meta.ring,
        (computed.isCritical || computed.isExpired) && "border-red-300",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 flex-shrink-0 rounded-full", meta.dot)} />
            <h4 className="truncate font-black text-paper-ink">
              {medicine.name || "未命名药品"}
            </h4>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className="rounded bg-paper-shade px-1.5 py-0.5 text-[0.7rem] font-semibold text-paper-muted">
              {medicine.group}
            </span>
            {showIcons && (
              <span className="text-xs" aria-hidden>
                {meta.emoji}
              </span>
            )}
            <span className={cn("rounded px-1.5 py-0.5 text-[0.7rem] font-black", meta.bg, meta.text)}>
              {meta.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          {computed.remainingDays >= 0 && (
            <p className="text-xs font-bold text-paper-ink">
              可用
              <span
                className={cn(
                  "text-base",
                  computed.remainingDays <= medicine.refillThreshold
                    ? "text-red-600"
                    : "text-amber-deep",
                )}
              >
                {" "}
                {computed.remainingDays}{" "}
              </span>
              天
            </p>
          )}
          <p className="text-[0.65rem] font-bold text-paper-muted">
            {medicine.stockQuantity} {medicine.singleDoseUnit || "片"} · 日耗{" "}
            {computed.dailyConsumption}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 border-t border-dashed border-paper-line pt-2">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-paper-line" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.75rem] font-bold text-paper-ink">
              单次剂量：{medicine.dosage || "—"}
            </p>
            <p className="text-[0.7rem] text-paper-muted">
              每日 {medicine.slots.length} 次
              {medicine.packageSpec && ` · ${medicine.packageSpec}`}
            </p>
          </div>
        </div>

        {(computed.isExpiring || computed.isExpired) && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg px-2 py-1",
              computed.isExpired ? "bg-red-100" : "bg-orange-50",
            )}
          >
            <CalendarX
              size={12}
              className={cn(
                "mt-0.5 flex-shrink-0",
                computed.isExpired ? "text-red-600" : "text-orange-500",
              )}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-[0.7rem] font-black",
                  computed.isExpired ? "text-red-700" : "text-orange-700",
                )}
              >
                有效期：{formatDate(medicine.expiryDate)}
                {computed.isExpired
                  ? `（已过期 ${Math.abs(computed.daysToExpiry)} 天）`
                  : computed.daysToExpiry <= 30
                    ? `（剩余 ${computed.daysToExpiry} 天）`
                    : ""}
              </p>
            </div>
          </div>
        )}

        {(computed.needRefill || medicine.purchaseLocation) && (
          <div className="flex items-start gap-2">
            <MapPin size={12} className="mt-0.5 flex-shrink-0 text-paper-muted" />
            <div className="min-w-0 flex-1">
              {medicine.purchaseLocation ? (
                <>
                  <p className="truncate text-[0.75rem] font-bold text-paper-ink">
                    {medicine.purchaseLocation}
                  </p>
                  {medicine.purchaseContact && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[0.65rem] text-paper-muted">
                      <Phone size={10} />
                      {medicine.purchaseContact}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[0.7rem] italic text-paper-muted">未填写购药地点</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryPanel() {
  const medicines = useMedStore((s) => s.medicines);
  const settings = useMedStore((s) => s.settings);
  const setPreviewOpen = useMedStore((s) => s.setPreviewOpen);

  const groups = useMemo(() => groupByStatus(medicines), [medicines]);
  const totalStock = useMemo(
    () => medicines.filter((m) => m.enableStock).length,
    [medicines],
  );
  const criticalCount = groups.critical.length;
  const lowCount = groups.low.length;
  const expiringCount = groups.expiring.length;
  const expiredCount = groups.expired.length;
  const needRefillCount = criticalCount + lowCount + expiringCount + expiredCount;
  const needRefillList = [...groups.critical, ...groups.low, ...groups.expiring, ...groups.expired];

  return (
    <section className="app-surface flex h-full flex-col bg-paper-shade/40">
      <header className="border-b border-paper-line bg-paper/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-black text-paper-ink">
              库存与补药提醒
            </h2>
            <p className="text-xs text-paper-muted">
              共 {totalStock} 种启用库存 · {needRefillCount} 项需关注
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-amber px-2.5 py-1.5 text-xs font-black text-white shadow-sm transition hover:bg-amber-deep"
          >
            <Printer size={14} />
            补药清单
          </button>
        </div>

        {needRefillCount > 0 && (
          <div
            className={cn(
              "mt-3 flex flex-wrap items-center gap-1.5 rounded-xl border p-2",
              criticalCount > 0
                ? "border-red-200 bg-red-50"
                : lowCount > 0
                  ? "border-amber-soft bg-amber-tint/30"
                  : "border-orange-200 bg-orange-50",
            )}
          >
            {criticalCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-500 px-2 py-0.5 text-[0.7rem] font-black text-white">
                <AlertCircle size={10} />
                立即补 {criticalCount}
              </span>
            )}
            {lowCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber px-2 py-0.5 text-[0.7rem] font-black text-white">
                <AlertTriangle size={10} />
                建议补 {lowCount}
              </span>
            )}
            {expiringCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2 py-0.5 text-[0.7rem] font-black text-white">
                <CalendarCheck size={10} />
                临近过期 {expiringCount}
              </span>
            )}
            {expiredCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-700 px-2 py-0.5 text-[0.7rem] font-black text-white">
                <CalendarX size={10} />
                已过期 {expiredCount}
              </span>
            )}
            <span className="ml-auto text-[0.7rem] font-bold text-paper-muted">
              详见下方分类
            </span>
          </div>
        )}
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {totalStock === 0 ? (
          <div className="mt-10 rounded-2xl border-2 border-dashed border-paper-line bg-white/50 p-6 text-center">
            <Package size={40} className="mx-auto mb-3 text-paper-line" />
            <p className="font-serif text-lg font-bold text-paper-ink">
              暂无库存数据
            </p>
            <p className="mt-1 text-sm text-paper-muted">
              在药品录入中开启「库存与补药提醒」即可
            </p>
          </div>
        ) : needRefillList.length === 0 && groups.normal.length === 0 ? null : (
          STATUS_ORDER.map((statusKey) => {
            const list = groups[statusKey];
            if (list.length === 0) return null;
            const header = STATUS_HEADER[statusKey];
            const Icon = header.icon;
            return (
              <div key={statusKey}>
                <div
                  className={cn(
                    "mb-2 flex items-center gap-2 rounded-xl border px-3 py-1.5",
                    header.accent,
                  )}
                >
                  <Icon size={15} />
                  <h3 className="text-sm font-black">{header.title}</h3>
                  <span className="ml-auto text-xs font-bold">
                    {list.length} 种
                  </span>
                </div>
                <div className="space-y-2">
                  {list.map((row) => (
                    <StockItemCard key={row.medicine.id} row={row} settings={settings} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
