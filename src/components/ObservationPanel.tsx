import { useState, useMemo } from "react";
import {
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  Pill,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SEVERITY_LIST,
} from "@/lib/constants";
import {
  formatDate,
  getDayOfWeek,
  filterObservationRecords,
  sortObservationRecords,
  checkConsecutiveDays,
  getObservationSummary,
} from "@/lib/format";
import { useMedStore } from "@/store/useMedStore";
import type { ObservationRecord, SeverityLevel } from "@/types";
import ObservationCard from "@/components/ObservationCard";
import ObservationForm from "@/components/ObservationForm";

export default function ObservationPanel() {
  const observationRecords = useMedStore((s) => s.observationRecords);
  const medicines = useMedStore((s) => s.medicines);
  const removeObservationRecord = useMedStore((s) => s.removeObservationRecord);
  const showIcons = useMedStore((s) => s.settings.showIcons);

  const [dateOffset, setDateOffset] = useState(0);
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);
  const [filterMedicineId, setFilterMedicineId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ObservationRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const currentDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dateOffset * dateRange);
    return d.toISOString().split("T")[0];
  }, [dateOffset, dateRange]);

  const startDate = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - dateRange + 1);
    return d.toISOString().split("T")[0];
  }, [currentDate, dateRange]);

  const filteredRecords = useMemo(() => {
    let records = filterObservationRecords(observationRecords, {
      startDate,
      endDate: currentDate,
      medicineId: filterMedicineId ?? undefined,
      severity: filterSeverity ?? undefined,
    });
    return sortObservationRecords(records);
  }, [observationRecords, startDate, currentDate, filterMedicineId, filterSeverity]);

  const summary = useMemo(() => {
    return getObservationSummary(filteredRecords, medicines);
  }, [filteredRecords, medicines]);

  const getConsecutiveInfo = (record: ObservationRecord) => {
    if (!record.medicineId) return { isConsecutive: false, consecutiveDays: 0 };
    return checkConsecutiveDays(observationRecords, record.medicineId);
  };

  const handleEdit = (record: ObservationRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    removeObservationRecord(id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const isToday = dateOffset === 0;

  return (
    <section className="app-surface flex h-full flex-col bg-paper-shade/40">
      <header className="border-b border-paper-line bg-paper/80 px-4 py-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-black text-paper-ink">
              异常观察日志
            </h2>
            <p className="text-xs text-paper-muted">
              记录服药后身体反应，便于复诊沟通
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-black text-white shadow-sm transition hover:bg-red-600"
          >
            <Plus size={16} />
            新增记录
          </button>
        </div>

        <div className="mb-2 flex items-center gap-1 rounded-lg bg-white/80 p-0.5">
          <button
            type="button"
            onClick={() => setDateOffset((d) => d - 1)}
            className="rounded-md px-2.5 py-1.5 text-sm font-bold text-paper-muted transition hover:bg-amber-tint hover:text-amber-deep"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-1 items-center justify-center gap-2">
            {showIcons && <Calendar size={16} className="text-red-500" />}
            <span className="text-sm font-black text-paper-ink">
              {formatDate(startDate)} ~ {formatDate(currentDate)}
            </span>
            <span className="text-sm font-bold text-paper-muted">
              ({dateRange}天)
            </span>
            {isToday && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[0.6rem] font-black text-white">
                包含今天
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDateOffset((d) => d + 1)}
            disabled={isToday}
            className="rounded-md px-2.5 py-1.5 text-sm font-bold text-paper-muted transition hover:bg-amber-tint hover:text-amber-deep disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={() => setDateOffset(0)}
              className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-black text-white transition hover:bg-red-600"
            >
              今天
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-1 rounded-lg bg-white/80 p-0.5">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => {
                  setDateRange(days);
                  setDateOffset(0);
                }}
                className={cn(
                  "flex-1 rounded-md px-2 py-1 text-xs font-bold transition",
                  dateRange === days
                    ? "bg-red-500 text-white"
                    : "text-paper-muted hover:bg-red-50 hover:text-red-600"
                )}
              >
                {days}天
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition",
              showFilters || filterMedicineId || filterSeverity
                ? "bg-amber text-white"
                : "bg-white/80 text-paper-muted hover:bg-amber-tint hover:text-amber-deep"
            )}
          >
            <Filter size={14} />
            筛选
          </button>
        </div>

        {showFilters && (
          <div className="mt-2 space-y-2 rounded-xl border-2 border-amber-soft bg-amber-tint/20 p-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-amber-deep">
                按药品筛选
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilterMedicineId(null)}
                  className={cn(
                    "rounded-lg border-2 px-2.5 py-1 text-xs font-bold transition",
                    filterMedicineId === null
                      ? "border-transparent bg-amber text-white"
                      : "border-paper-line bg-white text-paper-muted hover:border-amber"
                  )}
                >
                  全部
                </button>
                {medicines.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFilterMedicineId(m.id)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-bold transition",
                      filterMedicineId === m.id
                        ? "border-transparent bg-amber text-white"
                        : "border-paper-line bg-white text-paper-muted hover:border-amber"
                    )}
                  >
                    <Pill size={12} />
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-amber-deep">
                按严重程度筛选
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilterSeverity(null)}
                  className={cn(
                    "rounded-lg border-2 px-2.5 py-1 text-xs font-bold transition",
                    filterSeverity === null
                      ? "border-transparent bg-amber text-white"
                      : "border-paper-line bg-white text-paper-muted hover:border-amber"
                  )}
                >
                  全部
                </button>
                {SEVERITY_LIST.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setFilterSeverity(s.key)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-bold transition",
                      filterSeverity === s.key
                        ? cn("border-transparent", s.bg, s.text)
                        : "border-paper-line bg-white text-paper-muted hover:border-amber"
                    )}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {(filterMedicineId || filterSeverity) && (
              <button
                type="button"
                onClick={() => {
                  setFilterMedicineId(null);
                  setFilterSeverity(null);
                }}
                className="text-xs font-bold text-amber-deep underline"
              >
                清除所有筛选
              </button>
            )}
          </div>
        )}
      </header>

      {summary.totalRecords > 0 && (
        <div className="border-b border-paper-line bg-white/60 px-4 py-2">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="font-bold text-paper-muted">共</span>
              <span className="font-black text-paper-ink">{summary.totalRecords}</span>
              <span className="font-bold text-paper-muted">条记录</span>
            </div>
            {summary.severeCount > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                <AlertTriangle size={12} />
                <span className="font-black">{summary.severeCount}条严重</span>
              </div>
            )}
            {summary.moderateCount > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-deep">
                <span className="font-black">{summary.moderateCount}条中度</span>
              </div>
            )}
            {summary.mildCount > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                <span className="font-black">{summary.mildCount}条轻微</span>
              </div>
            )}
            {summary.consultedCount > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                <span className="font-black">{summary.consultedCount}次就医咨询</span>
              </div>
            )}
            {summary.hasHighRisk && (
              <div className="ml-auto flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-white animate-pulse">
                <TrendingUp size={12} />
                <span className="font-black">有需要关注的情况</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {filteredRecords.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-paper-line bg-white/50 p-6 text-center">
            <p className="text-lg font-black text-paper-muted mb-1">
              暂无异常观察记录
            </p>
            <p className="text-sm text-paper-muted mb-3">
              如老人服药后有不适反应，请及时记录
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-red-600"
            >
              <Plus size={16} />
              添加第一条记录
            </button>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const consecutiveInfo = getConsecutiveInfo(record);
            return (
              <ObservationCard
                key={record.id}
                record={record}
                isConsecutive={consecutiveInfo.isConsecutive}
                consecutiveDays={consecutiveInfo.consecutiveDays}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          })
        )}

        <div className="rounded-2xl border-2 border-dashed border-paper-line bg-white/50 p-3">
          <p className="text-sm font-semibold text-paper-muted">
            💡 记录提示
          </p>
          <ul className="mt-1 space-y-1 text-xs text-paper-muted">
            <li>• 每次服药后注意观察老人状态，如有异常及时记录</li>
            <li>• 连续多日出现相同症状或严重不适请及时就医</li>
            <li>• 复诊时可在「打印预览」中生成就医摘要</li>
            <li>• 所有记录保存在本地，不上传任何隐私数据</li>
          </ul>
        </div>
      </div>

      {showForm && (
        <ObservationForm
          record={editingRecord}
          onClose={handleCloseForm}
        />
      )}
    </section>
  );
}
