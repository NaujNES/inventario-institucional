import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function LoansTable() {
  const [loans, setLoans] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newLoan, setNewLoan] = useState({
    id_activo: '',
    id_usuario_responsable: '',
    estado_asignacion: 'Activo',
    observaciones: 'Préstamo institucional'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loansRes, assetsRes, usersRes] = await Promise.all([
        api.get('/asignaciones/').catch(() => ({ data: [] })),
        api.get('/activos/').catch(() => ({ data: [] })),
        api.get('/usuarios/').catch(() => ({ data: [] }))
      ]);
      
      setLoans(loansRes.data);
      setAssets(assetsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error al cargar datos de asignaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    try {
      await api.post('/asignaciones/', {
        ...newLoan,
        id_activo: parseInt(newLoan.id_activo),
        id_usuario_responsable: parseInt(newLoan.id_usuario_responsable)
      });
      setShowModal(false);
      setNewLoan({
        id_activo: '',
        id_usuario_responsable: '',
        estado_asignacion: 'Activo',
        observaciones: 'Préstamo institucional'
      });
      fetchData();
    } catch (err) {
      console.error('Error al registrar asignación:', err);
      alert('No se pudo registrar la asignación. Verifica los datos.');
    }
  };

  const handleReturnAsset = async (id_asignacion) => {
    if (window.confirm('¿Confirmar la devolución de este activo?')) {
      try {
        await api.patch(`/asignaciones/${id_asignacion}/devolver`);
        fetchData();
      } catch (err) {
        console.error('Error al procesar devolución:', err);
        alert('No se pudo procesar la devolución.');
      }
    }
  };

  // Filtro flexible para capturar activos disponibles sin importar mayúsculas
  const availableAssets = assets.filter(a => 
    a.estado && a.estado.toLowerCase().includes('disponible')
  );

  if (loading) {
    return <div className="text-slate-400 p-6 text-center">Cargando módulo de préstamos...</div>;
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg w-full">
      <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ClipboardList className="text-indigo-400" /> Control de Préstamos y Asignaciones
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} /> Nueva Asignación
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">ID Activo</th>
              <th className="p-4">ID Usuario</th>
              <th className="p-4">Fecha Asignación</th>
              <th className="p-4">Fecha Devolución</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loans.map((loan) => (
              <tr key={loan.id_asignacion} className="hover:bg-slate-750 transition-colors">
                <td className="p-4 font-medium text-white">#{loan.id_asignacion}</td>
                <td className="p-4">{loan.id_activo}</td>
                <td className="p-4">{loan.id_usuario_responsable}</td>
                <td className="p-4 text-slate-400 text-sm">
                  {loan.fecha_asignacion ? new Date(loan.fecha_asignacion).toLocaleString() : 'N/A'}
                </td>
                <td className="p-4 text-slate-400 text-sm">
                  {loan.fecha_devolucion ? new Date(loan.fecha_devolucion).toLocaleString() : 'Pendiente'}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    loan.estado_asignacion === 'Activo' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {loan.estado_asignacion}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {loan.estado_asignacion !== 'Devuelto' && (
                    <button 
                      onClick={() => handleReturnAsset(loan.id_asignacion)}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1 mx-auto"
                      title="Registrar devolución"
                    >
                      <CheckCircle2 size={14} /> Devolver
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  No hay registros de asignaciones en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Nueva Asignación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ArrowRightLeft className="text-indigo-400" /> Asignar Activo a Usuario
            </h3>
            
            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Activo Disponible ({availableAssets.length} disponibles)
                </label>
                <select
                  value={newLoan.id_activo}
                  onChange={(e) => setNewLoan({ ...newLoan, id_activo: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Seleccione un activo --</option>
                  {availableAssets.map((asset) => (
                    <option key={asset.id_activo} value={asset.id_activo}>
                      {asset.codigo_unico} - {asset.nombre_activo}
                    </option>
                  ))}
                </select>
                {availableAssets.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1">⚠️ No hay activos con estado "Disponible". Revisa la gestión de activos.</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Usuario Responsable ({users.length} registrados)
                </label>
                <select
                  value={newLoan.id_usuario_responsable}
                  onChange={(e) => setNewLoan({ ...newLoan, id_usuario_responsable: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Seleccione un usuario --</option>
                  {users.map((user) => (
                    <option key={user.id_usuario} value={user.id_usuario}>
                      {user.nombre} (Doc: {user.numero_documento})
                    </option>
                  ))}
                </select>
                {users.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1">⚠️ No se encontraron usuarios. Verifica la sesión o la base de datos.</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Observaciones</label>
                <input
                  type="text"
                  value={newLoan.observaciones}
                  onChange={(e) => setNewLoan({ ...newLoan, observaciones: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
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
                  Guardar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}