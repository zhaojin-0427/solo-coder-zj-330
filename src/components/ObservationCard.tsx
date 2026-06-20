import { useMemo } from "react";
import { Edit2, Trash2, Calendar, Clock, Pill, AlertTriangle, UserCheck, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  severityMeta,
  slotMeta,
} from "@/lib/constants";
import {
  formatDate,
  formatDuration,
  formatSymptoms,
  getSymptomEmojis,
  getDayOfWeek,
} from "@/lib/format";
import { useMedStore } from "@/store/useMedStore";
import type { ObservationRecord } from "@/types";

interface ObservationCardProps {
  record: ObservationRecord;
  isConsecutive?: boolean;
  consecutiveDays?: number;
  onEdit: (record: ObservationRecord) => void;
  onDelete: (id: string) => void;
}

export default function ObservationCard({
  record,
  isConsecutive = false,
  consecutiveDays = 0,
  onEdit,
  onDelete,
}: ObservationCardProps) {
  const medicines = useMedStore((s) => s.medicines);
  const showIcons = useMedStore((s) => s.settings.showIcons);

  const severity = severityMeta(record.severity);
  const medicine = useMemo(
    () => medicines.find((m) => m.id === record.medicineId),
    [medicines, record.medicineId]
  );

  const symptomEmojis = getSymptomEmojis(record.symptomTypes);
  const symptomLabels = formatSymptoms(record.symptomTypes);
  const durationText = formatDuration(record.duration);
  const dateText = formatDate(record.date);
  const dayOfWeek = getDayOfWeek(record.date);
  const slotText = record.timeSlot ? slotMeta(record.timeSlot).label : "";

  const isHighRisk = record.severity === "severe" || (isConsecutive && consecutiveDays >= 3);

  return (
    <div
      className={cn(
        "paper-surface overflow-hidden rounded-2xl border-2 bg-white shadow-panel transition-all",
        isHighRisk
          ? "border-red-400 animate-pulse-slow"
          : isConsecutive
            ? "border-amber-300"
            : severity.border
      )}
    >
      <div className={cn("flex items-center justify-between px-4 py-2", severity.bg)}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {showIcons && symptomEmojis.slice(0, 3).map((emoji, i) => (
              <span key={i} className="text-lg">{emoji}</span>
            ))}
            {symptomEmojis.length > 3 && (
              <span className="text-xs font-bold text-paper-muted">+{symptomEmojis.length - 3}</span>
            )}
          </div>
          <span className={cn("text-sm font-black", severity.text)}>
            {severity.emoji} {severity.label}
          </span>
          {isHighRisk && (
            <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[0.65rem] font-black text-white">
              <AlertTriangle size={12} />
              需关注
            </span>
          )}
          {isConsecutive && !isHighRisk && (
            <span className="rounded-full bg-amber px-2 py-0.5 text-[0.65rem] font-black text-white">
              连续 {consecutiveDays} 天
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(record)}
            className="rounded-lg p-1 text-paper-muted transition hover:bg-white/60 hover:text-amber-deep"
            aria-label="编辑"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("确定要删除这条观察记录吗？")) {
                onDelete(record.id);
              }
            }}
            className="rounded-lg p-1 text-paper-muted transition hover:bg-white/60 hover:text-red-500"
            aria-label="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-paper-muted">
            <Calendar size={12} />
            <span className="font-bold">{dateText}</span>
            <span className="font-semibold">{dayOfWeek}</span>
          </div>
          {slotText && (
            <div className="flex items-center gap-1 text-paper-muted">
              <Clock size={12} />
              <span className="font-bold">{slotText}</span>
            </div>
          )}
          {medicine && (
            <div className="flex items-center gap-1 text-paper-muted">
              <Pill size={12} />
              <span className="font-bold text-amber-deep">{medicine.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-paper-muted">
            <span>⏱️</span>
            <span className="font-semibold">{durationText}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-paper-muted mb-0.5">症状</p>
          <p className="text-sm font-bold text-paper-ink">{symptomLabels}</p>
        </div>

        {record.treatment && (
          <div>
            <p className="text-xs font-bold text-paper-muted mb-0.5">处理方式</p>
            <p className="text-sm text-paper-ink">{record.treatment}</p>
          </div>
        )}

        {record.notes && (
          <div className="rounded-lg bg-paper-shade/30 p-2">
            <p className="text-xs font-bold text-paper-muted mb-0.5">家属备注</p>
            <p className="text-sm text-paper-ink">{record.notes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {record.stoppedMedication && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[0.7rem] font-bold text-red-700">
              <Ban size={12} />
              已停药
            </span>
          )}
          {record.consultedDoctor && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[0.7rem] font-bold text-green-700">
              <UserCheck size={12} />
              已咨询医生
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
