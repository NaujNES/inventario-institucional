import React, { useMemo, useState } from "react";
import { MapPin, Plus, Building2, Users, Package, ChevronRight } from "lucide-react";
import { useApp } from "../../hooks/useApp";
import EntityModal from "../modals/EntityModal";
import SalaDetailModal from "../modals/SalaDetailModal";
import { initials } from "../../utils/helpers";

export default function LocationsView() {
  const { salas, locations, assets } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);

  const data = useMemo(() => {
    if (salas.length > 0) return salas;
    return locations.map((l) => ({
      ...l,
      totalActivos: assets.filter((a) => a.ubicacionId === l.id).length,
      docentes: [],
      activos: [],
    }));
  }, [salas, locations, assets]);

  const grouped = useMemo(
    () =>
      data.reduce((acc, sala) => {
        const bloque = sala.bloque || "General";
        if (!acc[bloque]) acc[bloque] = [];
        acc[bloque].push(sala);
        return acc;
      }, {}),
    [data]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-ink-2">
            Salas y espacios institucionales con sus docentes responsables y activos registrados.
          </p>
          <p className="mt-0.5 text-xs text-ink-3">Haz clic en una sala para ver su ficha completa.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Nueva sala / espacio
        </button>
      </div>

      {Object.keys(grouped).map((bloque) => (
        <section key={bloque}>
          <div className="mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-ink-3" />
            <h3 className="text-sm font-semibold tracking-tight text-ink">{bloque}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grouped[bloque].map((sala) => {
              const docentes = sala.docentes || [];
              return (
                <article
                  key={sala.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSalaSeleccionada(sala.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSalaSeleccionada(sala.id); }}
                  className="card flex cursor-pointer flex-col p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-[15px] font-semibold tracking-tight text-ink">{sala.nombre}</h4>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-3">
                        <MapPin size={12} /> {sala.bloque || "General"}
                      </p>
                      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-[13px] text-ink-3">
                        {sala.descripcion || "Sin descripción"}
                      </p>
                    </div>
                    <ChevronRight size={16} className="mt-1 flex-none text-ink-3" />
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {docentes.slice(0, 4).map((d) => (
                      <span
                        key={d.id_sala_docente}
                        title={`${d.nombre_docente}${d.es_responsable_principal ? " · Responsable principal" : ""}`}
                        className={`grid size-8 place-items-center rounded-full text-xs font-semibold ${d.es_responsable_principal ? "bg-accent text-white" : "bg-subtle text-ink-2 border border-line"}`}
                      >
                        {initials(d.nombre_docente)}
                      </span>
                    ))}
                    {docentes.length === 0 && (
                      <span className="text-xs text-ink-3">Sin docentes asociados</span>
                    )}
                    {docentes.length > 4 && (
                      <span className="text-xs text-ink-3">+{docentes.length - 4}</span>
                    )}
                  </div>

                  <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-ink-2">
                        <Package size={14} className="text-ink-3" />
                        <strong className="font-semibold text-ink">{sala.totalActivos ?? 0}</strong> activos
                      </span>
                      <span className="flex items-center gap-1.5 text-ink-2">
                        <Users size={14} className="text-ink-3" />
                        <strong className="font-semibold text-ink">{docentes.length}</strong> docentes
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {data.length === 0 && (
        <div className="py-10 text-center text-ink-3">No hay salas o ubicaciones creadas.</div>
      )}

      <EntityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type="location" />
      <SalaDetailModal
        isOpen={!!salaSeleccionada}
        salaId={salaSeleccionada}
        onClose={() => setSalaSeleccionada(null)}
      />
    </div>
  );
}
