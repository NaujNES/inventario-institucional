import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function AssetModal({ showModal, setShowModal, newAsset, setNewAsset, handleCreateAsset, formError }) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-white">Registrar Nuevo Activo</h3>
          <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateAsset} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Código Único</label>
              <input
                type="text"
                required
                value={newAsset.codigo_unico}
                onChange={(e) => setNewAsset({ ...newAsset, codigo_unico: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Ej: ACT-LAP-001"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">ID de Clase</label>
              <input
                type="number"
                required
                value={newAsset.id_clase}
                onChange={(e) => setNewAsset({ ...newAsset, id_clase: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Ej: 1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Activo</label>
            <input
              type="text"
              required
              value={newAsset.nombre_activo}
              onChange={(e) => setNewAsset({ ...newAsset, nombre_activo: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Ej: Laptop Lenovo ThinkPad"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Descripción</label>
            <input
              type="text"
              value={newAsset.descripcion}
              onChange={(e) => setNewAsset({ ...newAsset, descripcion: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Ej: Equipo para desarrollo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">ID de Ubicación</label>
              <input
                type="number"
                required
                value={newAsset.id_ubicacion}
                onChange={(e) => setNewAsset({ ...newAsset, id_ubicacion: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Ej: 1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Estado</label>
              <select
                value={newAsset.estado}
                onChange={(e) => setNewAsset({ ...newAsset, estado: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="Disponible">Disponible</option>
                <option value="Asignado">Asignado</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-700">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition shadow-lg shadow-indigo-600/30"
            >
              Guardar Activo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}