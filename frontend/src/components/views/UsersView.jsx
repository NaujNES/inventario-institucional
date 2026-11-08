import React, { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { Shield, Edit2, Trash2 } from "lucide-react";
import UserModal from "../modals/UserModal";

export default function UsersView() {
  const { users, roles, deleteUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Desactivar al usuario "${nombre}"?`)) {
      await deleteUser(id);
    }
  };

  const getRolName = (id) => {
    const r = roles.find((x) => x.id_rol === id);
    return r ? r.nombre_rol : "Sin rol";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-ink-2">Gestiona el personal y sus permisos de acceso.</p>
        <button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} className="btn btn-primary">
          <Shield size={16} /> Nuevo Usuario
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-subtle text-ink-3 text-xs uppercase tracking-wider border-b border-line">
            <tr>
              <th className="p-4 font-medium">Documento</th>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Rol</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-subtle transition-colors">
                <td className="p-4 text-ink-2">{u.documento || "N/A"}</td>
                <td className="p-4 font-medium text-ink">{u.nombre || "Sin nombre"}</td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-accent-fg text-sm font-medium">
                    <Shield size={14} /> {getRolName(u.id_rol)}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${u.estado_activo ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {u.estado_activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => { setEditingUser(u); setIsModalOpen(true); }} className="p-1.5 text-ink-3 hover:text-ink hover:bg-subtle rounded-md">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(u.id, u.nombre)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-ink-3">No hay usuarios registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userToEdit={editingUser} />
    </div>
  );
}