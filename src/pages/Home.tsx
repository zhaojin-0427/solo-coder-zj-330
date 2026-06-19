import { useState } from "react";
import { PencilRuler, Layers, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import MedicineForm from "@/components/MedicineForm";
import LabelCanvas from "@/components/LabelCanvas";
import TimeCardPanel from "@/components/TimeCardPanel";
import PrintPreview from "@/components/PrintPreview";
import SchemeDrawer from "@/components/SchemeDrawer";

type MobileTab = "input" | "canvas" | "slots";

const TABS: { key: MobileTab; label: string; icon: typeof Layers }[] = [
  { key: "input", label: "录入", icon: PencilRuler },
  { key: "canvas", label: "标签", icon: Layers },
  { key: "slots", label: "时段卡", icon: Clock },
];

export default function Home() {
  const [tab, setTab] = useState<MobileTab>("input");

  return (
    <div className="flex h-full min-h-screen flex-col bg-paper">
      <Header />

      <div className="flex flex-1 flex-col overflow-hidden pb-14 lg:flex-row lg:pb-0">
        <div
          className={cn(
            "h-full min-h-0 flex-1 overflow-hidden lg:block",
            tab === "input" ? "block" : "hidden",
            "lg:w-80 lg:flex-none",
          )}
        >
          <MedicineForm />
        </div>

        <div
          className={cn(
            "h-full min-h-0 flex-1 overflow-hidden lg:block",
            tab === "canvas" ? "block" : "hidden",
          )}
        >
          <LabelCanvas />
        </div>

        <div
          className={cn(
            "h-full min-h-0 flex-1 overflow-hidden lg:block lg:w-80 lg:flex-none",
            tab === "slots" ? "block" : "hidden",
          )}
        >
          <TimeCardPanel />
        </div>
      </div>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 flex border-t border-paper-line bg-paper/95 backdrop-blur lg:hidden">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-bold transition",
                tab === t.key
                  ? "text-amber-deep"
                  : "text-paper-muted",
              )}
            >
              <Icon
                size={20}
                className={cn(tab === t.key && "text-amber-deep")}
              />
              {t.label}
            </button>
          );
        })}
      </nav>

      <PrintPreview />
      <SchemeDrawer />
    </div>
  );
}
