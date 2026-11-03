from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/mantenimientos", tags=["Mantenimientos"])


@router.post(
    "/",
    response_model=schemas.MantenimientoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_maintenance(
    maintenance: schemas.MantenimientoCreate, db: Session = Depends(get_db)
):
  """Registra un nuevo mantenimiento para un activo."""
  return crud.create_mantenimiento(db=db, mantenimiento=maintenance)


@router.get("/", response_model=list[schemas.MantenimientoResponse])
def list_maintenances(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
  """Obtiene la lista de todos los mantenimientos registrados."""
  return crud.get_mantenimientos(db, skip=skip, limit=limit)


@router.patch(
    "/{id_mantenimiento}/completar",
    response_model=schemas.MantenimientoResponse,
)
def finalizar_mantenimiento(
    id_mantenimiento: int, db: Session = Depends(get_db)
):
  """Finaliza o completa el estado de un mantenimiento."""
  db_mantenimiento = crud.completar_mantenimiento(
      db=db, id_mantenimiento=id_mantenimiento
  )
  if not db_mantenimiento:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No se encontró el registro de mantenimiento.",
    )
  return db_mantenimiento


@router.delete(
    "/{id_mantenimiento}", response_model=schemas.MantenimientoResponse
)
def delete_maintenance(id_mantenimiento: int, db: Session = Depends(get_db)):
  """Elimina un registro de mantenimiento."""
  db_mantenimiento = crud.delete_mantenimiento(
      db=db, id_mantenimiento=id_mantenimiento
  )
  if not db_mantenimiento:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No se encontró el registro de mantenimiento para eliminar.",
    )
  return db_mantenimiento