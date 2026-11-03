from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import models
from security import verify_password  # O la función que uses para verificar contraseñas
from sqlalchemy.orm import Session

router = APIRouter(tags=["Authentication"])


@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
  # Buscar al usuario por su número de documento (o username que mande el front)
  user = (
      db.query(models.Usuario)
      .filter(models.Usuario.numero_documento == form_data.username)
      .first()
  )

  # Verificar si el usuario existe y si la contraseña coincide
  # (Si usas passlib con verify_password, compárala aquí. Si guardaste el hash, valídalo)
  if not user or not verify_password(form_data.password, user.password):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales incorrectas o usuario no encontrado",
        headers={"WWW-Authenticate": "Bearer"},
    )

  # Retornar el token de acceso que espera tu frontend
  return {
      "access_token": f"fake-jwt-token-for-{user.numero_documento}",
      "token_type": "bearer",
  }