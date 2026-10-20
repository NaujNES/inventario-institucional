from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Rol(Base):
    __tablename__ = "rol"
    id_rol = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_rol = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text)

    usuarios = relationship("Usuario", back_populates="rol")


class Usuario(Base):
    __tablename__ = "usuario"
    id_usuario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero_documento = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    id_rol = Column(Integer, ForeignKey("rol.id_rol"), nullable=False)
    estado_activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

    rol = relationship("Rol", back_populates="usuarios")
    asignaciones = relationship("Asignacion", back_populates="usuario_responsable")
    movimientos = relationship("Movimiento", back_populates="usuario")
    auditorias = relationship("Auditoria", back_populates="usuario")


class ClaseActivo(Base):
    __tablename__ = "clase_activo"
    id_clase = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_clase = Column(String(100), nullable=False)
    descripcion = Column(Text)

    activos = relationship("ActivoFijo", back_populates="clase")


class Ubicacion(Base):
    __tablename__ = "ubicacion"
    id_ubicacion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_espacio = Column(String(100), nullable=False)
    edificio_bloque = Column(String(50), nullable=False)
    descripcion = Column(Text)

    activos = relationship("ActivoFijo", back_populates="ubicacion")


class ActivoFijo(Base):
    __tablename__ = "activo_fijo"
    id_activo = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_unico = Column(String(5), unique=True, nullable=False)
    denominacion = Column(String(150), nullable=False)
    marca = Column(String(50))
    modelo = Column(String(50))
    numero_serie = Column(String(100))
    fecha_adquisicion = Column(Date, nullable=False)
    valor_comercial = Column(Numeric(12, 2), nullable=False)
    estado_fisico = Column(String(50), nullable=False)
    id_clase = Column(Integer, ForeignKey("clase_activo.id_clase"), nullable=False)
    id_ubicacion = Column(Integer, ForeignKey("ubicacion.id_ubicacion"), nullable=False)

    clase = relationship("ClaseActivo", back_populates="activos")
    ubicacion = relationship("Ubicacion", back_populates="activos")
    asignaciones = relationship("Asignacion", back_populates="activo")
    movimientos = relationship("Movimiento", back_populates="activo")
    mantenimientos = relationship("Mantenimiento", back_populates="activo")


class Asignacion(Base):
    __tablename__ = "asignacion"
    id_asignacion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_activo = Column(Integer, ForeignKey("activo_fijo.id_activo"), nullable=False)
    id_usuario_responsable = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    fecha_asignacion = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    fecha_devolucion = Column(DateTime, nullable=True)
    estado_asignacion = Column(String(50), nullable=False)
    observaciones = Column(Text)

    activo = relationship("ActivoFijo", back_populates="asignaciones")
    usuario_responsable = relationship("Usuario", back_populates="asignaciones")


class Movimiento(Base):
    __tablename__ = "movimiento"
    id_movimiento = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_activo = Column(Integer, ForeignKey("activo_fijo.id_activo"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    tipo_movimiento = Column(String(50), nullable=False)
    descripcion_detalle = Column(Text, nullable=False)
    fecha_movimiento = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

    activo = relationship("ActivoFijo", back_populates="movimientos")
    usuario = relationship("Usuario", back_populates="movimientos")


class Mantenimiento(Base):
    __tablename__ = "mantenimiento"
    id_mantenimiento = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_activo = Column(Integer, ForeignKey("activo_fijo.id_activo"), nullable=False)
    fecha_programada = Column(Date, nullable=False)
    fecha_realizacion = Column(Date, nullable=True)
    tipo_mantenimiento = Column(String(50), nullable=False)
    descripcion_trabajo = Column(Text, nullable=False)
    costo = Column(Numeric(10, 2), default=0.00)

    activo = relationship("ActivoFijo", back_populates="mantenimientos")


class Auditoria(Base):
    __tablename__ = "auditoria"
    id_auditoria = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    accion_realizada = Column(String(100), nullable=False)
    detalle_cambio = Column(Text, nullable=False)
    fecha_hora = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

    usuario = relationship("Usuario", back_populates="auditorias")