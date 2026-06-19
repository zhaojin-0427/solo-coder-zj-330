import { useState } from "react";
import {
  Save,
  FolderOpen,
  Printer,
  Contrast,
  Type,
  Sparkle,
  Pill,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FONT_SIZE_LABEL } from "@/lib/constants";
import { useMedStore } from "@/store/useMedStore";
import type { FontSizeLevel } from "@/types";

export default function Header() {
  const currentName = useMedStore((s) => s.currentName);
  const dirty = useMedStore((s) => s.dirty);
  const settings = useMedStore((s) => s.settings);
  const saveCurrent = useMedStore((s) => s.saveCurrent);
  const setSchemeDrawerOpen = useMedStore((s) => s.setSchemeDrawerOpen);
  const setPreviewOpen = useMedStore((s) => s.setPreviewOpen);
  const toggleContrast = useMedStore((s) => s.toggleContrast);
  const toggleIcons = useMedStore((s) => s.toggleIcons);
  const setFontSize = useMedStore((s) => s.setFontSize);

  const [name, setName] = useState(currentName);

  const handleSave = () => {
    saveCurrent(name || currentName);
  };

  const fontSizes: FontSizeLevel[] = ["large", "xlarge", "xxlarge"];

  return (
    <header className="app-surface no-print z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-amber/30 bg-paper px-4 py-2.5 shadow-panel">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber text-white shadow-sm">
          <Pill size={22} />
        </div>
        <div className="leading-tight">
          <h1 className="font-serif text-xl font-black text-paper-ink">
            药盒标签放大器
          </h1>
          <p className="text-[0.7rem] font-semibold text-paper-muted">
            家庭适老打印工具 · 离线可用
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => useMedStore.setState({ currentName: name })}
          placeholder="方案名称"
          className={cn(
            "min-w-0 max-w-xs flex-1 rounded-xl border-2 border-paper-line bg-white px-3 py-1.5 font-bold text-paper-ink outline-none transition focus:border-amber",
            dirty && "border-amber/60 bg-amber-tint/30",
          )}
          aria-label="方案名称"
        />
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber px-3 py-1.5 font-bold text-white shadow-sm transition hover:bg-amber-deep"
        >
          <Save size={16} />
          保存方案
        </button>
        <button
          type="button"
          onClick={() => setSchemeDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border-2 border-paper-line bg-white px-3 py-1.5 font-bold text-paper-ink transition hover:border-amber"
        >
          <FolderOpen size={16} />
          方案库
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex items-center gap-0.5 rounded-xl bg-paper-shade p-0.5">
          <Type size={14} className="ml-1.5 text-paper-muted" />
          {fontSizes.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFontSize(f)}
              aria-pressed={settings.fontSize === f}
              className={cn(
                "rounded-lg px-2 py-1 text-xs font-bold transition",
                settings.fontSize === f
                  ? "bg-amber text-white shadow-sm"
                  : "text-paper-muted hover:text-paper-ink",
              )}
            >
              {FONT_SIZE_LABEL[f]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleIcons}
          aria-pressed={settings.showIcons}
          className={cn(
            "inline-flex items-center gap-1 rounded-xl border-2 px-2.5 py-1.5 text-xs font-bold transition",
            settings.showIcons
              ? "border-amber bg-amber-tint text-amber-deep"
              : "border-paper-line bg-white text-paper-muted",
          )}
          title="图标提示"
        >
          <Sparkle size={14} />
          图标
        </button>

        <button
          type="button"
          onClick={toggleContrast}
          aria-pressed={settings.highContrast}
          className={cn(
            "inline-flex items-center gap-1 rounded-xl border-2 px-2.5 py-1.5 text-xs font-bold transition",
            settings.highContrast
              ? "border-black bg-black text-white"
              : "border-paper-line bg-white text-paper-ink hover:border-amber",
          )}
          title="高对比模式"
        >
          <Contrast size={14} />
          高对比
        </button>

        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-deep px-3 py-1.5 font-bold text-white shadow-sm transition hover:bg-amber"
        >
          <Printer size={16} />
          导出打印
        </button>
      </div>
    </header>
  );
}
