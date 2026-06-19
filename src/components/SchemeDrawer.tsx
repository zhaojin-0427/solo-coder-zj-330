import {
  X,
  FolderOpen,
  Trash2,
  Calendar,
  Pill,
  Inbox,
} from "lucide-react";
import { useMedStore } from "@/store/useMedStore";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function SchemeDrawer() {
  const open = useMedStore((s) => s.schemeDrawerOpen);
  const setOpen = useMedStore((s) => s.setSchemeDrawerOpen);
  const schemes = useMedStore((s) => s.schemes);
  const loadScheme = useMedStore((s) => s.loadScheme);
  const deleteScheme = useMedStore((s) => s.deleteScheme);
  const currentName = useMedStore((s) => s.currentName);

  if (!open) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="关闭"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-paper shadow-2xl animate-pop-in">
        <header className="flex items-center justify-between border-b border-paper-line bg-amber px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <FolderOpen size={20} />
            <h2 className="font-serif text-lg font-black">方案库</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="关闭"
            className="rounded-lg p-1.5 transition hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3">
          {schemes.length === 0 ? (
            <div className="mt-16 text-center text-paper-muted">
              <Inbox size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-serif text-lg font-bold">还没有保存的方案</p>
              <p className="mt-1 text-sm">
                在顶部填写方案名称并点击「保存方案」
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {schemes.map((s) => (
                <li
                  key={s.id}
                  className={`rounded-2xl border-2 bg-white p-3 shadow-sm transition ${
                    s.name === currentName
                      ? "border-amber"
                      : "border-paper-line hover:border-amber-soft"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-serif text-base font-black text-paper-ink">
                        {s.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-paper-muted">
                        <span className="inline-flex items-center gap-1">
                          <Pill size={12} />
                          {s.medicines.length} 种药品
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(s.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteScheme(s.id)}
                      aria-label="删除方案"
                      className="shrink-0 rounded-lg p-1.5 text-red-400 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      loadScheme(s);
                      setOpen(false);
                    }}
                    className="mt-2 w-full rounded-lg bg-amber-tint py-1.5 text-sm font-bold text-amber-deep transition hover:bg-amber-soft hover:text-white"
                  >
                    加载此方案
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-paper-line bg-paper-shade/60 px-4 py-3 text-xs text-paper-muted">
          方案仅保存在本浏览器（localStorage），不上传任何数据。
        </footer>
      </aside>
    </div>
  );
}
