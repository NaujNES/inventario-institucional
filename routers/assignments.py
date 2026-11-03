from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud
import schemas
from database import get_db  # Ajusta según cómo importes tu sesión de BD

router = APIRouter(prefix="/asignaciones", tags=["Asignaciones"])


@router.post(
    "/",
    response_model=schemas.AsignacionResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_asignacion(
    asignacion: schemas.AsignacionCreate, db: Session = Depends(get_db)
):
  """Registra una nueva asignación de activo a un usuario y cambia el estado del activo a 'En uso'."""
  return crud.create_asignacion(db=db, asignacion=asignacion)


@router.get("/", response_model=list[schemas.AsignacionResponse])
def listar_asignaciones(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
  """Obtiene la lista de todas las asignaciones registradas."""
  return crud.get_asignaciones(db, skip=skip, limit=limit)


@router.get("/{id_asignacion}", response_model=schemas.AsignacionResponse)
def obtener_asignacion(id_asignacion: int, db: Session = Depends(get_db)):
  """Busca una asignación específica por su ID."""
  db_asignacion = crud.get_asignacion(db, id_asignacion=id_asignacion)
  if not db_asignacion:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Asignación no encontrada"
    )
  return db_asignacion


@router.patch(
    "/{id_asignacion}/devolver", response_model=schemas.AsignacionResponse
)
def devolver_asignacion(id_asignacion: int, db: Session = Depends(get_db)):
  """Marca una asignación como devuelta y libera el activo."""
  db_asignacion = crud.devolver_asignacion(db=db, id_asignacion=id_asignacion)
  if not db_asignacion:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
            "No se pudo procesar la devolución. La asignación no existe o ya"
            " fue devuelta."
        ),
    )
  return db_asignacion