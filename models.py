from database import Base
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class Rol(Base):
  __tablename__ = 'roles'

  id_rol = Column(Integer, primary_key=True, index=True)
  nombre_rol = Column(String(50), nullable=False, unique=True)
  descripcion = Column(String(255), nullable=True)

  usuarios = relationship('Usuario', back_populates='rol')


class Ubicacion(Base):
  __tablename__ = 'ubicaciones'

  id_ubicacion = Column(
      Integer, primary_key=True, index=True, autoincrement=True
  )
  nombre_espacio = Column(String(100), nullable=False)
  edificio_bloque = Column(String(100), nullable=True)
  descripcion = Column(String(255), nullable=True)

  activos = relationship('ActivoFijo', back_populates='ubicacion')
  docentes = relationship(
      'SalaDocente',
      back_populates='sala',
      order_by='SalaDocente.fecha_asociacion',
  )


class ClaseActivo(Base):
  __tablename__ = 'clases_activo'

  id_clase = Column(
      Integer, primary_key=True, index=True, autoincrement=True
  )
  nombre_clase = Column(String(100), nullable=False)
  descripcion = Column(String(255), nullable=True)

  activos = relationship('ActivoFijo', back_populates='clase')


class Usuario(Base):
  __tablename__ = 'usuarios'

  id_usuario = Column(Integer, primary_key=True, index=True)
  numero_documento = Column(String(50), unique=True, index=True, nullable=False)
  nombre = Column(String(100), nullable=False)
  id_rol = Column(Integer, ForeignKey('roles.id_rol'), nullable=False)
  estado_activo = Column(Boolean, default=True)
  password = Column(String(255), nullable=False)
  fecha_creacion = Column(DateTime, server_default=func.now())

  rol = relationship('Rol', back_populates='usuarios')
  asignaciones = relationship('Asignacion', back_populates='usuario')
  salas_asociadas = relationship(
      'SalaDocente', back_populates='docente', order_by='SalaDocente.fecha_asociacion'
  )
  activos_asignados = relationship(
      'AsignacionActivo',
      back_populates='responsable',
      foreign_keys='AsignacionActivo.id_usuario_responsable',
      order_by='AsignacionActivo.fecha_asignacion',
  )


class ActivoFijo(Base):
  __tablename__ = 'activos'

  id_activo = Column(Integer, primary_key=True, index=True)
  codigo_unico = Column(String(100), unique=True, index=True)
  nombre_activo = Column(String(150), nullable=False)
  descripcion = Column(Text, nullable=True)
  # Estados: Disponible, Prestado, Mantenimiento, Dado de baja
  estado = Column(String(50), default='Disponible')
  id_clase = Column(
      Integer, ForeignKey('clases_activo.id_clase'), nullable=False
  )
  id_ubicacion = Column(
      Integer, ForeignKey('ubicaciones.id_ubicacion'), nullable=False
  )
  fecha_adquisicion = Column(DateTime, nullable=True)

  clase = relationship('ClaseActivo', back_populates='activos')
  ubicacion = relationship('Ubicacion', back_populates='activos')
  mantenimientos = relationship('Mantenimiento', back_populates='activo')
  asignaciones = relationship('Asignacion', back_populates='activo')
  movimientos = relationship('Movimiento', back_populates='activo')
  prestamos = relationship(
      'Prestamo',
      back_populates='activo',
      order_by='Prestamo.fecha_prestamo',
  )
  asignaciones_activo = relationship(
      'AsignacionActivo',
      back_populates='activo',
      order_by='AsignacionActivo.fecha_asignacion',
  )
  historial_cambios = relationship(
      'HistorialActivo',
      back_populates='activo',
      order_by='HistorialActivo.fecha',
  )


class Asignacion(Base):
  """Tabla heredada de asignaciones. Se conserva para no perder historial."""

  __tablename__ = 'asignaciones'

  id_asignacion = Column(Integer, primary_key=True, index=True)
  id_activo = Column(Integer, ForeignKey('activos.id_activo'), nullable=False)
  id_usuario_responsable = Column(
      Integer, ForeignKey('usuarios.id_usuario'), nullable=False
  )
  estado_asignacion = Column(String(50), nullable=False)
  observaciones = Column(Text, nullable=True)
  fecha_asignacion = Column(DateTime, server_default=func.now())
  fecha_devolucion = Column(DateTime, nullable=True)

  activo = relationship('ActivoFijo', back_populates='asignaciones')
  usuario = relationship('Usuario', back_populates='asignaciones')


class Movimiento(Base):
  __tablename__ = 'movimientos'

  id_movimiento = Column(Integer, primary_key=True, index=True)
  id_activo = Column(Integer, ForeignKey('activos.id_activo'), nullable=False)
  id_usuario = Column(Integer, ForeignKey('usuarios.id_usuario'), nullable=False)
  tipo_movimiento = Column(String(50), nullable=False)
  descripcion_detalle = Column(Text, nullable=False)
  fecha_movimiento = Column(DateTime, server_default=func.now())

  activo = relationship('ActivoFijo', back_populates='movimientos')
  usuario = relationship('Usuario')


class Mantenimiento(Base):
  __tablename__ = 'mantenimientos'

  id_mantenimiento = Column(Integer, primary_key=True, index=True)
  id_activo = Column(Integer, ForeignKey('activos.id_activo'))
  tipo_mantenimiento = Column(String(50), nullable=False)
  descripcion = Column(Text, nullable=True)
  costo = Column(Float, nullable=False)
  fecha_mantenimiento = Column(DateTime, nullable=True)

  activo = relationship('ActivoFijo', back_populates='mantenimientos')


class Auditoria(Base):
  __tablename__ = 'auditorias'

  id_auditoria = Column(Integer, primary_key=True, index=True)
  id_usuario = Column(Integer, ForeignKey('usuarios.id_usuario'), nullable=False)
  accion_realizada = Column(String(100), nullable=False)
  detalle_cambio = Column(Text, nullable=False)
  fecha_hora = Column(DateTime, server_default=func.now())

  usuario = relationship('Usuario')


# =====================================================================
# NUEVAS ENTIDADES: PRÉSTAMOS, SALAS/DOCENTES Y ASIGNACIONES
# =====================================================================


class Prestamo(Base):
  """Préstamo temporal de un activo a un estudiante, docente o visitante."""

  __tablename__ = 'prestamos'

  id_prestamo = Column(Integer, primary_key=True, index=True)
  id_activo = Column(
      Integer, ForeignKey('activos.id_activo'), nullable=False, index=True
  )
  nombre_solicitante = Column(String(150), nullable=False)
  grado = Column(String(50), nullable=True)
  fecha_prestamo = Column(DateTime, nullable=False, server_default=func.now())
  actividad = Column(String(255), nullable=True)
  fecha_entrega = Column(DateTime, nullable=True)
  fecha_devolucion_esperada = Column(DateTime, nullable=True)
  observaciones_entrega = Column(Text, nullable=True)
  estado_prestamo = Column(String(30), nullable=False, default='Activo')
  fecha_devolucion_real = Column(DateTime, nullable=True)
  observaciones_devolucion = Column(Text, nullable=True)
  persona_recibe_devolucion = Column(String(150), nullable=True)
  estado_devolucion = Column(String(50), nullable=True)
  id_usuario_registra = Column(
      Integer, ForeignKey('usuarios.id_usuario'), nullable=True
  )
  id_asignacion_legado = Column(Integer, unique=True, nullable=True)
  fecha_creacion = Column(DateTime, server_default=func.now())

  activo = relationship('ActivoFijo', back_populates='prestamos')
  componentes = relationship(
      'PrestamoComponente',
      back_populates='prestamo',
      cascade='all, delete-orphan',
      order_by='PrestamoComponente.id_componente_prestamo',
  )
  usuario_registra = relationship(
      'Usuario', foreign_keys=[id_usuario_registra]
  )


class PrestamoComponente(Base):
  """Estado de entrega y devolución de cada componente del activo."""

  __tablename__ = 'prestamo_componentes'

  id_componente_prestamo = Column(Integer, primary_key=True, index=True)
  id_prestamo = Column(
      Integer, ForeignKey('prestamos.id_prestamo'), nullable=False, index=True
  )
  nombre_componente = Column(String(120), nullable=False)
  estado_entrega = Column(String(30), nullable=False, default='Bueno')
  observacion_entrega = Column(Text, nullable=True)
  estado_devolucion = Column(String(30), nullable=True)
  observacion_devolucion = Column(Text, nullable=True)

  prestamo = relationship('Prestamo', back_populates='componentes')


class SalaDocente(Base):
  """Docentes responsables de una sala o espacio institucional."""

  __tablename__ = 'sala_docentes'
  __table_args__ = (
      UniqueConstraint('id_ubicacion', 'id_usuario', name='uq_sala_docente'),
  )

  id_sala_docente = Column(Integer, primary_key=True, index=True)
  id_ubicacion = Column(
      Integer, ForeignKey('ubicaciones.id_ubicacion'), nullable=False, index=True
  )
  id_usuario = Column(
      Integer, ForeignKey('usuarios.id_usuario'), nullable=False, index=True
  )
  es_responsable_principal = Column(Boolean, default=False)
  observaciones = Column(Text, nullable=True)
  activa = Column(Boolean, default=True)
  fecha_asociacion = Column(DateTime, server_default=func.now())

  sala = relationship('Ubicacion', back_populates='docentes')
  docente = relationship('Usuario', back_populates='salas_asociadas')


class AsignacionActivo(Base):
  """Responsable permanente (custodia) de un activo dentro de una sala.

  Cada cambio de responsable o de ubicación cierra la fila activa y crea una
  nueva, conservando así el historial completo.
  """

  __tablename__ = 'asignaciones_activo'

  id_asignacion_activo = Column(Integer, primary_key=True, index=True)
  id_activo = Column(
      Integer, ForeignKey('activos.id_activo'), nullable=False, index=True
  )
  id_usuario_responsable = Column(
      Integer, ForeignKey('usuarios.id_usuario'), nullable=False, index=True
  )
  id_ubicacion = Column(
      Integer, ForeignKey('ubicaciones.id_ubicacion'), nullable=False, index=True
  )
  estado = Column(String(30), nullable=False, default='Activa')
  observaciones = Column(Text, nullable=True)
  fecha_asignacion = Column(DateTime, server_default=func.now())
  fecha_fin = Column(DateTime, nullable=True)
  id_usuario_registra = Column(
      Integer, ForeignKey('usuarios.id_usuario'), nullable=True
  )

  activo = relationship('ActivoFijo', back_populates='asignaciones_activo')
  responsable = relationship(
      'Usuario',
      back_populates='activos_asignados',
      foreign_keys=[id_usuario_responsable],
  )
  sala = relationship('Ubicacion')
  usuario_registra = relationship(
      'Usuario', foreign_keys=[id_usuario_registra]
  )


class HistorialActivo(Base):
  """Bitácora de cambios de responsable, ubicación y estado del activo."""

  __tablename__ = 'historial_activo'

  id_historial = Column(Integer, primary_key=True, index=True)
  id_activo = Column(
      Integer, ForeignKey('activos.id_activo'), nullable=False, index=True
  )
  tipo_cambio = Column(String(60), nullable=False)
  valor_anterior = Column(String(255), nullable=True)
  valor_nuevo = Column(String(255), nullable=True)
  observaciones = Column(Text, nullable=True)
  id_usuario = Column(
      Integer, ForeignKey('usuarios.id_usuario'), nullable=True
  )
  fecha = Column(DateTime, server_default=func.now())

  activo = relationship('ActivoFijo', back_populates='historial_cambios')
  usuario = relationship('Usuario')
