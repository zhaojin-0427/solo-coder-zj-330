import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SYMPTOM_LIST,
  SEVERITY_LIST,
  DURATION_UNIT_LIST,
  SLOT_LIST,
} from "@/lib/constants";
import { useMedStore } from "@/store/useMedStore";
import type { ObservationRecord, TimeSlot, SymptomType, SeverityLevel, DurationUnit } from "@/types";

interface ObservationFormProps {
  record?: ObservationRecord | null;
  prefill?: {
    medicineId?: string;
    date?: string;
    timeSlot?: TimeSlot;
  };
  onClose: () => void;
}

export default function ObservationForm({ record, prefill, onClose }: ObservationFormProps) {
  const addObservationRecord = useMedStore((s) => s.addObservationRecord);
  const updateObservationRecord = useMedStore((s) => s.updateObservationRecord);
  const medicines = useMedStore((s) => s.medicines);
  const showIcons = useMedStore((s) => s.settings.showIcons);

  const isEditing = !!record;

  const [date, setDate] = useState(record?.date || prefill?.date || new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(record?.timeSlot ?? prefill?.timeSlot ?? null);
  const [medicineId, setMedicineId] = useState<string | null>(record?.medicineId ?? prefill?.medicineId ?? null);
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>(record?.symptomTypes || []);
  const [severity, setSeverity] = useState<SeverityLevel>(record?.severity || "mild");
  const [durationValue, setDurationValue] = useState<number>(record?.duration.value || 1);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(record?.duration.unit || "hours");
  const [stoppedMedication, setStoppedMedication] = useState<boolean>(record?.stoppedMedication || false);
  const [consultedDoctor, setConsultedDoctor] = useState<boolean>(record?.consultedDoctor || false);
  const [treatment, setTreatment] = useState<string>(record?.treatment || "");
  const [notes, setNotes] = useState<string>(record?.notes || "");

  const toggleSymptom = (symptom: SymptomType) => {
    setSymptomTypes((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (symptomTypes.length === 0) {
      alert("请至少选择一种症状");
      return;
    }

    const recordData = {
      date,
      timeSlot,
      medicineId,
      symptomTypes,
      severity,
      duration: { value: durationValue, unit: durationUnit },
      stoppedMedication,
      consultedDoctor,
      treatment,
      notes,
    };

    if (isEditing && record) {
      updateObservationRecord(record.id, recordData);
    } else {
      addObservationRecord(recordData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-paper shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-paper-line bg-paper/95 px-5 py-4 backdrop-blur">
          <h3 className="font-serif text-xl font-black text-paper-ink">
            {isEditing ? "编辑异常观察记录" : "新增异常观察记录"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-paper-muted transition hover:bg-paper-shade hover:text-paper-ink"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-paper-muted">
                观察日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border-2 border-paper-line bg-white px-3 py-2 text-base font-semibold text-paper-ink outline-none transition focus:border-amber"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-paper-muted">
                服药时段（可选）
              </label>
              <div className="flex gap-1.5">
                {SLOT_LIST.map((s) => {
                  const active = timeSlot === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setTimeSlot(active ? null : s.key)}
                      className={cn(
                        "flex-1 rounded-lg border-2 px-2 py-2 text-sm font-bold transition",
                        active
                          ? "border-transparent bg-amber text-white shadow-sm"
                          : "border-paper-line bg-white text-paper-muted hover:border-amber"
                      )}
                    >
                      {showIcons && <span className="mr-1">{s.emoji}</span>}
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-paper-muted">
              关联药品（可选）
            </label>
            <select
              value={medicineId || ""}
              onChange={(e) => setMedicineId(e.target.value || null)}
              className="w-full rounded-xl border-2 border-paper-line bg-white px-3 py-2 text-base font-semibold text-paper-ink outline-none transition focus:border-amber"
            >
              <option value="">不关联特定药品（通用记录）</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-paper-muted">
              症状类型（可多选）
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_LIST.map((s) => {
                const active = symptomTypes.includes(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleSymptom(s.key)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border-2 px-3 py-1.5 text-sm font-bold transition",
                      active
                        ? "border-transparent bg-red-500 text-white shadow-sm"
                        : "border-paper-line bg-white text-paper-muted hover:border-red-300"
                    )}
                  >
                    {showIcons && <span>{s.emoji}</span>}
                    {s.label}
                    {active && <X size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-paper-muted">
              严重程度
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SEVERITY_LIST.map((s) => {
                const active = severity === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSeverity(s.key)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 transition",
                      active
                        ? cn(s.border, s.bg, "shadow-sm ring-2", s.ring)
                        : "border-paper-line bg-white hover:border-amber"
                    )}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className={cn("text-sm font-black", active ? s.text : "text-paper-muted")}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-paper-muted">
              持续时间
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={durationValue}
                onChange={(e) => setDurationValue(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                className="w-24 rounded-xl border-2 border-paper-line bg-white px-3 py-2 text-base font-semibold text-paper-ink outline-none transition focus:border-amber"
              />
              <div className="flex gap-1.5">
                {DURATION_UNIT_LIST.map((d) => {
                  const active = durationUnit === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDurationUnit(d.key)}
                      className={cn(
                        "rounded-lg border-2 px-3 py-2 text-sm font-bold transition",
                        active
                          ? "border-transparent bg-amber text-white shadow-sm"
                          : "border-paper-line bg-white text-paper-muted hover:border-amber"
                      )}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-paper-line bg-white p-3 transition hover:border-amber">
              <span className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-paper-line transition-colors duration-200 ease-in-out focus:outline-none">
                <input
                  type="checkbox"
                  checked={stoppedMedication}
                  onChange={(e) => setStoppedMedication(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    stoppedMedication ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-0 rounded-full transition-colors duration-200",
                    stoppedMedication ? "bg-red-500" : "bg-paper-line"
                  )}
                />
              </span>
              <div>
                <p className="text-sm font-black text-paper-ink">已停药</p>
                <p className="text-xs text-paper-muted">暂停服用该药品</p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-paper-line bg-white p-3 transition hover:border-amber">
              <span className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-paper-line transition-colors duration-200 ease-in-out focus:outline-none">
                <input
                  type="checkbox"
                  checked={consultedDoctor}
                  onChange={(e) => setConsultedDoctor(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    consultedDoctor ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-0 rounded-full transition-colors duration-200",
                    consultedDoctor ? "bg-green-600" : "bg-paper-line"
                  )}
                />
              </span>
              <div>
                <p className="text-sm font-black text-paper-ink">已咨询医生</p>
                <p className="text-xs text-paper-muted">已联系医生或就医</p>
              </div>
            </label>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-paper-muted">
              处理方式
            </label>
            <input
              type="text"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="例如：休息后缓解、服用过敏药、送医等"
              className="w-full rounded-xl border-2 border-paper-line bg-white px-3 py-2 text-base font-semibold text-paper-ink outline-none transition focus:border-amber"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-paper-muted">
              家属备注
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录详细情况，如症状具体表现、与饮食/活动的关系、后续观察计划等"
              rows={3}
              className="w-full resize-y rounded-xl border-2 border-paper-line bg-white px-3 py-2 text-base text-paper-ink outline-none transition focus:border-amber"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-paper-line py-3 text-base font-black text-paper-muted transition hover:bg-paper-shade"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-amber py-3 text-base font-black text-white shadow-sm transition hover:bg-amber-soft"
            >
              {isEditing ? "保存修改" : "添加记录"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
