import { Printer, Layers, Grid2x2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAPER_META } from "@/lib/constants";
import { useMedStore } from "@/store/useMedStore";
import StickerLabel from "@/components/StickerLabel";
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

export default function LabelCanvas() {
  const medicines = useMedStore((s) => s.medicines);
  const settings = useMedStore((s) => s.settings);
  const setPaper = useMedStore((s) => s.setPaper);
  const setPreviewOpen = useMedStore((s) => s.setPreviewOpen);

  const paper = PAPER_META[settings.paperSize];
  const groups = groupMedicines(medicines);

  return (
    <section className="app-surface flex h-full flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-paper-line bg-paper/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-amber-deep" />
          <h2 className="font-serif text-lg font-black text-paper-ink">
            标签画布
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 rounded-xl bg-paper-shade p-0.5">
            <Grid2x2 size={14} className="ml-1.5 text-paper-muted" />
            {(Object.keys(PAPER_META) as PaperSize[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPaper(p)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                  settings.paperSize === p
                    ? "bg-amber text-white shadow-sm"
                    : "text-paper-muted hover:text-paper-ink",
                )}
              >
                {PAPER_META[p].label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1 rounded-xl bg-amber-deep px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber"
          >
            <Printer size={14} />
            打印预览
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-paper-grain p-4 sm:p-6">
        {medicines.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-serif text-xl font-bold text-paper-muted">
              添加药品后，大字标签会出现在这里
            </p>
          </div>
        ) : (
          <div
            className="mx-auto"
            style={{ maxWidth: paper.width * 0.62 }}
          >
            {groups.map(([group, list]) => (
              <div key={group} className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber" />
                  <h3 className="font-serif text-base font-black text-paper-ink">
                    {group}
                  </h3>
                  <span className="text-xs text-paper-muted">
                    {list.length} 种
                  </span>
                  <span className="h-px flex-1 bg-paper-line" />
                </div>
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: `repeat(${paper.cols}, minmax(0, 1fr))` }}
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
        )}
      </div>
    </section>
  );
}
