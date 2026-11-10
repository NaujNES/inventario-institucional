import { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { Tags, Plus, Trash2 } from "lucide-react";
import EntityModal from "../modals/EntityModal";

export default function CategoriesView() {
  const { categories, assets, deleteCategory } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const countAssets = (catId) => assets.filter(a => a.categoriaId === catId).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-ink-2">Clasifica los activos para encontrarlos más fácil.</p>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => {
          const count = countAssets(c.id);
          return (
            <article key={c.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent-fg">
                  <Tags size={20} />
                </span>
                
                {/* BOTÓN DE ELIMINAR AGREGADO AQUÍ */}
                <button 
                  onClick={() => {
                    if(window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) deleteCategory(c.id);
                  }} 
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors" 
                  title="Eliminar categoría"
                >
                  <Trash2 size={16} />
                </button>

              </div>
              <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-ink">{c.nombre}</h3>
              <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-[13px] text-ink-3">
                {c.descripcion || "Sin descripción"}
              </p>
              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-semibold tracking-tight text-ink">{count}</span>
                  <span className="text-[13px] text-ink-3">{count === 1 ? 'activo' : 'activos'}</span>
                </div>
              </div>
            </article>
          );
        })}
        {categories.length === 0 && (
          <div className="col-span-full py-10 text-center text-ink-3">No hay categorías creadas.</div>
        )}
      </div>

      <EntityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type="category" />
    </div>
  );
}