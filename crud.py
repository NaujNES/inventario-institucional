from sqlalchemy.orm import Session
import models
import schemas
from security import get_password_hash
# ==========================================
# 1. ROL
# ==========================================
def get_rol(db: Session, id_rol: int):
    return db.query(models.Rol).filter(models.Rol.id_rol == id_rol).first()

def get_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Rol).offset(skip).limit(limit).all()

def create_rol(db: Session, rol: schemas.RolCreate):
    db_rol = models.Rol(
        nombre_rol=rol.nombre_rol,
        descripcion=rol.descripcion
    )
    db.add(db_rol)
    db.commit()
    db.refresh(db_rol)
    return db_rol


# ==========================================
# 2. USUARIO
# ==========================================
def get_usuario(db: Session, id_usuario: int):
    return db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()

def get_usuario_por_documento(db: Session, numero_documento: str):
    return db.query(models.Usuario).filter(models.Usuario.numero_documento == numero_documento).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Usuario).offset(skip).limit(limit).all()

def create_usuario(db: Session, usuario: schemas.UsuarioCreate):
    # Encriptar la contraseña recibida
    hashed_pwd = get_password_hash(usuario.password)

    db_usuario = models.Usuario(
        numero_documento=usuario.numero_documento,
        nombre=usuario.nombre,
        id_rol=usuario.id_rol,
        estado_activo=usuario.estado_activo,
        password=hashed_pwd,  # <-- Se guarda la contraseña encriptada
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

# ==========================================
# 3. CLASE DE ACTIVO
# ==========================================
def get_clase_activo(db: Session, id_clase: int):
    return db.query(models.ClaseActivo).filter(models.ClaseActivo.id_clase == id_clase).first()

def get_clases_activo(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ClaseActivo).offset(skip).limit(limit).all()

def create_clase_activo(db: Session, clase: schemas.ClaseActivoCreate):
    db_clase = models.ClaseActivo(
        nombre_clase=clase.nombre_clase,
        descripcion=clase.descripcion
    )
    db.add(db_clase)
    db.commit()
    db.refresh(db_clase)
    return db_clase


# ==========================================
# 4. UBICACIÓN
# ==========================================
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


# ==========================================
# 5. ACTIVO FIJO
# ==========================================
def get_activo_fijo(db: Session, id_activo: int):
    return db.query(models.ActivoFijo).filter(models.ActivoFijo.id_activo == id_activo).first()

def get_activo_fijo_por_codigo(db: Session, codigo_unico: str):
    return db.query(models.ActivoFijo).filter(models.ActivoFijo.codigo_unico == codigo_unico).first()

def get_activos_fijos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ActivoFijo).offset(skip).limit(limit).all()

def create_activo_fijo(db: Session, activo: schemas.ActivoFijoCreate):
    db_activo = models.ActivoFijo(
        codigo_unico=activo.codigo_unico,
        denominacion=activo.denominacion,
        marca=activo.marca,
        modelo=activo.modelo,
        numero_serie=activo.numero_serie,
        fecha_adquisicion=activo.fecha_adquisicion,
        valor_comercial=activo.valor_comercial,
        estado_fisico=activo.estado_fisico,
        id_clase=activo.id_clase,
        id_ubicacion=activo.id_ubicacion
    )
    db.add(db_activo)
    db.commit()
    db.refresh(db_activo)
    return db_activo


# ==========================================
# 6. ASIGNACIÓN
# ==========================================
def get_asignacion(db: Session, id_asignacion: int):
    return db.query(models.Asignacion).filter(models.Asignacion.id_asignacion == id_asignacion).first()

def get_asignaciones(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Asignacion).offset(skip).limit(limit).all()

def create_asignacion(db: Session, asignacion: schemas.AsignacionCreate):
    db_asignacion = models.Asignacion(
        id_activo=asignacion.id_activo,
        id_usuario_responsable=asignacion.id_usuario_responsable,
        estado_asignacion=asignacion.estado_asignacion,
        observaciones=asignacion.observaciones
    )
    db.add(db_asignacion)
    db.commit()
    db.refresh(db_asignacion)
    return db_asignacion


# ==========================================
# 7. MOVIMIENTO
# ==========================================
def get_movimientos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Movimiento).offset(skip).limit(limit).all()

def create_movimiento(db: Session, movimiento: schemas.MovimientoCreate):
    db_movimiento = models.Movimiento(
        id_activo=movimiento.id_activo,
        id_usuario=movimiento.id_usuario,
        tipo_movimiento=movimiento.tipo_movimiento,
        descripcion_detalle=movimiento.descripcion_detalle
    )
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento


# ==========================================
# 8. MANTENIMIENTO
# ==========================================
def get_mantenimientos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Mantenimiento).offset(skip).limit(limit).all()

def create_mantenimiento(db: Session, mantenimiento: schemas.MantenimientoCreate):
    db_mantenimiento = models.Mantenimiento(
        id_activo=mantenimiento.id_activo,
        fecha_programada=mantenimiento.fecha_programada,
        fecha_realizacion=mantenimiento.fecha_realizacion,
        tipo_mantenimiento=mantenimiento.tipo_mantenimiento,
        descripcion_trabajo=mantenimiento.descripcion_trabajo,
        costo=mantenimiento.costo
    )
    db.add(db_mantenimiento)
    db.commit()
    db.refresh(db_mantenimiento)
    return db_mantenimiento


# ==========================================
# 9. AUDITORÍA
# ==========================================
def get_auditorias(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Auditoria).offset(skip).limit(limit).all()

def create_auditoria(db: Session, auditoria: schemas.AuditoriaCreate):
    db_auditoria = models.Auditoria(
        id_usuario=auditoria.id_usuario,
        accion_realizada=auditoria.accion_realizada,
        detalle_cambio=auditoria.detalle_cambio
    )
    db.add(db_auditoria)
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria