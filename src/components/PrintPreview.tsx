import { useState } from "react";
import { X, Printer, StickyNote, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAPER_META } from "@/lib/constants";
import { useMedStore } from "@/store/useMedStore";
import StickerLabel from "@/components/StickerLabel";
import PocketCard from "@/components/PocketCard";
import type { Medicine, PaperSize } from "@/types";

function groupMedicines(medicines: Medicine[]): [string, Medicine[]][] {
  const map = new Map<string, Medicine[]>();
  for (const m of medicines) {
    const key = m.group || "未分组";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries());
}

export default function PrintPreview() {
  const open = useMedStore((s) => s.previewOpen);
  const setOpen = useMedStore((s) => s.setPreviewOpen);
  const medicines = useMedStore((s) => s.medicines);
  const settings = useMedStore((s) => s.settings);
  const currentName = useMedStore((s) => s.currentName);
  const setPaper = useMedStore((s) => s.setPaper);

  const [tab, setTab] = useState<"sticker" | "pocket">("sticker");

  if (!open) return null;

  const paper = PAPER_META[settings.paperSize];
  const groups = groupMedicines(medicines);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-lg font-black">打印预览</h2>
          <div className="flex items-center gap-0.5 rounded-lg bg-white/10 p-0.5">
            <button
              type="button"
              onClick={() => setTab("sticker")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition",
                tab === "sticker" ? "bg-amber text-zinc-900" : "text-white/80",
              )}
            >
              <StickyNote size={15} />
              标签贴纸
            </button>
            <button
              type="button"
              onClick={() => setTab("pocket")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition",
                tab === "pocket" ? "bg-amber text-zinc-900" : "text-white/80",
              )}
            >
              <CreditCard size={15} />
              随身卡
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tab === "sticker" && (
            <div className="flex items-center gap-1 rounded-lg bg-white/10 p-0.5">
              {(Object.keys(PAPER_META) as PaperSize[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaper(p)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-bold transition",
                    settings.paperSize === p
                      ? "bg-amber text-zinc-900"
                      : "text-white/80",
                  )}
                >
                  {PAPER_META[p].label}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber px-3 py-1.5 text-sm font-black text-zinc-900 transition hover:bg-amber-soft"
          >
            <Printer size={15} />
            打印 / 导出 PDF
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="关闭预览"
            className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-zinc-800 p-4 sm:p-8">
        <p className="mx-auto mb-3 max-w-3xl text-center text-xs text-white/50">
          提示：点击「打印 / 导出 PDF」后，在系统对话框中选择“另存为 PDF”即可保存。下方为实际打印内容预览。
        </p>

        <div className="print-root mx-auto max-w-3xl rounded-xl bg-white p-4 shadow-2xl sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-paper-line pb-2">
            <h3 className="font-serif text-xl font-black text-paper-ink">
              {currentName || "服药方案"}
            </h3>
            <span className="text-xs font-semibold text-paper-muted">
              {tab === "sticker" ? `${paper.label} · 标签贴纸` : "随身服药卡"}
            </span>
          </div>

          {tab === "sticker" ? (
            medicines.length === 0 ? (
              <p className="py-10 text-center text-paper-muted">暂无药品</p>
            ) : (
              <div className="space-y-5">
                {groups.map(([group, list]) => (
                  <div key={group}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber" />
                      <h4 className="font-serif text-base font-black text-paper-ink">
                        {group}
                      </h4>
                    </div>
                    <div
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns: `repeat(${paper.cols}, minmax(0, 1fr))`,
                      }}
                    >
                      {list.map((m) => (
                        <StickerLabel
                          key={m.id}
                          medicine={m}
                          settings={settings}
                          compact={paper.cols >= 3}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex justify-center">
              <PocketCard
                name={currentName}
                medicines={medicines}
                settings={settings}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
