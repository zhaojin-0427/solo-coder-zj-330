import { Plus, Users } from "lucide-react";
import { useMedStore } from "@/store/useMedStore";
import CaregiverCard from "@/components/CaregiverCard";

export default function CaregiverManager() {
  const caregivers = useMedStore((s) => s.caregivers);
  const addCaregiver = useMedStore((s) => s.addCaregiver);
  const showIcons = useMedStore((s) => s.settings.showIcons);

  return (
    <section className="app-surface flex h-full flex-col bg-paper-shade/40">
      <header className="flex items-center justify-between gap-2 border-b border-paper-line bg-paper/80 px-4 py-3 backdrop-blur">
        <div>
          <h2 className="font-serif text-lg font-black text-paper-ink">
            照护者管理
          </h2>
          <p className="text-xs text-paper-muted">
            共 {caregivers.length} 位照护者
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {caregivers.length === 0 ? (
          <div className="mt-10 rounded-2xl border-2 border-dashed border-paper-line bg-white/50 p-6 text-center">
            <div className="mb-3 flex justify-center">
              {showIcons && (
                <Users size={48} className="text-paper-muted/50" />
              )}
            </div>
            <p className="font-serif text-lg font-bold text-paper-ink">
              还没有照护者
            </p>
            <p className="mt-1 text-sm text-paper-muted">
              点击下方按钮添加第一位家庭成员
            </p>
          </div>
        ) : (
          caregivers.map((c, i) => (
            <CaregiverCard
              key={c.id}
              caregiver={c}
              index={i}
              total={caregivers.length}
            />
          ))
        )}

        <button
          type="button"
          onClick={addCaregiver}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-soft bg-amber-tint/30 py-3 font-bold text-amber-deep transition hover:bg-amber-tint hover:border-amber"
        >
          <Plus size={20} />
          添加照护者
        </button>
      </div>
    </section>
  );
}
