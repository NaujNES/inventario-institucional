import React, { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { ArrowRightLeft, CheckCircle2 } from "lucide-react";

export default function LoansView() {
  const { loans, assets, users, createLoan, returnLoan } = useApp();
  const [form, setForm] = useState({ id_activo: "", id_usuario: "", observaciones: "" });

  // Solo podemos prestar activos que estén "Disponibles"
  const availableAssets = assets.filter((a) => a.estado === "Disponible");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createLoan(form);
    setForm({ id_activo: "", id_usuario: "", observaciones: "" }); // Limpiar
  };

  return (
    <div className="space-y-6">
      {/* Formulario de Asignación */}
      <div className="card p-5 border-l-4 border-l-accent">
        <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <ArrowRightLeft size={16} className="text-accent-fg" /> Asignar Activo a un Funcionario
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <select required className="field flex-1" value={form.id_activo} onChange={(e) => setForm({ ...form, id_activo: e.target.value })}>
            <option value="">Seleccione Activo (Disponibles: {availableAssets.length})</option>
            {availableAssets.map((a) => <option key={a.id} value={a.id}>{a.codigo} - {a.nombre}</option>)}
          </select>
          <select required className="field flex-1" value={form.id_usuario} onChange={(e) => setForm({ ...form, id_usuario: e.target.value })}>
            <option value="">Seleccione Usuario</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
          </select>
          <button type="submit" disabled={availableAssets.length === 0} className="btn btn-primary whitespace-nowrap">Asignar Préstamo</button>
        </form>
      </div>

      {/* Tabla de Préstamos */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-subtle text-ink-3 text-xs uppercase tracking-wider border-b border-line">
              <tr>
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Activo</th>
                <th className="p-4 font-medium">Asignado a</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loans.map((l) => {
                const asset = assets.find((a) => a.id === l.id_activo);
                const user = users.find((u) => u.id === l.id_usuario);
                return (
                  <tr key={l.id} className="hover:bg-subtle transition-colors">
                    <td className="p-4 text-ink-2">#{l.id}</td>
                    <td className="p-4 font-medium text-ink">{asset?.nombre || `Activo #${l.id_activo}`}</td>
                    <td className="p-4 text-ink-2">{user?.nombre || `Usuario #${l.id_usuario}`}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${l.estado === "Activa" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {l.estado}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {l.estado === "Activa" && (
                        <button onClick={() => returnLoan(l.id)} className="btn btn-secondary btn-sm text-emerald-600 border-emerald-200">
                          <CheckCircle2 size={14} /> Devolver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {loans.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-ink-3">No hay préstamos registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}