import { useEffect, useMemo, useState } from "react";
import {
  UserRound, Users, Package, MapPin, Eye, Plus, Star, RefreshCw, ArrowRightLeft,
} from "lucide-react";
import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import { useApp } from "../../hooks/useApp";
import { fmtDateTime } from "../../utils/helpers";
import AssetDetailModal from "./AssetDetailModal";

export default function DocenteDetailModal({ isOpen, docenteId, onClose }) {
  const {
    assets, categories, locations, docentes, fetchDocenteDetail, assignAsset,
  } = useApp();
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id_activo: "", id_ubicacion: "", observaciones: "" });
  const [saving, setSaving] = useState(false);
  const [assetId, setAssetId] = useState(null);

  const docenteBase = docentes.find((d) => d.id === docenteId);

  const cargar = async () => {
    if (!docenteId) return;
    setLoading(true);
    const data = await fetchDocenteDetail(docenteId);
    setDetalle(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && docenteId) {
      cargar();
      setForm({ id_activo: "", id_ubicacion: "", observaciones: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, docenteId]);

  const docente = detalle || docenteBase;
  const asignados = docente?.activosAsignados || [];
  const temporales = docente?.prestamosTemporales || [];

  const activosDisponibles = useMemo(() => {
    const yaAsignados = new Set(asignados.map((a) => a.idActivo));
    return assets.filter((a) => !yaAsignados.has(a.id));
  }, [assets, asignados]);

  const getCategoria = (id) => categories.find((c) => c.id === id)?.nombre || "Sin categoría";
  const getUbicacion = (id) => {
    const loc = locations.find((l) => l.id === id);
    return loc ? `${loc.nombre} (${loc.bloque})` : "Sin ubicación";
  };

  if (!isOpen || !docente) return null;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!form.id_activo || !form.id_ubicacion) return;
    setSaving(true);
    const ok = await assignAsset(form.id_activo, {
      id_usuario_responsable: docente.id,
      id_ubicacion: form.id_ubicacion,
      observaciones: form.observaciones || "Asignación desde la ficha del docente.",
    });
    setSaving(false);
    if (ok) {
      setForm({ id_activo: "", id_ubicacion: "", observaciones: "" });
      await cargar();
    }
  };

  const assetDetalle = assets.find((a) => a.id === assetId) || null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={docente.nombre}
        subtitle={`${docente.rol || "Docente"} · Documento ${docente.documento}`}
        icon={UserRound}
        size="xl"
        footer={<button onClick={onClose} className="btn btn-secondary">Cerrar</button>}
      >
        <div className="space-y-5">
          {loading && (
            <div className="flex items-center gap-2 rounded-lg border border-line p-3 text-sm text-ink-3">
              <RefreshCw size={15} className="animate-spin" /> Cargando información...
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-line p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Salas asociadas</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{docente.totalSalas}</p>
            </div>
            <div className="rounded-lg border border-line p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Activos permanentes</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{docente.totalActivosAsignados}</p>
            </div>
            <div className="rounded-lg border border-line p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Préstamos temporales activos</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{temporales.length}</p>
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-accent-fg" />
              <h3 className="text-sm font-semibold text-ink">Salas a las que está asociado</h3>
            </div>
            {(docente.salas || []).length === 0 ? (
              <div className="rounded-lg border border-dashed border-line p-4 text-sm text-ink-3">
                Este docente no está asociado a ninguna sala. Puede asociarlo desde la ficha de la sala.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(docente.salas || []).map((s) => (
                  <span key={s.id_ubicacion} className="inline-flex items-center gap-2 rounded-lg border border-line bg-subtle px-3 py-2 text-sm text-ink-2">
                    <MapPin size={14} className="text-ink-3" />
                    {s.nombre_espacio}
                    <span className="text-xs text-ink-3">({s.edificio_bloque || "General"})</span>
                    {s.es_responsable_principal && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                        <Star size={11} /> Principal
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 border-t border-line pt-5">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Package size={16} className="text-accent-fg" /> Activos bajo su responsabilidad permanente
              </h3>
              <p className="mt-0.5 text-xs text-ink-3">
                Custodia permanente del activo. No es un préstamo temporal.
              </p>
            </div>

            {asignados.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line p-4 text-sm text-ink-3">
                No tiene activos asignados permanentemente.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-subtle text-xs uppercase tracking-wider text-ink-3">
                    <tr>
                      <th className="p-3 font-medium">Código</th>
                      <th className="p-3 font-medium">Activo</th>
                      <th className="p-3 font-medium">Categoría</th>
                      <th className="p-3 font-medium">Estado</th>
                      <th className="p-3 font-medium">Ubicación</th>
                      <th className="p-3 font-medium">Asignado desde</th>
                      <th className="p-3 font-medium">Observaciones</th>
                      <th className="p-3 text-center font-medium">Ver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {asignados.map((a) => {
                      const asset = assets.find((x) => x.id === a.idActivo);
                      return (
                        <tr key={a.id} className="hover:bg-subtle">
                          <td className="p-3 font-mono text-xs text-ink-2">{a.codigoActivo || asset?.codigo || "—"}</td>
                          <td className="p-3 font-medium text-ink">{a.nombreActivo || asset?.nombre || "—"}</td>
                          <td className="p-3 text-ink-2">{getCategoria(asset?.categoriaId)}</td>
                          <td className="p-3"><StatusBadge estado={asset?.estado || "Disponible"} /></td>
                          <td className="p-3 text-ink-2">{a.nombreSala || getUbicacion(a.idUbicacion)}</td>
                          <td className="p-3 text-ink-2">{fmtDateTime(a.fechaAsignacion)}</td>
                          <td className="p-3 text-ink-3">{a.observaciones || "—"}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setAssetId(a.idActivo)}
                              className="p-1.5 text-ink-3 hover:bg-subtle hover:text-ink rounded-md"
                              title="Ver ficha del activo"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <form onSubmit={handleAssign} className="grid grid-cols-1 gap-3 rounded-lg border border-line bg-subtle/40 p-3 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <label className="label">Asignar activo</label>
                <select
                  className="field"
                  value={form.id_activo}
                  onChange={(e) => setForm({ ...form, id_activo: e.target.value })}
                >
                  <option value="">Seleccione un activo...</option>
                  {activosDisponibles.map((a) => (
                    <option key={a.id} value={a.id}>{a.codigo} — {a.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="label">Sala / ubicación</label>
                <select
                  className="field"
                  value={form.id_ubicacion}
                  onChange={(e) => setForm({ ...form, id_ubicacion: e.target.value })}
                >
                  <option value="">Seleccione una sala...</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.nombre} ({l.bloque})</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="label">Observaciones</label>
                <div className="flex gap-2">
                  <input
                    className="field"
                    placeholder="Motivo de la asignación..."
                    value={form.observaciones}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  />
                  <button type="submit" disabled={saving || !form.id_activo || !form.id_ubicacion} className="btn btn-primary btn-sm flex-none">
                    <Plus size={14} /> Asignar
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="space-y-3 border-t border-line pt-5">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <ArrowRightLeft size={16} className="text-accent-fg" /> Préstamos temporales activos
              </h3>
              <p className="mt-0.5 text-xs text-ink-3">
                Activos que están bajo su responsabilidad permanente pero que en este momento están prestados a otra persona.
              </p>
            </div>
            {temporales.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line p-4 text-sm text-ink-3">
                No hay préstamos temporales activos sobre sus activos asignados.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-subtle text-xs uppercase tracking-wider text-ink-3">
                    <tr>
                      <th className="p-3 font-medium">Activo</th>
                      <th className="p-3 font-medium">Solicitante</th>
                      <th className="p-3 font-medium">Grado</th>
                      <th className="p-3 font-medium">Actividad</th>
                      <th className="p-3 font-medium">Devolución esperada</th>
                      <th className="p-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {temporales.map((l) => (
                      <tr key={l.id} className="hover:bg-subtle">
                        <td className="p-3">
                          <p className="font-medium text-ink">{l.nombre_activo}</p>
                          <p className="font-mono text-xs text-ink-3">{l.codigo_activo}</p>
                        </td>
                        <td className="p-3 text-ink-2">{l.nombre_solicitante}</td>
                        <td className="p-3 text-ink-2">{l.grado || "—"}</td>
                        <td className="p-3 text-ink-2">{l.actividad || "—"}</td>
                        <td className="p-3 text-ink-2">{fmtDateTime(l.fecha_devolucion_esperada)}</td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <StatusBadge estado={l.estado} kind="loan" />
                            {l.vencido && <StatusBadge estado="Vencido" kind="loan" />}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </Modal>

      <AssetDetailModal
        isOpen={!!assetDetalle}
        asset={assetDetalle}
        onClose={() => setAssetId(null)}
      />
    </>
  );
}
