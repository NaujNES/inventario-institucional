from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class Rol(Base):
    __tablename__ = "roles"
    
    id_rol = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String(50), nullable=False, unique=True)
    
    usuarios = relationship("Usuario", back_populates="rol")


class Ubicacion(Base):
    __tablename__ = "ubicaciones"
    
    id_ubicacion = Column(Integer, primary_key=True, index=True)
    nombre_ubicacion = Column(String(100), nullable=False)
    
    activos = relationship("ActivoFijo", back_populates="ubicacion")


class ClaseActivo(Base):
    __tablename__ = "clases_activo"
    
    id_clase = Column(Integer, primary_key=True, index=True)
    nombre_clase = Column(String(100), nullable=False)
    
    activos = relationship("ActivoFijo", back_populates="clase")


class Usuario(Base):
    __tablename__ = "usuarios"
    
    id_usuario = Column(Integer, primary_key=True, index=True)
    numero_documento = Column(String(50), unique=True, index=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    id_rol = Column(Integer, ForeignKey("roles.id_rol"), nullable=False)
    estado_activo = Column(Boolean, default=True)
    password = Column(String(255), nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    
    rol = relationship("Rol", back_populates="usuarios")
    asignaciones = relationship("Asignacion", back_populates="usuario")


class ActivoFijo(Base):
    __tablename__ = "activos"

    id_activo = Column(Integer, primary_key=True, index=True)
    codigo_unico = Column(String(50), unique=True, index=True, nullable=False)
    nombre_activo = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    estado = Column(String(50), default="Disponible")
    id_clase = Column(Integer, ForeignKey("clases_activo.id_clase"), nullable=False)
    id_ubicacion = Column(Integer, ForeignKey("ubicaciones.id_ubicacion"), nullable=False)
    fecha_adquisicion = Column(DateTime, default=datetime.utcnow)

    clase = relationship("ClaseActivo", back_populates="activos", foreign_keys=[id_clase])
    ubicacion = relationship("Ubicacion", back_populates="activos", foreign_keys=[id_ubicacion])
    mantenimientos = relationship("Mantenimiento", back_populates="activo")
    asignaciones = relationship("Asignacion", back_populates="activo")


class Asignacion(Base):
    __tablename__ = "asignaciones"
    
    id_asignacion = Column(Integer, primary_key=True, index=True)
    id_activo = Column(Integer, ForeignKey("activos.id_activo"), nullable=False)
    id_usuario_responsable = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    estado_asignacion = Column(String(50), nullable=False)
    observaciones = Column(Text, nullable=True)
    fecha_asignacion = Column(DateTime, default=datetime.utcnow)

    activo = relationship("ActivoFijo", back_populates="asignaciones", foreign_keys=[id_activo])
    usuario = relationship("Usuario", back_populates="asignaciones", foreign_keys=[id_usuario_responsable])


class Mantenimiento(Base):
    __tablename__ = "mantenimientos"
    
    id_mantenimiento = Column(Integer, primary_key=True, index=True)
    id_activo = Column(Integer, ForeignKey("activos.id_activo"), nullable=False)
    descripcion = Column(Text, nullable=False)
    fecha_mantenimiento = Column(DateTime, default=datetime.utcnow)
    
    activo = relationship("ActivoFijo", back_populates="mantenimientos", foreign_keys=[id_activo])