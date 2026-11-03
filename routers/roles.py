from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.post(
    "/", response_model=schemas.RolResponse, status_code=status.HTTP_201_CREATED
)
def create_role(rol: schemas.RolCreate, db: Session = Depends(get_db)):
  """Crea un nuevo rol en el sistema."""
  return crud.create_rol(db=db, rol=rol)


@router.get("/", response_model=list[schemas.RolResponse])
def list_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
  """Obtiene la lista de roles disponibles."""
  return crud.get_roles(db, skip=skip, limit=limit)