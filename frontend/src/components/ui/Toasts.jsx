import React from "react";
import { useApp } from "../../hooks/useApp";
import { CircleCheck, Info, CircleAlert, X } from "lucide-react";

export default function Toasts() {
  const { toasts } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const isError = t.tone === "error";
        const isSuccess = t.tone === "success";
        
        return (
          <div key={t.id} className="toast pointer-events-auto flex items-start gap-3 p-3 rounded-xl bg-surface border border-line shadow-pop animate-in slide-in-from-bottom-2 fade-in">
            <span className={`mt-0.5 ${isError ? "text-red-500" : isSuccess ? "text-emerald-500" : "text-accent-fg"}`}>
              {isError ? <CircleAlert size={18} /> : isSuccess ? <CircleCheck size={18} /> : <Info size={18} />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-medium text-ink leading-snug">{t.message}</p>
              {t.detail && <p className="text-[13px] text-ink-3 mt-0.5 leading-snug">{t.detail}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}