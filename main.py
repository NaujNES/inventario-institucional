from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

import database
import models
import schemas
import crud
import security

# Crear las tablas automáticamente en MySQL si no existen
models.Base.metadata.create_all(bind=database.engine)

# Inicializar la aplicación FastAPI
app = FastAPI(
    title="API Inventario Institucional",
    description="Sistema backend para la gestión y control de inventario institucional",
    version="1.0.0"
)

# --- RUTA DE AUTENTICACIÓN (LOGIN) ---
@app.post("/token", tags=["Autenticación"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    usuario = crud.get_usuario_por_documento(db, numero_documento=form_data.username)
    if not usuario or not security.verify_password(form_data.password, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Número de documento o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": usuario.numero_documento})
    return {"access_token": access_token, "token_type": "bearer"}


# --- ENDPOINTS PARA ROLES ---
@app.post("/roles/", response_model=schemas.RolResponse, tags=["Roles"])
def crear_rol(rol: schemas.RolCreate, db: Session = Depends(database.get_db)):
    return crud.create_rol(db=db, rol=rol)

@app.get("/roles/", response_model=List[schemas.RolResponse], tags=["Roles"])
def listar_roles(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_roles(db, skip=skip, limit=limit)


# --- ENDPOINTS PARA USUARIOS ---
@app.post("/usuarios/", response_model=schemas.UsuarioResponse, tags=["Usuarios"])
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_usuario_por_documento(db, numero_documento=usuario.numero_documento)
    if db_user:
        raise HTTPException(status_code=400, detail="El número de documento ya se encuentra registrado")
    return crud.create_usuario(db=db, usuario=usuario)

@app.get("/usuarios/", response_model=List[schemas.UsuarioResponse], tags=["Usuarios"])
def listar_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.Usuario = Depends(security.get_current_user)):
    return crud.get_usuarios(db, skip=skip, limit=limit)


# --- ENDPOINTS PARA CLASES DE ACTIVO ---
@app.post("/clases-activo/", response_model=schemas.ClaseActivoResponse, tags=["Clases de Activo"])
def crear_clase_activo(clase: schemas.ClaseActivoCreate, db: Session = Depends(database.get_db)):
    return crud.create_clase_activo(db=db, clase=clase)

@app.get("/clases-activo/", response_model=List[schemas.ClaseActivoResponse], tags=["Clases de Activo"])
def listar_clases_activo(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_clases_activo(db, skip=skip, limit=limit)


# --- ENDPOINTS PARA UBICACIONES ---
@app.post("/ubicaciones/", response_model=schemas.UbicacionResponse, tags=["Ubicaciones"])
def crear_ubicacion(ubicacion: schemas.UbicacionCreate, db: Session = Depends(database.get_db)):
    return crud.create_ubicacion(db=db, ubicacion=ubicacion)

@app.get("/ubicaciones/", response_model=List[schemas.UbicacionResponse], tags=["Ubicaciones"])
def listar_ubicaciones(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_ubicaciones(db, skip=skip, limit=limit)


# --- ENDPOINTS PARA ACTIVOS FIJOS ---
@app.post("/activos/", response_model=schemas.ActivoFijoResponse, tags=["Activos Fijos"])
def crear_activo_fijo(activo: schemas.ActivoFijoCreate, db: Session = Depends(database.get_db), current_user: models.Usuario = Depends(security.get_current_user)):
    db_activo = crud.get_activo_por_codigo(db, codigo_unico=activo.codigo_unico)
    if db_activo:
        raise HTTPException(status_code=400, detail="El código único del activo ya está registrado")
    return crud.create_activo_fijo(db=db, activo=activo)

@app.get("/activos/", response_model=List[schemas.ActivoFijoResponse], tags=["Activos Fijos"])
def listar_activos_fijos(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_activos_fijos(db, skip=skip, limit=limit)


# --- ENDPOINTS PARA ASIGNACIONES ---
@app.post("/asignaciones/", response_model=schemas.AsignacionResponse, tags=["Asignaciones"])
def crear_asignacion(asignacion: schemas.AsignacionCreate, db: Session = Depends(database.get_db), current_user: models.Usuario = Depends(security.get_current_user)):
    return crud.create_asignacion(db=db, asignacion=asignacion)

@app.get("/asignaciones/", response_model=List[schemas.AsignacionResponse], tags=["Asignaciones"])
def listar_asignaciones(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_asignaciones(db, skip=skip, limit=limit)


# --- ENDPOINTS PARA MOVIMIENTOS ---
@app.post("/movimientos/", response_model=schemas.MovimientoResponse, tags=["Movimientos"])
def crear_movimiento(movimiento: schemas.MovimientoCreate, db: Session = Depends(database.get_db), current_user: models.Usuario = Depends(security.get_current_user)):
    return crud.create_movimiento(db=db, movimiento=movimiento)

@app.get("/movimientos/", response_model=List[schemas.MovimientoResponse], tags=["Movimientos"])
def listar_movimientos(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_movimientos(db, skip=skip, limit=limit)


# --- ENDPOINTS PARA MANTENIMIENTOS ---
@app.post("/mantenimientos/", response_model=schemas.MantenimientoResponse, tags=["Mantenimientos"])
def crear_mantenimiento(mantenimiento: schemas.MantenimientoCreate, db: Session = Depends(database.get_db), current_user: models.Usuario = Depends(security.get_current_user)):
    return crud.create_mantenimiento(db=db, mantenimiento=mantenimiento)

@app.get("/mantenimientos/", response_model=List[schemas.MantenimientoResponse], tags=["Mantenimientos"])
def listar_mantenimientos(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_mantenimientos(db, skip=skip, limit=limit)


# --- ENDPOINTS PARA AUDITORÍA ---
@app.get("/auditorias/", response_model=List[schemas.AuditoriaResponse], tags=["Auditoría"])
def listar_auditorias(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.Usuario = Depends(security.get_current_user)):
    return crud.get_auditorias(db, skip=skip, limit=limit)