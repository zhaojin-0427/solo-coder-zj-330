import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  severityMeta,
  slotMeta,
} from "@/lib/constants";
import {
  formatDate,
  formatDuration,
  formatSymptoms,
  getDayOfWeek,
  sortObservationRecords,
  getObservationSummary,
  getSymptomEmojis,
} from "@/lib/format";
import type {
  Medicine,
  Caregiver,
  ObservationRecord,
  Settings,
} from "@/types";

interface MedicalSummaryPrintProps {
  settings: Settings;
  medicines: Medicine[];
  caregivers: Caregiver[];
  observationRecords: ObservationRecord[];
  schemeName: string;
  mode: "full" | "pocket";
}

export default function MedicalSummaryPrint({
  settings,
  medicines,
  caregivers,
  observationRecords,
  schemeName,
  mode,
}: MedicalSummaryPrintProps) {
  const showIcons = settings.showIcons;

  const sortedRecords = useMemo(() => {
    return sortObservationRecords(observationRecords);
  }, [observationRecords]);

  const summary = useMemo(() => {
    return getObservationSummary(observationRecords, medicines);
  }, [observationRecords, medicines]);

  const getMedicineName = (medicineId: string | null) => {
    if (!medicineId) return "未关联";
    const med = medicines.find((m) => m.id === medicineId);
    return med?.name || "未知药品";
  };

  if (mode === "pocket") {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border-4 border-amber bg-white p-4 shadow-lg">
        <div className="border-b-2 border-amber-soft pb-3 mb-3">
          <h2 className="font-serif text-xl font-black text-amber-deep text-center">
            🏥 就医随身卡
          </h2>
          <p className="text-center text-sm font-bold text-paper-muted mt-1">
            {schemeName}
          </p>
          <p className="text-center text-xs text-paper-muted">
            生成日期：{formatDate(new Date().toISOString().split("T")[0])}
          </p>
        </div>

        {summary.totalRecords > 0 && (
          <div className="mb-3">
            <h3 className="text-sm font-black text-paper-ink mb-2 flex items-center gap-1">
              {showIcons && <span>📊</span>}
              近期情况摘要
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-paper-shade/50 p-2">
                <p className="font-bold text-paper-muted">异常记录</p>
                <p className="text-lg font-black text-paper-ink">{summary.totalRecords} 次</p>
              </div>
              {summary.severeCount > 0 && (
                <div className="rounded-lg bg-red-100 p-2">
                  <p className="font-bold text-red-700">严重不适</p>
                  <p className="text-lg font-black text-red-600">{summary.severeCount} 次</p>
                </div>
              )}
              {summary.moderateCount > 0 && (
                <div className="rounded-lg bg-amber-100 p-2">
                  <p className="font-bold text-amber-deep">中度不适</p>
                  <p className="text-lg font-black text-amber-deep">{summary.moderateCount} 次</p>
                </div>
              )}
              {summary.consultedCount > 0 && (
                <div className="rounded-lg bg-blue-100 p-2">
                  <p className="font-bold text-blue-700">就医咨询</p>
                  <p className="text-lg font-black text-blue-600">{summary.consultedCount} 次</p>
                </div>
              )}
            </div>
          </div>
        )}

        {summary.byMedicine.length > 0 && (
          <div className="mb-3">
            <h3 className="text-sm font-black text-paper-ink mb-2 flex items-center gap-1">
              {showIcons && <span>💊</span>}
              各药反应
            </h3>
            <div className="space-y-2">
              {summary.byMedicine.slice(0, 3).map((item) => {
                const severity = item.highestSeverity ? severityMeta(item.highestSeverity) : null;
                return (
                  <div key={item.medicineId} className="rounded-lg border border-paper-line p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-paper-ink">{item.medicineName}</span>
                      {severity && (
                        <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] font-black", severity.bg, severity.text)}>
                          {severity.emoji} {severity.label}
                        </span>
                      )}
                    </div>
                    <div className="text-[0.7rem] text-paper-muted mt-1">
                      {item.latestRecord && (
                        <p>
                          最近：{formatDate(item.latestRecord.date)} · {formatSymptoms(item.latestRecord.symptomTypes)}
                        </p>
                      )}
                      {item.consecutiveInfo.isConsecutive && (
                        <p className="text-amber-deep font-bold">
                          ⚠️ 连续 {item.consecutiveInfo.consecutiveDays} 天出现
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-black text-paper-ink mb-2 flex items-center gap-1">
            {showIcons && <span>📋</span>}
            当前用药
          </h3>
          <div className="space-y-1.5">
            {medicines.map((m) => (
              <div key={m.id} className="text-xs">
                <p className="font-bold text-paper-ink">
                  {m.name} <span className="font-normal text-paper-muted">{m.dosage}</span>
                </p>
                <p className="text-[0.65rem] text-paper-muted">
                  {m.frequency} · {m.slots.map((s) => slotMeta(s).label).join("/")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {caregivers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-paper-line">
            <h3 className="text-sm font-black text-paper-ink mb-2 flex items-center gap-1">
              {showIcons && <span>📞</span>}
              紧急联系
            </h3>
            <div className="space-y-1">
              {caregivers.slice(0, 2).map((c) => (
                <div key={c.id} className="text-xs">
                  <p className="font-bold text-paper-ink">
                    {c.name}（{c.relation}）
                  </p>
                  <p className="text-[0.7rem] text-paper-muted">{c.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t-2 border-amber-soft text-center">
          <p className="text-[0.65rem] text-paper-muted">
            就诊时请出示此卡 · 记录仅供医生参考
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="border-b-2 border-amber pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-black text-paper-ink">
              🏥 就医沟通摘要
            </h1>
            <p className="text-base font-bold text-paper-muted mt-1">
              {schemeName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-paper-ink">
              生成日期：{formatDate(new Date().toISOString().split("T")[0])}
            </p>
            {summary.dateRange && (
              <p className="text-xs text-paper-muted">
                记录范围：{formatDate(summary.dateRange.start)} ~ {formatDate(summary.dateRange.end)}
              </p>
            )}
          </div>
        </div>
      </div>

      {summary.totalRecords > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-black text-paper-ink mb-3 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            一、总体情况概览
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border-2 border-paper-line bg-white p-3 text-center">
              <p className="text-sm font-bold text-paper-muted">异常记录总数</p>
              <p className="text-3xl font-black text-paper-ink">{summary.totalRecords}</p>
              <p className="text-xs text-paper-muted">次</p>
            </div>
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 text-center">
              <p className="text-sm font-bold text-red-700">严重不适</p>
              <p className="text-3xl font-black text-red-600">{summary.severeCount}</p>
              <p className="text-xs text-red-600">次</p>
            </div>
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-center">
              <p className="text-sm font-bold text-amber-deep">中度不适</p>
              <p className="text-3xl font-black text-amber-deep">{summary.moderateCount}</p>
              <p className="text-xs text-amber-deep">次</p>
            </div>
            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3 text-center">
              <p className="text-sm font-bold text-green-700">轻微不适</p>
              <p className="text-3xl font-black text-green-600">{summary.mildCount}</p>
              <p className="text-xs text-green-600">次</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <div className="rounded-lg bg-blue-50 px-3 py-1.5">
              <span className="font-bold text-blue-700">就医咨询：</span>
              <span className="font-black text-blue-600">{summary.consultedCount} 次</span>
            </div>
            <div className="rounded-lg bg-red-50 px-3 py-1.5">
              <span className="font-bold text-red-700">暂停用药：</span>
              <span className="font-black text-red-600">{summary.stoppedCount} 次</span>
            </div>
            {summary.hasHighRisk && (
              <div className="rounded-lg bg-red-100 px-3 py-1.5 animate-pulse">
                <span className="font-black text-red-700">⚠️ 有需要医生重点关注的情况</span>
              </div>
            )}
          </div>
        </div>
      )}

      {summary.byMedicine.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-black text-paper-ink mb-3 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber" />
            二、各药品不良反应统计
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-soft/30">
                  <th className="border-2 border-paper-line px-3 py-2 text-left font-black text-paper-ink">
                    药品名称
                  </th>
                  <th className="border-2 border-paper-line px-3 py-2 text-center font-black text-paper-ink">
                    记录次数
                  </th>
                  <th className="border-2 border-paper-line px-3 py-2 text-center font-black text-paper-ink">
                    最高严重程度
                  </th>
                  <th className="border-2 border-paper-line px-3 py-2 text-center font-black text-paper-ink">
                    连续出现
                  </th>
                  <th className="border-2 border-paper-line px-3 py-2 text-left font-black text-paper-ink">
                    主要症状
                  </th>
                  <th className="border-2 border-paper-line px-3 py-2 text-left font-black text-paper-ink">
                    最近记录
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.byMedicine.map((item) => {
                  const severity = item.highestSeverity ? severityMeta(item.highestSeverity) : null;
                  const symptoms = item.latestRecord ? formatSymptoms(item.latestRecord.symptomTypes) : "";
                  return (
                    <tr key={item.medicineId}>
                      <td className="border-2 border-paper-line px-3 py-2 font-bold text-paper-ink">
                        {item.medicineName}
                      </td>
                      <td className="border-2 border-paper-line px-3 py-2 text-center font-black">
                        {item.recordCount}
                      </td>
                      <td className="border-2 border-paper-line px-3 py-2 text-center">
                        {severity && (
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-black", severity.bg, severity.text)}>
                            {severity.emoji} {severity.label}
                          </span>
                        )}
                      </td>
                      <td className="border-2 border-paper-line px-3 py-2 text-center">
                        {item.consecutiveInfo.isConsecutive ? (
                          <span className="font-black text-amber-deep">
                            {item.consecutiveInfo.consecutiveDays} 天 ⚠️
                          </span>
                        ) : (
                          <span className="text-paper-muted">-</span>
                        )}
                      </td>
                      <td className="border-2 border-paper-line px-3 py-2">
                        {symptoms}
                      </td>
                      <td className="border-2 border-paper-line px-3 py-2 text-sm">
                        {item.latestRecord && (
                          <div>
                            <p className="font-bold">{formatDate(item.latestRecord.date)}</p>
                            <p className="text-xs text-paper-muted">{item.latestRecord.treatment}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sortedRecords.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-black text-paper-ink mb-3 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-600" />
            三、详细异常记录时间线
          </h2>
          <div className="space-y-3">
            {sortedRecords.map((record, index) => {
              const severity = severityMeta(record.severity);
              const emojis = getSymptomEmojis(record.symptomTypes);
              return (
                <div
                  key={record.id}
                  className={cn(
                    "rounded-xl border-2 bg-white p-4",
                    severity.border
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-shade text-sm font-black text-paper-ink">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-black text-paper-ink">
                          {formatDate(record.date)} {getDayOfWeek(record.date)}
                          {record.timeSlot && (
                            <span className="ml-2 font-normal text-paper-muted">
                              {slotMeta(record.timeSlot).label}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-paper-muted">
                          关联药品：<span className="font-bold text-amber-deep">{getMedicineName(record.medicineId)}</span>
                        </p>
                      </div>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-black", severity.bg, severity.text)}>
                      {severity.emoji} {severity.label}
                    </span>
                  </div>

                  <div className="ml-11 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-paper-muted">症状：</span>
                      {showIcons && emojis.map((e, i) => (
                        <span key={i} className="text-lg">{e}</span>
                      ))}
                      <span className="text-sm font-bold text-paper-ink">
                        {formatSymptoms(record.symptomTypes)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div>
                        <span className="font-bold text-paper-muted">持续时间：</span>
                        <span className="font-bold text-paper-ink">{formatDuration(record.duration)}</span>
                      </div>
                      {record.stoppedMedication && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                          ⏸️ 已停药
                        </span>
                      )}
                      {record.consultedDoctor && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                          👨‍⚕️ 已咨询医生
                        </span>
                      )}
                    </div>

                    {record.treatment && (
                      <div className="rounded-lg bg-paper-shade/30 p-2">
                        <p className="text-sm font-bold text-paper-muted">处理方式：</p>
                        <p className="text-sm text-paper-ink">{record.treatment}</p>
                      </div>
                    )}

                    {record.notes && (
                      <div className="rounded-lg bg-amber-tint/20 p-2 border border-amber-soft">
                        <p className="text-sm font-bold text-amber-deep">家属备注：</p>
                        <p className="text-sm text-paper-ink">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-5">
        <h2 className="text-lg font-black text-paper-ink mb-3 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-600" />
          四、当前用药方案
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="border-2 border-paper-line px-3 py-2 text-left font-black text-paper-ink">
                  药品名称
                </th>
                <th className="border-2 border-paper-line px-3 py-2 text-left font-black text-paper-ink">
                  剂量
                </th>
                <th className="border-2 border-paper-line px-3 py-2 text-left font-black text-paper-ink">
                  频次
                </th>
                <th className="border-2 border-paper-line px-3 py-2 text-left font-black text-paper-ink">
                  时段
                </th>
                <th className="border-2 border-paper-line px-3 py-2 text-left font-black text-paper-ink">
                  注意事项
                </th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m.id}>
                  <td className="border-2 border-paper-line px-3 py-2 font-bold text-paper-ink">
                    {m.name}
                  </td>
                  <td className="border-2 border-paper-line px-3 py-2">{m.dosage}</td>
                  <td className="border-2 border-paper-line px-3 py-2">{m.frequency}</td>
                  <td className="border-2 border-paper-line px-3 py-2">
                    {m.slots.map((s) => slotMeta(s).label).join("、")}
                  </td>
                  <td className="border-2 border-paper-line px-3 py-2 text-sm">
                    {m.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {caregivers.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-paper-ink mb-3 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-600" />
            五、家属联系方式
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {caregivers.map((c) => (
              <div key={c.id} className="rounded-xl border-2 border-paper-line bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="font-black text-paper-ink">{c.name}</p>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                    {c.relation}
                  </span>
                </div>
                <p className="text-sm font-bold text-paper-ink mt-1">
                  📞 {c.phone}
                </p>
                <p className="text-sm text-paper-muted">
                  负责时段：{c.slots.length > 0 ? c.slots.map((s) => slotMeta(s).label).join("、") : "全天"}
                </p>
                {c.note && (
                  <p className="text-xs text-paper-muted mt-1">{c.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.totalRecords === 0 && (
        <div className="rounded-xl border-2 border-dashed border-paper-line bg-paper-shade/30 p-8 text-center">
          <p className="text-lg font-black text-paper-muted mb-2">
            暂无异常观察记录
          </p>
          <p className="text-sm text-paper-muted">
            如老人服药后有不适反应，请在「异常观察日志」中记录
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t-2 border-paper-line text-center">
        <p className="text-xs text-paper-muted">
          本摘要根据记录自动生成 · 仅供医生参考 · 具体诊断请遵医嘱
        </p>
        <p className="text-xs text-paper-muted mt-1">
          所有数据保存在本地设备，不上传任何隐私信息
        </p>
      </div>
    </div>
  );
}
