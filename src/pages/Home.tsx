import { useState } from "react";
import {
  PencilRuler,
  Layers,
  Clock,
  Users,
  ClipboardCheck,
  Package,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import MedicineForm from "@/components/MedicineForm";
import CaregiverManager from "@/components/CaregiverManager";
import LabelCanvas from "@/components/LabelCanvas";
import TimeCardPanel from "@/components/TimeCardPanel";
import HandoverPanel from "@/components/HandoverPanel";
import InventoryPanel from "@/components/InventoryPanel";
import ObservationPanel from "@/components/ObservationPanel";
import PrintPreview from "@/components/PrintPreview";
import SchemeDrawer from "@/components/SchemeDrawer";

type MobileTab = "input" | "caregiver" | "canvas" | "slots" | "handover" | "inventory" | "observation";
type LeftTab = "input" | "caregiver";
type RightTab = "slots" | "handover" | "inventory" | "observation";

const MOBILE_TABS: { key: MobileTab; label: string; icon: typeof Layers }[] = [
  { key: "input", label: "录入", icon: PencilRuler },
  { key: "caregiver", label: "照护者", icon: Users },
  { key: "canvas", label: "标签", icon: Layers },
  { key: "slots", label: "时段卡", icon: Clock },
  { key: "handover", label: "交接", icon: ClipboardCheck },
  { key: "inventory", label: "库存", icon: Package },
  { key: "observation", label: "观察", icon: AlertCircle },
];

export default function Home() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("input");
  const [leftTab, setLeftTab] = useState<LeftTab>("input");
  const [rightTab, setRightTab] = useState<RightTab>("slots");

  return (
    <div className="flex h-full min-h-screen flex-col bg-paper">
      <Header />

      <div className="flex flex-1 flex-col overflow-hidden pb-14 lg:flex-row lg:pb-0">
        <div className="hidden h-full min-h-0 flex-col lg:flex lg:w-80 lg:flex-none">
          <div className="no-print flex border-b border-paper-line bg-paper/80">
            <button
              type="button"
              onClick={() => setLeftTab("input")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition",
                leftTab === "input"
                  ? "text-amber-deep border-b-2 border-amber-deep -mb-px"
                  : "text-paper-muted hover:text-paper-ink",
              )}
            >
              <PencilRuler size={16} />
              药品录入
            </button>
            <button
              type="button"
              onClick={() => setLeftTab("caregiver")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition",
                leftTab === "caregiver"
                  ? "text-amber-deep border-b-2 border-amber-deep -mb-px"
                  : "text-paper-muted hover:text-paper-ink",
              )}
            >
              <Users size={16} />
              照护者
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {leftTab === "input" ? <MedicineForm /> : <CaregiverManager />}
          </div>
        </div>

        <div
          className={cn(
            "h-full min-h-0 flex-1 overflow-hidden lg:block",
            mobileTab === "canvas" ? "block" : "hidden",
          )}
        >
          <LabelCanvas />
        </div>

        <div className="hidden h-full min-h-0 flex-col lg:flex lg:w-80 lg:flex-none">
          <div className="no-print flex border-b border-paper-line bg-paper/80">
            <button
              type="button"
              onClick={() => setRightTab("slots")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition",
                rightTab === "slots"
                  ? "text-amber-deep border-b-2 border-amber-deep -mb-px"
                  : "text-paper-muted hover:text-paper-ink",
              )}
            >
              <Clock size={16} />
              时段卡
            </button>
            <button
              type="button"
              onClick={() => setRightTab("inventory")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition",
                rightTab === "inventory"
                  ? "text-amber-deep border-b-2 border-amber-deep -mb-px"
                  : "text-paper-muted hover:text-paper-ink",
              )}
            >
              <Package size={16} />
              库存
            </button>
            <button
              type="button"
              onClick={() => setRightTab("handover")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition",
                rightTab === "handover"
                  ? "text-amber-deep border-b-2 border-amber-deep -mb-px"
                  : "text-paper-muted hover:text-paper-ink",
              )}
            >
              <ClipboardCheck size={16} />
              交接
            </button>
            <button
              type="button"
              onClick={() => setRightTab("observation")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition",
                rightTab === "observation"
                  ? "text-red-500 border-b-2 border-red-500 -mb-px"
                  : "text-paper-muted hover:text-paper-ink",
              )}
            >
              <AlertCircle size={16} />
              观察
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {rightTab === "slots" ? (
              <TimeCardPanel />
            ) : rightTab === "inventory" ? (
              <InventoryPanel />
            ) : rightTab === "handover" ? (
              <HandoverPanel />
            ) : (
              <ObservationPanel />
            )}
          </div>
        </div>

        <div
          className={cn(
            "h-full min-h-0 flex-1 overflow-hidden lg:hidden",
            mobileTab === "input" ? "block" : "hidden",
          )}
        >
          <MedicineForm />
        </div>
        <div
          className={cn(
            "h-full min-h-0 flex-1 overflow-hidden lg:hidden",
            mobileTab === "caregiver" ? "block" : "hidden",
          )}
        >
          <CaregiverManager />
        </div>
        <div
          className={cn(
            "h-full min-h-0 flex-1 overflow-hidden lg:hidden",
            mobileTab === "slots" ? "block" : "hidden",
          )}
        >
          <TimeCardPanel />
        </div>
        <div
          className={cn(
            "h-full min-h-0 flex-1 overflow-hidden lg:hidden",
            mobileTab === "handover" ? "block" : "hidden",
          )}
        >
          <HandoverPanel />
        </div>
        <div
          className={cn(
            "h-full min-h-0 flex-1 overflow-hidden lg:hidden",
            mobileTab === "inventory" ? "block" : "hidden",
          )}
        >
          <InventoryPanel />
        </div>
        <div
          className={cn(
            "h-full min-h-0 flex-1 overflow-hidden lg:hidden",
            mobileTab === "observation" ? "block" : "hidden",
          )}
        >
          <ObservationPanel />
        </div>
      </div>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 flex border-t border-paper-line bg-paper/95 backdrop-blur lg:hidden">
        {MOBILE_TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setMobileTab(t.key)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-bold transition",
                mobileTab === t.key
                  ? "text-amber-deep"
                  : "text-paper-muted",
              )}
            >
              <Icon
                size={20}
                className={cn(mobileTab === t.key && "text-amber-deep")}
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
