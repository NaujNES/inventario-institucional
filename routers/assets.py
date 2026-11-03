from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/activos", tags=["Activos Fijos"])


@router.post(
    "/",
    response_model=schemas.ActivoFijoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_asset(activo: schemas.ActivoFijoCreate, db: Session = Depends(get_db)):
  """Registra un nuevo activo fijo en el sistema."""
  existente = crud.get_activo_por_codigo(db, codigo_unico=activo.codigo_unico)
  if existente:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Ya existe un activo con el código '{activo.codigo_unico}'.",
    )
  return crud.create_activo_fijo(db=db, activo=activo)


@router.get("/", response_model=list[schemas.ActivoFijoResponse])
def list_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
  """Obtiene la lista de todos los activos fijos."""
  return crud.get_activos_fijos(db, skip=skip, limit=limit)


@router.get("/{id_activo}", response_model=schemas.ActivoFijoResponse)
def get_asset(id_activo: int, db: Session = Depends(get_db)):
  """Obtiene los detalles de un activo fijo por su ID."""
  db_activo = crud.get_activo_fijo(db, id_activo=id_activo)
  if not db_activo:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Activo fijo no encontrado"
    )
  return db_activo


@router.put("/{id_activo}", response_model=schemas.ActivoFijoResponse)
def update_asset(
    id_activo: int, activo: schemas.ActivoFijoCreate, db: Session = Depends(get_db)
):
  """Actualiza la información de un activo fijo existente."""
  db_activo = crud.update_activo_fijo(db, id_activo=id_activo, activo=activo)
  if not db_activo:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Activo fijo no encontrado"
    )
  return db_activo


@router.delete("/{id_activo}", status_code=status.HTTP_200_OK)
def delete_asset(id_activo: int, db: Session = Depends(get_db)):
  """Elimina un activo fijo."""
  return crud.delete_activo_fijo(db, id_activo=id_activo)