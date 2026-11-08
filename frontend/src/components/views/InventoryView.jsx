import React, { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { Search, Download, Plus, MapPin, Edit2, Trash2 } from "lucide-react";
import { nf } from "../../utils/helpers";
import AssetModal from "../modals/AssetModal";

export default function InventoryView() {
  const { assets, categories, locations, loading, deleteAsset } = useApp();
  const [search, setSearch] = useState("");
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const openNewModal = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el activo "${nombre}"?`)) {
      await deleteAsset(id);
    }
  };

  const getCatName = (id) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.nombre : "Sin categoría";
  };

  const getLocName = (id) => {
    const loc = locations.find((l) => l.id === id);
    return loc ? `${loc.nombre}, ${loc.bloque}` : "Sin ubicación";
  };

  const getStatusStyle = (estado) => {
    switch (estado) {
      case "Disponible": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30";
      case "En Uso": return "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30";
      case "Mantenimiento": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30";
      case "Dado de baja": return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredAssets = assets.filter(a => 
    a.codigo.toLowerCase().includes(search.toLowerCase()) || 
    a.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-ink-2">
          {nf.format(assets.length)} activos registrados en el sistema.
        </p>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary">
            <Download size={16} /> Exportar CSV
          </button>
          <button onClick={openNewModal} className="btn btn-primary">
            <Plus size={16} /> Nuevo activo
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-line">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input 
              type="text" 
              className="field pl-9" 
              placeholder="Buscar por código o nombre..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-subtle text-ink-3 text-xs uppercase tracking-wider border-b border-line">
              <tr>
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Activo</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium">Ubicación</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-ink-3">Cargando activos...</td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-ink-3">
                    {search ? "No se encontraron resultados." : "No hay activos registrados. ¡Crea el primero!"}
                  </td>
                </tr>
              ) : (
                filteredAssets.map((a) => (
                  <tr key={a.id} className="hover:bg-subtle transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-xs font-medium bg-subtle border border-line px-2 py-1 rounded-md text-ink-2">
                        {a.codigo}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-ink truncate max-w-[200px]" title={a.nombre}>{a.nombre}</p>
                      {a.descripcion && <p className="text-xs text-ink-3 truncate max-w-[200px]" title={a.descripcion}>{a.descripcion}</p>}
                    </td>
                    <td className="p-4 text-ink-2">{getCatName(a.categoriaId)}</td>
                    <td className="p-4 text-ink-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-ink-3" />
                        <span className="truncate max-w-[150px]">{getLocName(a.ubicacionId)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusStyle(a.estado)}`}>
                        {a.estado}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(a)} className="p-1.5 text-ink-3 hover:text-ink hover:bg-subtle rounded-md transition-colors" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(a.id, a.nombre)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aquí montamos el modal */}
      <AssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        assetToEdit={editingAsset} 
      />
    </div>
  );
}