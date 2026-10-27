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

    class Config:
        from_attributes = True


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

    class Config:
        from_attributes = True


# --- CLASE DE ACTIVO ---
class ClaseActivoBase(BaseModel):
    nombre_clase: str = Field(..., max_length=100)
    descripcion: Optional[str] = None

class ClaseActivoCreate(ClaseActivoBase):
    pass

class ClaseActivoResponse(ClaseActivoBase):
    id_clase: int

    class Config:
        from_attributes = True


# --- UBICACIÓN ---
class UbicacionBase(BaseModel):
    nombre_espacio: str = Field(..., max_length=100)
    edificio_bloque: str = Field(..., max_length=50)
    descripcion: Optional[str] = None

class UbicacionCreate(UbicacionBase):
    pass

class UbicacionResponse(UbicacionBase):
    id_ubicacion: int

    class Config:
        from_attributes = True


# --- ACTIVO FIJO ---
class ActivoFijoBase(BaseModel):
    codigo_unico: str = Field(..., max_length=50)
    nombre_activo: str = Field(..., max_length=150)
    marca: Optional[str] = Field(None, max_length=50)
    modelo: Optional[str] = Field(None, max_length=50)
    numero_serie: Optional[str] = Field(None, max_length=100)
    fecha_adquisicion: Optional[date] = None
    valor_comercial: Optional[Decimal] = Decimal("0.00")
    estado_fisico: Optional[str] = Field(None, max_length=50)
    estado: Optional[str] = "Disponible"
    descripcion: Optional[str] = None
    id_clase: int
    id_ubicacion: int

class ActivoFijoCreate(ActivoFijoBase):
    pass

class ActivoFijoResponse(ActivoFijoBase):
    id_activo: int

    class Config:
        from_attributes = True


# --- ASIGNACIÓN ---
class AsignacionBase(BaseModel):
    id_activo: int
    id_usuario_responsable: int
    estado_asignacion: str = Field(..., max_length=50)
    observaciones: Optional[str] = None

class AsignacionCreate(AsignacionBase):
    pass

class AsignacionResponse(AsignacionBase):
    id_asignacion: int
    fecha_asignacion: datetime
    fecha_devolucion: Optional[datetime] = None

    class Config:
        from_attributes = True


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

    class Config:
        from_attributes = True


# --- MANTENIMIENTO ---
class MantenimientoBase(BaseModel):
    id_activo: int
    fecha_programada: date
    tipo_mantenimiento: str = Field(..., max_length=50)
    descripcion_trabajo: str
    costo: Optional[Decimal] = Decimal("0.00")

class MantenimientoCreate(MantenimientoBase):
    pass

class MantenimientoResponse(MantenimientoBase):
    id_mantenimiento: int
    fecha_realizacion: Optional[date] = None

    class Config:
        from_attributes = True


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

    class Config:
        from_attributes = True