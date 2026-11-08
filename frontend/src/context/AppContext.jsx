import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { todayISO } from "../utils/helpers";

export const AppContext = createContext();

const DEFAULT_PREFS = { theme: "system", density: "comfortable", pageSize: 8, institucion: "Institución Educativa Nuestra Señora de Chiquinquirá" };
const LS_PREFS = "inv-institucional:prefs:v1";

export function AppProvider({ children }) {
  // --- ESTADOS PRINCIPALES ---
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loans, setLoans] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSeeded, setIsSeeded] = useState(false);

  // --- PREFERENCIAS Y TOASTS ---
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_PREFS));
      return saved ? { ...DEFAULT_PREFS, ...saved } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
    const root = document.documentElement;
    const isDark = prefs.theme === "dark" || (prefs.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", isDark);
    document.body.dataset.density = prefs.density;
  }, [prefs]);

  const showToast = useCallback((message, detail = "", tone = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, detail, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // --- FUNCIÓN PARA MANEJAR ERRORES DE FASTAPI ---
  // La movimos aquí arriba para que esté disponible en todas las funciones
  const getErrorMessage = (error) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
    return "Ocurrió un error inesperado. Revisa los datos.";
  };

  // --- CARGA DE DATOS ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get("/activos/"),
        api.get("/ubicaciones/"),
        api.get("/usuarios/"),
        api.get("/clases-activo/"),
        api.get("/roles/"),
        api.get("/asignaciones/"),    
        api.get("/mantenimientos/")   
      ]);

      if (results[0].status === "fulfilled") {
        setAssets(results[0].value.data.map((a) => ({
          id: a.id_activo,
          codigo: a.codigo_unico,
          nombre: a.nombre_activo,
          descripcion: a.descripcion,
          categoriaId: a.id_clase,
          ubicacionId: a.id_ubicacion,
          estado: a.estado,
          fecha: a.fecha_adquisicion ? a.fecha_adquisicion.split("T")[0] : todayISO()
        })));
      }

      if (results[1].status === "fulfilled") {
        setLocations(results[1].value.data.map((l) => ({
          id: l.id_ubicacion,
          nombre: l.nombre_espacio,
          bloque: l.edificio_bloque || "General",
          descripcion: l.descripcion
        })));
      }

      if (results[2].status === "fulfilled") {
        setUsers(results[2].value.data.map((u) => ({
          id: u.id_usuario,
          nombre: u.nombre,
          documento: u.numero_documento,
          id_rol: u.id_rol,
          estado_activo: u.estado_activo
        })));
      }

      if (results[3].status === "fulfilled") {
        setCategories(results[3].value.data.map((c) => ({
          id: c.id_clase,
          nombre: c.nombre_clase,
          descripcion: c.descripcion,
          icono: "tag"
        })));
      }

      if (results[4].status === "fulfilled") {
        setRoles(results[4].value.data);
      }
      
      if (results[5].status === "fulfilled") {
        setLoans(results[5].value.data.map((l) => ({
          id: l.id_asignacion,
          id_activo: l.id_activo,
          id_usuario: l.id_usuario_responsable,
          estado: l.estado_asignacion,
          fecha_asignacion: l.fecha_asignacion,
          fecha_devolucion: l.fecha_devolucion
        })));
      }

      if (results[6].status === "fulfilled") {
        setMaintenances(results[6].value.data.map((m) => ({
          id: m.id_mantenimiento,
          id_activo: m.id_activo,
          tipo: m.tipo_mantenimiento,
          descripcion: m.descripcion,
          costo: m.costo,
          fecha: m.fecha_mantenimiento
        })));
      }
    } catch (error) {
      console.error("Error crítico cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [fetchData]);

  // --- CRUD ACTIVOS ---
  const createAsset = async (payload) => {
    try {
      const backendPayload = {
        codigo_unico: payload.codigo,
        nombre_activo: payload.nombre,
        descripcion: payload.descripcion,
        estado: payload.estado,
        id_clase: parseInt(payload.categoriaId),
        id_ubicacion: parseInt(payload.ubicacionId),
        fecha_adquisicion: new Date(payload.fecha).toISOString()
      };
      await api.post("/activos/", backendPayload);
      await fetchData();
      showToast("Activo registrado", `${payload.codigo} se agregó al inventario.`);
    } catch (error) {
      showToast("Error al crear", getErrorMessage(error), "error");
    }
  };

  const updateAsset = async (id, payload) => {
    try {
      const backendPayload = {
        codigo_unico: payload.codigo,
        nombre_activo: payload.nombre,
        descripcion: payload.descripcion,
        estado: payload.estado,
        id_clase: parseInt(payload.categoriaId),
        id_ubicacion: parseInt(payload.ubicacionId),
        fecha_adquisicion: new Date(payload.fecha).toISOString()
      };
      await api.put(`/activos/${id}`, backendPayload);
      await fetchData();
      showToast("Cambios guardados", `${payload.codigo} se actualizó.`);
    } catch (error) {
      showToast("Error al actualizar", getErrorMessage(error), "error");
    }
  };

  const deleteAsset = async (id) => {
    try {
      await api.delete(`/activos/${id}`);
      await fetchData();
      showToast("Activo eliminado", "El registro fue borrado del sistema.");
    } catch (error) {
      showToast("Error al eliminar", getErrorMessage(error), "error");
    }
  };

  // --- CRUD CATEGORÍAS Y UBICACIONES ---
  const createCategory = async (nombre, descripcion) => {
    try {
      await api.post("/clases-activo/", { nombre_clase: nombre, descripcion });
      await fetchData();
      showToast("Categoría creada", nombre);
    } catch (error) {
      showToast("Error al crear", getErrorMessage(error), "error");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/clases-activo/${id}`);
      await fetchData();
      showToast("Categoría eliminada", "Se borró correctamente de la base de datos.");
    } catch (error) {
      showToast("Error al eliminar", getErrorMessage(error), "error");
    }
  };

  const createLocation = async (nombre, bloque, descripcion) => {
    try {
      await api.post("/ubicaciones/", { nombre_espacio: nombre, edificio_bloque: bloque, descripcion });
      await fetchData();
      showToast("Ubicación creada", `${nombre}, ${bloque}`);
    } catch (error) {
      showToast("Error al crear", getErrorMessage(error), "error");
    }
  };

  // --- CRUD USUARIOS ---
  const createUser = async (payload) => {
    try {
      await api.post("/usuarios/", {
        numero_documento: payload.documento,
        nombre: payload.nombre,
        password: payload.password || null,
        id_rol: parseInt(payload.id_rol),
        estado_activo: payload.estado_activo
      });
      await fetchData();
      showToast("Usuario creado", `${payload.nombre} fue registrado.`);
    } catch (error) {
      showToast("Error al crear usuario", getErrorMessage(error), "error");
    }
  };

  const updateUser = async (id, payload) => {
    try {
      const data = {
        nombre: payload.nombre,
        numero_documento: payload.documento,
        id_rol: parseInt(payload.id_rol),
        estado_activo: payload.estado_activo
      };
      if (payload.password) data.password = payload.password;

      await api.patch(`/usuarios/${id}`, data);
      await fetchData();
      showToast("Usuario actualizado", "Los datos se guardaron correctamente.");
    } catch (error) {
      showToast("Error al actualizar", getErrorMessage(error), "error"); 
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/usuarios/${id}`);
      await fetchData();
      showToast("Usuario desactivado", "Ya no podrá iniciar sesión, pero su historial se conserva."); 
    } catch (error) {
      showToast("Error al desactivar", getErrorMessage(error), "error");
    }
  };

  // --- PRÉSTAMOS Y MANTENIMIENTOS ---
  const createLoan = async (payload) => {
    try {
      await api.post("/asignaciones/", {
        id_activo: parseInt(payload.id_activo),
        id_usuario_responsable: parseInt(payload.id_usuario),
        estado_asignacion: "Activa",
        observaciones: payload.observaciones
      });
      await fetchData();
      showToast("Préstamo registrado", "El activo ahora está En Uso.");
    } catch (error) {
      showToast("Error al asignar", getErrorMessage(error), "error");
    }
  };

  const returnLoan = async (id) => {
    try {
      await api.patch(`/asignaciones/${id}/devolver`);
      await fetchData();
      showToast("Devolución exitosa", "El activo vuelve a estar Disponible.");
    } catch (error) {
      showToast("Error al devolver", getErrorMessage(error), "error");
    }
  };

  const createMaintenance = async (payload) => {
    try {
      await api.post("/mantenimientos/", {
        id_activo: parseInt(payload.id_activo),
        tipo_mantenimiento: payload.tipo,
        descripcion: payload.descripcion,
        costo: parseFloat(payload.costo) || 0
      });
      await fetchData();
      showToast("Mantenimiento registrado", "El activo ha sido enviado a revisión.");
    } catch (error) {
      showToast("Error al registrar", getErrorMessage(error), "error");
    }
  };

  const completeMaintenance = async (id) => {
    try {
      await api.patch(`/mantenimientos/${id}/completar`);
      await fetchData();
      showToast("Mantenimiento completado", "El activo ha sido liberado.");
    } catch (error) {
      showToast("Error al completar", getErrorMessage(error), "error");
    }
  };

  return (
    <AppContext.Provider
      value={{
        assets, categories, locations, users, roles, loans, maintenances, loading, isSeeded,
        prefs, setPrefs, fetchData,
        createAsset, updateAsset, deleteAsset,
        createCategory, deleteCategory, createLocation,
        createUser, updateUser, deleteUser,
        createLoan, returnLoan, createMaintenance, completeMaintenance,
        toasts, showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}