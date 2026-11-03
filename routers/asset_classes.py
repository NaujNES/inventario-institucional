from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/clases-activo", tags=["Clases de Activo"])


@router.post(
    "/",
    response_model=schemas.ClaseActivoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_asset_class(
    asset_class: schemas.ClaseActivoCreate, db: Session = Depends(get_db)
):
  """Crea una nueva clase de activo."""
  return crud.create_clase_activo(db=db, clase_activo=asset_class)


@router.get("/", response_model=list[schemas.ClaseActivoResponse])
def list_asset_classes(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
  """Obtiene la lista de todas las clases de activo."""
  return crud.get_clases_activos(db, skip=skip, limit=limit)