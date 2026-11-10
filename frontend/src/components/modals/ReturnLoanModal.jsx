import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Undo2, PackageCheck, ClipboardList } from "lucide-react";
import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import { useApp } from "../../hooks/useApp";
import { fmtDateTime, toInputDateTime } from "../../utils/helpers";

const ESTADOS_DEVOLUCION = ["Bueno", "Con daños", "Con observaciones", "No devuelto / perdido"];

export default function ReturnLoanModal({ isOpen, loan, onClose }) {
  const { assets, returnLoan } = useApp();
  const [form, setForm] = useState({
    fecha_devolucion_real: "",
    persona_recibe_devolucion: "",
    estado_devolucion: "Bueno",
    observaciones_devolucion: "",
  });
  const [componentes, setComponentes] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const asset = assets.find((a) => a.id === loan?.id_activo);

  useEffect(() => {
    if (!isOpen || !loan) return;
    setForm({
      fecha_devolucion_real: toInputDateTime(new Date()),
      persona_recibe_devolucion: "",
      estado_devolucion: "Bueno",
      observaciones_devolucion: "",
    });
    setComponentes(
      (loan.componentes || []).map((c) => ({
        id_componente_prestamo: c.id_componente_prestamo,
        nombre_componente: c.nombre_componente,
        estado_entrega: c.estado_entrega,
        observacion_entrega: c.observacion_entrega,
        estado_devolucion: c.estado_devolucion || "Bueno",
        observacion_devolucion: c.observacion_devolucion || "",
      }))
    );
    setError("");
  }, [isOpen, loan]);

  if (!loan) return null;

  const updateComponent = (index, patch) => {
    setComponentes((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const hayNovedad =
    form.estado_devolucion !== "Bueno" ||
    componentes.some((c) => c.estado_devolucion !== "Bueno");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fecha_devolucion_real) {
      setError("Indique la fecha real de devolución.");
      return;
    }
    if (!form.persona_recibe_devolucion.trim()) {
      setError("Indique la persona que recibe la devolución.");
      return;
    }
    if (loan.fecha_prestamo && new Date(form.fecha_devolucion_real) < new Date(loan.fecha_prestamo)) {
      setError("La fecha real de devolución no puede ser anterior a la fecha del préstamo.");
      return;
    }
    setSaving(true);
    const ok = await returnLoan(loan.id, { ...form, componentes });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar devolución"
      subtitle={`${loan.codigo_activo || asset?.codigo || ""} — ${loan.nombre_activo || asset?.nombre || ""}`}
      icon={Undo2}
      size="xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" form="form-return" disabled={saving} className="btn btn-primary">
            {saving ? "Registrando..." : "Registrar devolución"}
          </button>
        </>
      }
    >
      <form id="form-return" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertTriangle size={16} className="mt-0.5 flex-none" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-lg border border-line bg-subtle/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <PackageCheck size={16} className="text-accent-fg" />
            <span className="text-sm font-semibold text-ink">{loan.nombre_activo || asset?.nombre}</span>
            <StatusBadge estado={loan.estado} kind="loan" />
            {loan.vencido && <StatusBadge estado="Vencido" kind="loan" />}
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-ink-3 sm:grid-cols-2">
            <p><span className="font-medium text-ink-2">Solicitante:</span> {loan.nombre_solicitante}</p>
            <p><span className="font-medium text-ink-2">Grado:</span> {loan.grado || "No registrado"}</p>
            <p><span className="font-medium text-ink-2">Actividad:</span> {loan.actividad || "No registrada"}</p>
            <p><span className="font-medium text-ink-2">Préstamo:</span> {fmtDateTime(loan.fecha_prestamo)}</p>
            <p><span className="font-medium text-ink-2">Devolución esperada:</span> {fmtDateTime(loan.fecha_devolucion_esperada)}</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-accent-fg" />
            <h3 className="text-sm font-semibold text-ink">Datos de la devolución</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Fecha real de devolución *</label>
              <input
                type="datetime-local"
                className="field"
                value={form.fecha_devolucion_real}
                onChange={(e) => setForm({ ...form, fecha_devolucion_real: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Persona que recibe *</label>
              <input
                className="field"
                placeholder="Nombre de quien recibe"
                value={form.persona_recibe_devolucion}
                onChange={(e) => setForm({ ...form, persona_recibe_devolucion: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Estado general</label>
              <select
                className="field"
                value={form.estado_devolucion}
                onChange={(e) => setForm({ ...form, estado_devolucion: e.target.value })}
              >
                {ESTADOS_DEVOLUCION.map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Observaciones sobre daños, pérdidas o novedades</label>
            <textarea
              className="field"
              rows="3"
              placeholder="Describa cualquier daño, pérdida o novedad detectada al recibir el activo..."
              value={form.observaciones_devolucion}
              onChange={(e) => setForm({ ...form, observaciones_devolucion: e.target.value })}
            />
          </div>
        </section>

        <section className="space-y-3 border-t border-line pt-5">
          <div>
            <h3 className="text-sm font-semibold text-ink">Comparación de componentes</h3>
            <p className="mt-0.5 text-xs text-ink-3">
              Compare el estado de entrega con el estado en que se recibe cada componente.
            </p>
          </div>

          {componentes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-ink-3">
              Este préstamo no tiene componentes registrados.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-subtle text-xs uppercase tracking-wider text-ink-3">
                  <tr>
                    <th className="p-3 font-medium">Componente</th>
                    <th className="p-3 font-medium">Estado al entregar</th>
                    <th className="p-3 font-medium">Estado al recibir</th>
                    <th className="p-3 font-medium">Observación de devolución</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {componentes.map((c, index) => (
                    <tr key={c.id_componente_prestamo || index}>
                      <td className="p-3">
                        <p className="font-medium text-ink">{c.nombre_componente}</p>
                        {c.observacion_entrega && (
                          <p className="mt-0.5 text-xs text-ink-3">{c.observacion_entrega}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <StatusBadge estado={c.estado_entrega} />
                      </td>
                      <td className="p-3">
                        <select
                          className="field min-w-[150px]"
                          value={c.estado_devolucion}
                          onChange={(e) => updateComponent(index, { estado_devolucion: e.target.value })}
                        >
                          {ESTADOS_DEVOLUCION.map((estado) => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          className="field min-w-[180px]"
                          placeholder="Novedad al recibir..."
                          value={c.observacion_devolucion}
                          onChange={(e) => updateComponent(index, { observacion_devolucion: e.target.value })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {hayNovedad && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle size={16} className="mt-0.5 flex-none" />
            <span>
              Ha indicado novedades en la devolución. Estas quedarán registradas en el historial del activo para comparar el estado inicial con el final.
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-subtle p-3 text-xs text-ink-3">
          <CheckCircle2 size={15} className="mt-0.5 flex-none text-emerald-600" />
          <span>Al registrar la devolución el activo volverá a estado <strong>Disponible</strong>, salvo que esté en mantenimiento o dado de baja.</span>
        </div>
      </form>
    </Modal>
  );
}
