import React, { useMemo, useState } from "react";
import { useApp } from "../../hooks/useApp";
import { Search, Download, Plus, MapPin, Edit2, Trash2, Eye, UserRound } from "lucide-react";
import { nf } from "../../utils/helpers";
import AssetModal from "../modals/AssetModal";
import AssetDetailModal from "../modals/AssetDetailModal";
import StatusBadge from "../ui/StatusBadge";

export default function InventoryView() {
  const { assets, categories, locations, loading, deleteAsset, loans, assignments } = useApp();
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [ubicacionFiltro, setUbicacionFiltro] = useState("Todas");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [detailAssetId, setDetailAssetId] = useState(null);

  const openNewModal = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el activo "${nombre}"? Esta acción no se puede deshacer.`)) {
      await deleteAsset(id);
    }
  };

  const exportCsv = () => {
    const rows = filteredAssets.map((a) => [
      a.codigo,
      a.nombre,
      getCatName(a.categoriaId),
      getLocName(a.ubicacionId),
      a.estado,
      getResponsable(a),
      a.fecha,
    ]);
    const header = ["Código", "Activo", "Categoría", "Ubicación", "Estado", "Responsable / uso", "Fecha adquisición"];
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventario_institucional.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCatName = (id) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.nombre : "Sin categoría";
  };

  const getLocName = (id) => {
    const loc = locations.find((l) => l.id === id);
    return loc ? `${loc.nombre}, ${loc.bloque}` : "Sin ubicación";
  };

  const getAsignacion = (assetId) =>
    assignments.find((a) => a.idActivo === assetId && a.estado === "Activa");

  const getPrestamoActivo = (assetId) =>
    loans.find((l) => l.id_activo === assetId && l.estado === "Activo");

  const getResponsable = (asset) => {
    const prestamo = getPrestamoActivo(asset.id);
    if (prestamo) return `Préstamo: ${prestamo.nombre_solicitante}`;
    const asignacion = getAsignacion(asset.id);
    if (asignacion) return asignacion.nombreResponsable || "Responsable asignado";
    return "Sin responsable";
  };

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return assets.filter((a) => {
      const coincideTexto =
        !term ||
        String(a.codigo || "").toLowerCase().includes(term) ||
        String(a.nombre || "").toLowerCase().includes(term) ||
        String(a.descripcion || "").toLowerCase().includes(term);
      const coincideEstado =
        estadoFiltro === "Todos" ||
        String(a.estado || "").toLowerCase() === estadoFiltro.toLowerCase();
      const coincideCategoria =
        categoriaFiltro === "Todas" || String(a.categoriaId) === String(categoriaFiltro);
      const coincideUbicacion =
        ubicacionFiltro === "Todas" || String(a.ubicacionId) === String(ubicacionFiltro);
      return coincideTexto && coincideEstado && coincideCategoria && coincideUbicacion;
    });
  }, [assets, search, estadoFiltro, categoriaFiltro, ubicacionFiltro]);

  const detailAsset = assets.find((a) => a.id === detailAssetId) || null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-ink-2">
          {nf.format(assets.length)} activos registrados. {nf.format(filteredAssets.length)} visibles con los filtros actuales.
        </p>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="btn btn-secondary">
            <Download size={16} /> Exportar CSV
          </button>
          <button onClick={openNewModal} className="btn btn-primary">
            <Plus size={16} /> Nuevo activo
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-1 gap-3 border-b border-line p-4 md:grid-cols-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              type="text"
              className="field pl-9"
              placeholder="Buscar por código, nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="field" value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
            <option value="Todas">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <select className="field" value={ubicacionFiltro} onChange={(e) => setUbicacionFiltro(e.target.value)}>
            <option value="Todas">Todas las salas / ubicaciones</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.nombre} ({l.bloque})</option>
            ))}
          </select>
          <select className="field" value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
            <option value="Todos">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Prestado">Prestado</option>
            <option value="En Uso">En Uso (heredado)</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Dado de baja">Dado de baja</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-subtle text-ink-3 text-xs uppercase tracking-wider border-b border-line">
              <tr>
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Activo</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium">Ubicación</th>
                <th className="p-4 font-medium">Responsable / uso</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-ink-3">Cargando activos...</td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-ink-3">
                    {search || estadoFiltro !== "Todos" || categoriaFiltro !== "Todas" || ubicacionFiltro !== "Todas"
                      ? "No se encontraron resultados con los filtros actuales."
                      : "No hay activos registrados. ¡Crea el primero!"}
                  </td>
                </tr>
              ) : (
                filteredAssets.map((a) => {
                  const prestamo = getPrestamoActivo(a.id);
                  const asignacion = getAsignacion(a.id);
                  return (
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
                        {prestamo ? (
                          <div>
                            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Préstamo temporal</p>
                            <p className="text-xs text-ink-2 truncate max-w-[170px]">{prestamo.nombre_solicitante}</p>
                          </div>
                        ) : asignacion ? (
                          <div className="flex items-start gap-1.5">
                            <UserRound size={14} className="mt-0.5 text-ink-3" />
                            <div>
                              <p className="text-xs font-medium text-ink">{asignacion.nombreResponsable}</p>
                              <p className="text-xs text-ink-3">{asignacion.nombreSala}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-3">Sin responsable</span>
                        )}
                      </td>
                      <td className="p-4">
                        <StatusBadge estado={a.estado} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setDetailAssetId(a.id)} className="p-1.5 text-ink-3 hover:text-ink hover:bg-subtle rounded-md transition-colors" title="Ver ficha e historial">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => openEditModal(a)} className="p-1.5 text-ink-3 hover:text-ink hover:bg-subtle rounded-md transition-colors" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(a.id, a.nombre)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assetToEdit={editingAsset}
      />
      <AssetDetailModal
        isOpen={!!detailAsset}
        asset={detailAsset}
        onClose={() => setDetailAssetId(null)}
      />
    </div>
  );
}
