from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, crud, security, database

models.Base.metadata.create_all(bind=database.engine)
# --- CREACIÓN OPCIONAL DEL USUARIO ADMINISTRADOR INICIAL ---
# Las credenciales se reciben por variables de entorno y nunca se guardan
# directamente en el código fuente.
import os

def create_initial_admin():
    admin_document = os.getenv("ADMIN_DOCUMENT")
    admin_name = os.getenv("ADMIN_NAME", "Administrador Inicial")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_document or not admin_password:
        print("ADMIN_DOCUMENT/ADMIN_PASSWORD no definidos; no se crea usuario inicial.")
        return

    db = database.SessionLocal()
    try:
        if db.query(models.Usuario).count() == 0:
            admin_rol = (
                db.query(models.Rol)
                .filter(models.Rol.nombre_rol == "Administrador")
                .first()
            )
            if not admin_rol:
                admin_rol = models.Rol(
                    nombre_rol="Administrador",
                    descripcion="Acceso total al sistema",
                )
                db.add(admin_rol)
                db.commit()
                db.refresh(admin_rol)

            admin_user = models.Usuario(
                numero_documento=admin_document,
                nombre=admin_name,
                password=security.get_password_hash(admin_password),
                id_rol=admin_rol.id_rol,
                estado_activo=True,
            )
            db.add(admin_user)
            db.commit()
            print(f"Usuario administrador inicial creado: {admin_document}")
    finally:
        db.close()


create_initial_admin()
# ---------------------------------------------------------
app = FastAPI(
    title="API Prototipo para manejo Inventarios de Sala de Computo y STEAM",
    description=(
        "Sistema backend para la gestión y control del inventario de la sala "
        "de cómputo y STEAM"
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost",
        "http://127.0.0.1",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def evitar_cache_api(request, call_next):
    """Evita que el navegador muestre respuestas antiguas de la API.

    Sin esta cabecera el navegador puede reutilizar un JSON ya cargado y
    mostrar datos viejos aunque la base de datos ya tenga otros.
    """
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": (
            "API del Prototipo para manejo Inventarios de Sala de Computo y "
            "STEAM funcionando"
        ),
        "docs": "/docs",
    }

@app.post("/token", tags=["Autenticación"])
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    usuario = crud.get_usuario_por_documento(db, form_data.username)
    
    # Verificamos que exista, esté activo y tenga contraseña
    if not usuario or not usuario.estado_activo or not usuario.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verificamos que el rol tenga permitido loguearse
    rol = db.query(models.Rol).filter(models.Rol.id_rol == usuario.id_rol).first()
    if not rol or rol.nombre_rol.lower() not in ("administrador", "admin", "custodio"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este usuario no tiene permitido el acceso al sistema, solo para préstamos."
        )

    if not security.verify_password(form_data.password, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token = security.create_access_token({"sub": usuario.numero_documento})
    return {"access_token": token, "token_type": "bearer"}

# --- ROLES ---
@app.post("/roles/", response_model=schemas.RolResponse, tags=["Roles"])
def crear_rol(
    rol: schemas.RolCreate,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_admin_user),
):
    return crud.create_rol(db=db, rol=rol)

@app.get("/roles/", response_model=List[schemas.RolResponse], tags=["Roles"])
def listar_roles(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_roles(db, skip=skip, limit=limit)

# --- USUARIOS ---
@app.post("/usuarios/", response_model=schemas.UsuarioResponse, tags=["Usuarios"])
def crear_usuario(
    usuario: schemas.UsuarioCreate,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_admin_user),
):
    if crud.get_usuario_por_documento(db, usuario.numero_documento):
        raise HTTPException(400, "El número de documento ya está registrado.")
    return crud.create_usuario(db=db, usuario=usuario)

@app.get("/usuarios/", response_model=List[schemas.UsuarioResponse], tags=["Usuarios"])
def listar_usuarios(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_usuarios(db, skip=skip, limit=limit)

@app.patch("/usuarios/{id_usuario}", response_model=schemas.UsuarioResponse, tags=["Usuarios"])
def actualizar_usuario(
    id_usuario: int,
    usuario: schemas.UsuarioUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_admin_user),
):
    # Validar permisos del Custodio
    rol_actual = db.query(models.Rol).filter(models.Rol.id_rol == current_user.id_rol).first()
    db_usuario = crud.get_usuario(db, id_usuario)
    if not db_usuario:
        raise HTTPException(404, "Usuario no encontrado")
        
    rol_objetivo = db.query(models.Rol).filter(models.Rol.id_rol == db_usuario.id_rol).first()

    if rol_actual and rol_actual.nombre_rol.lower() == "custodio" and rol_objetivo and rol_objetivo.nombre_rol.lower() in ("administrador", "admin"):
        raise HTTPException(403, "Un Custodio no puede modificar a un Administrador.")

    db_usuario = crud.update_usuario(db, id_usuario, usuario)
    if not db_usuario:
        raise HTTPException(404, "Usuario no encontrado")
    return db_usuario

@app.delete("/usuarios/{id_usuario}", tags=["Usuarios"])
def eliminar_usuario(
    id_usuario: int,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_admin_user),
):
    # Validar permisos del Custodio
    rol_actual = db.query(models.Rol).filter(models.Rol.id_rol == current_user.id_rol).first()
    db_usuario = crud.get_usuario(db, id_usuario)
    if not db_usuario:
        raise HTTPException(404, "Usuario no encontrado")
        
    rol_objetivo = db.query(models.Rol).filter(models.Rol.id_rol == db_usuario.id_rol).first()

    if rol_actual and rol_actual.nombre_rol.lower() == "custodio" and rol_objetivo and rol_objetivo.nombre_rol.lower() in ("administrador", "admin"):
        raise HTTPException(403, "Un Custodio no puede eliminar a un Administrador.")

    db_usuario = crud.delete_usuario(db, id_usuario)
    return {"message": "Usuario eliminado"}

# --- CLASES DE ACTIVO ---
@app.post("/clases-activo/", response_model=schemas.ClaseActivoResponse, tags=["Clases de Activo"])
def crear_clase_activo(
    clase: schemas.ClaseActivoCreate,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.create_clase_activo(db=db, clase_activo=clase)

@app.get("/clases-activo/", response_model=List[schemas.ClaseActivoResponse], tags=["Clases de Activo"])
def listar_clases_activo(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_clases_activos(db, skip=skip, limit=limit)

@app.delete("/clases-activo/{id_clase}", tags=["Clases de Activo"])
def eliminar_clase_activo(
    id_clase: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    db_clase = crud.delete_clase_activo(db, id_clase)
    if not db_clase:
        raise HTTPException(404, "Categoría no encontrada")
    return {"message": "Categoría eliminada exitosamente"}

# --- UBICACIONES ---
@app.post("/ubicaciones/", response_model=schemas.UbicacionResponse, tags=["Ubicaciones"])
def crear_ubicacion(
    ubicacion: schemas.UbicacionCreate,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.create_ubicacion(db=db, ubicacion=ubicacion)

@app.get("/ubicaciones/", response_model=List[schemas.UbicacionResponse], tags=["Ubicaciones"])
def listar_ubicaciones(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_ubicaciones(db, skip=skip, limit=limit)

@app.put("/ubicaciones/{id_ubicacion}", response_model=schemas.UbicacionResponse, tags=["Ubicaciones"])
def actualizar_ubicacion(
    id_ubicacion: int,
    ubicacion: schemas.UbicacionCreate,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    db_ubicacion = crud.update_ubicacion(db, id_ubicacion, ubicacion)
    if not db_ubicacion:
        raise HTTPException(404, "Ubicación no encontrada")
    return db_ubicacion

@app.delete("/ubicaciones/{id_ubicacion}", tags=["Ubicaciones"])
def eliminar_ubicacion(
    id_ubicacion: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    db_ubicacion = crud.delete_ubicacion(db, id_ubicacion)
    if not db_ubicacion:
        raise HTTPException(404, "Ubicación no encontrada")
    return {"message": "Ubicación eliminada"}

# --- ACTIVOS ---
@app.post("/activos/", response_model=schemas.ActivoFijoResponse, tags=["Activos Fijos"])
def crear_activo_fijo(
    activo: schemas.ActivoFijoCreate,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    if crud.get_activo_por_codigo(db, activo.codigo_unico):
        raise HTTPException(400, "El código único ya está registrado.")
    return crud.create_activo_fijo(db=db, activo=activo)

@app.get("/activos/", response_model=List[schemas.ActivoFijoResponse], tags=["Activos Fijos"])
def listar_activos_fijos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_activos_fijos(db, skip=skip, limit=limit)

@app.put("/activos/{id_activo}", response_model=schemas.ActivoFijoResponse, tags=["Activos Fijos"])
def actualizar_activo(
    id_activo: int,
    activo: schemas.ActivoFijoCreate,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    db_activo = crud.update_activo_fijo(db, id_activo, activo)
    if not db_activo:
        raise HTTPException(404, "Activo no encontrado")
    return db_activo

@app.delete("/activos/{id_activo}", tags=["Activos Fijos"])
def eliminar_activo(
    id_activo: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    db_activo = crud.delete_activo_fijo(db, id_activo)
    if not db_activo:
        raise HTTPException(404, "Activo no encontrado")
    return {"message": "Activo eliminado"}

# --- ASIGNACIONES ---
@app.post("/asignaciones/", response_model=schemas.AsignacionResponse, tags=["Asignaciones"])
def crear_asignacion(
    asignacion: schemas.AsignacionCreate,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.create_asignacion(db=db, asignacion=asignacion)

@app.get("/asignaciones/", response_model=List[schemas.AsignacionResponse], tags=["Asignaciones"])
def listar_asignaciones(
    skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_asignaciones(db, skip=skip, limit=limit)

@app.patch("/asignaciones/{id_asignacion}/devolver", response_model=schemas.AsignacionResponse, tags=["Asignaciones"])
def devolver_asignacion(
    id_asignacion: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    db_asignacion = crud.devolver_asignacion(db, id_asignacion)
    if not db_asignacion:
        raise HTTPException(400, "Asignación no encontrada o ya devuelta.")
    return db_asignacion

@app.delete("/asignaciones/{id_asignacion}", tags=["Asignaciones"])
def eliminar_asignacion(
    id_asignacion: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    db_asignacion = crud.delete_asignacion(db, id_asignacion)
    if not db_asignacion:
        raise HTTPException(404, "Asignación no encontrada")
    return {"message": "Asignación eliminada del historial"}

# --- MOVIMIENTOS ---
@app.post("/movimientos/", response_model=schemas.MovimientoResponse, tags=["Movimientos"])
def crear_movimiento(
    movimiento: schemas.MovimientoCreate,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.create_movimiento(db=db, movimiento=movimiento)

@app.get("/movimientos/", response_model=List[schemas.MovimientoResponse], tags=["Movimientos"])
def listar_movimientos(
    skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_movimientos(db, skip=skip, limit=limit)

# --- MANTENIMIENTOS ---
@app.post("/mantenimientos/", response_model=schemas.MantenimientoResponse, tags=["Mantenimientos"])
def crear_mantenimiento(
    mantenimiento: schemas.MantenimientoCreate,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.create_mantenimiento(db=db, mantenimiento=mantenimiento)

@app.get("/mantenimientos/", response_model=List[schemas.MantenimientoResponse], tags=["Mantenimientos"])
def listar_mantenimientos(
    skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_mantenimientos(db, skip=skip, limit=limit)

@app.patch("/mantenimientos/{id_mantenimiento}/completar", response_model=schemas.MantenimientoResponse, tags=["Mantenimientos"])
def completar_mantenimiento(
    id_mantenimiento: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    db_m = crud.completar_mantenimiento(db, id_mantenimiento)
    if not db_m:
        raise HTTPException(404, "Mantenimiento no encontrado.")
    return db_m

@app.delete("/mantenimientos/{id_mantenimiento}", tags=["Mantenimientos"])
def eliminar_mantenimiento(
    id_mantenimiento: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    db_m = crud.delete_mantenimiento(db, id_mantenimiento)
    if not db_m:
        raise HTTPException(404, "Mantenimiento no encontrado.")
    return {"message": "Mantenimiento eliminado"}

# --- PRÉSTAMOS ---
@app.get("/prestamos/", response_model=List[schemas.PrestamoResponse], tags=["Préstamos"])
def listar_prestamos(
    skip: int = 0,
    limit: int = 200,
    estado: str | None = None,
    id_activo: int | None = None,
    buscar: str | None = None,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_prestamos(
        db,
        skip=skip,
        limit=limit,
        estado=estado,
        id_activo=id_activo,
        buscar=buscar,
    )

@app.post("/prestamos/", response_model=schemas.PrestamoResponse, tags=["Préstamos"])
def crear_prestamo(
    prestamo: schemas.PrestamoCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user),
):
    # El usuario que registra se toma del token, no del cuerpo de la petición.
    prestamo.id_usuario_registra = current_user.id_usuario
    return crud.create_prestamo(db=db, prestamo=prestamo)

@app.get("/prestamos/{id_prestamo}", response_model=schemas.PrestamoResponse, tags=["Préstamos"])
def obtener_prestamo(
    id_prestamo: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    db_prestamo = crud.get_prestamo(db, id_prestamo)
    if not db_prestamo:
        raise HTTPException(404, "Préstamo no encontrado.")
    return crud._serialize_prestamo(db_prestamo)

@app.post("/prestamos/{id_prestamo}/devolver", response_model=schemas.PrestamoResponse, tags=["Préstamos"])
def devolver_prestamo(
    id_prestamo: int,
    devolucion: schemas.PrestamoDevolucion,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.devolver_prestamo(db, id_prestamo, devolucion)

@app.get("/activos/{id_activo}/prestamos", response_model=List[schemas.PrestamoResponse], tags=["Préstamos"])
def listar_prestamos_por_activo(
    id_activo: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_prestamos_por_activo(db, id_activo)

# --- SALAS Y DOCENTES ---
@app.get("/salas/", response_model=List[schemas.SalaResumenResponse], tags=["Salas"])
def listar_salas(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_salas(db, skip=skip, limit=limit)

@app.get("/salas/{id_ubicacion}", response_model=schemas.SalaDetalleResponse, tags=["Salas"])
def obtener_sala(
    id_ubicacion: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    sala = crud.get_sala_detalle(db, id_ubicacion)
    if not sala:
        raise HTTPException(404, "Sala no encontrada.")
    return sala

@app.post("/salas/{id_ubicacion}/docentes", response_model=schemas.SalaDocenteResponse, tags=["Salas"])
def asociar_docente_sala(
    id_ubicacion: int,
    asociacion: schemas.SalaDocenteCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user),
):
    return crud.asociar_docente_sala(
        db,
        id_ubicacion,
        asociacion,
        id_usuario_registra=current_user.id_usuario,
    )

@app.delete("/salas/{id_ubicacion}/docentes/{id_sala_docente}", tags=["Salas"])
def desasociar_docente_sala(
    id_ubicacion: int,
    id_sala_docente: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    asociacion = crud.desasociar_docente_sala(db, id_sala_docente)
    if not asociacion or asociacion.get("id_ubicacion") != id_ubicacion:
        raise HTTPException(404, "Asociación no encontrada.")
    return {"message": "Docente desasociado de la sala."}

@app.get("/docentes/", response_model=List[schemas.DocenteResumenResponse], tags=["Docentes"])
def listar_docentes(
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_docentes(db)

@app.get("/docentes/{id_usuario}", response_model=schemas.DocenteResumenResponse, tags=["Docentes"])
def obtener_docente(
    id_usuario: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    docente = crud.get_docente(db, id_usuario)
    if not docente:
        raise HTTPException(404, "Docente no encontrado.")
    return docente

# --- ASIGNACIONES PERMANENTES ---
@app.get("/asignaciones-activo/", response_model=List[schemas.AsignacionActivoResponse], tags=["Asignaciones de Activo"])
def listar_asignaciones_activo(
    skip: int = 0,
    limit: int = 300,
    id_activo: int | None = None,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_asignaciones_activo(
        db, skip=skip, limit=limit, id_activo=id_activo
    )

@app.get("/activos/{id_activo}/asignacion", response_model=schemas.AsignacionActivoResponse, tags=["Asignaciones de Activo"])
def obtener_asignacion_actual(
    id_activo: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    asignacion = crud.get_asignacion_activa(db, id_activo)
    if not asignacion:
        raise HTTPException(404, "El activo no tiene una asignación activa.")
    return crud._serialize_asignacion_activo(asignacion)

@app.post("/activos/{id_activo}/asignacion", response_model=schemas.AsignacionActivoResponse, tags=["Asignaciones de Activo"])
def asignar_activo(
    id_activo: int,
    datos: schemas.AsignarActivoRequest,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user),
):
    return crud.crear_asignacion_activo(
        db,
        schemas.AsignacionActivoCreate(
            id_activo=id_activo,
            id_usuario_responsable=datos.id_usuario_responsable,
            id_ubicacion=datos.id_ubicacion,
            observaciones=datos.observaciones,
        ),
        id_usuario_registra=current_user.id_usuario,
    )

@app.post("/activos/{id_activo}/trasladar", response_model=schemas.AsignacionActivoResponse, tags=["Asignaciones de Activo"])
def trasladar_activo(
    id_activo: int,
    datos: schemas.TrasladarActivoRequest,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user),
):
    return crud.trasladar_activo_v2(
        db,
        id_activo,
        datos,
        id_usuario_registra=current_user.id_usuario,
    )

@app.post("/asignaciones-activo/", response_model=schemas.AsignacionActivoResponse, tags=["Asignaciones de Activo"])
def crear_asignacion_activo(
    datos: schemas.AsignacionActivoCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user),
):
    return crud.crear_asignacion_activo(
        db,
        datos,
        id_usuario_registra=current_user.id_usuario,
    )

@app.patch("/asignaciones-activo/{id_asignacion_activo}/cerrar", response_model=schemas.AsignacionActivoResponse, tags=["Asignaciones de Activo"])
def cerrar_asignacion_activo(
    id_asignacion_activo: int,
    observaciones: str | None = None,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user),
):
    asignacion = crud.cerrar_asignacion_activo(
        db,
        id_asignacion_activo,
        observaciones=observaciones,
        id_usuario_registra=current_user.id_usuario,
    )
    if not asignacion:
        raise HTTPException(404, "Asignación no encontrada.")
    return asignacion

@app.get("/activos/{id_activo}/historial", response_model=schemas.ActivoHistorialResponse, tags=["Historial"])
def obtener_historial_activo(
    id_activo: int,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    historial = crud.get_historial_activo(db, id_activo)
    if not historial:
        raise HTTPException(404, "Activo no encontrado.")
    return historial
# --- AUDITORÍA ---
@app.get("/auditorias/", response_model=List[schemas.AuditoriaResponse], tags=["Auditoría"])
def listar_auditorias(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    _: models.Usuario = Depends(security.get_current_user),
):
    return crud.get_auditorias(db, skip=skip, limit=limit)

@app.post("/auditorias/", response_model=schemas.AuditoriaResponse, tags=["Auditoría"])
def crear_auditoria(
    auditoria: schemas.AuditoriaCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user),
):
    registro = schemas.AuditoriaCreate(
        id_usuario=current_user.id_usuario,
        accion_realizada=auditoria.accion_realizada,
        detalle_cambio=auditoria.detalle_cambio,
    )
    return crud.create_auditoria(db=db, auditoria=registro)
