from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/ubicaciones", tags=["Ubicaciones"])

@router.post(
    "/",
    response_model=schemas.UbicacionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_location(
    location: schemas.UbicacionCreate, db: Session = Depends(get_db)
):
  """Crea una nueva ubicación o espacio físico."""
  return crud.create_ubicacion(db=db, ubicacion=location)


@router.get("/", response_model=list[schemas.UbicacionResponse])
def list_locations(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
  """Obtiene la lista de ubicaciones registradas."""
  return crud.get_ubicaciones(db, skip=skip, limit=limit)