import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useApp } from "../../hooks/useApp";

export default function UserModal({ isOpen, onClose, userToEdit }) {
  const { roles, createUser, updateUser } = useApp();
  
  const [form, setForm] = useState({
    nombre: "",
    documento: "",
    password: "",
    id_rol: "",
    estado_activo: true
  });

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setForm({ 
          ...userToEdit, 
          password: "" 
        });
      } else {
        setForm({
          nombre: "", documento: "", password: "",
          id_rol: roles.length > 0 ? roles[0].id_rol : "", 
          estado_activo: true
        });
      }
    }
  }, [userToEdit, isOpen, roles]);

  if (!isOpen) return null;

  // Validar si el rol requiere contraseña
  const selectedRoleObj = roles.find((r) => String(r.id_rol) === String(form.id_rol));
  const requiresPassword = !selectedRoleObj || ["Administrador", "Custodio", "admin", "custodio"].includes(selectedRoleObj.nombre_rol);

    const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (userToEdit && !payload.password) {
      delete payload.password; // Si está vacío, lo quitamos para que no falle
    }
    
    if (userToEdit) {
      await updateUser(userToEdit.id, payload);
    } else {
      await createUser(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-line rounded-xl w-full max-w-md shadow-pop overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h2 className="text-lg font-semibold text-ink">{userToEdit ? "Editar Usuario" : "Nuevo Usuario"}</h2>
          <button onClick={onClose} className="icon-btn text-ink-3 hover:bg-subtle"><X size={20} /></button>
        </div>

        <form id="form-user" onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Nombre Completo</label>
            <input required type="text" className="field" value={form.nombre || ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label className="label">Número de Documento</label>
            <input required type="text" className="field" value={form.documento || ""} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
          </div>
          
          {requiresPassword && (
            <div>
              <label className="label">{userToEdit ? "Nueva Contraseña (Opcional)" : "Contraseña"}</label>
              <input 
  required={!userToEdit && requiresPassword} 
  type="password" 
  className="field" 
  minLength={6}  // <--- ESTO ES VITAL
  value={form.password || ""} 
  onChange={(e) => setForm({ ...form, password: e.target.value })} 
/>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Rol</label>
              <select required className="field" value={form.id_rol || ""} onChange={(e) => setForm({ ...form, id_rol: e.target.value })}>
                <option value="">Seleccione...</option>
                {roles.map((r) => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="field" value={form.estado_activo ? "true" : "false"} onChange={(e) => setForm({ ...form, estado_activo: e.target.value === "true" })}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
        </form>

        <div className="p-5 border-t border-line bg-subtle/50 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
          <button type="submit" form="form-user" className="btn btn-primary">Guardar</button>
        </div>
      </div>
    </div>
  );
}