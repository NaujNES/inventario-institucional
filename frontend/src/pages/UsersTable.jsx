import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, UserX, Shield } from 'lucide-react';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Asegúrate de que tu backend tenga el endpoint GET /usuarios
      const response = await api.get('/usuarios');
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map((user) => (
              <tr key={user.id_usuario} className="hover:bg-slate-750 transition-colors">
                <td className="p-4 font-medium text-white">{user.numero_documento}</td>
                <td className="p-4">{user.nombre}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold">
                    {user.nombre_rol || `Rol ID: ${user.id_rol}`}
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
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  No se encontraron usuarios registrados en la base de datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}