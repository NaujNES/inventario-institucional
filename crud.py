from datetime import date, datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
import models
import schemas
from security import get_password_hash

# --- ROL ---
def get_rol(db: Session, id_rol: int):
  return db.query(models.Rol).filter(models.Rol.id_rol == id_rol).first()

def get_roles(db: Session, skip: int = 0, limit: int = 100):
  return db.query(models.Rol).offset(skip).limit(limit).all()

def create_rol(db: Session, rol: schemas.RolCreate):
  rol_existente = (
      db.query(models.Rol)
      .filter(models.Rol.nombre_rol == rol.nombre_rol)
      .first()
  )
  if rol_existente:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"El rol '{rol.nombre_rol}' ya existe en la base de datos.",
    )

  db_rol = models.Rol(nombre_rol=rol.nombre_rol, descripcion=rol.descripcion)
  db.add(db_rol)
  db.commit()
  db.refresh(db_rol)
  return db_rol

# --- USUARIO ---
def get_usuario(db: Session, id_usuario: int):
  return (
      db.query(models.Usuario)
      .filter(models.Usuario.id_usuario == id_usuario)
      .first()
  )

def get_usuario_por_documento(db: Session, numero_documento: str):
  return (
      db.query(models.Usuario)
      .filter(models.Usuario.numero_documento == numero_documento)
      .first()
  )

def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
  return db.query(models.Usuario).offset(skip).limit(limit).all()

def create_usuario(db: Session, usuario: schemas.UsuarioCreate):
  # Validar si hay contraseña para encriptarla
  hashed_password = get_password_hash(usuario.password) if usuario.password else None
  
  db_usuario = models.Usuario(
      numero_documento=usuario.numero_documento,
      nombre=usuario.nombre,
      password=hashed_password,
      id_rol=usuario.id_rol,
      estado_activo=usuario.estado_activo,
  )
  db.add(db_usuario)
  db.commit()
  db.refresh(db_usuario)
  return db_usuario

# --- CLASE DE ACTIVO ---
def get_clase_activo(db: Session, id_clase: int):
  return (
      db.query(models.ClaseActivo)
      .filter(models.ClaseActivo.id_clase == id_clase)
      .first()
  )

def get_clases_activos(db: Session, skip: int = 0, limit: int = 100):
  return db.query(models.ClaseActivo).offset(skip).limit(limit).all()

def create_clase_activo(db: Session, clase_activo: schemas.ClaseActivoCreate):
  db_clase = models.ClaseActivo(
      nombre_clase=clase_activo.nombre_clase,
      descripcion=clase_activo.descripcion,
  )
  db.add(db_clase)
  db.commit()
  db.refresh(db_clase)
  return db_clase

def delete_clase_activo(db: Session, id_clase: int):
    db_clase = get_clase_activo(db, id_clase)
    if not db_clase:
        return None
    try:
        db.delete(db_clase)
        db.commit()
        return db_clase
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar porque tiene activos asociados.",
        )

# --- UBICACIÓN ---
def get_ubicacion(db: Session, id_ubicacion: int):
  return (
      db.query(models.Ubicacion)
      .filter(models.Ubicacion.id_ubicacion == id_ubicacion)
      .first()
  )

def get_ubicaciones(db: Session, skip: int = 0, limit: int = 100):
  return db.query(models.Ubicacion).offset(skip).limit(limit).all()

def create_ubicacion(db: Session, ubicacion: schemas.UbicacionCreate):
  db_ubicacion = models.Ubicacion(
      nombre_espacio=ubicacion.nombre_espacio,
      edificio_bloque=ubicacion.edificio_bloque,
      descripcion=ubicacion.descripcion,
  )
  db.add(db_ubicacion)
  db.commit()
  db.refresh(db_ubicacion)
  return db_ubicacion

# --- ACTIVO FIJO ---
def get_activo_fijo(db: Session, id_activo: int):
  return (
      db.query(models.ActivoFijo)
      .filter(models.ActivoFijo.id_activo == id_activo)
      .first()
  )

def get_activo_por_codigo(db: Session, codigo_unico: str):
  return (
      db.query(models.ActivoFijo)
      .filter(models.ActivoFijo.codigo_unico == codigo_unico)
      .first()
  )

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
  return (
      db.query(models.Asignacion)
      .filter(models.Asignacion.id_asignacion == id_asignacion)
      .first()
  )

def get_asignaciones(db: Session, skip: int = 0, limit: int = 100):
  return db.query(models.Asignacion).offset(skip).limit(limit).all()

def create_asignacion(db: Session, asignacion: schemas.AsignacionCreate):
  db_activo = get_activo_fijo(db, asignacion.id_activo)
  if not db_activo:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"El activo con ID {asignacion.id_activo} no existe.",
    )

  if db_activo.estado != "Disponible":
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
            f"El activo con código '{db_activo.codigo_unico}' no está"
            f" disponible para asignación (Estado actual: {db_activo.estado})."
        ),
    )

  db_usuario = get_usuario(db, asignacion.id_usuario_responsable)
  if not db_usuario:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=(
            f"El usuario responsable con ID {asignacion.id_usuario_responsable}"
            " no existe."
        ),
    )

  db_asignacion = models.Asignacion(
      id_activo=asignacion.id_activo,
      id_usuario_responsable=asignacion.id_usuario_responsable,
      estado_asignacion=asignacion.estado_asignacion,
      observaciones=asignacion.observaciones,
      fecha_asignacion=datetime.now(),
  )

    
  db_activo.estado = "En Uso" 

  db.add(db_asignacion)
  db.commit()
  db.refresh(db_asignacion)
  return db_asignacion

# --- MOVIMIENTO ---
def get_movimiento(db: Session, id_movimiento: int):
  return (
      db.query(models.Movimiento)
      .filter(models.Movimiento.id_movimiento == id_movimiento)
      .first()
  )

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
  return (
      db.query(models.Mantenimiento)
      .filter(models.Mantenimiento.id_mantenimiento == id_mantenimiento)
      .first()
  )

def get_mantenimientos(db: Session, skip: int = 0, limit: int = 100):
  return db.query(models.Mantenimiento).offset(skip).limit(limit).all()

def create_mantenimiento(db: Session, mantenimiento: schemas.MantenimientoCreate):
  db_activo = get_activo_fijo(db, mantenimiento.id_activo)
  if not db_activo:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"El activo con ID {mantenimiento.id_activo} no existe.",
    )

  prestamo_activo = get_prestamo_activo(db, mantenimiento.id_activo)
  if prestamo_activo:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
            f"El activo '{db_activo.codigo_unico}' tiene un préstamo activo"
            " sin devolver. Registre la devolución antes de enviarlo a"
            " mantenimiento."
        ),
    )

  db_mantenimiento = models.Mantenimiento(**mantenimiento.model_dump())
  db.add(db_mantenimiento)

  # ESTO ES LO QUE HACE EL CAMBIO DE ESTADO
  db_activo.estado = "Mantenimiento"

  db.commit()
  db.refresh(db_mantenimiento)
  return db_mantenimiento

# --- AUDITORÍA ---
def get_auditoria(db: Session, id_auditoria: int):
  return (
      db.query(models.Auditoria)
      .filter(models.Auditoria.id_auditoria == id_auditoria)
      .first()
  )

def get_auditorias(db: Session, skip: int = 0, limit: int = 100):
  return db.query(models.Auditoria).offset(skip).limit(limit).all()

def create_auditoria(db: Session, auditoria: schemas.AuditoriaCreate):
  db_auditoria = models.Auditoria(**auditoria.model_dump())
  db.add(db_auditoria)
  db.commit()
  db.refresh(db_auditoria)
  return db_auditoria

# --- ACTUALIZAR Y ELIMINAR: ACTIVOS FIJOS ---
def update_activo_fijo(db: Session, id_activo: int, activo: schemas.ActivoFijoCreate):
  db_activo = get_activo_fijo(db, id_activo)
  if not db_activo:
    return None
  update_data = activo.model_dump(exclude_unset=True)

  nuevo_estado = update_data.get("estado")
  if nuevo_estado is not None:
    prestamo_activo = get_prestamo_activo(db, id_activo)
    if prestamo_activo and nuevo_estado.strip().lower() != "prestado":
      raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail=(
              f"El activo '{db_activo.codigo_unico}' tiene un préstamo activo"
              " sin devolver. Su estado solo puede ser 'Prestado' hasta que"
              " se registre la devolución."
          ),
      )

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
        detail=(
            "No se puede eliminar el activo porque tiene registros asociados"
            " (movimientos, asignaciones o mantenimientos)."
        ),
    )

# --- ACTUALIZAR Y ELIMINAR: USUARIOS ---
def update_usuario(db: Session, id_usuario: int, usuario: schemas.UsuarioUpdate):
    db_usuario = get_usuario(db, id_usuario)
    if not db_usuario:
        return None
    update_data = usuario.model_dump(exclude_unset=True, exclude_none=True)
    if update_data.get("password"):
        update_data["password"] = get_password_hash(update_data["password"])
    else:
        update_data.pop("password", None)
    for key, value in update_data.items():
        setattr(db_usuario, key, value)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def delete_usuario(db: Session, id_usuario: int):
    db_usuario = get_usuario(db, id_usuario)
    if not db_usuario:
        return None
    # En lugar de borrarlo de la base de datos, lo desactivamos
    db_usuario.estado_activo = False
    db.commit()
    db.refresh(db_usuario)
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
    try:
        db.delete(db_ubicacion)
        db.commit()
        return db_ubicacion
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar la ubicación porque tiene activos asociados.",
        )

# --- LÓGICA DE NEGOCIO: DEVOLUCIÓN DE ASIGNACIÓN ---
def devolver_asignacion(db: Session, id_asignacion: int):
  db_asignacion = get_asignacion(db, id_asignacion)
  if not db_asignacion or db_asignacion.fecha_devolucion is not None:
    return None

  db_asignacion.fecha_devolucion = datetime.now(timezone.utc)
  db_asignacion.estado_asignacion = "Devuelto"

  db_activo = get_activo_fijo(db, db_asignacion.id_activo)
  if db_activo:
    db_activo.estado = "Disponible"

  db.commit()
  db.refresh(db_asignacion)
  return db_asignacion

def delete_asignacion(db: Session, id_asignacion: int):
    db_asignacion = get_asignacion(db, id_asignacion)
    if not db_asignacion:
        return None
    db.delete(db_asignacion)
    db.commit()
    return db_asignacion

# --- LÓGICA DE NEGOCIO: COMPLETAR MANTENIMIENTO ---
def completar_mantenimiento(db: Session, id_mantenimiento: int):
  db_mantenimiento = get_mantenimiento(db, id_mantenimiento)
  if not db_mantenimiento:
    return None

  db_mantenimiento.fecha_mantenimiento = date.today()
  
  # ESTO DEVUELVE EL ACTIVO A DISPONIBLE
  db_activo = get_activo_fijo(db, db_mantenimiento.id_activo)
  if db_activo:
    db_activo.estado = "Disponible"

  db.commit()
  db.refresh(db_mantenimiento)
  return db_mantenimiento

# --- LÓGICA DE NEGOCIO: TRASLADO DE ACTIVO ---
def trasladar_activo(
    db: Session,
    id_activo: int,
    nueva_ubicacion_id: int,
    id_usuario: int,
    detalle: str,
):
  db_activo = get_activo_fijo(db, id_activo)
  if not db_activo:
    return None

  ubicacion_anterior = db_activo.id_ubicacion
  db_activo.id_ubicacion = nueva_ubicacion_id

  db_movimiento = models.Movimiento(
      id_activo=id_activo,
      id_usuario=id_usuario,
      tipo_movimiento="Traslado de Ubicación",
      descripcion_detalle=(
          f"Activo trasladado de la ubicación ID {ubicacion_anterior} a la"
          f" ubicación ID {nueva_ubicacion_id}. Motivo: {detalle}"
      ),
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


# =====================================================================
# PRÉSTAMOS
# =====================================================================

ROLES_DOCENTE = (
    "profesor",
    "profesora",
    "docente",
    "coordinador",
    "coordinadora",
    "rector",
    "rectora",
    "orientador",
    "orientadora",
)


def es_rol_docente(nombre_rol: str | None) -> bool:
  return (nombre_rol or "").strip().lower() in ROLES_DOCENTE


def _now() -> datetime:
  return datetime.now()


def _to_naive(value: datetime | None) -> datetime | None:
  if value is None:
    return None
  if value.tzinfo is not None:
    return value.astimezone(timezone.utc).replace(tzinfo=None)
  return value


def get_prestamo(db: Session, id_prestamo: int):
  return (
      db.query(models.Prestamo)
      .filter(models.Prestamo.id_prestamo == id_prestamo)
      .first()
  )


def get_prestamo_activo(db: Session, id_activo: int):
  return (
      db.query(models.Prestamo)
      .filter(
          models.Prestamo.id_activo == id_activo,
          models.Prestamo.estado_prestamo == "Activo",
      )
      .order_by(models.Prestamo.fecha_prestamo.desc())
      .first()
  )


def _serialize_componente(componente: models.PrestamoComponente) -> dict:
  return {
      "id_componente_prestamo": componente.id_componente_prestamo,
      "nombre_componente": componente.nombre_componente,
      "estado_entrega": componente.estado_entrega,
      "observacion_entrega": componente.observacion_entrega,
      "estado_devolucion": componente.estado_devolucion,
      "observacion_devolucion": componente.observacion_devolucion,
  }


def _serialize_prestamo(prestamo: models.Prestamo) -> dict:
  esperada = _to_naive(prestamo.fecha_devolucion_esperada)
  vencido = (
      prestamo.estado_prestamo == "Activo"
      and esperada is not None
      and esperada < _now()
  )
  activo = prestamo.activo
  usuario = prestamo.usuario_registra
  return {
      "id_prestamo": prestamo.id_prestamo,
      "id_activo": prestamo.id_activo,
      "nombre_solicitante": prestamo.nombre_solicitante,
      "grado": prestamo.grado,
      "fecha_prestamo": prestamo.fecha_prestamo,
      "actividad": prestamo.actividad,
      "fecha_entrega": prestamo.fecha_entrega,
      "fecha_devolucion_esperada": prestamo.fecha_devolucion_esperada,
      "observaciones_entrega": prestamo.observaciones_entrega,
      "estado_prestamo": prestamo.estado_prestamo,
      "fecha_devolucion_real": prestamo.fecha_devolucion_real,
      "observaciones_devolucion": prestamo.observaciones_devolucion,
      "persona_recibe_devolucion": prestamo.persona_recibe_devolucion,
      "estado_devolucion": prestamo.estado_devolucion,
      "id_usuario_registra": prestamo.id_usuario_registra,
      "fecha_creacion": prestamo.fecha_creacion,
      "nombre_activo": activo.nombre_activo if activo else None,
      "codigo_activo": activo.codigo_unico if activo else None,
      "nombre_usuario_registra": usuario.nombre if usuario else None,
      "vencido": vencido,
      "componentes": [
          _serialize_componente(c) for c in prestamo.componentes
      ],
  }


def get_prestamos(
    db: Session,
    skip: int = 0,
    limit: int = 200,
    estado: str | None = None,
    id_activo: int | None = None,
    buscar: str | None = None,
):
  consulta = db.query(models.Prestamo)
  if id_activo is not None:
    consulta = consulta.filter(models.Prestamo.id_activo == id_activo)

  if estado:
    estado_normalizado = estado.strip().lower()
    if estado_normalizado == "activo":
      consulta = consulta.filter(models.Prestamo.estado_prestamo == "Activo")
    elif estado_normalizado == "devuelto":
      consulta = consulta.filter(models.Prestamo.estado_prestamo == "Devuelto")
    elif estado_normalizado in ("vencido", "vencida"):
      consulta = consulta.filter(
          models.Prestamo.estado_prestamo == "Activo",
          models.Prestamo.fecha_devolucion_esperada < _now(),
      )

  if buscar:
    patron = f"%{buscar.strip()}%"
    consulta = consulta.join(models.ActivoFijo).filter(
        or_(
            models.Prestamo.nombre_solicitante.ilike(patron),
            models.Prestamo.grado.ilike(patron),
            models.Prestamo.actividad.ilike(patron),
            models.ActivoFijo.nombre_activo.ilike(patron),
            models.ActivoFijo.codigo_unico.ilike(patron),
        )
    )

  registros = (
      consulta.order_by(models.Prestamo.fecha_prestamo.desc())
      .offset(skip)
      .limit(limit)
      .all()
  )
  return [_serialize_prestamo(p) for p in registros]


def get_prestamos_por_activo(db: Session, id_activo: int):
  registros = (
      db.query(models.Prestamo)
      .filter(models.Prestamo.id_activo == id_activo)
      .order_by(models.Prestamo.fecha_prestamo.desc())
      .all()
  )
  return [_serialize_prestamo(p) for p in registros]


def create_prestamo(db: Session, prestamo: schemas.PrestamoCreate):
  db_activo = get_activo_fijo(db, prestamo.id_activo)
  if not db_activo:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"El activo con ID {prestamo.id_activo} no existe.",
    )

  estado_activo = (db_activo.estado or "").strip().lower()
  if estado_activo != "disponible":
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
            f"El activo '{db_activo.codigo_unico}' no se puede prestar porque"
            f" su estado actual es '{db_activo.estado}'. Solo se permiten"
            " activos disponibles."
        ),
    )

  if get_prestamo_activo(db, db_activo.id_activo):
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
            f"El activo '{db_activo.codigo_unico}' ya tiene un préstamo activo"
            " sin devolver."
        ),
    )

  fecha_prestamo = _to_naive(prestamo.fecha_prestamo) or _now()
  fecha_entrega = _to_naive(prestamo.fecha_entrega) or fecha_prestamo
  fecha_esperada = (
      _to_naive(prestamo.fecha_devolucion_esperada) or fecha_entrega
  )

  if fecha_entrega < fecha_prestamo:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="La fecha de entrega no puede ser anterior a la fecha del préstamo.",
    )
  if fecha_esperada < fecha_prestamo:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
            "La fecha de devolución esperada no puede ser anterior a la fecha"
            " del préstamo."
        ),
    )
  if fecha_esperada < fecha_entrega:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
            "La fecha de devolución esperada no puede ser anterior a la fecha"
            " de entrega."
        ),
    )

  db_prestamo = models.Prestamo(
      id_activo=db_activo.id_activo,
      nombre_solicitante=prestamo.nombre_solicitante.strip(),
      grado=(prestamo.grado or "").strip() or None,
      fecha_prestamo=fecha_prestamo,
      actividad=(prestamo.actividad or "").strip() or None,
      fecha_entrega=fecha_entrega,
      fecha_devolucion_esperada=fecha_esperada,
      observaciones_entrega=prestamo.observaciones_entrega,
      estado_prestamo="Activo",
      id_usuario_registra=prestamo.id_usuario_registra,
  )

  for componente in prestamo.componentes:
    nombre = (componente.nombre_componente or "").strip()
    if not nombre:
      continue
    db_prestamo.componentes.append(
        models.PrestamoComponente(
            nombre_componente=nombre,
            estado_entrega=componente.estado_entrega or "Bueno",
            observacion_entrega=componente.observacion_entrega,
        )
    )

  estado_anterior = db_activo.estado
  db_activo.estado = "Prestado"
  db.add(db_prestamo)
  db.add(
      models.HistorialActivo(
          id_activo=db_activo.id_activo,
          tipo_cambio="Préstamo registrado",
          valor_anterior=estado_anterior,
          valor_nuevo="Prestado",
          observaciones=(
              f"Préstamo a {prestamo.nombre_solicitante}"
              f"{(' - ' + prestamo.grado) if prestamo.grado else ''}"
              f". Actividad: {prestamo.actividad or 'No especificada'}"
          ),
          id_usuario=prestamo.id_usuario_registra,
          fecha=_now(),
      )
  )

  db.commit()
  db.refresh(db_prestamo)
  return _serialize_prestamo(db_prestamo)


def devolver_prestamo(
    db: Session, id_prestamo: int, devolucion: schemas.PrestamoDevolucion
):
  db_prestamo = get_prestamo(db, id_prestamo)
  if not db_prestamo:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Préstamo no encontrado.",
    )
  if db_prestamo.estado_prestamo == "Devuelto":
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Este préstamo ya fue devuelto.",
    )

  fecha_real = _to_naive(devolucion.fecha_devolucion_real) or _now()
  fecha_prestamo = _to_naive(db_prestamo.fecha_prestamo)
  if fecha_prestamo and fecha_real < fecha_prestamo:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
            "La fecha real de devolución no puede ser anterior a la fecha del"
            " préstamo."
        ),
    )

  db_prestamo.fecha_devolucion_real = fecha_real
  db_prestamo.estado_prestamo = "Devuelto"
  db_prestamo.persona_recibe_devolucion = (
      devolucion.persona_recibe_devolucion or ""
  ).strip() or None
  db_prestamo.estado_devolucion = devolucion.estado_devolucion
  db_prestamo.observaciones_devolucion = devolucion.observaciones_devolucion

  componentes_por_id = {
      c.id_componente_prestamo: c for c in db_prestamo.componentes
  }
  for item in devolucion.componentes:
    componente = componentes_por_id.get(item.id_componente_prestamo)
    if componente is None:
      continue
    componente.estado_devolucion = item.estado_devolucion
    componente.observacion_devolucion = item.observacion_devolucion

  db_activo = db_prestamo.activo
  if db_activo:
    estado_anterior = db_activo.estado
    if (db_activo.estado or "").lower() not in (
        "mantenimiento",
        "dado de baja",
    ):
      db_activo.estado = "Disponible"
    db.add(
        models.HistorialActivo(
            id_activo=db_activo.id_activo,
            tipo_cambio="Devolución registrada",
            valor_anterior=estado_anterior,
            valor_nuevo=db_activo.estado,
            observaciones=(
                f"Devuelto por {db_prestamo.nombre_solicitante}. Recibido por"
                f" {db_prestamo.persona_recibe_devolucion or 'No registrado'}."
                f" Estado general: {db_prestamo.estado_devolucion or 'No registrado'}."
            ),
            id_usuario=db_prestamo.id_usuario_registra,
            fecha=_now(),
        )
    )

  db.commit()
  db.refresh(db_prestamo)
  return _serialize_prestamo(db_prestamo)


# =====================================================================
# SALAS Y DOCENTES
# =====================================================================


def _serialize_sala_docente(asociacion: models.SalaDocente) -> dict:
  docente = asociacion.docente
  rol = None
  if docente and docente.rol:
    rol = docente.rol.nombre_rol
  return {
      "id_sala_docente": asociacion.id_sala_docente,
      "id_ubicacion": asociacion.id_ubicacion,
      "id_usuario": asociacion.id_usuario,
      "nombre_docente": docente.nombre if docente else None,
      "documento_docente": docente.numero_documento if docente else None,
      "rol_docente": rol,
      "es_responsable_principal": bool(asociacion.es_responsable_principal),
      "observaciones": asociacion.observaciones,
      "activa": bool(asociacion.activa),
      "fecha_asociacion": asociacion.fecha_asociacion,
  }


def _docentes_de_sala(db: Session, id_ubicacion: int):
  asociaciones = (
      db.query(models.SalaDocente)
      .filter(
          models.SalaDocente.id_ubicacion == id_ubicacion,
          models.SalaDocente.activa.is_(True),
      )
      .order_by(
          models.SalaDocente.es_responsable_principal.desc(),
          models.SalaDocente.fecha_asociacion,
      )
      .all()
  )
  return [_serialize_sala_docente(a) for a in asociaciones]


def _serialize_sala(db: Session, sala: models.Ubicacion, incluir_activos=False):
  total_activos = (
      db.query(models.ActivoFijo)
      .filter(models.ActivoFijo.id_ubicacion == sala.id_ubicacion)
      .count()
  )
  datos = {
      "id_ubicacion": sala.id_ubicacion,
      "nombre_espacio": sala.nombre_espacio,
      "edificio_bloque": sala.edificio_bloque,
      "descripcion": sala.descripcion,
      "total_activos": total_activos,
      "docentes": _docentes_de_sala(db, sala.id_ubicacion),
  }
  if incluir_activos:
    activos = (
        db.query(models.ActivoFijo)
        .filter(models.ActivoFijo.id_ubicacion == sala.id_ubicacion)
        .order_by(models.ActivoFijo.nombre_activo)
        .all()
    )
    datos["activos"] = [
        {
            "id_activo": a.id_activo,
            "codigo_unico": a.codigo_unico,
            "nombre_activo": a.nombre_activo,
            "descripcion": a.descripcion,
            "estado": a.estado,
            "id_clase": a.id_clase,
            "id_ubicacion": a.id_ubicacion,
            "fecha_adquisicion": a.fecha_adquisicion,
        }
        for a in activos
    ]
  return datos


def get_salas(db: Session, skip: int = 0, limit: int = 200):
  salas = db.query(models.Ubicacion).offset(skip).limit(limit).all()
  return [_serialize_sala(db, s) for s in salas]


def get_sala_detalle(db: Session, id_ubicacion: int):
  sala = get_ubicacion(db, id_ubicacion)
  if not sala:
    return None
  return _serialize_sala(db, sala, incluir_activos=True)


def asociar_docente_sala(
    db: Session,
    id_ubicacion: int,
    asociacion: schemas.SalaDocenteCreate,
    id_usuario_registra: int | None = None,
):
  sala = get_ubicacion(db, id_ubicacion)
  if not sala:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="La sala o ubicación no existe.",
    )

  docente = get_usuario(db, asociacion.id_usuario)
  if not docente:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="El docente indicado no existe.",
    )
  if not docente.estado_activo:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="El docente indicado está inactivo y no puede asociarse.",
    )

  if asociacion.es_responsable_principal:
    db.query(models.SalaDocente).filter(
        models.SalaDocente.id_ubicacion == id_ubicacion,
        models.SalaDocente.activa.is_(True),
        models.SalaDocente.id_usuario != asociacion.id_usuario,
    ).update({models.SalaDocente.es_responsable_principal: False})

  existente = (
      db.query(models.SalaDocente)
      .filter(
          models.SalaDocente.id_ubicacion == id_ubicacion,
          models.SalaDocente.id_usuario == asociacion.id_usuario,
      )
      .first()
  )

  if existente:
    existente.activa = True
    existente.es_responsable_principal = asociacion.es_responsable_principal
    existente.observaciones = asociacion.observaciones
    db_asociacion = existente
  else:
    db_asociacion = models.SalaDocente(
        id_ubicacion=id_ubicacion,
        id_usuario=asociacion.id_usuario,
        es_responsable_principal=asociacion.es_responsable_principal,
        observaciones=asociacion.observaciones,
        activa=True,
        fecha_asociacion=_now(),
    )
    db.add(db_asociacion)

  if id_usuario_registra:
    db.add(
        models.Auditoria(
            id_usuario=id_usuario_registra,
            accion_realizada="Asociar docente a sala",
            detalle_cambio=(
                f"Docente {docente.nombre} asociado a la sala"
                f" {sala.nombre_espacio}."
            ),
        )
    )

  db.commit()
  db.refresh(db_asociacion)
  return _serialize_sala_docente(db_asociacion)


def desasociar_docente_sala(db: Session, id_sala_docente: int):
  asociacion = (
      db.query(models.SalaDocente)
      .filter(models.SalaDocente.id_sala_docente == id_sala_docente)
      .first()
  )
  if not asociacion:
    return None
  asociacion.activa = False
  asociacion.es_responsable_principal = False
  db.commit()
  db.refresh(asociacion)
  return _serialize_sala_docente(asociacion)


def get_docente(db: Session, id_usuario: int):
  docente = get_usuario(db, id_usuario)
  if not docente:
    return None
  rol = docente.rol.nombre_rol if docente.rol else None
  salas = []
  for asociacion in docente.salas_asociadas:
    if not asociacion.activa:
      continue
    sala = asociacion.sala
    salas.append(
        {
            "id_ubicacion": asociacion.id_ubicacion,
            "nombre_espacio": sala.nombre_espacio if sala else None,
            "edificio_bloque": sala.edificio_bloque if sala else None,
            "es_responsable_principal": bool(
                asociacion.es_responsable_principal
            ),
            "fecha_asociacion": asociacion.fecha_asociacion,
        }
    )

  asignaciones = (
      db.query(models.AsignacionActivo)
      .filter(
          models.AsignacionActivo.id_usuario_responsable == id_usuario,
          models.AsignacionActivo.estado == "Activa",
      )
      .order_by(models.AsignacionActivo.fecha_asignacion.desc())
      .all()
  )

  ids_activos = [a.id_activo for a in asignaciones]
  prestamos_temporales = []
  if ids_activos:
    prestamos = (
        db.query(models.Prestamo)
        .filter(
            models.Prestamo.id_activo.in_(ids_activos),
            models.Prestamo.estado_prestamo == "Activo",
        )
        .order_by(models.Prestamo.fecha_prestamo.desc())
        .all()
    )
    prestamos_temporales = [_serialize_prestamo(p) for p in prestamos]

  return {
      "id_usuario": docente.id_usuario,
      "nombre": docente.nombre,
      "numero_documento": docente.numero_documento,
      "rol": rol,
      "salas": salas,
      "total_salas": len(salas),
      "total_activos_asignados": len(asignaciones),
      "activos_asignados": [
          _serialize_asignacion_activo(a) for a in asignaciones
      ],
      "prestamos_temporales": prestamos_temporales,
  }


def get_docentes(db: Session):
  roles = db.query(models.Rol).all()
  ids_roles = [r.id_rol for r in roles if es_rol_docente(r.nombre_rol)]
  if not ids_roles:
    return []
  docentes = (
      db.query(models.Usuario)
      .filter(
          models.Usuario.id_rol.in_(ids_roles),
          models.Usuario.estado_activo.is_(True),
      )
      .order_by(models.Usuario.nombre)
      .all()
  )
  return [get_docente(db, d.id_usuario) for d in docentes]


# =====================================================================
# ASIGNACIONES PERMANENTES DE ACTIVOS
# =====================================================================


def _serialize_asignacion_activo(asignacion: models.AsignacionActivo) -> dict:
  responsable = asignacion.responsable
  sala = asignacion.sala
  activo = asignacion.activo
  return {
      "id_asignacion_activo": asignacion.id_asignacion_activo,
      "id_activo": asignacion.id_activo,
      "id_usuario_responsable": asignacion.id_usuario_responsable,
      "id_ubicacion": asignacion.id_ubicacion,
      "estado": asignacion.estado,
      "observaciones": asignacion.observaciones,
      "fecha_asignacion": asignacion.fecha_asignacion,
      "fecha_fin": asignacion.fecha_fin,
      "nombre_responsable": responsable.nombre if responsable else None,
      "documento_responsable": (
          responsable.numero_documento if responsable else None
      ),
      "nombre_sala": sala.nombre_espacio if sala else None,
      "nombre_activo": activo.nombre_activo if activo else None,
      "codigo_activo": activo.codigo_unico if activo else None,
  }


def get_asignacion_activa(db: Session, id_activo: int):
  return (
      db.query(models.AsignacionActivo)
      .filter(
          models.AsignacionActivo.id_activo == id_activo,
          models.AsignacionActivo.estado == "Activa",
      )
      .order_by(models.AsignacionActivo.fecha_asignacion.desc())
      .first()
  )


def get_asignaciones_activo(
    db: Session, skip: int = 0, limit: int = 300, id_activo: int | None = None
):
  consulta = db.query(models.AsignacionActivo)
  if id_activo is not None:
    consulta = consulta.filter(
        models.AsignacionActivo.id_activo == id_activo
    )
  registros = (
      consulta.order_by(models.AsignacionActivo.fecha_asignacion.desc())
      .offset(skip)
      .limit(limit)
      .all()
  )
  return [_serialize_asignacion_activo(a) for a in registros]


def crear_asignacion_activo(
    db: Session,
    datos: schemas.AsignacionActivoCreate,
    id_usuario_registra: int | None = None,
):
  db_activo = get_activo_fijo(db, datos.id_activo)
  if not db_activo:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"El activo con ID {datos.id_activo} no existe.",
    )

  db_usuario = get_usuario(db, datos.id_usuario_responsable)
  if not db_usuario:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="El docente o responsable indicado no existe.",
    )
  if not db_usuario.estado_activo:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="El docente o responsable indicado está inactivo.",
    )

  db_sala = get_ubicacion(db, datos.id_ubicacion)
  if not db_sala:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="La sala o ubicación indicada no existe.",
    )

  asignacion_actual = get_asignacion_activa(db, db_activo.id_activo)
  if (
      asignacion_actual
      and asignacion_actual.id_usuario_responsable
      == datos.id_usuario_responsable
      and asignacion_actual.id_ubicacion == datos.id_ubicacion
  ):
    if datos.observaciones is not None:
      asignacion_actual.observaciones = datos.observaciones
      db.commit()
      db.refresh(asignacion_actual)
    return _serialize_asignacion_activo(asignacion_actual)

  ahora = _now()
  nombre_anterior = (
      asignacion_actual.responsable.nombre
      if asignacion_actual and asignacion_actual.responsable
      else None
  )
  sala_anterior = db_activo.ubicacion.nombre_espacio if db_activo.ubicacion else None
  sala_nueva = db_sala.nombre_espacio

  if asignacion_actual:
    asignacion_actual.estado = "Cerrada"
    asignacion_actual.fecha_fin = ahora

  db_activo.id_ubicacion = db_sala.id_ubicacion

  db_asignacion = models.AsignacionActivo(
      id_activo=db_activo.id_activo,
      id_usuario_responsable=db_usuario.id_usuario,
      id_ubicacion=db_sala.id_ubicacion,
      estado="Activa",
      observaciones=datos.observaciones,
      fecha_asignacion=ahora,
      id_usuario_registra=id_usuario_registra,
  )
  db.add(db_asignacion)

  if asignacion_actual is None or nombre_anterior != db_usuario.nombre:
    db.add(
        models.HistorialActivo(
            id_activo=db_activo.id_activo,
            tipo_cambio="Cambio de responsable",
            valor_anterior=nombre_anterior or "Sin responsable",
            valor_nuevo=db_usuario.nombre,
            observaciones=datos.observaciones,
            id_usuario=id_usuario_registra,
            fecha=ahora,
        )
    )

  if sala_anterior and sala_anterior != sala_nueva:
    db.add(
        models.HistorialActivo(
            id_activo=db_activo.id_activo,
            tipo_cambio="Traslado de ubicación",
            valor_anterior=sala_anterior,
            valor_nuevo=sala_nueva,
            observaciones=datos.observaciones,
            id_usuario=id_usuario_registra,
            fecha=ahora,
        )
    )
    db.add(
        models.Movimiento(
            id_activo=db_activo.id_activo,
            id_usuario=id_usuario_registra or db_usuario.id_usuario,
            tipo_movimiento="Traslado de Ubicación",
            descripcion_detalle=(
                f"Activo trasladado de '{sala_anterior}' a '{sala_nueva}'."
                f" {datos.observaciones or ''}"
            ).strip(),
            fecha_movimiento=ahora,
        )
    )

  db.commit()
  db.refresh(db_asignacion)
  return _serialize_asignacion_activo(db_asignacion)


def trasladar_activo_v2(
    db: Session,
    id_activo: int,
    datos: schemas.TrasladarActivoRequest,
    id_usuario_registra: int | None = None,
):
  if not get_activo_fijo(db, id_activo):
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"El activo con ID {id_activo} no existe.",
    )
  asignacion_actual = get_asignacion_activa(db, id_activo)
  id_responsable = datos.id_usuario_responsable
  if id_responsable is None and asignacion_actual:
    id_responsable = asignacion_actual.id_usuario_responsable
  if id_responsable is None:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
            "El activo no tiene un responsable asignado. Indique un docente"
            " responsable para realizar el traslado."
        ),
    )
  return crear_asignacion_activo(
      db,
      schemas.AsignacionActivoCreate(
          id_activo=id_activo,
          id_usuario_responsable=id_responsable,
          id_ubicacion=datos.id_ubicacion,
          observaciones=datos.observaciones,
      ),
      id_usuario_registra=id_usuario_registra,
  )


def cerrar_asignacion_activo(
    db: Session,
    id_asignacion_activo: int,
    observaciones: str | None = None,
    id_usuario_registra: int | None = None,
):
  asignacion = (
      db.query(models.AsignacionActivo)
      .filter(
          models.AsignacionActivo.id_asignacion_activo
          == id_asignacion_activo
      )
      .first()
  )
  if not asignacion:
    return None
  if asignacion.estado == "Cerrada":
    return _serialize_asignacion_activo(asignacion)

  asignacion.estado = "Cerrada"
  asignacion.fecha_fin = _now()
  if observaciones:
    asignacion.observaciones = observaciones

  db.add(
      models.HistorialActivo(
          id_activo=asignacion.id_activo,
          tipo_cambio="Fin de asignación",
          valor_anterior=(
              asignacion.responsable.nombre
              if asignacion.responsable
              else "Sin responsable"
          ),
          valor_nuevo="Sin responsable asignado",
          observaciones=observaciones,
          id_usuario=id_usuario_registra,
          fecha=_now(),
      )
  )
  db.commit()
  db.refresh(asignacion)
  return _serialize_asignacion_activo(asignacion)


# =====================================================================
# HISTORIAL CONSOLIDADO DEL ACTIVO
# =====================================================================


def get_historial_activo(db: Session, id_activo: int):
  db_activo = get_activo_fijo(db, id_activo)
  if not db_activo:
    return None

  prestamos = (
      db.query(models.Prestamo)
      .filter(models.Prestamo.id_activo == id_activo)
      .order_by(models.Prestamo.fecha_prestamo.desc())
      .all()
  )
  asignaciones = (
      db.query(models.AsignacionActivo)
      .filter(models.AsignacionActivo.id_activo == id_activo)
      .order_by(models.AsignacionActivo.fecha_asignacion.desc())
      .all()
  )
  movimientos = (
      db.query(models.Movimiento)
      .filter(models.Movimiento.id_activo == id_activo)
      .order_by(models.Movimiento.fecha_movimiento.desc())
      .all()
  )
  cambios = (
      db.query(models.HistorialActivo)
      .filter(models.HistorialActivo.id_activo == id_activo)
      .order_by(models.HistorialActivo.fecha.desc())
      .all()
  )

  asignacion_actual = next(
      (a for a in asignaciones if a.estado == "Activa"), None
  )
  prestamo_activo = next(
      (p for p in prestamos if p.estado_prestamo == "Activo"), None
  )

  return {
      "activo": schemas.ActivoFijoResponse.model_validate(db_activo).model_dump(),
      "asignacion_actual": (
          _serialize_asignacion_activo(asignacion_actual)
          if asignacion_actual
          else None
      ),
      "prestamo_activo": (
          _serialize_prestamo(prestamo_activo) if prestamo_activo else None
      ),
      "prestamos": [_serialize_prestamo(p) for p in prestamos],
      "asignaciones": [
          _serialize_asignacion_activo(a) for a in asignaciones
      ],
      "movimientos": [
          {
              "id_movimiento": m.id_movimiento,
              "id_activo": m.id_activo,
              "id_usuario": m.id_usuario,
              "tipo_movimiento": m.tipo_movimiento,
              "descripcion_detalle": m.descripcion_detalle,
              "fecha_movimiento": m.fecha_movimiento,
              "nombre_usuario": m.usuario.nombre if m.usuario else None,
          }
          for m in movimientos
      ],
      "cambios": [
          {
              "id_historial": c.id_historial,
              "id_activo": c.id_activo,
              "tipo_cambio": c.tipo_cambio,
              "valor_anterior": c.valor_anterior,
              "valor_nuevo": c.valor_nuevo,
              "observaciones": c.observaciones,
              "id_usuario": c.id_usuario,
              "nombre_usuario": c.usuario.nombre if c.usuario else None,
              "fecha": c.fecha,
          }
          for c in cambios
      ],
  }