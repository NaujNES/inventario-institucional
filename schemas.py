from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

# --- ROL ---
class RolBase(BaseModel):
    nombre_rol: str = Field(..., max_length=50)
    descripcion: Optional[str] = None

class RolCreate(RolBase):
    pass

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
    password: str = Field(..., max_length=100)

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    fecha_creacion: datetime
    model_config = {"from_attributes": True}


# --- CLASE DE ACTIVO ---
class ClaseActivoBase(BaseModel):
    nombre_clase: str = Field(..., max_length=100)
    descripcion: Optional[str] = None

class ClaseActivoCreate(ClaseActivoBase):
    pass

class ClaseActivoResponse(ClaseActivoBase):
    id_clase: int
    model_config = {"from_attributes": True}


# --- UBICACIÓN ---
class UbicacionBase(BaseModel):
    nombre_espacio: str = Field(..., max_length=100)
    edificio_bloque: str = Field(..., max_length=50)
    descripcion: Optional[str] = None

class UbicacionCreate(UbicacionBase):
    pass

class UbicacionResponse(UbicacionBase):
    id_ubicacion: int
    model_config = {"from_attributes": True}


# --- ACTIVO FIJO ---
class ActivoFijoBase(BaseModel):
    codigo_unico: str = Field(..., max_length=50)
    nombre_activo: str = Field(..., max_length=100)
    descripcion: Optional[str] = None
    estado: Optional[str] = "Disponible"
    id_clase: int
    id_ubicacion: int
    fecha_adquisicion: Optional[datetime] = None

class ActivoFijoCreate(ActivoFijoBase):
    pass

class ActivoFijoResponse(ActivoFijoBase):
    id_activo: int
    model_config = {"from_attributes": True}
class ActivoFijoCreate(ActivoFijoBase):
    pass

class ActivoFijoResponse(ActivoFijoBase):
    id_activo: int
    model_config = {"from_attributes": True}


# --- ASIGNACIÓN ---
class AsignacionBase(BaseModel):
  id_activo: int = Field(..., description="ID del activo fijo a asignar")
  id_usuario_responsable: int = Field(
      ..., description="ID del usuario que recibe el activo"
  )
  estado_asignacion: str = Field(
      default="Activa", max_length=50, description="Estado de la asignación"
  )
  observaciones: Optional[str] = Field(
      None, description="Observaciones o notas de la entrega"
  )


class AsignacionCreate(AsignacionBase):
  """Esquema para registrar una nueva asignación"""

  pass


class AsignacionUpdate(BaseModel):
  """Esquema para actualizar o finalizar una asignación"""

  estado_asignacion: Optional[str] = Field(None, max_length=50)
  observaciones: Optional[str] = None
  fecha_devolucion: Optional[datetime] = None


class AsignacionResponse(AsignacionBase):
  id_asignacion: int
  estado_asignacion: str
  fecha_asignacion: Optional[
      datetime
  ] = None  # <--- Cambiado a Optional por si viene nulo de la BD
  fecha_devolucion: Optional[datetime] = None

  class Config:
    from_attributes = True  # Compatible con Pydantic v2 para modelos ORM
# --- MOVIMIENTO ---
class MovimientoBase(BaseModel):
    id_activo: int
    id_usuario: int
    tipo_movimiento: str = Field(..., max_length=50)
    descripcion_detalle: str

class MovimientoCreate(MovimientoBase):
    pass

class MovimientoResponse(MovimientoBase):
    id_movimiento: int
    fecha_movimiento: datetime
    model_config = {"from_attributes": True}


# --- MANTENIMIENTO ---
class MantenimientoBase(BaseModel):
    id_activo: int
    tipo_mantenimiento: str = Field(..., max_length=50)
    descripcion: str
    costo: Optional[Decimal] = Decimal('0.00')  # <--- Añadido para soportar el costo
    fecha_mantenimiento: Optional[datetime] = None

class MantenimientoCreate(MantenimientoBase):
    pass

class MantenimientoResponse(MantenimientoBase):
    id_mantenimiento: int
    model_config = {"from_attributes": True}
# --- AUDITORÍA ---
class AuditoriaBase(BaseModel):
    id_usuario: int
    accion_realizada: str = Field(..., max_length=100)
    detalle_cambio: str

class AuditoriaCreate(AuditoriaBase):
    pass

class AuditoriaResponse(AuditoriaBase):
    id_auditoria: int
    fecha_hora: datetime
    model_config = {"from_attributes": True}


class UsuarioUpdate(BaseModel):
  numero_documento: Optional[str] = None
  nombre: Optional[str] = None
  password: Optional[str] = None
  id_rol: Optional[int] = None
  estado_activo: Optional[bool] = None


class MantenimientoBase(BaseModel):
  id_activo: int
  tipo_mantenimiento: str
  descripcion: Optional[str] = None  # <--- Único campo de texto
  costo: float
  fecha_mantenimiento: Optional[datetime] = None


class MantenimientoCreate(MantenimientoBase):
  pass


class MantenimientoResponse(MantenimientoBase):
  id_mantenimiento: int

  class Config:
    from_attributes = True