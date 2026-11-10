from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

# --- ROL ---
class RolBase(BaseModel):
    nombre_rol: str = Field(..., max_length=50)
    descripcion: Optional[str] = None

class RolCreate(RolBase): pass

class RolResponse(RolBase):
    id_rol: int
    model_config = {"from_attributes": True}

# --- USUARIO ---
class UsuarioBase(BaseModel):
    numero_documento: str = Field(..., max_length=20)
    nombre: str = Field(..., max_length=100)
    id_rol: int
    estado_activo: Optional[bool] = True

class UsuarioCreate(UsuarioBase):
    # Contraseña opcional
    password: Optional[str] = Field(None, min_length=6, max_length=72)

class UsuarioUpdate(BaseModel):
    numero_documento: Optional[str] = Field(None, max_length=20)
    nombre: Optional[str] = Field(None, max_length=100)
    password: Optional[str] = Field(None, min_length=6, max_length=72)
    id_rol: Optional[int] = None
    estado_activo: Optional[bool] = None

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    fecha_creacion: datetime
    model_config = {"from_attributes": True}

# --- CLASE DE ACTIVO ---
class ClaseActivoBase(BaseModel):
    nombre_clase: str = Field(..., max_length=100)
    descripcion: Optional[str] = None

class ClaseActivoCreate(ClaseActivoBase): pass

class ClaseActivoResponse(ClaseActivoBase):
    id_clase: int
    model_config = {"from_attributes": True}

# --- UBICACIÓN ---
class UbicacionBase(BaseModel):
    nombre_espacio: str = Field(..., max_length=100)
    edificio_bloque: Optional[str] = Field(None, max_length=100)
    descripcion: Optional[str] = None

class UbicacionCreate(UbicacionBase): pass

class UbicacionResponse(UbicacionBase):
    id_ubicacion: int
    model_config = {"from_attributes": True}

# --- ACTIVO FIJO ---
class ActivoFijoBase(BaseModel):
    codigo_unico: str = Field(..., max_length=50)
    nombre_activo: str = Field(..., max_length=150)
    descripcion: Optional[str] = None
    estado: Optional[str] = "Disponible"
    id_clase: int
    id_ubicacion: int
    fecha_adquisicion: Optional[datetime] = None

class ActivoFijoCreate(ActivoFijoBase): pass

class ActivoFijoResponse(ActivoFijoBase):
    id_activo: int
    model_config = {"from_attributes": True}

# --- ASIGNACIÓN ---
class AsignacionBase(BaseModel):
    id_activo: int
    id_usuario_responsable: int
    estado_asignacion: str = Field(default="Activa", max_length=50)
    observaciones: Optional[str] = None

class AsignacionCreate(AsignacionBase): pass

class AsignacionUpdate(BaseModel):
    estado_asignacion: Optional[str] = Field(None, max_length=50)
    observaciones: Optional[str] = None
    fecha_devolucion: Optional[datetime] = None

class AsignacionResponse(AsignacionBase):
    id_asignacion: int
    fecha_asignacion: Optional[datetime] = None
    fecha_devolucion: Optional[datetime] = None
    model_config = {"from_attributes": True}

# --- MOVIMIENTO ---
class MovimientoBase(BaseModel):
    id_activo: int
    id_usuario: int
    tipo_movimiento: str = Field(..., max_length=50)
    descripcion_detalle: str

class MovimientoCreate(MovimientoBase): pass

class MovimientoResponse(MovimientoBase):
    id_movimiento: int
    fecha_movimiento: datetime
    model_config = {"from_attributes": True}

# --- MANTENIMIENTO ---
class MantenimientoBase(BaseModel):
    id_activo: int
    tipo_mantenimiento: str = Field(..., max_length=50)
    descripcion: Optional[str] = None
    costo: Decimal = Decimal("0.00")
    fecha_mantenimiento: Optional[datetime] = None

class MantenimientoCreate(MantenimientoBase): pass

class MantenimientoResponse(MantenimientoBase):
    id_mantenimiento: int
    model_config = {"from_attributes": True}

# --- AUDITORÍA ---
class AuditoriaBase(BaseModel):
    id_usuario: int
    accion_realizada: str = Field(..., max_length=100)
    detalle_cambio: str

class AuditoriaCreate(AuditoriaBase): pass

class AuditoriaResponse(AuditoriaBase):
    id_auditoria: int
    fecha_hora: datetime
    model_config = {"from_attributes": True}


# =====================================================================
# PRÉSTAMOS
# =====================================================================
class PrestamoComponenteBase(BaseModel):
    nombre_componente: str = Field(..., max_length=120)
    estado_entrega: str = Field(default="Bueno", max_length=30)
    observacion_entrega: Optional[str] = None


class PrestamoComponenteCreate(PrestamoComponenteBase):
    pass


class PrestamoComponenteDevolucion(BaseModel):
    id_componente_prestamo: int
    estado_devolucion: str = Field(..., max_length=30)
    observacion_devolucion: Optional[str] = None


class PrestamoComponenteResponse(PrestamoComponenteBase):
    id_componente_prestamo: int
    estado_devolucion: Optional[str] = None
    observacion_devolucion: Optional[str] = None
    model_config = {"from_attributes": True}


class PrestamoBase(BaseModel):
    id_activo: int
    nombre_solicitante: str = Field(..., max_length=150)
    grado: Optional[str] = Field(None, max_length=50)
    fecha_prestamo: datetime
    actividad: Optional[str] = Field(None, max_length=255)
    fecha_entrega: Optional[datetime] = None
    fecha_devolucion_esperada: Optional[datetime] = None
    observaciones_entrega: Optional[str] = None


class PrestamoCreate(PrestamoBase):
    componentes: List[PrestamoComponenteCreate] = []
    id_usuario_registra: Optional[int] = None


class PrestamoDevolucion(BaseModel):
    fecha_devolucion_real: datetime
    persona_recibe_devolucion: str = Field(..., max_length=150)
    estado_devolucion: str = Field(default="Bueno", max_length=50)
    observaciones_devolucion: Optional[str] = None
    componentes: List[PrestamoComponenteDevolucion] = []


class PrestamoResponse(PrestamoBase):
    id_prestamo: int
    estado_prestamo: str
    fecha_devolucion_real: Optional[datetime] = None
    observaciones_devolucion: Optional[str] = None
    persona_recibe_devolucion: Optional[str] = None
    estado_devolucion: Optional[str] = None
    id_usuario_registra: Optional[int] = None
    fecha_creacion: Optional[datetime] = None
    nombre_activo: Optional[str] = None
    codigo_activo: Optional[str] = None
    nombre_usuario_registra: Optional[str] = None
    vencido: bool = False
    componentes: List[PrestamoComponenteResponse] = []
    model_config = {"from_attributes": True}


# =====================================================================
# SALAS Y DOCENTES
# =====================================================================
class SalaDocenteBase(BaseModel):
    id_usuario: int
    es_responsable_principal: bool = False
    observaciones: Optional[str] = None


class SalaDocenteCreate(SalaDocenteBase):
    pass


class SalaDocenteResponse(BaseModel):
    id_sala_docente: int
    id_ubicacion: int
    id_usuario: int
    nombre_docente: Optional[str] = None
    documento_docente: Optional[str] = None
    rol_docente: Optional[str] = None
    es_responsable_principal: bool = False
    observaciones: Optional[str] = None
    activa: bool = True
    fecha_asociacion: Optional[datetime] = None
    model_config = {"from_attributes": True}


class SalaResumenResponse(UbicacionResponse):
    total_activos: int = 0
    docentes: List[SalaDocenteResponse] = []


class SalaDetalleResponse(SalaResumenResponse):
    activos: List[ActivoFijoResponse] = []


# =====================================================================
# ASIGNACIONES PERMANENTES (RESPONSABLES)
# =====================================================================
class AsignacionActivoCreate(BaseModel):
    id_activo: int
    id_usuario_responsable: int
    id_ubicacion: int
    observaciones: Optional[str] = None


class AsignacionActivoResponse(BaseModel):
    id_asignacion_activo: int
    id_activo: int
    id_usuario_responsable: int
    id_ubicacion: int
    estado: str
    observaciones: Optional[str] = None
    fecha_asignacion: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    nombre_responsable: Optional[str] = None
    documento_responsable: Optional[str] = None
    nombre_sala: Optional[str] = None
    nombre_activo: Optional[str] = None
    codigo_activo: Optional[str] = None
    model_config = {"from_attributes": True}


class AsignarActivoRequest(BaseModel):
    id_usuario_responsable: int
    id_ubicacion: int
    observaciones: Optional[str] = None


class TrasladarActivoRequest(BaseModel):
    id_ubicacion: int
    id_usuario_responsable: Optional[int] = None
    observaciones: Optional[str] = None


# =====================================================================
# HISTORIAL DEL ACTIVO
# =====================================================================
class HistorialActivoResponse(BaseModel):
    id_historial: int
    id_activo: int
    tipo_cambio: str
    valor_anterior: Optional[str] = None
    valor_nuevo: Optional[str] = None
    observaciones: Optional[str] = None
    id_usuario: Optional[int] = None
    nombre_usuario: Optional[str] = None
    fecha: Optional[datetime] = None
    model_config = {"from_attributes": True}


class MovimientoResponseDetalle(MovimientoResponse):
    nombre_usuario: Optional[str] = None


class ActivoHistorialResponse(BaseModel):
    activo: ActivoFijoResponse
    asignacion_actual: Optional[AsignacionActivoResponse] = None
    prestamo_activo: Optional[PrestamoResponse] = None
    prestamos: List[PrestamoResponse] = []
    asignaciones: List[AsignacionActivoResponse] = []
    movimientos: List[MovimientoResponseDetalle] = []
    cambios: List[HistorialActivoResponse] = []


class DocenteResumenResponse(BaseModel):
    id_usuario: int
    nombre: str
    numero_documento: str
    rol: Optional[str] = None
    salas: List[dict] = []
    total_salas: int = 0
    total_activos_asignados: int = 0
    activos_asignados: List[AsignacionActivoResponse] = []
    prestamos_temporales: List[PrestamoResponse] = []
    model_config = {"from_attributes": True}