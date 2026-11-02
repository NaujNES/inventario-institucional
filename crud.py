from sqlalchemy.orm import Session
import models
import schemas
from security import get_password_hash
from sqlalchemy.exc import IntegrityError
# --- ROL ---
def get_rol(db: Session, id_rol: int):
    return db.query(models.Rol).filter(models.Rol.id_rol == id_rol).first()

def get_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Rol).offset(skip).limit(limit).all()

from fastapi import HTTPException, status

def create_rol(db: Session, rol: schemas.RolCreate):
    # Verificar si ya existe un rol con ese nombre
    rol_existente = db.query(models.Rol).filter(models.Rol.nombre_rol == rol.nombre_rol).first()
    if rol_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El rol '{rol.nombre_rol}' ya existe en la base de datos."
        )
    
    db_rol = models.Rol(nombre_rol=rol.nombre_rol, descripcion=rol.descripcion)
    db.add(db_rol)
    db.commit()
    db.refresh(db_rol)
    return db_rol

# --- USUARIO ---
def get_usuario(db: Session, id_usuario: int):
    return db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()

def get_usuario_por_documento(db: Session, numero_documento: str):
    return db.query(models.Usuario).filter(models.Usuario.numero_documento == numero_documento).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Usuario).offset(skip).limit(limit).all()

def create_usuario(db: Session, usuario: schemas.UsuarioCreate):
    hashed_password = get_password_hash(usuario.password)
    db_usuario = models.Usuario(
        numero_documento=usuario.numero_documento,
        nombre=usuario.nombre,
        password=hashed_password,
        id_rol=usuario.id_rol,
        estado_activo=usuario.estado_activo
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


# --- CLASE DE ACTIVO ---
def get_clase_activo(db: Session, id_clase: int):
    return db.query(models.ClaseActivo).filter(models.ClaseActivo.id_clase == id_clase).first()

def get_clases_activo(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ClaseActivo).offset(skip).limit(limit).all()

def create_clase_activo(db: Session, clase: schemas.ClaseActivoCreate):
    db_clase = models.ClaseActivo(nombre_clase=clase.nombre_clase, descripcion=clase.descripcion)
    db.add(db_clase)
    db.commit()
    db.refresh(db_clase)
    return db_clase


# --- UBICACIÓN ---
def get_ubicacion(db: Session, id_ubicacion: int):
    return db.query(models.Ubicacion).filter(models.Ubicacion.id_ubicacion == id_ubicacion).first()

def get_ubicaciones(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Ubicacion).offset(skip).limit(limit).all()

def create_ubicacion(db: Session, ubicacion: schemas.UbicacionCreate):
    db_ubicacion = models.Ubicacion(
        nombre_espacio=ubicacion.nombre_espacio,
        edificio_bloque=ubicacion.edificio_bloque,
        descripcion=ubicacion.descripcion
    )
    db.add(db_ubicacion)
    db.commit()
    db.refresh(db_ubicacion)
    return db_ubicacion


# --- ACTIVO FIJO ---
def get_activo_fijo(db: Session, id_activo: int):
    return db.query(models.ActivoFijo).filter(models.ActivoFijo.id_activo == id_activo).first()

def get_activo_por_codigo(db: Session, codigo_unico: str):
    return db.query(models.ActivoFijo).filter(models.ActivoFijo.codigo_unico == codigo_unico).first()

def get_activos_fijos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ActivoFijo).offset(skip).limit(limit).all()

def create_activo_fijo(db: Session, activo: schemas.ActivoFijoCreate):
    db_activo = models.ActivoFijo(**activo.model_dump())
    db.add(db_activo)
    db.commit()
    db.refresh(db_activo)
    return db_activo


# --- ASIGNACIÓN ---
def get_asignacion(db: Session, id_asignacion: int):
    return db.query(models.Asignacion).filter(models.Asignacion.id_asignacion == id_asignacion).first()

def get_asignaciones(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Asignacion).offset(skip).limit(limit).all()

from datetime import datetime

def create_asignacion(db: Session, asignacion: schemas.AsignacionCreate):
    db_asignacion = models.Asignacion(
        id_activo=asignacion.id_activo,
        id_usuario_responsable=asignacion.id_usuario_responsable,
        estado_asignacion=asignacion.estado_asignacion,
        observaciones=asignacion.observaciones,
        fecha_asignacion=datetime.now()  # <-- Asignamos la fecha explícitamente aquí
    )
    db.add(db_asignacion)
    db.commit()
    db.refresh(db_asignacion)
    return db_asignacion


# --- MOVIMIENTO ---
def get_movimiento(db: Session, id_movimiento: int):
    return db.query(models.Movimiento).filter(models.Movimiento.id_movimiento == id_movimiento).first()

def get_movimientos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Movimiento).offset(skip).limit(limit).all()

def create_movimiento(db: Session, movimiento: schemas.MovimientoCreate):
    db_movimiento = models.Movimiento(**movimiento.model_dump())
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento


# --- MANTENIMIENTO ---
def get_mantenimiento(db: Session, id_mantenimiento: int):
    return db.query(models.Mantenimiento).filter(models.Mantenimiento.id_mantenimiento == id_mantenimiento).first()

def get_mantenimientos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Mantenimiento).offset(skip).limit(limit).all()

def create_mantenimiento(db: Session, mantenimiento: schemas.MantenimientoCreate):
    db_mantenimiento = models.Mantenimiento(**mantenimiento.model_dump())
    db.add(db_mantenimiento)
    db.commit()
    db.refresh(db_mantenimiento)
    return db_mantenimiento


# --- AUDITORÍA ---
def get_auditoria(db: Session, id_auditoria: int):
    return db.query(models.Auditoria).filter(models.Auditoria.id_auditoria == id_auditoria).first()

def get_auditorias(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Auditoria).offset(skip).limit(limit).all()

def create_auditoria(db: Session, auditoria: schemas.AuditoriaCreate):
    db_auditoria = models.Auditoria(**auditoria.model_dump())
    db.add(db_auditoria)
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

# --- ACTUALIZAR Y ELIMINAR: ACTIVOS FIJOS ---
def update_activo_fijo(db: Session, id_activo: int, activo: schemas.ActivoFijoCreate):
    db_activo = get_activo_fijo(db, id_activo)
    if not db_activo:
        return None
    update_data = activo.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_activo, key, value)
    db.commit()
    db.refresh(db_activo)
    return db_activo

def delete_activo_fijo(db: Session, id_activo: int):
    db_activo = get_activo_fijo(db, id_activo)
    if not db_activo:
        return None
    try:
        db.delete(db_activo)
        db.commit()
        return db_activo
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el activo porque tiene registros asociados (movimientos, asignaciones o mantenimientos)."
        )


# --- ACTUALIZAR Y ELIMINAR: USUARIOS ---
def update_usuario(db: Session, id_usuario: int, usuario: schemas.UsuarioCreate):
    db_usuario = get_usuario(db, id_usuario)
    if not db_usuario:
        return None
    update_data = usuario.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["password"] = get_password_hash(update_data["password"])
    
    for key, value in update_data.items():
        setattr(db_usuario, key, value)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def delete_usuario(db: Session, id_usuario: int):
    db_usuario = get_usuario(db, id_usuario)
    if not db_usuario:
        return None
    db.delete(db_usuario)
    db.commit()
    return db_usuario


# --- ACTUALIZAR Y ELIMINAR: UBICACIONES ---
def update_ubicacion(db: Session, id_ubicacion: int, ubicacion: schemas.UbicacionCreate):
    db_ubicacion = get_ubicacion(db, id_ubicacion)
    if not db_ubicacion:
        return None
    update_data = ubicacion.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_ubicacion, key, value)
    db.commit()
    db.refresh(db_ubicacion)
    return db_ubicacion

def delete_ubicacion(db: Session, id_ubicacion: int):
    db_ubicacion = get_ubicacion(db, id_ubicacion)
    if not db_ubicacion:
        return None
    db.delete(db_ubicacion)
    db.commit()
    return db_ubicacion

from datetime import date, datetime, timezone

# --- LÓGICA DE NEGOCIO: DEVOLUCIÓN DE ASIGNACIÓN ---
def devolver_asignacion(db: Session, id_asignacion: int):
    db_asignacion = get_asignacion(db, id_asignacion)
    if not db_asignacion or db_asignacion.fecha_devolucion is not None:
        return None
    
    # Marcar fecha de devolución y estado
    db_asignacion.fecha_devolucion = datetime.now(timezone.utc)
    db_asignacion.estado_asignacion = "Devuelto"
    
    # Liberar el activo (ponerlo de nuevo en Disponible)
    db_activo = get_activo_fijo(db, db_asignacion.id_activo)
    if db_activo:
        db_activo.estado = "Disponible"
        
    db.commit()
    db.refresh(db_asignacion)
    return db_asignacion


# --- LÓGICA DE NEGOCIO: COMPLETAR MANTENIMIENTO ---
def completar_mantenimiento(db: Session, id_mantenimiento: int):
    db_mantenimiento = get_mantenimiento(db, id_mantenimiento)
    if not db_mantenimiento:
        return None
    
    db_mantenimiento.fecha_realizacion = date.today()
    db.commit()
    db.refresh(db_mantenimiento)
    return db_mantenimiento


# --- LÓGICA DE NEGOCIO: TRASLADO DE ACTIVO CON MOVIMIENTO AUTOMÁTICO ---
def trasladar_activo(db: Session, id_activo: int, nueva_ubicacion_id: int, id_usuario: int, detalle: str):
    db_activo = get_activo_fijo(db, id_activo)
    if not db_activo:
        return None
    
    ubicacion_anterior = db_activo.id_ubicacion
    db_activo.id_ubicacion = nueva_ubicacion_id
    
    # Crear automáticamente el registro en la tabla movimientos
    db_movimiento = models.Movimiento(
        id_activo=id_activo,
        id_usuario=id_usuario,
        tipo_movimiento="Traslado de Ubicación",
        descripcion_detalle=f"Activo trasladado de la ubicación ID {ubicacion_anterior} a la ubicación ID {nueva_ubicacion_id}. Motivo: {detalle}"
    )
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_activo)
    return db_activo

def delete_mantenimiento(db: Session, id_mantenimiento: int):
    db_mantenimiento = get_mantenimiento(db, id_mantenimiento)
    if not db_mantenimiento:
        return None
    db.delete(db_mantenimiento)
    db.commit()
    return db_mantenimiento