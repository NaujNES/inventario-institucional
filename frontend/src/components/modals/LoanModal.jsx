import React, { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Plus, Trash2, AlertTriangle, Package, User, CalendarDays, ClipboardList, Boxes } from "lucide-react";
import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import { useApp } from "../../hooks/useApp";
import { toInputDateTime } from "../../utils/helpers";

const ESTADOS_COMPONENTE = ["Bueno", "Con daños", "Con observaciones"];

function defaultComponentsFor(asset, categoryName) {
  const text = `${asset?.nombre || ""} ${categoryName || ""}`.toLowerCase();
  if (/(comput|portátil|portatil|laptop|pc|escritorio|tablet)/.test(text)) {
    return ["Computador", "Cargador", "Mouse", "Teclado", "Otros accesorios"];
  }
  if (/impresora|scanner|escaner/.test(text)) {
    return ["Impresora", "Cable de poder", "Tóner / tinta", "Bandeja"];
  }
  if (/proyector|video ?beam/.test(text)) {
    return ["Proyector", "Cable HDMI", "Control remoto", "Cable de poder"];
  }
  return ["Activo principal", "Accesorios", "Otros"];
}

function addDays(dateValue, days) {
  const d = dateValue ? new Date(dateValue) : new Date();
  d.setDate(d.getDate() + days);
  return toInputDateTime(d);
}

export default function LoanModal({ isOpen, onClose, preselectedAssetId = "" }) {
  const { assets, categories, locations, loans, createLoan } = useApp();
  const [form, setForm] = useState({
    id_activo: "",
    nombre_solicitante: "",
    grado: "",
    fecha_prestamo: "",
    actividad: "",
    fecha_entrega: "",
    fecha_devolucion_esperada: "",
    observaciones_entrega: "",
  });
  const [componentes, setComponentes] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const availableAssets = useMemo(
    () =>
      assets.filter((a) => {
        const disponible = String(a.estado || "").toLowerCase() === "disponible";
        const tienePrestamo = loans.some(
          (l) => l.id_activo === a.id && l.estado === "Activo"
        );
        return disponible && !tienePrestamo;
      }),
    [assets, loans]
  );

  const selectedAsset = assets.find((a) => String(a.id) === String(form.id_activo));
  const selectedCategory = categories.find((c) => c.id === selectedAsset?.categoriaId);
  const selectedLocation = locations.find((l) => l.id === selectedAsset?.ubicacionId);

  const loadComponents = (asset, categoryName) => {
    setComponentes(
      defaultComponentsFor(asset, categoryName).map((nombre) => ({
        nombre_componente: nombre,
        estado_entrega: "Bueno",
        observacion_entrega: "",
      }))
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    const now = toInputDateTime(new Date());
    const assetId = preselectedAssetId ? String(preselectedAssetId) : "";
    setForm({
      id_activo: assetId,
      nombre_solicitante: "",
      grado: "",
      fecha_prestamo: now,
      actividad: "",
      fecha_entrega: now,
      fecha_devolucion_esperada: addDays(now, 3),
      observaciones_entrega: "",
    });
    setError("");
    const asset = assets.find((a) => String(a.id) === assetId);
    if (asset) {
      const cat = categories.find((c) => c.id === asset.categoriaId);
      loadComponents(asset, cat?.nombre);
    } else {
      setComponentes([{ nombre_componente: "Activo principal", estado_entrega: "Bueno", observacion_entrega: "" }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, preselectedAssetId, assets.length, categories.length]);

  const handleAssetChange = (value) => {
    const asset = assets.find((a) => String(a.id) === String(value));
    const cat = categories.find((c) => c.id === asset?.categoriaId);
    setForm((prev) => {
      const entrega = prev.fecha_entrega || prev.fecha_prestamo;
      return { ...prev, id_activo: value, fecha_entrega: entrega };
    });
    loadComponents(asset, cat?.nombre);
  };

  const updateComponent = (index, patch) => {
    setComponentes((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const removeComponent = (index) => {
    setComponentes((prev) => prev.filter((_, i) => i !== index));
  };

  const addComponent = () => {
    setComponentes((prev) => [
      ...prev,
      { nombre_componente: "", estado_entrega: "Bueno", observacion_entrega: "" },
    ]);
  };

  const validate = () => {
    if (!form.id_activo) return "Seleccione el activo que se va a prestar.";
    if (!availableAssets.some((a) => String(a.id) === String(form.id_activo))) {
      return "El activo seleccionado no está disponible para préstamo.";
    }
    if (!form.nombre_solicitante.trim()) return "Ingrese el nombre de la persona que solicita el activo.";
    if (!form.fecha_prestamo) return "Indique la fecha del préstamo.";
    if (!form.fecha_entrega) return "Indique la fecha de entrega del activo.";
    if (!form.fecha_devolucion_esperada) return "Indique la fecha de devolución esperada.";
    if (new Date(form.fecha_entrega) < new Date(form.fecha_prestamo)) {
      return "La fecha de entrega no puede ser anterior a la fecha del préstamo.";
    }
    if (new Date(form.fecha_devolucion_esperada) < new Date(form.fecha_prestamo)) {
      return "La devolución esperada no puede ser anterior a la fecha del préstamo.";
    }
    if (new Date(form.fecha_devolucion_esperada) < new Date(form.fecha_entrega)) {
      return "La devolución esperada no puede ser anterior a la fecha de entrega.";
    }
    if (componentes.some((c) => !c.nombre_componente.trim())) {
      return "Cada componente debe tener un nombre. Elimine las filas vacías.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    const ok = await createLoan({ ...form, componentes });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar préstamo de activo"
      subtitle="Entrega temporal para una actividad específica"
      icon={ArrowRightLeft}
      size="xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" form="form-loan" disabled={saving} className="btn btn-primary">
            {saving ? "Registrando..." : "Registrar préstamo"}
          </button>
        </>
      }
    >
      <form id="form-loan" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertTriangle size={16} className="mt-0.5 flex-none" />
            <span>{error}</span>
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-accent-fg" />
            <h3 className="text-sm font-semibold text-ink">Activo a prestar</h3>
          </div>
          <div>
            <label className="label">Activo disponible</label>
            <select
              className="field"
              value={form.id_activo}
              onChange={(e) => handleAssetChange(e.target.value)}
            >
              <option value="">Seleccione un activo ({availableAssets.length} disponibles)</option>
              {availableAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.codigo} — {a.nombre}
                </option>
              ))}
            </select>
            {availableAssets.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                No hay activos disponibles. Los activos prestados, en mantenimiento o dados de baja no se pueden prestar.
              </p>
            )}
          </div>

          {selectedAsset && (
            <div className="rounded-lg border border-line bg-subtle/60 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-medium">{selectedAsset.codigo}</span>
                <span className="text-sm font-medium text-ink">{selectedAsset.nombre}</span>
                <StatusBadge estado={selectedAsset.estado} />
              </div>
              <p className="mt-1 text-xs text-ink-3">
                {selectedCategory?.nombre || "Sin categoría"} · {selectedLocation ? `${selectedLocation.nombre} (${selectedLocation.bloque})` : "Sin ubicación"}
              </p>
            </div>
          )}
        </section>

        <section className="space-y-4 border-t border-line pt-5">
          <div className="flex items-center gap-2">
            <User size={16} className="text-accent-fg" />
            <h3 className="text-sm font-semibold text-ink">Información del solicitante</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nombre de la persona que solicita *</label>
              <input
                className="field"
                placeholder="Nombre completo"
                value={form.nombre_solicitante}
                onChange={(e) => setForm({ ...form, nombre_solicitante: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Grado</label>
              <input
                className="field"
                placeholder="Ej: 11°A, 8°B, Docente"
                value={form.grado}
                onChange={(e) => setForm({ ...form, grado: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-line pt-5">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-accent-fg" />
            <h3 className="text-sm font-semibold text-ink">Fechas y actividad</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Fecha del préstamo *</label>
              <input
                type="datetime-local"
                className="field"
                value={form.fecha_prestamo}
                onChange={(e) => setForm({ ...form, fecha_prestamo: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Fecha de entrega *</label>
              <input
                type="datetime-local"
                className="field"
                value={form.fecha_entrega}
                onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Devolución esperada *</label>
              <input
                type="datetime-local"
                className="field"
                value={form.fecha_devolucion_esperada}
                onChange={(e) => setForm({ ...form, fecha_devolucion_esperada: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Actividad en la que se utilizará el activo</label>
            <input
              className="field"
              placeholder="Ej: Clase de robótica, feria institucional, evaluación..."
              value={form.actividad}
              onChange={(e) => setForm({ ...form, actividad: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Observaciones de entrega</label>
            <textarea
              className="field"
              rows="2"
              placeholder="Novedades generales al momento de entregar el activo..."
              value={form.observaciones_entrega}
              onChange={(e) => setForm({ ...form, observaciones_entrega: e.target.value })}
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-line pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Boxes size={16} className="text-accent-fg" />
              <h3 className="text-sm font-semibold text-ink">Estado de los componentes al entregar</h3>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => loadComponents(selectedAsset, selectedCategory?.nombre)} className="btn btn-secondary btn-sm">
                Cargar sugeridos
              </button>
              <button type="button" onClick={addComponent} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Agregar
              </button>
            </div>
          </div>
          <p className="text-xs text-ink-3">
            Registre individualmente el estado de cada pieza. Por ejemplo: computador, cargador, mouse, teclado y otros accesorios.
          </p>

          <div className="space-y-3">
            {componentes.map((componente, index) => (
              <div key={index} className="rounded-lg border border-line bg-surface p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <label className="label">Componente</label>
                    <input
                      className="field"
                      placeholder="Ej: Cargador"
                      value={componente.nombre_componente}
                      onChange={(e) => updateComponent(index, { nombre_componente: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="label">Estado</label>
                    <select
                      className="field"
                      value={componente.estado_entrega}
                      onChange={(e) => updateComponent(index, { estado_entrega: e.target.value })}
                    >
                      {ESTADOS_COMPONENTE.map((estado) => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end justify-end sm:col-span-3">
                    <button
                      type="button"
                      onClick={() => removeComponent(index)}
                      className="btn btn-secondary btn-sm text-red-600"
                      title="Quitar componente"
                    >
                      <Trash2 size={14} /> Quitar
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="label">Observación del componente</label>
                  <input
                    className="field"
                    placeholder="Detalle del estado, rayones, faltantes, etc."
                    value={componente.observacion_entrega}
                    onChange={(e) => updateComponent(index, { observacion_entrega: e.target.value })}
                  />
                </div>
              </div>
            ))}
            {componentes.length === 0 && (
              <div className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-ink-3">
                No hay componentes registrados. Puede agregar los que desee.
              </div>
            )}
          </div>
        </section>

        <div className="flex items-start gap-2 rounded-lg bg-subtle p-3 text-xs text-ink-3">
          <ClipboardList size={15} className="mt-0.5 flex-none" />
          <span>
            Al registrar el préstamo el activo cambiará automáticamente a estado <strong>Prestado</strong> y quedará disponible en el historial del activo.
          </span>
        </div>
      </form>
    </Modal>
  );
}
