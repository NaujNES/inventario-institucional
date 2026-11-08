import React, { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { MapPin, Plus, Building2 } from "lucide-react";
import EntityModal from "../modals/EntityModal";

export default function LocationsView() {
  const { locations, assets } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const countAssets = (locId) => assets.filter(a => a.ubicacionId === locId).length;

  // Agrupar por bloque
  const grouped = locations.reduce((acc, loc) => {
    const b = loc.bloque || "General";
    if (!acc[b]) acc[b] = [];
    acc[b].push(loc);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-ink-2">Espacios físicos donde se encuentran los activos.</p>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Nueva ubicación
        </button>
      </div>

      {Object.keys(grouped).map((bloque) => (
        <section key={bloque}>
          <div className="mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-ink-3" />
            <h3 className="text-sm font-semibold tracking-tight text-ink">{bloque}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grouped[bloque].map((l) => {
              const count = countAssets(l.id);
              return (
                <article key={l.id} className="card flex flex-col p-5">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-[15px] font-semibold tracking-tight text-ink">{l.nombre}</h4>
                      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-[13px] text-ink-3">{l.descripcion || "Sin descripción"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-xl font-semibold tracking-tight text-ink">{count}</span>
                      <span className="text-[13px] text-ink-3 ml-1">{count === 1 ? 'activo' : 'activos'}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
      {locations.length === 0 && (
        <div className="py-10 text-center text-ink-3">No hay ubicaciones creadas.</div>
      )}

      <EntityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type="location" />
    </div>
  );
}