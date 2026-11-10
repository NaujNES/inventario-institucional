import { useEffect, useMemo, useState } from "react";
import {
  Boxes, ClipboardList, History, MapPin, Package,
  PencilLine, RefreshCw, UserCheck, UserRound, ArrowRightLeft, Undo2,
} from "lucide-react";
import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import { useApp } from "../../hooks/useApp";
import { fmtDate, fmtDateTime } from "../../utils/helpers";
import LoanModal from "./LoanModal";
import ReturnLoanModal from "./ReturnLoanModal";

const TABS = [
  { id: "resumen", label: "Resumen", icon: Package },
  { id: "prestamos", label: "Historial de préstamos", icon: ClipboardList },
  { id: "asignaciones", label: "Responsables y ubicación", icon: UserCheck },
  { id: "cambios", label: "Bitácora", icon: History },
];

function LoanCard({ loan }) {
  return (
    <details className="group rounded-lg border border-line bg-surface">
      <summary className="flex cursor-pointer flex-wrap items-center gap-2 p-3">
        <span className="font-medium text-ink">{loan.nombre_solicitante}</span>
        {loan.grado && <span className="text-xs text-ink-3">· {loan.grado}</span>}
        <StatusBadge estado={loan.estado} kind="loan" />
        {loan.vencido && <StatusBadge estado="Vencido" kind="loan" />}
        <span className="ml-auto text-xs text-ink-3">{fmtDateTime(loan.fecha_prestamo)}</span>
      </summary>
      <div className="border-t border-line p-3">
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Actividad</p>
            <p className="text-ink-2">{loan.actividad || "No registrada"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Fechas</p>
            <p className="text-ink-2">Préstamo: {fmtDateTime(loan.fecha_prestamo)}</p>
            <p className="text-ink-2">Entrega: {fmtDateTime(loan.fecha_entrega)}</p>
            <p className="text-ink-2">Devolución esperada: {fmtDateTime(loan.fecha_devolucion_esperada)}</p>
            <p className="text-ink-2">Devolución real: {loan.fecha_devolucion_real ? fmtDateTime(loan.fecha_devolucion_real) : "Pendiente"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Entrega</p>
            <p className="text-ink-2">{loan.observaciones_entrega || "Sin observaciones"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Devolución</p>
            <p className="text-ink-2">{loan.observaciones_devolucion || "Sin observaciones"}</p>
            <p className="text-ink-2">Recibió: {loan.persona_recibe_devolucion || "No registrado"}</p>
            <p className="text-ink-2">Estado general: {loan.estado_devolucion || "No registrado"}</p>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="bg-subtle text-ink-3">
              <tr>
                <th className="p-2 font-medium">Componente</th>
                <th className="p-2 font-medium">Al entregar</th>
                <th className="p-2 font-medium">Al recibir</th>
                <th className="p-2 font-medium">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(loan.componentes || []).map((c) => (
                <tr key={c.id_componente_prestamo}>
                  <td className="p-2 font-medium text-ink">{c.nombre_componente}</td>
                  <td className="p-2">
                    <StatusBadge estado={c.estado_entrega} />
                    {c.observacion_entrega && <p className="mt-1 text-ink-3">{c.observacion_entrega}</p>}
                  </td>
                  <td className="p-2">
                    {c.estado_devolucion ? <StatusBadge estado={c.estado_devolucion} /> : <span className="text-ink-3">Pendiente</span>}
                    {c.observacion_devolucion && <p className="mt-1 text-ink-3">{c.observacion_devolucion}</p>}
                  </td>
                  <td className="p-2 text-ink-3">
                    {c.observacion_entrega || c.observacion_devolucion || "Sin observaciones"}
                  </td>
                </tr>
              ))}
              {(loan.componentes || []).length === 0 && (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-ink-3">Sin componentes registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}

export default function AssetDetailModal({ isOpen, asset, onClose }) {
  const {
    categories, locations, docentes, assignments,
    assignAsset, closeAssignment, fetchAssetHistory,
  } = useApp();
  const [tab, setTab] = useState("resumen");
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignForm, setAssignForm] = useState({ id_usuario_responsable: "", id_ubicacion: "", observaciones: "" });
  const [savingAssign, setSavingAssign] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const categoria = categories.find((c) => c.id === asset?.categoriaId);
  const ubicacion = locations.find((l) => l.id === asset?.ubicacionId);
  const asignacionContexto = assignments.find(
    (a) => a.idActivo === asset?.id && a.estado === "Activa"
  );

  const loadHistory = async () => {
    if (!asset) return;
    setLoading(true);
    const data = await fetchAssetHistory(asset.id);
    setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && asset) {
      setTab("resumen");
      loadHistory();
      setAssignForm({
        id_usuario_responsable: "",
        id_ubicacion: String(asset.ubicacionId || ""),
        observaciones: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, asset?.id]);

  const asignacionActual = history?.asignacionActual || asignacionContexto;
  const prestamoActivo = history?.prestamoActivo || null;

  const docentesDisponibles = useMemo(() => {
    const base = docentes.map((d) => ({ id: d.id, nombre: d.nombre, documento: d.documento }));
    if (asignacionActual && !base.some((d) => d.id === asignacionActual.idUsuarioResponsable)) {
      base.push({
        id: asignacionActual.idUsuarioResponsable,
        nombre: asignacionActual.nombreResponsable || "Responsable actual",
        documento: asignacionActual.documentoResponsable || "",
      });
    }
    return base;
  }, [docentes, asignacionActual]);

  useEffect(() => {
    if (!asset) return;
    setAssignForm((prev) => ({
      ...prev,
      id_usuario_responsable: asignacionActual
        ? String(asignacionActual.idUsuarioResponsable)
        : prev.id_usuario_responsable,
      id_ubicacion: String(asset.ubicacionId || ""),
    }));
  }, [asset?.id, asignacionActual?.idUsuarioResponsable, asset?.ubicacionId]);

  if (!isOpen || !asset) return null;

  const disponible = String(asset.estado || "").toLowerCase() === "disponible";

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.id_usuario_responsable || !assignForm.id_ubicacion) return;
    setSavingAssign(true);
    const ok = await assignAsset(asset.id, assignForm);
    setSavingAssign(false);
    if (ok) {
      setAssignForm((prev) => ({ ...prev, observaciones: "" }));
      await loadHistory();
    }
  };

  const handleCloseAssignment = async () => {
    if (!asignacionActual) return;
    if (!window.confirm("¿Cerrar la asignación permanente actual? El activo quedará sin responsable, pero el historial se conservará.")) return;
    const ok = await closeAssignment(asignacionActual.id, "Cierre manual de asignación.");
    if (ok) await loadHistory();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={asset.nombre}
        subtitle={`${asset.codigo} · ${categoria?.nombre || "Sin categoría"}`}
        icon={Package}
        size="xl"
        footer={
          <>
            {disponible && (
              <button onClick={() => setLoanOpen(true)} className="btn btn-primary">
                <ArrowRightLeft size={16} /> Prestar activo
              </button>
            )}
            {prestamoActivo && (
              <button onClick={() => setReturnOpen(true)} className="btn btn-secondary text-emerald-600">
                <Undo2 size={16} /> Registrar devolución
              </button>
            )}
            <button onClick={onClose} className="btn btn-secondary">Cerrar</button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge estado={asset.estado} />
            {prestamoActivo && (
              <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                Préstamo temporal activo
              </span>
            )}
            {asignacionActual && (
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                Responsable permanente: {asignacionActual.nombreResponsable}
              </span>
            )}
          </div>

          <div className="flex gap-1 overflow-x-auto rounded-lg border border-line bg-subtle p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  tab === t.id ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"
                }`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center gap-2 rounded-lg border border-line p-4 text-sm text-ink-3">
              <RefreshCw size={15} className="animate-spin" /> Cargando historial...
            </div>
          )}

          {tab === "resumen" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-line p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Información del activo</p>
                  <div className="mt-2 space-y-1.5 text-sm text-ink-2">
                    <p><span className="font-medium text-ink">Código:</span> {asset.codigo}</p>
                    <p><span className="font-medium text-ink">Categoría:</span> {categoria?.nombre || "Sin categoría"}</p>
                    <p><span className="font-medium text-ink">Adquisición:</span> {fmtDate(asset.fecha)}</p>
                    <p><span className="font-medium text-ink">Descripción:</span> {asset.descripcion || "Sin descripción"}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-line p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Ubicación y responsables</p>
                  <div className="mt-2 space-y-1.5 text-sm text-ink-2">
                    <p className="flex items-center gap-1.5"><MapPin size={14} /> {ubicacion ? `${ubicacion.nombre} (${ubicacion.bloque})` : "Sin ubicación"}</p>
                    <p className="flex items-center gap-1.5"><UserRound size={14} /> {asignacionActual?.nombreResponsable || "Sin responsable permanente"}</p>
                    <p className="flex items-center gap-1.5"><Boxes size={14} /> {asignacionActual?.nombreSala || ubicacion?.nombre || "Sin sala"}</p>
                  </div>
                </div>
              </div>

              {prestamoActivo && (
                <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <ClipboardList size={16} className="text-indigo-600 dark:text-indigo-300" />
                    <p className="text-sm font-semibold text-ink">Préstamo temporal en curso</p>
                    <StatusBadge estado="Activo" kind="loan" />
                    {prestamoActivo.vencido && <StatusBadge estado="Vencido" kind="loan" />}
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-ink-2 sm:grid-cols-2">
                    <p>Solicitante: <strong>{prestamoActivo.nombre_solicitante}</strong>{prestamoActivo.grado ? ` · ${prestamoActivo.grado}` : ""}</p>
                    <p>Actividad: {prestamoActivo.actividad || "No registrada"}</p>
                    <p>Entrega: {fmtDateTime(prestamoActivo.fecha_entrega)}</p>
                    <p>Devolución esperada: {fmtDateTime(prestamoActivo.fecha_devolucion_esperada)}</p>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-line p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">Asignación permanente</h3>
                    <p className="text-xs text-ink-3">Responsable y sala bajo custodia. No impide prestar el activo temporalmente.</p>
                  </div>
                  {asignacionActual && (
                    <button onClick={handleCloseAssignment} className="btn btn-secondary btn-sm text-red-600">
                      Cerrar asignación
                    </button>
                  )}
                </div>

                <form onSubmit={handleAssign} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-4">
                    <label className="label">Docente responsable</label>
                    <select
                      className="field"
                      value={assignForm.id_usuario_responsable}
                      onChange={(e) => setAssignForm({ ...assignForm, id_usuario_responsable: e.target.value })}
                    >
                      <option value="">Seleccione...</option>
                      {docentesDisponibles.map((d) => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <label className="label">Sala / ubicación</label>
                    <select
                      className="field"
                      value={assignForm.id_ubicacion}
                      onChange={(e) => setAssignForm({ ...assignForm, id_ubicacion: e.target.value })}
                    >
                      <option value="">Seleccione...</option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.nombre} ({l.bloque})</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <label className="label">Observaciones</label>
                    <input
                      className="field"
                      placeholder="Motivo del cambio..."
                      value={assignForm.observaciones}
                      onChange={(e) => setAssignForm({ ...assignForm, observaciones: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-12 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingAssign || !assignForm.id_usuario_responsable || !assignForm.id_ubicacion}
                      className="btn btn-primary btn-sm"
                    >
                      <PencilLine size={14} /> {savingAssign ? "Guardando..." : "Asignar / cambiar responsable"}
                    </button>
                  </div>
                </form>
                {docentesDisponibles.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    No hay docentes registrados. Cree un usuario con rol Profesor para asignarlo como responsable.
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === "prestamos" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Historial de préstamos</h3>
                  <p className="text-xs text-ink-3">Todas las entregas temporales registradas para este activo.</p>
                </div>
                {disponible && (
                  <button onClick={() => setLoanOpen(true)} className="btn btn-primary btn-sm">
                    <ArrowRightLeft size={14} /> Nuevo préstamo
                  </button>
                )}
              </div>
              {(history?.prestamos || []).length === 0 && !loading ? (
                <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink-3">
                  Este activo no tiene préstamos registrados.
                </div>
              ) : (
                (history?.prestamos || []).map((loan) => <LoanCard key={loan.id} loan={loan} />)
              )}
            </div>
          )}

          {tab === "asignaciones" && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">Historial de responsables y ubicaciones</h3>
                <p className="text-xs text-ink-3">Cada cambio cierra la asignación anterior y conserva el registro completo.</p>
              </div>
              {(history?.asignaciones || []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink-3">
                  No hay asignaciones permanentes registradas.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-line">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-subtle text-xs uppercase tracking-wider text-ink-3">
                      <tr>
                        <th className="p-3 font-medium">Responsable</th>
                        <th className="p-3 font-medium">Sala</th>
                        <th className="p-3 font-medium">Desde</th>
                        <th className="p-3 font-medium">Hasta</th>
                        <th className="p-3 font-medium">Estado</th>
                        <th className="p-3 font-medium">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {(history?.asignaciones || []).map((a) => (
                        <tr key={a.id}>
                          <td className="p-3 font-medium text-ink">{a.nombreResponsable || "Sin responsable"}</td>
                          <td className="p-3 text-ink-2">{a.nombreSala || "Sin sala"}</td>
                          <td className="p-3 text-ink-2">{fmtDateTime(a.fechaAsignacion)}</td>
                          <td className="p-3 text-ink-2">{a.fechaFin ? fmtDateTime(a.fechaFin) : "Actual"}</td>
                          <td className="p-3">
                            <span className={`rounded-md border px-2 py-0.5 text-xs ${a.estado === "Activa" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300"}`}>
                              {a.estado}
                            </span>
                          </td>
                          <td className="p-3 text-ink-3">{a.observaciones || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "cambios" && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">Bitácora de cambios</h3>
                <p className="text-xs text-ink-3">Quién realizó cada modificación y cuándo.</p>
              </div>
              {(history?.cambios || []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink-3">
                  No hay cambios registrados.
                </div>
              ) : (
                <div className="space-y-2">
                  {(history?.cambios || []).map((c) => (
                    <div key={c.id_historial} className="rounded-lg border border-line p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-ink">{c.tipo_cambio}</span>
                        <span className="ml-auto text-xs text-ink-3">{fmtDateTime(c.fecha)}</span>
                      </div>
                      <p className="mt-1 text-xs text-ink-2">
                        {c.valor_anterior || "—"} <span className="mx-1 text-ink-3">→</span> {c.valor_nuevo || "—"}
                      </p>
                      {c.observaciones && <p className="mt-1 text-xs text-ink-3">{c.observaciones}</p>}
                      <p className="mt-1 text-xs text-ink-3">Registrado por: {c.nombre_usuario || "Sistema"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <LoanModal
        isOpen={loanOpen}
        onClose={async () => {
          setLoanOpen(false);
          await loadHistory();
        }}
        preselectedAssetId={asset.id}
      />
      <ReturnLoanModal
        isOpen={returnOpen}
        loan={prestamoActivo}
        onClose={async () => {
          setReturnOpen(false);
          await loadHistory();
        }}
      />
    </>
  );
}
