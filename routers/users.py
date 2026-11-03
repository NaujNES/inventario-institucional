from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.post(
    "/",
    response_model=schemas.UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(user: schemas.UsuarioCreate, db: Session = Depends(get_db)):
  """Crea un nuevo usuario en el sistema con contraseña hasheada."""
  db_user = crud.get_usuario_por_documento(db, numero_documento=user.numero_documento)
  if db_user:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Ya existe un usuario registrado con el documento {user.numero_documento}.",
    )
  return crud.create_usuario(db=db, usuario=user)


@router.get("/", response_model=list[schemas.UsuarioResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
  """Lista todos los usuarios registrados en el sistema."""
  return crud.get_usuarios(db, skip=skip, limit=limit)


@router.get("/{id_usuario}", response_model=schemas.UsuarioResponse)
def get_user(id_usuario: int, db: Session = Depends(get_db)):
  """Obtiene el detalle de un usuario específico por su ID."""
  db_user = crud.get_usuario(db, id_usuario=id_usuario)
  if not db_user:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Usuario no encontrado.",
    )
  return db_user


@router.delete("/{id_usuario}", response_model=schemas.UsuarioResponse)
def delete_user(id_usuario: int, db: Session = Depends(get_db)):
  """Elimina un usuario del sistema."""
  db_user = crud.delete_usuario(db, id_usuario=id_usuario)
  if not db_user:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Usuario no encontrado para eliminar.",
    )
  return db_user

@router.patch("/{id_usuario}", response_model=schemas.UsuarioResponse)
def update_user(
    id_usuario: int, user: schemas.UsuarioUpdate, db: Session = Depends(get_db)
):
  """Actualiza los datos o el rol de un usuario existente."""
  db_user = crud.update_usuario(db=db, id_usuario=id_usuario, usuario=user)
  if not db_user:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Usuario no encontrado para actualizar.",
    )
  return db_user