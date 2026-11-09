import React from "react";
import { useApp } from "../../hooks/useApp";
import {
  Package, UserCheck, Wrench, PackageCheck, Minus, ClipboardList,
  TriangleAlert, Users, MapPin,
} from "lucide-react";
import { nf, pct } from "../../utils/helpers";

export default function DashboardView() {
  const { assets, loans, docentes, salas } = useApp();

  const total = assets.length;
  const enUso = assets.filter((a) => ["en uso", "prestado"].includes(String(a.estado).toLowerCase())).length;
  const mantenimiento = assets.filter((a) => String(a.estado).toLowerCase() === "mantenimiento").length;
  const disponibles = assets.filter((a) => String(a.estado).toLowerCase() === "disponible").length;
  const bajas = assets.filter((a) => String(a.estado).toLowerCase() === "dado de baja").length;
  const prestamosActivos = loans.filter((l) => l.estado === "Activo");
  const vencidos = prestamosActivos.filter((l) => l.vencido);

  const StatCard = ({ label, value, icon: Icon, tone, detail }) => (
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
          <Minus size={14} /> {detail || "Sin cambios"}
        </span>
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Panel General</h2>
          <p className="mt-0.5 text-sm text-ink-3">Resumen del inventario institucional, préstamos y responsables.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de activos" value={total} icon={Package} tone="bg-accent-soft text-accent-fg" detail={`${nf.format(disponibles)} disponibles`} />
        <StatCard label="Activos prestados" value={enUso} icon={UserCheck} tone="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" detail={`${prestamosActivos.length} préstamos activos`} />
        <StatCard label="En mantenimiento" value={mantenimiento} icon={Wrench} tone="bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" detail="Requieren revisión" />
        <StatCard label="Disponibles" value={disponibles} icon={PackageCheck} tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" detail="Listos para prestar" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
            <ClipboardList size={15} className="text-ink-3" /> Préstamos activos
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{nf.format(prestamosActivos.length)}</p>
          <p className="mt-1 text-xs text-ink-3">Histórico total: {nf.format(loans.length)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
            <TriangleAlert size={15} className="text-red-500" /> Préstamos vencidos
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{nf.format(vencidos.length)}</p>
          <p className="mt-1 text-xs text-ink-3">Devoluciones pendientes</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
            <Users size={15} className="text-ink-3" /> Docentes responsables
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{nf.format(docentes.length)}</p>
          <p className="mt-1 text-xs text-ink-3">Con salas y activos asignados</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
            <MapPin size={15} className="text-ink-3" /> Salas y espacios
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{nf.format(salas.length)}</p>
          <p className="mt-1 text-xs text-ink-3">Con activos registrados</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="mb-4 text-sm font-semibold tracking-tight text-ink">Distribución del inventario por estado</h3>

        <div className="flex h-7 w-full gap-0.5 overflow-hidden rounded-md">
          {total > 0 ? (
            <>
              {disponibles > 0 && <div className="bg-emerald-500 transition-all hover:brightness-110" style={{ width: `${pct(disponibles, total)}%` }} title={`Disponibles: ${pct(disponibles, total)}%`} />}
              {enUso > 0 && <div className="bg-indigo-500 transition-all hover:brightness-110" style={{ width: `${pct(enUso, total)}%` }} title={`Prestados: ${pct(enUso, total)}%`} />}
              {mantenimiento > 0 && <div className="bg-amber-500 transition-all hover:brightness-110" style={{ width: `${pct(mantenimiento, total)}%` }} title={`Mantenimiento: ${pct(mantenimiento, total)}%`} />}
              {bajas > 0 && <div className="bg-slate-400 transition-all hover:brightness-110" style={{ width: `${pct(bajas, total)}%` }} title={`Dados de baja: ${pct(bajas, total)}%`} />}
            </>
          ) : (
            <div className="grid w-full place-items-center rounded-md bg-subtle text-xs text-ink-3">Sin activos registrados</div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <div className="flex items-center gap-2"><span className="size-2 rounded-sm bg-emerald-500"></span><span className="text-[13px] text-ink-2">Disponible</span></div>
          <div className="flex items-center gap-2"><span className="size-2 rounded-sm bg-indigo-500"></span><span className="text-[13px] text-ink-2">Prestado</span></div>
          <div className="flex items-center gap-2"><span className="size-2 rounded-sm bg-amber-500"></span><span className="text-[13px] text-ink-2">Mantenimiento</span></div>
          <div className="flex items-center gap-2"><span className="size-2 rounded-sm bg-slate-400"></span><span className="text-[13px] text-ink-2">Dado de baja</span></div>
        </div>
      </div>
    </div>
  );
}
