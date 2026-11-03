import React, { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function MaintenanceTable() {
  const [maintenances, setMaintenances] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newMaint, setNewMaint] = useState({
    id_activo: '',
    tipo_mantenimiento: 'Preventivo',
    descripcion: '',
    costo: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [maintRes, assetsRes] = await Promise.all([
        api.get('/mantenimientos/').catch(() => ({ data: [] })),
        api.get('/activos/').catch(() => ({ data: [] }))
      ]);
      setMaintenances(maintRes.data);
      setAssets(assetsRes.data);
    } catch (err) {
      console.error('Error al cargar datos de mantenimientos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mantenimientos/', {
        id_activo: parseInt(newMaint.id_activo),
        tipo_mantenimiento: newMaint.tipo_mantenimiento,
        descripcion: newMaint.descripcion,
        costo: parseFloat(newMaint.costo) || 0.0
      });
      setShowModal(false);
      setNewMaint({
        id_activo: '',
        tipo_mantenimiento: 'Preventivo',
        descripcion: '',
        costo: ''
      });
      fetchData();
    } catch (err) {
      console.error('Error detallado del backend:', err.response?.data);
      
      const detail = err.response?.data?.detail;
      let mensajeError = 'Error desconocido';
      
      if (typeof detail === 'string') {
        mensajeError = detail;
      } else if (Array.isArray(detail)) {
        mensajeError = detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(' | ');
      } else if (typeof detail === 'object' && detail !== null) {
        mensajeError = JSON.stringify(detail);
      }

      alert(`Detalle del error de FastAPI:\n${mensajeError}`);
    }
  };

  const handleCompleteMaintenance = async (id_mantenimiento) => {
    if (window.confirm('¿Marcar este mantenimiento como completado?')) {
      try {
        await api.patch(`/mantenimientos/${id_mantenimiento}/completar`);
        fetchData();
      } catch (err) {
        console.error('Error al completar mantenimiento:', err);
        alert('No se pudo actualizar el estado.');
      }
    }
  };

  const handleDeleteMaintenance = async (id_mantenimiento) => {
    if (window.confirm('¿Estás seguro de eliminar este registro de mantenimiento?')) {
      try {
        await api.delete(`/mantenimientos/${id_mantenimiento}`);
        fetchData();
      } catch (err) {
        console.error('Error al eliminar mantenimiento:', err);
        alert('No se pudo eliminar el mantenimiento.');
      }
    }
  };

  if (loading) {
    return <div className="text-slate-400 p-6 text-center">Cargando módulo de mantenimientos...</div>;
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg w-full">
      <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wrench className="text-indigo-400" /> Gestión de Mantenimientos
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} /> Registrar Mantenimiento
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Activo ID</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Descripción</th>
              <th className="p-4">Costo</th>
              <th className="p-4">Fecha Realización</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {maintenances.map((m) => {
              const fechaFinalizacion = m.fecha_mantenimiento || m.fecha_realizacion;

              return (
                <tr key={m.id_mantenimiento} className="hover:bg-slate-750 transition-colors">
                  <td className="p-4 font-medium text-white">#{m.id_mantenimiento}</td>
                  <td className="p-4">{m.id_activo}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {m.tipo_mantenimiento}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 max-w-xs truncate">
                    {m.descripcion || 'Sin descripción'}
                  </td>
                  <td className="p-4 text-emerald-400 font-medium">
                    ${Number(m.costo || m.costo_estimado || m.precio || m.valor || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {fechaFinalizacion ? new Date(fechaFinalizacion).toLocaleDateString() : (
                      <span className="text-amber-400 font-medium">Pendiente</span>
                    )}
                  </td>
                  <td className="p-4 text-center flex items-center justify-center gap-2">
                    {!fechaFinalizacion && (
                      <button 
                        onClick={() => handleCompleteMaintenance(m.id_mantenimiento)}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                        title="Completar mantenimiento"
                      >
                        <CheckCircle2 size={14} /> Finalizar
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteMaintenance(m.id_mantenimiento)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                      title="Eliminar registro"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
            {maintenances.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  No hay registros de mantenimientos en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Nuevo Mantenimiento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Wrench className="text-indigo-400" /> Registrar Mantenimiento de Activo
            </h3>
            
            <form onSubmit={handleCreateMaintenance} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Seleccionar Activo</label>
                <select
                  value={newMaint.id_activo}
                  onChange={(e) => setNewMaint({ ...newMaint, id_activo: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Seleccione un activo --</option>
                  {assets.map((asset) => (
                    <option key={asset.id_activo} value={asset.id_activo}>
                      {asset.codigo_unico || asset.codigo_inventario || asset.codigo} - {asset.nombre_activo || asset.nombre || asset.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Tipo de Mantenimiento</label>
                <select
                  value={newMaint.tipo_mantenimiento}
                  onChange={(e) => setNewMaint({ ...newMaint, tipo_mantenimiento: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Descripción del Problema / Tarea</label>
                <textarea
                  value={newMaint.descripcion}
                  onChange={(e) => setNewMaint({ ...newMaint, descripcion: e.target.value })}
                  required
                  rows="3"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Detalles del mantenimiento o problema..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Costo Estimado</label>
                <input
                  type="number"
                  step="any"
                  value={newMaint.costo}
                  onChange={(e) => setNewMaint({ ...newMaint, costo: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ej: 50000"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Guardar Mantenimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}