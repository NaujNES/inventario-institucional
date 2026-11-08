import React from "react";
import { useApp } from "../../hooks/useApp";
import { Package, UserCheck, Wrench, PackageCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { nf, pct, plural } from "../../utils/helpers";

export default function DashboardView() {
  const { assets } = useApp();

    const total = assets.length;
  
  const enUso = assets.filter((a) => a.estado.toLowerCase() === "en uso").length;
  const mantenimiento = assets.filter((a) => a.estado.toLowerCase() === "mantenimiento").length;
  const disponibles = assets.filter((a) => a.estado.toLowerCase() === "disponible").length;
  const StatCard = ({ label, value, icon: Icon, tone }) => (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-ink-2">{label}</p>
        <span className={`grid size-8 place-items-center rounded-lg ${tone}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-[30px] font-semibold leading-none tracking-tight text-ink">{nf.format(value)}</p>
      <p className="mt-3 flex items-center gap-1.5 text-[13px] text-ink-3">
        <span className="inline-flex items-center gap-0.5 font-medium text-emerald-700 dark:text-emerald-400">
          <Minus size={14} /> Sin cambios
        </span>
        <span>vs. mes anterior</span>
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Panel General</h2>
          <p className="mt-0.5 text-sm text-ink-3">Resumen del inventario institucional</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de activos" value={total} icon={Package} tone="bg-accent-soft text-accent-fg" />
        <StatCard label="Activos en uso" value={enUso} icon={UserCheck} tone="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" />
        <StatCard label="En mantenimiento" value={mantenimiento} icon={Wrench} tone="bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" />
        <StatCard label="Disponibles" value={disponibles} icon={PackageCheck} tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" />
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold tracking-tight text-ink mb-4">Distribución del inventario por estado</h3>
        
        <div className="h-7 flex gap-0.5 w-full rounded-md overflow-hidden">
          {total > 0 ? (
            <>
              {disponibles > 0 && <div className="bg-emerald-500 hover:brightness-110 transition-all" style={{ width: `${pct(disponibles, total)}%` }} title={`Disponibles: ${pct(disponibles, total)}%`} />}
              {enUso > 0 && <div className="bg-indigo-500 hover:brightness-110 transition-all" style={{ width: `${pct(enUso, total)}%` }} title={`En Uso: ${pct(enUso, total)}%`} />}
              {mantenimiento > 0 && <div className="bg-amber-500 hover:brightness-110 transition-all" style={{ width: `${pct(mantenimiento, total)}%` }} title={`Mantenimiento: ${pct(mantenimiento, total)}%`} />}
            </>
          ) : (
            <div className="w-full bg-subtle rounded-md grid place-items-center text-xs text-ink-3">Sin activos registrados</div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <div className="flex items-center gap-2"><span className="size-2 rounded-sm bg-emerald-500"></span><span className="text-[13px] text-ink-2">Disponible</span></div>
          <div className="flex items-center gap-2"><span className="size-2 rounded-sm bg-indigo-500"></span><span className="text-[13px] text-ink-2">En uso</span></div>
          <div className="flex items-center gap-2"><span className="size-2 rounded-sm bg-amber-500"></span><span className="text-[13px] text-ink-2">Mantenimiento</span></div>
        </div>
      </div>
    </div>
  );
}