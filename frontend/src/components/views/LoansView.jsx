import { useMemo, useState } from "react";
import {
  ArrowRightLeft, CalendarClock, CheckCircle2, ClipboardList,
  Eye, Plus, Search, TriangleAlert, Undo2,
} from "lucide-react";
import { useApp } from "../../hooks/useApp";
import { fmtDateTime } from "../../utils/helpers";
import StatusBadge from "../ui/StatusBadge";
import LoanModal from "../modals/LoanModal";
import ReturnLoanModal from "../modals/ReturnLoanModal";
import AssetDetailModal from "../modals/AssetDetailModal";

export default function LoansView() {
  const { loans } = useApp();
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [loanOpen, setLoanOpen] = useState(false);
  const [returnLoanId, setReturnLoanId] = useState(null);
  const [detailAssetId, setDetailAssetId] = useState(null);
  const { assets } = useApp();

  const activos = loans.filter((l) => l.estado === "Activo");
  const vencidos = activos.filter((l) => l.vencido);
  const devueltos = loans.filter((l) => l.estado === "Devuelto");

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return loans.filter((l) => {
      const coincideEstado =
        estadoFiltro === "Todos" ||
        (estadoFiltro === "Vencido" ? l.vencido && l.estado === "Activo" : l.estado === estadoFiltro);
      if (!coincideEstado) return false;
      if (!term) return true;
      return (
        String(l.nombre_solicitante || "").toLowerCase().includes(term) ||
        String(l.grado || "").toLowerCase().includes(term) ||
        String(l.actividad || "").toLowerCase().includes(term) ||
        String(l.nombre_activo || "").toLowerCase().includes(term) ||
        String(l.codigo_activo || "").toLowerCase().includes(term)
      );
    });
  }, [loans, search, estadoFiltro]);

  const loanSeleccionado = loans.find((l) => l.id === returnLoanId) || null;
  const assetDetalle = assets.find((a) => a.id === detailAssetId) || null;

  const StatCard = ({ label, value, icon: Icon, tone }) => (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-ink-2">{label}</p>
        <span className={`grid size-8 place-items-center rounded-lg ${tone}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold leading-none tracking-tight text-ink">{value}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Préstamos activos" value={activos.length} icon={ClipboardList} tone="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" />
        <StatCard label="Vencidos" value={vencidos.length} icon={TriangleAlert} tone="bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" />
        <StatCard label="Devueltos" value={devueltos.length} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" />
        <StatCard label="Total histórico" value={loans.length} icon={CalendarClock} tone="bg-accent-soft text-accent-fg" />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Préstamos de activos</h2>
          <p className="text-sm text-ink-3">
            Entregas temporales a estudiantes, docentes o visitantes. El responsable permanente se gestiona desde la ficha del activo.
          </p>
        </div>
        <button onClick={() => setLoanOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Nuevo préstamo
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              className="field pl-9"
              placeholder="Buscar por solicitante, activo, grado o actividad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["Todos", "Activo", "Vencido", "Devuelto"].map((estado) => (
              <button
                key={estado}
                onClick={() => setEstadoFiltro(estado)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  estadoFiltro === estado
                    ? "border-accent bg-accent-soft text-accent-fg"
                    : "border-line-strong bg-surface text-ink-2 hover:bg-subtle"
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left border-collapse">
            <thead className="border-b border-line bg-subtle text-xs uppercase tracking-wider text-ink-3">
              <tr>
                <th className="p-4 font-medium">Activo</th>
                <th className="p-4 font-medium">Solicitante</th>
                <th className="p-4 font-medium">Grado</th>
                <th className="p-4 font-medium">Actividad</th>
                <th className="p-4 font-medium">Préstamo</th>
                <th className="p-4 font-medium">Devolución esperada</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtrados.map((l) => (
                <tr key={l.id} className="hover:bg-subtle transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-ink">{l.nombre_activo || `Activo #${l.id_activo}`}</p>
                    <p className="font-mono text-xs text-ink-3">{l.codigo_activo || "—"}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-ink">{l.nombre_solicitante}</p>
                    <p className="text-xs text-ink-3">{l.componentes?.length || 0} componentes registrados</p>
                  </td>
                  <td className="p-4 text-ink-2">{l.grado || "—"}</td>
                  <td className="p-4 text-ink-2">
                    <span className="line-clamp-2 max-w-[220px]" title={l.actividad || ""}>{l.actividad || "—"}</span>
                  </td>
                  <td className="p-4 text-ink-2 whitespace-nowrap">{fmtDateTime(l.fecha_prestamo)}</td>
                  <td className="p-4 text-ink-2 whitespace-nowrap">
                    {fmtDateTime(l.fecha_devolucion_esperada)}
                    {l.vencido && l.estado === "Activo" && (
                      <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">Fecha vencida</p>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge estado={l.estado} kind="loan" />
                      {l.vencido && l.estado === "Activo" && <StatusBadge estado="Vencido" kind="loan" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setDetailAssetId(l.id_activo)}
                        className="p-1.5 text-ink-3 hover:bg-subtle hover:text-ink rounded-md transition-colors"
                        title="Ver ficha e historial del activo"
                      >
                        <Eye size={16} />
                      </button>
                      {l.estado === "Activo" && (
                        <button
                          onClick={() => setReturnLoanId(l.id)}
                          className="btn btn-secondary btn-sm text-emerald-600"
                        >
                          <Undo2 size={14} /> Devolver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-ink-3">
                    {loans.length === 0 ? "No hay préstamos registrados. Crea el primero." : "No se encontraron préstamos con los filtros actuales."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-line bg-subtle/60 p-3 text-xs text-ink-3">
        <ArrowRightLeft size={15} className="mt-0.5 flex-none" />
        <span>
          Un activo prestado no puede volver a prestarse hasta registrar su devolución. Los activos en mantenimiento o dados de baja tampoco pueden prestarse.
        </span>
      </div>

      <LoanModal isOpen={loanOpen} onClose={() => setLoanOpen(false)} />
      <ReturnLoanModal
        isOpen={!!loanSeleccionado}
        loan={loanSeleccionado}
        onClose={() => setReturnLoanId(null)}
      />
      <AssetDetailModal
        isOpen={!!assetDetalle}
        asset={assetDetalle}
        onClose={() => setDetailAssetId(null)}
      />
    </div>
  );
}
