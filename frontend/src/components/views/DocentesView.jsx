import React, { useMemo, useState } from "react";
import { Search, Users, Package, MapPin, ChevronRight, Star } from "lucide-react";
import { useApp } from "../../hooks/useApp";
import { initials } from "../../utils/helpers";
import DocenteDetailModal from "../modals/DocenteDetailModal";

export default function DocentesView() {
  const { docentes, salas } = useApp();
  const [search, setSearch] = useState("");
  const [salaFiltro, setSalaFiltro] = useState("Todas");
  const [seleccionado, setSeleccionado] = useState(null);

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return docentes.filter((d) => {
      const coincideTexto =
        !term ||
        String(d.nombre || "").toLowerCase().includes(term) ||
        String(d.documento || "").toLowerCase().includes(term) ||
        String(d.rol || "").toLowerCase().includes(term);
      const coincideSala =
        salaFiltro === "Todas" ||
        (d.salas || []).some((s) => String(s.id_ubicacion) === String(salaFiltro));
      return coincideTexto && coincideSala;
    });
  }, [docentes, search, salaFiltro]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-ink-2">
            Docentes responsables de salas y activos institucionales.
          </p>
          <p className="mt-0.5 text-xs text-ink-3">
            Haz clic en un docente para ver sus salas, activos asignados y préstamos temporales.
          </p>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              className="field pl-9"
              placeholder="Buscar docente por nombre, documento o rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="field" value={salaFiltro} onChange={(e) => setSalaFiltro(e.target.value)}>
            <option value="Todas">Todas las salas</option>
            {salas.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="card p-8 text-center text-ink-3">
          {docentes.length === 0
            ? "No hay docentes registrados. Cree un usuario con rol Profesor para comenzar."
            : "No se encontraron docentes con los filtros actuales."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((d) => (
            <article
              key={d.id}
              role="button"
              tabIndex={0}
              onClick={() => setSeleccionado(d.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSeleccionado(d.id); }}
              className="card flex cursor-pointer flex-col p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="grid size-11 flex-none place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent-fg">
                  {initials(d.nombre)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-semibold text-ink">{d.nombre}</h3>
                  <p className="text-xs text-ink-3">{d.rol || "Docente"} · {d.documento}</p>
                </div>
                <ChevronRight size={16} className="mt-1 flex-none text-ink-3" />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(d.salas || []).slice(0, 3).map((s) => (
                  <span key={s.id_ubicacion} className="inline-flex items-center gap-1 rounded-md border border-line bg-subtle px-2 py-1 text-xs text-ink-2">
                    <MapPin size={11} className="text-ink-3" />
                    {s.nombre_espacio}
                    {s.es_responsable_principal && <Star size={11} className="text-amber-500" />}
                  </span>
                ))}
                {(d.salas || []).length > 3 && (
                  <span className="rounded-md border border-line px-2 py-1 text-xs text-ink-3">+{d.salas.length - 3}</span>
                )}
                {(d.salas || []).length === 0 && (
                  <span className="text-xs text-ink-3">Sin salas asociadas</span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-sm text-ink-2">
                <span className="flex items-center gap-1.5">
                  <Package size={14} className="text-ink-3" />
                  <strong className="font-semibold text-ink">{d.totalActivosAsignados || 0}</strong> activos
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-ink-3" />
                  <strong className="font-semibold text-ink">{d.totalSalas || 0}</strong> salas
                </span>
                {(d.prestamosTemporales || []).length > 0 && (
                  <span className="ml-auto rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {d.prestamosTemporales.length} préstamo(s) temporal(es)
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <DocenteDetailModal
        isOpen={!!seleccionado}
        docenteId={seleccionado}
        onClose={() => setSeleccionado(null)}
      />
    </div>
  );
}
