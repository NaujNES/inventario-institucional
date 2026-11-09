import React, { useEffect, useMemo, useState } from "react";
import {
  Building2, MapPin, Plus, UserRound, Users, Package, Trash2,
  Star, Eye, RefreshCw,
} from "lucide-react";
import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import { useApp } from "../../hooks/useApp";
import { fmtDate } from "../../utils/helpers";
import AssetDetailModal from "./AssetDetailModal";

export default function SalaDetailModal({ isOpen, salaId, onClose }) {
  const {
    categories, assignments, docentes, users, addSalaDocente, removeSalaDocente,
    fetchSalaDetail, salas,
  } = useApp();
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id_usuario: "", es_responsable_principal: false, observaciones: "" });
  const [saving, setSaving] = useState(false);
  const [assetId, setAssetId] = useState(null);

  const salaBase = salas.find((s) => s.id === salaId);

  const cargar = async () => {
    if (!salaId) return;
    setLoading(true);
    const data = await fetchSalaDetail(salaId);
    setDetalle(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && salaId) {
      cargar();
      setForm({ id_usuario: "", es_responsable_principal: false, observaciones: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, salaId]);

  const sala = detalle || salaBase;

  const docentesAsociados = sala?.docentes || [];
  const disponibles = useMemo(() => {
    const asociados = new Set(docentesAsociados.map((d) => d.id_usuario));
    const base = docentes.length > 0 ? docentes : users.filter((u) => u.estado_activo !== false);
    return base.filter((d) => !asociados.has(d.id));
  }, [docentes, users, docentesAsociados]);

  const getCategoria = (id) => categories.find((c) => c.id === id)?.nombre || "Sin categoría";
  const getResponsable = (idActivo) => {
    const asignacion = assignments.find((a) => a.idActivo === idActivo && a.estado === "Activa");
    return asignacion?.nombreResponsable || "Sin responsable";
  };

  if (!isOpen || !sala) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.id_usuario) return;
    setSaving(true);
    const ok = await addSalaDocente(sala.id, form);
    setSaving(false);
    if (ok) {
      setForm({ id_usuario: "", es_responsable_principal: false, observaciones: "" });
      await cargar();
    }
  };

  const handleRemove = async (docente) => {
    if (!window.confirm(`¿Desasociar a ${docente.nombre_docente} de esta sala? La asociación se conserva como historial.`)) return;
    const ok = await removeSalaDocente(sala.id, docente.id_sala_docente);
    if (ok) await cargar();
  };

  const assetDetalle = (sala.activos || []).find((a) => a.id_activo === assetId);
  const assetParaModal = assetDetalle
    ? {
        id: assetDetalle.id_activo,
        codigo: assetDetalle.codigo_unico,
        nombre: assetDetalle.nombre_activo,
        descripcion: assetDetalle.descripcion,
        categoriaId: assetDetalle.id_clase,
        ubicacionId: assetDetalle.id_ubicacion,
        estado: assetDetalle.estado,
        fecha: assetDetalle.fecha_adquisicion ? String(assetDetalle.fecha_adquisicion).slice(0, 10) : "",
      }
    : null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={sala.nombre}
        subtitle={`${sala.bloque || "General"} · Ficha de sala o espacio institucional`}
        icon={Building2}
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
            <div className="rounded-lg border border-line p-4 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Descripción</p>
              <p className="mt-1 text-sm text-ink-2">{sala.descripcion || "Sin descripción registrada."}</p>
            </div>
            <div className="rounded-lg border border-line p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Ubicación</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-2"><MapPin size={14} /> {sala.bloque || "General"}</p>
              <p className="mt-2 text-xs text-ink-3">{sala.totalActivos ?? (sala.activos || []).length} activos registrados</p>
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-accent-fg" />
              <h3 className="text-sm font-semibold text-ink">Docentes asociados</h3>
            </div>

            {docentesAsociados.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-ink-3">
                Esta sala aún no tiene docentes responsables asociados.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {docentesAsociados.map((d) => (
                  <div key={d.id_sala_docente} className="flex items-start justify-between gap-3 rounded-lg border border-line p-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-ink">{d.nombre_docente}</p>
                        {d.es_responsable_principal && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                            <Star size={12} /> Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-3">{d.documento_docente} · {d.rol_docente || "Docente"}</p>
                      {d.observaciones && <p className="mt-1 text-xs text-ink-3">{d.observaciones}</p>}
                    </div>
                    <button
                      onClick={() => handleRemove(d)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                      title="Desasociar docente"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 rounded-lg border border-line bg-subtle/40 p-3 sm:grid-cols-12">
              <div className="sm:col-span-5">
                <label className="label">Asociar docente</label>
                <select
                  className="field"
                  value={form.id_usuario}
                  onChange={(e) => setForm({ ...form, id_usuario: e.target.value })}
                >
                  <option value="">Seleccione un docente...</option>
                  {disponibles.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}{d.documento ? ` — ${d.documento}` : ""}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="label">Observaciones</label>
                <input
                  className="field"
                  placeholder="Cargo, horario, etc."
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                />
              </div>
              <div className="flex items-end gap-2 sm:col-span-3">
                <label className="flex h-9 items-center gap-2 text-xs text-ink-2">
                  <input
                    type="checkbox"
                    checked={form.es_responsable_principal}
                    onChange={(e) => setForm({ ...form, es_responsable_principal: e.target.checked })}
                  />
                  Principal
                </label>
                <button type="submit" disabled={saving || !form.id_usuario} className="btn btn-primary btn-sm">
                  <Plus size={14} /> Asociar
                </button>
              </div>
            </form>
            {disponibles.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No hay docentes disponibles para asociar. Cree usuarios con rol Profesor o Docente.
              </p>
            )}
          </section>

          <section className="space-y-3 border-t border-line pt-5">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-accent-fg" />
              <h3 className="text-sm font-semibold text-ink">Activos registrados en esta sala</h3>
            </div>
            {(sala.activos || []).length === 0 ? (
              <div className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-ink-3">
                No hay activos ubicados en esta sala.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-subtle text-xs uppercase tracking-wider text-ink-3">
                    <tr>
                      <th className="p-3 font-medium">Código</th>
                      <th className="p-3 font-medium">Activo</th>
                      <th className="p-3 font-medium">Categoría</th>
                      <th className="p-3 font-medium">Estado</th>
                      <th className="p-3 font-medium">Responsable</th>
                      <th className="p-3 font-medium">Adquisición</th>
                      <th className="p-3 text-center font-medium">Ver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {(sala.activos || []).map((a) => (
                      <tr key={a.id_activo} className="hover:bg-subtle">
                        <td className="p-3 font-mono text-xs text-ink-2">{a.codigo_unico}</td>
                        <td className="p-3">
                          <p className="font-medium text-ink">{a.nombre_activo}</p>
                          {a.descripcion && <p className="text-xs text-ink-3">{a.descripcion}</p>}
                        </td>
                        <td className="p-3 text-ink-2">{getCategoria(a.id_clase)}</td>
                        <td className="p-3"><StatusBadge estado={a.estado} /></td>
                        <td className="p-3 text-ink-2">
                          <span className="inline-flex items-center gap-1"><UserRound size={13} /> {getResponsable(a.id_activo)}</span>
                        </td>
                        <td className="p-3 text-ink-2">{a.fecha_adquisicion ? fmtDate(a.fecha_adquisicion) : "—"}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setAssetId(a.id_activo)}
                            className="p-1.5 text-ink-3 hover:bg-subtle hover:text-ink rounded-md"
                            title="Ver ficha del activo"
                          >
                            <Eye size={16} />
                          </button>
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
        isOpen={!!assetParaModal}
        asset={assetParaModal}
        onClose={() => setAssetId(null)}
      />
    </>
  );
}
