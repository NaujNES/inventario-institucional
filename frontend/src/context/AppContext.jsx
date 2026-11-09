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
  const [assignments, setAssignments] = useState([]);
  const [salas, setSalas] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSeeded] = useState(false);

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

  const getErrorMessage = (error) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
    return "Ocurrió un error inesperado. Revisa los datos.";
  };

  const mapAssignment = (a) => ({
    id: a.id_asignacion_activo,
    idActivo: a.id_activo,
    idUsuarioResponsable: a.id_usuario_responsable,
    idUbicacion: a.id_ubicacion,
    estado: a.estado,
    observaciones: a.observaciones,
    fechaAsignacion: a.fecha_asignacion,
    fechaFin: a.fecha_fin,
    nombreResponsable: a.nombre_responsable,
    documentoResponsable: a.documento_responsable,
    nombreSala: a.nombre_sala,
    nombreActivo: a.nombre_activo,
    codigoActivo: a.codigo_activo,
  });

  const mapLoan = (l) => ({
    id: l.id_prestamo,
    id_activo: l.id_activo,
    nombre_solicitante: l.nombre_solicitante,
    grado: l.grado,
    fecha_prestamo: l.fecha_prestamo,
    actividad: l.actividad,
    fecha_entrega: l.fecha_entrega,
    fecha_devolucion_esperada: l.fecha_devolucion_esperada,
    observaciones_entrega: l.observaciones_entrega,
    estado: l.estado_prestamo,
    fecha_devolucion_real: l.fecha_devolucion_real,
    observaciones_devolucion: l.observaciones_devolucion,
    persona_recibe_devolucion: l.persona_recibe_devolucion,
    estado_devolucion: l.estado_devolucion,
    nombre_activo: l.nombre_activo,
    codigo_activo: l.codigo_activo,
    nombre_usuario_registra: l.nombre_usuario_registra,
    vencido: l.vencido,
    componentes: l.componentes || [],
  });

  const mapDocente = (d) => ({
    id: d.id_usuario,
    nombre: d.nombre,
    documento: d.numero_documento,
    rol: d.rol,
    salas: d.salas || [],
    totalSalas: d.total_salas || 0,
    totalActivosAsignados: d.total_activos_asignados || 0,
    activosAsignados: (d.activos_asignados || []).map(mapAssignment),
    prestamosTemporales: (d.prestamos_temporales || []).map(mapLoan),
  });

  const mapSala = (s) => ({
    id: s.id_ubicacion,
    nombre: s.nombre_espacio,
    bloque: s.edificio_bloque || "General",
    descripcion: s.descripcion,
    totalActivos: s.total_activos || 0,
    docentes: s.docentes || [],
    activos: s.activos || [],
  });

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
        api.get("/prestamos/"),
        api.get("/mantenimientos/"),
        api.get("/asignaciones-activo/"),
        api.get("/salas/"),
        api.get("/docentes/"),
      ]);

      let mappedAssignments = [];
      if (results[7].status === "fulfilled") {
        mappedAssignments = results[7].value.data.map(mapAssignment);
        setAssignments(mappedAssignments);
      }

      if (results[0].status === "fulfilled") {
        setAssets(results[0].value.data.map((a) => {
          const asignacion = mappedAssignments.find(
            (x) => x.idActivo === a.id_activo && x.estado === "Activa"
          );
          return {
            id: a.id_activo,
            codigo: a.codigo_unico,
            nombre: a.nombre_activo,
            descripcion: a.descripcion,
            categoriaId: a.id_clase,
            ubicacionId: a.id_ubicacion,
            estado: a.estado,
            fecha: a.fecha_adquisicion ? a.fecha_adquisicion.split("T")[0] : todayISO(),
            responsableId: asignacion?.idUsuarioResponsable || null,
            responsableNombre: asignacion?.nombreResponsable || null,
            salaResponsable: asignacion?.nombreSala || null,
          };
        }));
      }

      if (results[1].status === "fulfilled") {
        setLocations(results[1].value.data.map((l) => ({
          id: l.id_ubicacion,
          nombre: l.nombre_espacio,
          bloque: l.edificio_bloque || "General",
          descripcion: l.descripcion,
        })));
      }

      if (results[2].status === "fulfilled") {
        setUsers(results[2].value.data.map((u) => ({
          id: u.id_usuario,
          nombre: u.nombre,
          documento: u.numero_documento,
          id_rol: u.id_rol,
          estado_activo: u.estado_activo,
        })));
      }

      if (results[3].status === "fulfilled") {
        setCategories(results[3].value.data.map((c) => ({
          id: c.id_clase,
          nombre: c.nombre_clase,
          descripcion: c.descripcion,
          icono: "tag",
        })));
      }

      if (results[4].status === "fulfilled") {
        setRoles(results[4].value.data);
      }

      if (results[5].status === "fulfilled") {
        setLoans(results[5].value.data.map(mapLoan));
      }

      if (results[6].status === "fulfilled") {
        setMaintenances(results[6].value.data.map((m) => ({
          id: m.id_mantenimiento,
          id_activo: m.id_activo,
          tipo: m.tipo_mantenimiento,
          descripcion: m.descripcion,
          costo: m.costo,
          fecha: m.fecha_mantenimiento,
        })));
      }

      if (results[8].status === "fulfilled") {
        setSalas(results[8].value.data.map(mapSala));
      }

      if (results[9].status === "fulfilled") {
        setDocentes(results[9].value.data.map(mapDocente));
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

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // --- FUNCIONES DE APOYO ---
  const assignAssetRequest = async (idActivo, payload) => {
    return api.post(`/activos/${idActivo}/asignacion`, {
      id_usuario_responsable: parseInt(payload.id_usuario_responsable),
      id_ubicacion: parseInt(payload.id_ubicacion),
      observaciones: payload.observaciones || null,
    });
  };

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
        fecha_adquisicion: new Date(payload.fecha).toISOString(),
      };
      const creado = await api.post("/activos/", backendPayload);
      if (payload.responsableId) {
        await assignAssetRequest(creado.data.id_activo, {
          id_usuario_responsable: payload.responsableId,
          id_ubicacion: payload.ubicacionId,
          observaciones: "Asignación registrada al crear el activo.",
        });
      }
      await fetchData();
      showToast("Activo registrado", `${payload.codigo} se agregó al inventario.`);
      return creado.data;
    } catch (error) {
      showToast("Error al crear", getErrorMessage(error), "error");
      return null;
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
        fecha_adquisicion: new Date(payload.fecha).toISOString(),
      };
      await api.put(`/activos/${id}`, backendPayload);
      if (payload.responsableId) {
        await assignAssetRequest(id, {
          id_usuario_responsable: payload.responsableId,
          id_ubicacion: payload.ubicacionId,
          observaciones: "Responsable actualizado desde la ficha del activo.",
        });
      }
      await fetchData();
      showToast("Cambios guardados", `${payload.codigo} se actualizó.`);
      return true;
    } catch (error) {
      showToast("Error al actualizar", getErrorMessage(error), "error");
      return false;
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
      showToast("Sala creada", `${nombre}, ${bloque}`);
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
        estado_activo: payload.estado_activo,
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
        estado_activo: payload.estado_activo,
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

  // --- PRÉSTAMOS ---
  const createLoan = async (payload) => {
    try {
      const body = {
        id_activo: parseInt(payload.id_activo),
        nombre_solicitante: payload.nombre_solicitante,
        grado: payload.grado || null,
        fecha_prestamo: payload.fecha_prestamo,
        actividad: payload.actividad || null,
        fecha_entrega: payload.fecha_entrega || null,
        fecha_devolucion_esperada: payload.fecha_devolucion_esperada || null,
        observaciones_entrega: payload.observaciones_entrega || null,
        componentes: (payload.componentes || []).map((c) => ({
          nombre_componente: c.nombre_componente,
          estado_entrega: c.estado_entrega,
          observacion_entrega: c.observacion_entrega || null,
        })),
      };
      await api.post("/prestamos/", body);
      await fetchData();
      showToast("Préstamo registrado", "El activo quedó marcado como Prestado.");
      return true;
    } catch (error) {
      showToast("Error al registrar préstamo", getErrorMessage(error), "error");
      return false;
    }
  };

  const returnLoan = async (id, payload) => {
    try {
      const body = {
        fecha_devolucion_real: payload.fecha_devolucion_real,
        persona_recibe_devolucion: payload.persona_recibe_devolucion,
        estado_devolucion: payload.estado_devolucion,
        observaciones_devolucion: payload.observaciones_devolucion || null,
        componentes: (payload.componentes || []).map((c) => ({
          id_componente_prestamo: c.id_componente_prestamo,
          estado_devolucion: c.estado_devolucion,
          observacion_devolucion: c.observacion_devolucion || null,
        })),
      };
      await api.post(`/prestamos/${id}/devolver`, body);
      await fetchData();
      showToast("Devolución registrada", "El activo vuelve a estar Disponible.");
      return true;
    } catch (error) {
      showToast("Error al devolver", getErrorMessage(error), "error");
      return false;
    }
  };

  // --- ASIGNACIONES PERMANENTES ---
  const assignAsset = async (idActivo, payload) => {
    try {
      await assignAssetRequest(idActivo, payload);
      await fetchData();
      showToast("Responsable asignado", "La asignación permanente fue registrada.");
      return true;
    } catch (error) {
      showToast("Error al asignar", getErrorMessage(error), "error");
      return false;
    }
  };

  const transferAsset = async (idActivo, payload) => {
    try {
      await api.post(`/activos/${idActivo}/trasladar`, {
        id_ubicacion: parseInt(payload.id_ubicacion),
        id_usuario_responsable: payload.id_usuario_responsable
          ? parseInt(payload.id_usuario_responsable)
          : null,
        observaciones: payload.observaciones || null,
      });
      await fetchData();
      showToast("Activo trasladado", "La ubicación y el historial fueron actualizados.");
      return true;
    } catch (error) {
      showToast("Error al trasladar", getErrorMessage(error), "error");
      return false;
    }
  };

  const closeAssignment = async (idAsignacion, observaciones = "") => {
    try {
      await api.patch(`/asignaciones-activo/${idAsignacion}/cerrar`, null, {
        params: { observaciones },
      });
      await fetchData();
      showToast("Asignación cerrada", "El activo quedó sin responsable permanente.");
      return true;
    } catch (error) {
      showToast("Error al cerrar asignación", getErrorMessage(error), "error");
      return false;
    }
  };

  // --- SALAS Y DOCENTES ---
  const addSalaDocente = async (idSala, payload) => {
    try {
      await api.post(`/salas/${idSala}/docentes`, {
        id_usuario: parseInt(payload.id_usuario),
        es_responsable_principal: !!payload.es_responsable_principal,
        observaciones: payload.observaciones || null,
      });
      await fetchData();
      showToast("Docente asociado", "La sala ahora tiene un nuevo responsable.");
      return true;
    } catch (error) {
      showToast("Error al asociar docente", getErrorMessage(error), "error");
      return false;
    }
  };

  const removeSalaDocente = async (idSala, idAsociacion) => {
    try {
      await api.delete(`/salas/${idSala}/docentes/${idAsociacion}`);
      await fetchData();
      showToast("Docente desasociado", "La asociación se conserva en el historial.");
      return true;
    } catch (error) {
      showToast("Error al desasociar", getErrorMessage(error), "error");
      return false;
    }
  };

  const fetchSalaDetail = async (idSala) => {
    try {
      const response = await api.get(`/salas/${idSala}`);
      return mapSala(response.data);
    } catch (error) {
      showToast("Error al cargar sala", getErrorMessage(error), "error");
      return null;
    }
  };

  const fetchDocenteDetail = async (idDocente) => {
    try {
      const response = await api.get(`/docentes/${idDocente}`);
      return mapDocente(response.data);
    } catch (error) {
      showToast("Error al cargar docente", getErrorMessage(error), "error");
      return null;
    }
  };

  const fetchAssetHistory = async (idActivo) => {
    try {
      const response = await api.get(`/activos/${idActivo}/historial`);
      const data = response.data;
      return {
        activo: data.activo,
        asignacionActual: data.asignacion_actual ? mapAssignment(data.asignacion_actual) : null,
        prestamoActivo: data.prestamo_activo ? mapLoan(data.prestamo_activo) : null,
        prestamos: (data.prestamos || []).map(mapLoan),
        asignaciones: (data.asignaciones || []).map(mapAssignment),
        movimientos: data.movimientos || [],
        cambios: data.cambios || [],
      };
    } catch (error) {
      showToast("Error al cargar historial", getErrorMessage(error), "error");
      return null;
    }
  };

  // --- MANTENIMIENTOS ---
  const createMaintenance = async (payload) => {
    try {
      await api.post("/mantenimientos/", {
        id_activo: parseInt(payload.id_activo),
        tipo_mantenimiento: payload.tipo,
        descripcion: payload.descripcion,
        costo: parseFloat(payload.costo) || 0,
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
        assets, categories, locations, users, roles, loans, maintenances,
        assignments, salas, docentes, loading, isSeeded,
        prefs, setPrefs, fetchData, refresh,
        createAsset, updateAsset, deleteAsset,
        createCategory, deleteCategory, createLocation,
        createUser, updateUser, deleteUser,
        createLoan, returnLoan,
        assignAsset, transferAsset, closeAssignment,
        addSalaDocente, removeSalaDocente,
        fetchSalaDetail, fetchDocenteDetail, fetchAssetHistory,
        createMaintenance, completeMaintenance,
        toasts, showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
