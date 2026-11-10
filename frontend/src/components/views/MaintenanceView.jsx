import { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { Wrench, CheckCircle2 } from "lucide-react";

export default function MaintenanceView() {
  const { maintenances, assets, createMaintenance, completeMaintenance } = useApp();
  const [form, setForm] = useState({ id_activo: "", tipo: "Preventivo", descripcion: "", costo: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMaintenance(form);
    setForm({ id_activo: "", tipo: "Preventivo", descripcion: "", costo: "" });
  };

  return (
    <div className="space-y-6">
      {/* Formulario de Registro */}
      <div className="card p-5 border-l-4 border-l-amber-500">
        <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Wrench size={16} className="text-amber-500" /> Registrar Nuevo Mantenimiento
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select required className="field sm:col-span-2" value={form.id_activo} onChange={(e) => setForm({ ...form, id_activo: e.target.value })}>
            <option value="">Seleccione el Activo a reparar</option>
            {assets.map((a) => <option key={a.id} value={a.id}>{a.codigo} - {a.nombre}</option>)}
          </select>
          <select className="field" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            <option value="Preventivo">Preventivo</option>
            <option value="Correctivo">Correctivo</option>
          </select>
          <input required type="number" className="field" placeholder="Costo $" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} />
          <input required type="text" className="field sm:col-span-3" placeholder="Descripción del daño o revisión..." value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <button type="submit" className="btn btn-primary">Guardar</button>
        </form>
      </div>

      {/* Tabla de Mantenimientos */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-subtle text-ink-3 text-xs uppercase tracking-wider border-b border-line">
              <tr>
                <th className="p-4 font-medium">Activo</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Descripción</th>
                <th className="p-4 font-medium">Costo</th>
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {maintenances.map((m) => {
                const asset = assets.find((a) => a.id === m.id_activo);
                return (
                  <tr key={m.id} className="hover:bg-subtle transition-colors">
                    <td className="p-4 font-medium text-ink">{asset?.nombre || `Activo #${m.id_activo}`}</td>
                    <td className="p-4 text-ink-2">{m.tipo}</td>
                    <td className="p-4 text-ink-2 max-w-[200px] truncate">{m.descripcion}</td>
                    <td className="p-4 text-emerald-600 font-medium">${m.costo}</td>
                    <td className="p-4 text-ink-3">
                      {m.fecha ? new Date(m.fecha).toLocaleDateString() : <span className="text-amber-500 font-medium">Pendiente</span>}
                    </td>
                    <td className="p-4 text-center">
                      {!m.fecha && (
                        <button onClick={() => completeMaintenance(m.id)} className="btn btn-secondary btn-sm text-emerald-600 border-emerald-200">
                          <CheckCircle2 size={14} /> Completar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {maintenances.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-ink-3">No hay mantenimientos registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}