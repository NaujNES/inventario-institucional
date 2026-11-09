import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useApp } from "../../hooks/useApp";
import { todayISO } from "../../utils/helpers";

export default function AssetModal({ isOpen, onClose, assetToEdit }) {
  const { categories, locations, createAsset, updateAsset, docentes, users } = useApp();
  const responsablesDisponibles = docentes.length > 0 ? docentes : users.filter((u) => u.estado_activo !== false);
  
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoriaId: "",
    ubicacionId: "",
    estado: "Disponible",
    fecha: todayISO(),
    responsableId: ""
  });

  useEffect(() => {
    if (assetToEdit) {
      setForm({ ...assetToEdit });
    } else {
      setForm({
        codigo: "",
        nombre: "",
        descripcion: "",
        categoriaId: categories[0]?.id || "",
        ubicacionId: locations[0]?.id || "",
        estado: "Disponible",
        fecha: todayISO(),
        responsableId: ""
      });
    }
  }, [assetToEdit, isOpen, categories, locations]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (assetToEdit) {
      await updateAsset(assetToEdit.id, form);
    } else {
      await createAsset(form);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-line rounded-xl w-full max-w-2xl shadow-pop overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div>
            <h2 className="text-lg font-semibold text-ink">{assetToEdit ? "Editar Activo" : "Nuevo Activo"}</h2>
            <p className="text-xs text-ink-3 mt-0.5">Completa los datos del bien institucional</p>
          </div>
          <button onClick={onClose} className="icon-btn text-ink-3 hover:bg-subtle">
            <X size={20} />
          </button>
        </div>

        <form id="form-asset" onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Código Único</label>
              <input required type="text" className="field font-mono uppercase" placeholder="ACT-0001" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
            </div>
            <div>
              <label className="label">Fecha de Adquisición</label>
              <input required type="date" className="field" max={todayISO()} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Nombre del Activo</label>
            <input required type="text" className="field" placeholder="Ej: Portátil Lenovo ThinkPad" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>

          <div>
            <label className="label">Descripción (Opcional)</label>
            <textarea className="field" rows="2" placeholder="Marca, modelo, número de serie..." value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Categoría</label>
              <select required className="field" value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
                <option value="">Seleccione...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ubicación</label>
              <select required className="field" value={form.ubicacionId} onChange={(e) => setForm({ ...form, ubicacionId: e.target.value })}>
                <option value="">Seleccione...</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.nombre} ({l.bloque})</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Estado</label>
              <select className="field" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="Disponible">Disponible</option>
                <option value="Prestado">Prestado</option>
                {form.estado === "En Uso" && <option value="En Uso">En Uso (heredado)</option>}
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Dado de baja">Dado de baja</option>
              </select>
            </div>
            <div>
              <label className="label">Responsable permanente (Opcional)</label>
              <select className="field" value={form.responsableId || ""} onChange={(e) => setForm({ ...form, responsableId: e.target.value })}>
                <option value="">Sin asignar</option>
                {responsablesDisponibles.map((u) => <option key={u.id} value={u.id}>{u.nombre}{u.documento ? ` — ${u.documento}` : ""}</option>)}
              </select>
              <p className="mt-1 text-xs text-ink-3">Se registra como asignación permanente en la sala seleccionada.</p>
            </div>
          </div>
        </form>

                <div className="p-5 border-t border-line bg-subtle/50 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
          <button type="submit" form="form-asset" className="btn btn-primary">
            {assetToEdit ? "Guardar Cambios" : "Registrar Activo"}
          </button>
        </div>
      </div>
    </div>
  );
}