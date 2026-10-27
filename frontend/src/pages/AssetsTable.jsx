import React from 'react';
import { Plus } from 'lucide-react';

export default function AssetsTable({ assets, loading, setShowModal }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Activos</h1>
          <p className="text-slate-400 text-sm">Administra y registra los elementos de la institución.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/30"
        >
          <Plus size={18} />
          <span>Nuevo Activo</span>
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-700/50 text-slate-300 text-xs uppercase tracking-wider border-b border-slate-700">
                <th className="p-4">Código Único</th>
                <th className="p-4">Nombre</th>
                <th className="p-4">Descripción</th>
                <th className="p-4">Clase ID</th>
                <th className="p-4">Ubicación ID</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-sm text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">Cargando activos...</td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">No hay activos registrados todavía.</td>
                </tr>
              ) : (
                assets.map((asset, index) => (
                  <tr key={index} className="hover:bg-slate-700/30 transition">
                    <td className="p-4 font-medium text-indigo-400">{asset.codigo_unico}</td>
                    <td className="p-4">{asset.nombre_activo}</td>
                    <td className="p-4 text-slate-400">{asset.descripcion}</td>
                    <td className="p-4 text-slate-400">{asset.id_clase}</td>
                    <td className="p-4">{asset.id_ubicacion}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {asset.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}