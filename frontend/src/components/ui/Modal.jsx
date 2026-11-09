import React from "react";
import { X } from "lucide-react";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  size = "lg",
  children,
  footer,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-pop ${SIZES[size] || SIZES.lg}`}
      >
        <div className="flex flex-none items-start justify-between gap-4 border-b border-line p-5">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span className="mt-0.5 grid size-9 flex-none place-items-center rounded-lg bg-accent-soft text-accent-fg">
                <Icon size={18} />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-ink">{title}</h2>
              {subtitle && <p className="mt-0.5 text-xs text-ink-3">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="icon-btn flex-none text-ink-3 hover:bg-subtle" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="flex flex-none flex-wrap justify-end gap-2 border-t border-line bg-subtle/50 p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
