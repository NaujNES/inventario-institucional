import React, { useState } from 'react';
import { Package, Plus, Trash2, Search } from 'lucide-react';

export default function AssetsTable({ assets, loading, setShowModal, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Filtrado en tiempo real por texto y estado
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.codigo_unico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.nombre_activo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || asset.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-slate-400 p-6 text-center">Cargando activos institucionales...</div>;
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
      <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="text-indigo-400" /> Gestión de Activos Fijos
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} /> Nuevo Activo
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="p-4 bg-slate-900/40 border-b border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por código o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-slate-400">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="Todos">Todos</option>
            <option value="Disponible">Disponible</option>
            <option value="En Uso">En Uso</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
            <tr>
              <th className="p-4">Código Único</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Descripción</th>
              <th className="p-4">Clase ID</th>
              <th className="p-4">Ubicación ID</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredAssets.map((asset) => (
              <tr key={asset.id_activo} className="hover:bg-slate-750 transition-colors">
                <td className="p-4 font-medium text-white">{asset.codigo_unico}</td>
                <td className="p-4">{asset.nombre_activo}</td>
                <td className="p-4 text-slate-400 text-sm">{asset.descripcion || 'Sin descripción'}</td>
                <td className="p-4">{asset.id_clase}</td>
                <td className="p-4">{asset.id_ubicacion}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    asset.estado === 'Disponible' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {asset.estado}
                  </span>
                </td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button 
                    onClick={() => onDelete(asset.id_activo)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Eliminar activo"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-500">
                  No se encontraron activos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}