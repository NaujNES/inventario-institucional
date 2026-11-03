import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, UserX, Shield, Trash2, Edit2, X } from 'lucide-react';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    numero_documento: '',
    id_rol: '',
    estado_activo: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/usuarios').catch(() => ({ data: [] })),
        api.get('/roles').catch(() => ({ data: [] }))
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id_usuario) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/usuarios/${id_usuario}`);
        fetchData();
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        alert('No se pudo eliminar el usuario.');
      }
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      nombre: user.nombre || '',
      numero_documento: user.numero_documento || '',
      id_rol: user.id_rol || '',
      estado_activo: user.estado_activo ?? true
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/usuarios/${selectedUser.id_usuario}`, {
        ...editForm,
        id_rol: parseInt(editForm.id_rol)
      });
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      alert('No se pudo actualizar el usuario.');
    }
  };

  // Función auxiliar para mostrar el nombre del rol en vez de solo el ID
  const getRolName = (id_rol) => {
    const rol = roles.find(r => r.id_rol === id_rol);
    return rol ? rol.nombre_rol : `Rol ID: ${id_rol}`;
  };

  if (loading) {
    return <div className="text-slate-400 p-6 text-center">Cargando usuarios del sistema...</div>;
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="text-blue-400" /> Gestión de Usuarios y Roles
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
            <tr>
              <th className="p-4">Documento</th>
              <th className="p-4">Nombre Completo</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Fecha de Creación</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map((user) => (
              <tr key={user.id_usuario} className="hover:bg-slate-750 transition-colors">
                <td className="p-4 font-medium text-white">{user.numero_documento}</td>
                <td className="p-4">{user.nombre}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold">
                    {user.nombre_rol || getRolName(user.id_rol)}
                  </span>
                </td>
                <td className="p-4">
                  {user.estado_activo ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                      <UserCheck size={14} /> Activo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                      <UserX size={14} /> Inactivo
                    </span>
                  )}
                </td>
                <td className="p-4 text-sm text-slate-400">
                  {user.fecha_creacion ? new Date(user.fecha_creacion).toLocaleDateString() : 'N/A'}
                </td>
                <td className="p-4 text-center flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                    title="Editar usuario o rol"
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id_usuario)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                    title="Eliminar usuario"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-500">
                  No se encontraron usuarios registrados en la base de datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Editar Usuario y Rol */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="text-blue-400" /> Editar Usuario y Rol
            </h3>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Número de Documento</label>
                <input
                  type="text"
                  value={editForm.numero_documento}
                  onChange={(e) => setEditForm({ ...editForm, numero_documento: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Rol del Sistema</label>
                <select
                  value={editForm.id_rol}
                  onChange={(e) => setEditForm({ ...editForm, id_rol: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Seleccione un rol --</option>
                  {roles.map((rol) => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                      {rol.nombre_rol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Estado</label>
                <select
                  value={editForm.estado_activo ? 'true' : 'false'}
                  onChange={(e) => setEditForm({ ...editForm, estado_activo: e.target.value === 'true' })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}