import { ChevronUp, ChevronDown, Trash2, Calendar, RotateCcw, Package, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FREQUENCY_PRESETS,
  GROUP_PRESETS,
  MEAL_LIST,
  SLOT_LIST,
} from "@/lib/constants";
import { slotTheme, formatDate, computeStockStatus, STOCK_STATUS_META, getDaysToExpiry } from "@/lib/format";
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
  const clearCompletedSlots = useMedStore((s) => s.clearCompletedSlots);
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
        className="mb-4 w-full resize-y rounded-xl border-2 border-paper-line bg-paper/50 px-3 py-2 text-base text-paper-ink outline-none focus:border-amber"
      />

      <div className="rounded-xl border-2 border-amber-soft bg-amber-tint/20 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-amber-deep" />
            <span className="text-sm font-black text-amber-deep">服药核对设置</span>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <span className="text-xs font-bold text-paper-muted">启用核对</span>
            <span className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-paper-line transition-colors duration-200 ease-in-out focus:outline-none">
              <input
                type="checkbox"
                checked={medicine.enableChecklist}
                onChange={(e) =>
                  updateMedicine(medicine.id, { enableChecklist: e.target.checked })
                }
                className="peer sr-only"
              />
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  medicine.enableChecklist ? "translate-x-5" : "translate-x-0.5",
                )}
              />
              <span
                className={cn(
                  "absolute inset-0 rounded-full transition-colors duration-200",
                  medicine.enableChecklist ? "bg-amber" : "bg-paper-line",
                )}
              />
            </span>
          </label>
        </div>

        {medicine.enableChecklist && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-paper-muted">
                  开始日期
                </label>
                <input
                  type="date"
                  value={medicine.startDate}
                  onChange={(e) =>
                    updateMedicine(medicine.id, { startDate: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-paper-line bg-white px-2 py-1.5 text-sm font-semibold text-paper-ink outline-none focus:border-amber"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-paper-muted">
                  疗程天数
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={medicine.courseDays}
                  onChange={(e) =>
                    updateMedicine(medicine.id, {
                      courseDays: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-full rounded-lg border-2 border-paper-line bg-white px-2 py-1.5 text-sm font-semibold text-paper-ink outline-none focus:border-amber"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white/60 px-2 py-1.5">
              <div className="text-xs">
                <span className="font-bold text-paper-ink">疗程范围：</span>
                <span className="text-paper-muted">
                  {formatDate(medicine.startDate)} ~{" "}
                  {formatDate(
                    (() => {
                      const d = new Date(medicine.startDate);
                      d.setDate(d.getDate() + medicine.courseDays - 1);
                      return d.toISOString().split("T")[0];
                    })(),
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm("确定要清空所有已核对的记录吗？")
                  ) {
                    clearCompletedSlots(medicine.id);
                  }
                }}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-red-500 transition hover:bg-red-50"
              >
                <RotateCcw size={12} />
                清空记录
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 rounded-xl border-2 border-green-200 bg-green-50/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-green-700" />
            <span className="text-sm font-black text-green-700">库存与补药提醒</span>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <span className="text-xs font-bold text-paper-muted">启用库存</span>
            <span className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-paper-line transition-colors duration-200 ease-in-out focus:outline-none">
              <input
                type="checkbox"
                checked={medicine.enableStock}
                onChange={(e) =>
                  updateMedicine(medicine.id, { enableStock: e.target.checked })
                }
                className="peer sr-only"
              />
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  medicine.enableStock ? "translate-x-5" : "translate-x-0.5",
                )}
              />
              <span
                className={cn(
                  "absolute inset-0 rounded-full transition-colors duration-200",
                  medicine.enableStock ? "bg-green-600" : "bg-paper-line",
                )}
              />
            </span>
          </label>
        </div>

        {medicine.enableStock && (
          (() => {
            const computed = computeStockStatus(medicine);
            const statusMeta = STOCK_STATUS_META[computed.stockStatus];
            return (
              <div className="space-y-3">
                <div className={cn("flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 ring-1", statusMeta.ring)}>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", statusMeta.dot)} />
                    <span className={cn("text-sm font-black", statusMeta.text)}>
                      {showIcons && <span className="mr-1" aria-hidden>{statusMeta.emoji}</span>}
                      {statusMeta.label}
                    </span>
                  </div>
                  <div className="text-right">
                    {computed.remainingDays >= 0 && (
                      <p className="text-xs font-bold text-paper-ink">
                        可用 <span className="text-base text-amber-deep">{computed.remainingDays}</span> 天
                      </p>
                    )}
                    {computed.daysToExpiry <= 30 && computed.daysToExpiry >= 0 && (
                      <p className="text-[0.7rem] font-bold text-orange-600">
                        距过期 {computed.daysToExpiry} 天
                      </p>
                    )}
                    {computed.daysToExpiry < 0 && (
                      <p className="text-[0.7rem] font-bold text-red-600">
                        已过期 {Math.abs(computed.daysToExpiry)} 天
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-paper-muted">
                      当前库存数量
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={medicine.stockQuantity}
                      onChange={(e) =>
                        updateMedicine(medicine.id, {
                          stockQuantity: Math.max(0, parseFloat(e.target.value) || 0),
                        })
                      }
                      className="w-full rounded-lg border-2 border-paper-line bg-white px-2 py-1.5 text-sm font-semibold text-paper-ink outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-paper-muted">
                      单位（片/粒/毫升）
                    </label>
                    <input
                      type="text"
                      value={medicine.singleDoseUnit}
                      onChange={(e) =>
                        updateMedicine(medicine.id, { singleDoseUnit: e.target.value })
                      }
                      placeholder="片/粒/袋"
                      className="w-full rounded-lg border-2 border-paper-line bg-white px-2 py-1.5 text-sm font-semibold text-paper-ink outline-none focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-paper-muted">
                      包装规格
                    </label>
                    <input
                      type="text"
                      value={medicine.packageSpec}
                      onChange={(e) =>
                        updateMedicine(medicine.id, { packageSpec: e.target.value })
                      }
                      placeholder="每盒 30 片"
                      className="w-full rounded-lg border-2 border-paper-line bg-white px-2 py-1.5 text-sm font-semibold text-paper-ink outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-paper-muted">
                      补药阈值（剩余≤N天提醒）
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={medicine.refillThreshold}
                      onChange={(e) =>
                        updateMedicine(medicine.id, {
                          refillThreshold: Math.max(1, parseInt(e.target.value) || 7),
                        })
                      }
                      className="w-full rounded-lg border-2 border-paper-line bg-white px-2 py-1.5 text-sm font-semibold text-paper-ink outline-none focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-paper-muted">
                    有效期至
                  </label>
                  <input
                    type="date"
                    value={medicine.expiryDate}
                    onChange={(e) =>
                      updateMedicine(medicine.id, { expiryDate: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-paper-line bg-white px-2 py-1.5 text-sm font-semibold text-paper-ink outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-bold text-paper-muted">
                    <MapPin size={12} />
                    购药地点
                  </label>
                  <input
                    type="text"
                    value={medicine.purchaseLocation}
                    onChange={(e) =>
                      updateMedicine(medicine.id, { purchaseLocation: e.target.value })
                    }
                    placeholder="例如：市人民医院门诊药房 / 京东健康"
                    className="w-full rounded-lg border-2 border-paper-line bg-white px-2 py-1.5 text-sm font-semibold text-paper-ink outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-paper-muted">
                    联系方式
                  </label>
                  <input
                    type="text"
                    value={medicine.purchaseContact}
                    onChange={(e) =>
                      updateMedicine(medicine.id, { purchaseContact: e.target.value })
                    }
                    placeholder="药房电话 / 线上购药链接"
                    className="w-full rounded-lg border-2 border-paper-line bg-white px-2 py-1.5 text-sm font-semibold text-paper-ink outline-none focus:border-green-500"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-white/70 px-2 py-1.5">
                  <div className="text-xs">
                    <span className="font-bold text-paper-ink">每日消耗：</span>
                    <span className="text-paper-muted">
                      约 {computed.dailyConsumption} {medicine.singleDoseUnit || "片"}
                      （{medicine.slots.length} 次/日 × 单次剂量）
                    </span>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
