from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

# ==========================================
# 1. ROL
# ==========================================
class RolBase(BaseModel):
    nombre_rol: str
    descripcion: Optional[str] = None

class RolCreate(RolBase):
    pass

class RolOut(RolBase):
    id_rol: int

    class Config:
        from_attributes = True


# ==========================================
# 2. USUARIO
# ==========================================
class UsuarioBase(BaseModel):
    numero_documento: str
    nombre: str
    id_rol: int
    estado_activo: Optional[bool] = True

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioOut(UsuarioBase):
    id_usuario: int
    fecha_creacion: datetime
    rol: Optional[RolOut] = None

    class Config:
        from_attributes = True


# ==========================================
# 3. CLASE DE ACTIVO
# ==========================================
class ClaseActivoBase(BaseModel):
    nombre_clase: str
    descripcion: Optional[str] = None

class ClaseActivoCreate(ClaseActivoBase):
    pass

class ClaseActivoOut(ClaseActivoBase):
    id_clase: int

    class Config:
        from_attributes = True


# ==========================================
# 4. UBICACIÓN
# ==========================================
class UbicacionBase(BaseModel):
    nombre_espacio: str
    edificio_bloque: Optional[str] = None
    descripcion: Optional[str] = None

class UbicacionCreate(UbicacionBase):
    pass

class UbicacionOut(UbicacionBase):
    id_ubicacion: int

    class Config:
        from_attributes = True


# ==========================================
# 5. ACTIVO FIJO
# ==========================================
class ActivoFijoBase(BaseModel):
    codigo_unico: str
    denominacion: str
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_serie: Optional[str] = None
    fecha_adquisicion: Optional[date] = None
    valor_comercial: Optional[float] = None
    estado_fisico: Optional[str] = None
    id_clase: int
    id_ubicacion: int

class ActivoFijoCreate(ActivoFijoBase):
    pass

class ActivoFijoOut(ActivoFijoBase):
    id_activo: int
    clase: Optional[ClaseActivoOut] = None
    ubicacion: Optional[UbicacionOut] = None

    class Config:
        from_attributes = True


# ==========================================
# 6. ASIGNACIÓN
# ==========================================
class AsignacionBase(BaseModel):
    id_activo: int
    id_usuario_responsable: int
    estado_asignacion: Optional[str] = "Activa"
    observaciones: Optional[str] = None

class AsignacionCreate(AsignacionBase):
    pass

class AsignacionOut(AsignacionBase):
    id_asignacion: int
    fecha_asignacion: datetime
    fecha_devolucion: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 7. MOVIMIENTO
# ==========================================
class MovimientoBase(BaseModel):
    id_activo: int
    id_usuario: int
    tipo_movimiento: str
    descripcion_detalle: Optional[str] = None

class MovimientoCreate(MovimientoBase):
    pass

class MovimientoOut(MovimientoBase):
    id_movimiento: int
    fecha_movimiento: datetime

    class Config:
        from_attributes = True


# ==========================================
# 8. MANTENIMIENTO
# ==========================================
class MantenimientoBase(BaseModel):
    id_activo: int
    fecha_programada: Optional[date] = None
    fecha_realizacion: Optional[date] = None
    tipo_mantenimiento: Optional[str] = None
    descripcion_trabajo: Optional[str] = None
    costo: Optional[float] = None

class MantenimientoCreate(MantenimientoBase):
    pass

class MantenimientoOut(MantenimientoBase):
    id_mantenimiento: int

    class Config:
        from_attributes = True


# ==========================================
# 9. AUDITORÍA
# ==========================================
class AuditoriaBase(BaseModel):
    id_usuario: int
    accion_realizada: str
    detalle_cambio: Optional[str] = None

class AuditoriaCreate(AuditoriaBase):
    pass

class AuditoriaOut(AuditoriaBase):
    id_auditoria: int
    fecha_hora: datetime

    class Config:
        from_attributes = True