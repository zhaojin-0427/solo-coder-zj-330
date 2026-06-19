import { Plus, FilePlus2, Sparkles } from "lucide-react";
import { useMedStore } from "@/store/useMedStore";
import MedicineCard from "@/components/MedicineCard";

export default function MedicineForm() {
  const medicines = useMedStore((s) => s.medicines);
  const addMedicine = useMedStore((s) => s.addMedicine);
  const newScheme = useMedStore((s) => s.newScheme);
  const loadSample = useMedStore((s) => s.loadSample);

  return (
    <section className="app-surface flex h-full flex-col bg-paper-shade/40">
      <header className="flex items-center justify-between gap-2 border-b border-paper-line bg-paper/80 px-4 py-3 backdrop-blur">
        <div>
          <h2 className="font-serif text-lg font-black text-paper-ink">
            药品录入
          </h2>
          <p className="text-xs text-paper-muted">
            共 {medicines.length} 种药品
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={loadSample}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-amber-deep transition hover:bg-amber-tint"
          >
            <Sparkles size={14} />
            示例
          </button>
          <button
            type="button"
            onClick={newScheme}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-paper-muted transition hover:bg-paper-shade"
          >
            <FilePlus2 size={14} />
            新建
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {medicines.length === 0 ? (
          <div className="mt-10 rounded-2xl border-2 border-dashed border-paper-line bg-white/50 p-6 text-center">
            <p className="font-serif text-lg font-bold text-paper-ink">
              还没有药品
            </p>
            <p className="mt-1 text-sm text-paper-muted">
              点击下方按钮添加第一种药品
            </p>
          </div>
        ) : (
          medicines.map((m, i) => (
            <MedicineCard
              key={m.id}
              medicine={m}
              index={i}
              total={medicines.length}
            />
          ))
        )}

        <button
          type="button"
          onClick={addMedicine}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-soft bg-amber-tint/30 py-3 font-bold text-amber-deep transition hover:bg-amber-tint hover:border-amber"
        >
          <Plus size={20} />
          添加药品
        </button>
      </div>
    </section>
  );
}
