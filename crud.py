from sqlalchemy.orm import Session
import models
import schemas
from security import get_password_hash

# --- OPERACIONES PARA ROL ---
def get_rol(db: Session, id_rol: int):
    return db.query(models.Rol).filter(models.Rol.id_rol == id_rol).first()

def get_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Rol).offset(skip).limit(limit).all()

def create_rol(db: Session, rol: schemas.RolCreate):
    db_rol = models.Rol(nombre_rol=rol.nombre_rol, descripcion=rol.descripcion)
    db.add(db_rol)
    db.commit()
    db.refresh(db_rol)
    return db_rol


# --- OPERACIONES PARA USUARIO ---
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


# --- OPERACIONES PARA CLASE DE ACTIVO ---
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


# --- OPERACIONES PARA UBICACIÓN ---
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


# --- OPERACIONES PARA ACTIVO FIJO ---
def get_activo_fijo(db: Session, id_activo: int):
    return db.query(models.ActivoFijo).filter(models.ActivoFijo.id_activo == id_activo).first()

def get_activo_por_codigo(db: Session, codigo_unico: str):
    return db.query(models.ActivoFijo).filter(models.ActivoFijo.codigo_unico == codigo_unico).first()

def get_activos_fijos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ActivoFijo).offset(skip).limit(limit).all()

def create_activo_fijo(db: Session, activo: schemas.ActivoFijoCreate):
    db_activo = models.ActivoFijo(**activo.dict())
    db.add(db_activo)
    db.commit()
    db.refresh(db_activo)
    return db_activo


# --- OPERACIONES PARA ASIGNACIÓN ---
def get_asignacion(db: Session, id_asignacion: int):
    return db.query(models.Asignacion).filter(models.Asignacion.id_asignacion == id_asignacion).first()

def get_asignaciones(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Asignacion).offset(skip).limit(limit).all()

def create_asignacion(db: Session, asignacion: schemas.AsignacionCreate):
    db_asignacion = models.Asignacion(**asignacion.dict())
    db.add(db_asignacion)
    db.commit()
    db.refresh(db_asignacion)
    return db_asignacion


# --- OPERACIONES PARA MOVIMIENTO ---
def get_movimiento(db: Session, id_movimiento: int):
    return db.query(models.Movimiento).filter(models.Movimiento.id_movimiento == id_movimiento).first()

def get_movimientos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Movimiento).offset(skip).limit(limit).all()

def create_movimiento(db: Session, movimiento: schemas.MovimientoCreate):
    db_movimiento = models.Movimiento(**movimiento.dict())
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento


# --- OPERACIONES PARA MANTENIMIENTO ---
def get_mantenimiento(db: Session, id_mantenimiento: int):
    return db.query(models.Mantenimiento).filter(models.Mantenimiento.id_mantenimiento == id_mantenimiento).first()

def get_mantenimientos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Mantenimiento).offset(skip).limit(limit).all()

def create_mantenimiento(db: Session, mantenimiento: schemas.MantenimientoCreate):
    db_mantenimiento = models.Mantenimiento(**mantenimiento.dict())
    db.add(db_mantenimiento)
    db.commit()
    db.refresh(db_mantenimiento)
    return db_mantenimiento


# --- OPERACIONES PARA AUDITORÍA ---
def get_auditoria(db: Session, id_auditoria: int):
    return db.query(models.Auditoria).filter(models.Auditoria.id_auditoria == id_auditoria).first()

def get_auditorias(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Auditoria).offset(skip).limit(limit).all()

def create_auditoria(db: Session, auditoria: schemas.AuditoriaCreate):
    db_auditoria = models.Auditoria(**auditoria.dict())
    db.add(db_auditoria)
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria

from sqlalchemy.orm import Session
import models
import schemas

def get_activos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Activo).offset(skip).limit(limit).all()

def create_activo(db: Session, activo: schemas.ActivoCreate):
    db_activo = models.Activo(
        codigo_placa=activo.codigo_placa,
        nombre_activo=activo.nombre_activo,
        descripcion=activo.descripcion,
        estado=activo.estado,
        id_clase=activo.id_clase,
        id_ubicacion=activo.id_ubicacion
    )
    db.add(db_activo)
    db.commit()
    db.refresh(db_activo)
    return db_activo