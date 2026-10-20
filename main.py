from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    verify_password,
)
import models
import schemas
import crud
from database import engine, get_db

# Crea las tablas si aún no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Inventario Institucional SENA",
    version="1.0.0",
    description="Back-end para la gestión de activos fijos, usuarios y auditoría."
)

@app.get("/")
def read_root():
    return {
        "estado": "Conectado con éxito",
        "proyecto": "inventario_institucional",
        "mensaje": "¡El servidor FastAPI está activo y enlazado con MySQL!"
    }

# --- ENDPOINTS ROL ---
@app.post("/roles/", response_model=schemas.RolOut)
def crear_rol(rol: schemas.RolCreate, db: Session = Depends(get_db)):
    return crud.create_rol(db=db, rol=rol)

@app.get("/roles/", response_model=List[schemas.RolOut])
def listar_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_roles(db=db, skip=skip, limit=limit)

# --- ENDPOINTS USUARIO ---
@app.post("/usuarios/", response_model=schemas.UsuarioOut)
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_user = crud.get_usuario_por_documento(db, numero_documento=usuario.numero_documento)
    if db_user:
        raise HTTPException(status_code=400, detail="El número de documento ya está registrado.")
    return crud.create_usuario(db=db, usuario=usuario)

@app.get("/usuarios/", response_model=List[schemas.UsuarioOut])
def listar_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_usuarios(db=db, skip=skip, limit=limit)

@app.post("/login")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # Buscar al usuario por numero_documento (OAuth2 usa 'username' por defecto)
    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.numero_documento == form_data.username)
        .first()
    )

    if not usuario or not verify_password(form_data.password, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Número de documento o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Crear el token JWT con expiración
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario.numero_documento, "id_rol": usuario.id_rol},
        expires_delta=access_token_expires,
    )

    return {"access_token": access_token, "token_type": "bearer"}
# --- ENDPOINTS UBICACIÓN ---
@app.post("/ubicaciones/", response_model=schemas.UbicacionOut)
def crear_ubicacion(ubicacion: schemas.UbicacionCreate, db: Session = Depends(get_db)):
    return crud.create_ubicacion(db=db, ubicacion=ubicacion)

@app.get("/ubicaciones/", response_model=List[schemas.UbicacionOut])
def listar_ubicaciones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_ubicaciones(db=db, skip=skip, limit=limit)

# --- ENDPOINTS CLASE ACTIVO ---
@app.post("/clases-activo/", response_model=schemas.ClaseActivoOut)
def crear_clase_activo(clase: schemas.ClaseActivoCreate, db: Session = Depends(get_db)):
    return crud.create_clase_activo(db=db, clase=clase)

@app.get("/clases-activo/", response_model=List[schemas.ClaseActivoOut])
def listar_clases_activo(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_clases_activo(db=db, skip=skip, limit=limit)

# --- ENDPOINTS ACTIVO FIJO ---
@app.post("/activos-fijos/", response_model=schemas.ActivoFijoOut)
def crear_activo_fijo(activo: schemas.ActivoFijoCreate, db: Session = Depends(get_db)):
    db_activo = crud.get_activo_fijo_por_codigo(db, codigo_unico=activo.codigo_unico)
    if db_activo:
        raise HTTPException(status_code=400, detail="El código único de activo ya existe.")
    return crud.create_activo_fijo(db=db, activo=activo)

@app.get("/activos-fijos/", response_model=List[schemas.ActivoFijoOut])
def listar_activos_fijos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_activos_fijos(db=db, skip=skip, limit=limit)




    # --- ENDPOINTS ASIGNACIÓN ---
@app.post("/asignaciones/", response_model=schemas.AsignacionOut)
def crear_asignacion(asignacion: schemas.AsignacionCreate, db: Session = Depends(get_db)):
    return crud.create_asignacion(db=db, asignacion=asignacion)

@app.get("/asignaciones/", response_model=List[schemas.AsignacionOut])
def listar_asignaciones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_asignaciones(db=db, skip=skip, limit=limit)

# --- ENDPOINTS MOVIMIENTO ---
@app.post("/movimientos/", response_model=schemas.MovimientoOut)
def crear_movimiento(movimiento: schemas.MovimientoCreate, db: Session = Depends(get_db)):
    return crud.create_movimiento(db=db, movimiento=movimiento)

@app.get("/movimientos/", response_model=List[schemas.MovimientoOut])
def listar_movimientos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_movimientos(db=db, skip=skip, limit=limit)

# --- ENDPOINTS MANTENIMIENTO ---
@app.post("/mantenimientos/", response_model=schemas.MantenimientoOut)
def crear_mantenimiento(mantenimiento: schemas.MantenimientoCreate, db: Session = Depends(get_db)):
    return crud.create_mantenimiento(db=db, mantenimiento=mantenimiento)

@app.get("/mantenimientos/", response_model=List[schemas.MantenimientoOut])
def listar_mantenimientos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_mantenimientos(db=db, skip=skip, limit=limit)

# --- ENDPOINTS AUDITORÍA ---
@app.post("/auditorias/", response_model=schemas.AuditoriaOut)
def crear_auditoria(auditoria: schemas.AuditoriaCreate, db: Session = Depends(get_db)):
    return crud.create_auditoria(db=db, auditoria=auditoria)

@app.get("/auditorias/", response_model=List[schemas.AuditoriaOut])
def listar_auditorias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_auditorias(db=db, skip=skip, limit=limit)


    from fastapi import Depends
from security import oauth2_scheme

@app.get("/perfil/mio")
def ver_mi_perfil(token: str = Depends(oauth2_scheme)):
    return {
        "mensaje": "¡Estás autenticado correctamente con JWT!",
        "tu_token": token
    }