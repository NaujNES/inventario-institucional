import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useApp } from "../../hooks/useApp";

export default function EntityModal({ isOpen, onClose, type }) {
  const { createCategory, createLocation } = useApp();
  const [nombre, setNombre] = useState("");
  const [bloque, setBloque] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const isCategory = type === "category";

  useEffect(() => {
    if (isOpen) {
      setNombre("");
      setBloque("");
      setDescripcion("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCategory) {
      await createCategory(nombre, descripcion);
    } else {
      await createLocation(nombre, bloque, descripcion);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-line rounded-xl w-full max-w-md shadow-pop overflow-hidden">
        
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h2 className="text-lg font-semibold text-ink">
            {isCategory ? "Nueva Categoría" : "Nueva Ubicación"}
          </h2>
          <button onClick={onClose} className="icon-btn text-ink-3 hover:bg-subtle">
            <X size={20} />
          </button>
        </div>

        <form id="form-entity" onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">{isCategory ? "Nombre de la categoría" : "Espacio / Sala"}</label>
            <input required type="text" className="field" placeholder={isCategory ? "Ej: Equipos de cómputo" : "Ej: Sala de sistemas 1"} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          {!isCategory && (
            <div>
              <label className="label">Edificio o Bloque</label>
              <input required type="text" className="field" placeholder="Ej: Bloque A" value={bloque} onChange={(e) => setBloque(e.target.value)} />
            </div>
          )}

          <div>
            <label className="label">Descripción (Opcional)</label>
            <textarea className="field" rows="2" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
            <button type="submit" form="form-entity" className="btn btn-primary">Guardar</button>
          </div>
        </form>

      </div>
    </div>
  );
}