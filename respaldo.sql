-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: inventario_institucional
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activos`
--

DROP TABLE IF EXISTS `activos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activos` (
  `id_activo` int NOT NULL AUTO_INCREMENT,
  `codigo_unico` varchar(50) NOT NULL,
  `nombre_activo` varchar(100) NOT NULL,
  `descripcion` text,
  `estado` varchar(50) DEFAULT NULL,
  `id_clase` int NOT NULL,
  `id_ubicacion` int NOT NULL,
  `fecha_adquisicion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_activo`),
  UNIQUE KEY `ix_activos_codigo_unico` (`codigo_unico`),
  KEY `id_clase` (`id_clase`),
  KEY `id_ubicacion` (`id_ubicacion`),
  KEY `ix_activos_id_activo` (`id_activo`),
  CONSTRAINT `activos_ibfk_1` FOREIGN KEY (`id_clase`) REFERENCES `clases_activo` (`id_clase`),
  CONSTRAINT `activos_ibfk_2` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activos`
--

LOCK TABLES `activos` WRITE;
/*!40000 ALTER TABLE `activos` DISABLE KEYS */;
INSERT INTO `activos` VALUES (1,'ACT-001','Computador de Escritorio','Core i7, 16GB RAM','Disponible',1,1,'2026-01-10 00:00:00'),(13,'89','impresora ','','Disponible',1,5,'2026-11-02 23:55:43'),(14,'078','Laptop HP (pentium)','','Disponible',1,1,'2026-11-03 19:33:30');
/*!40000 ALTER TABLE `activos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignaciones`
--

DROP TABLE IF EXISTS `asignaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones` (
  `id_asignacion` int NOT NULL AUTO_INCREMENT,
  `id_activo` int NOT NULL,
  `id_usuario_responsable` int NOT NULL,
  `estado_asignacion` varchar(50) NOT NULL,
  `observaciones` text,
  `fecha_asignacion` datetime DEFAULT NULL,
  `fecha_devolucion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_asignacion`),
  KEY `id_activo` (`id_activo`),
  KEY `id_usuario_responsable` (`id_usuario_responsable`),
  KEY `ix_asignaciones_id_asignacion` (`id_asignacion`),
  CONSTRAINT `asignaciones_ibfk_1` FOREIGN KEY (`id_activo`) REFERENCES `activos` (`id_activo`),
  CONSTRAINT `asignaciones_ibfk_2` FOREIGN KEY (`id_usuario_responsable`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones`
--

LOCK TABLES `asignaciones` WRITE;
/*!40000 ALTER TABLE `asignaciones` DISABLE KEYS */;
INSERT INTO `asignaciones` VALUES (1,1,1,'Devuelto','Entregado en perfectas condiciones',NULL,'2026-11-02 03:34:05'),(2,1,1,'Devuelto','Entregado en perfectas condiciones',NULL,'2026-11-02 03:34:06'),(3,1,1,'Devuelto','Entregado en perfectas condiciones','2026-10-26 20:55:51','2026-11-02 03:34:09'),(4,1,3,'Devuelto','Préstamo institucional','2026-11-01 22:35:46','2026-11-02 03:36:12'),(5,1,3,'Devuelto','Préstamo institucional','2026-11-02 17:22:44','2026-11-03 00:18:50'),(6,13,8,'Devuelto','Préstamo institucional','2026-11-02 20:33:53','2026-11-03 01:33:55'),(7,13,6,'Devuelto','Préstamo institucional','2026-11-02 21:15:55','2026-11-03 02:15:56'),(8,1,6,'Devuelto','Préstamo institucional','2026-11-02 21:57:02','2026-11-03 02:57:12'),(9,14,6,'Devuelto','Préstamo institucional','2026-11-03 14:45:02','2026-11-03 19:45:08'),(10,13,1,'Devuelto','','2026-11-07 19:25:11','2026-11-08 00:25:15');
/*!40000 ALTER TABLE `asignaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditorias`
--

DROP TABLE IF EXISTS `auditorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditorias` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `accion_realizada` varchar(100) NOT NULL,
  `detalle_cambio` text NOT NULL,
  `fecha_hora` datetime DEFAULT (now()),
  PRIMARY KEY (`id_auditoria`),
  KEY `id_usuario` (`id_usuario`),
  KEY `ix_auditorias_id_auditoria` (`id_auditoria`),
  CONSTRAINT `auditorias_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditorias`
--

LOCK TABLES `auditorias` WRITE;
/*!40000 ALTER TABLE `auditorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clases_activo`
--

DROP TABLE IF EXISTS `clases_activo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clases_activo` (
  `id_clase` int NOT NULL AUTO_INCREMENT,
  `nombre_clase` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_clase`),
  KEY `ix_clases_activo_id_clase` (`id_clase`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clases_activo`
--

LOCK TABLES `clases_activo` WRITE;
/*!40000 ALTER TABLE `clases_activo` DISABLE KEYS */;
INSERT INTO `clases_activo` VALUES (1,'Equipos de Cómputo','Computadores portátiles, de escritorio y tablets institucionales');
/*!40000 ALTER TABLE `clases_activo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimientos`
--

DROP TABLE IF EXISTS `mantenimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimientos` (
  `id_mantenimiento` int NOT NULL AUTO_INCREMENT,
  `id_activo` int NOT NULL,
  `tipo_mantenimiento` varchar(50) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `fecha_mantenimiento` datetime DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id_mantenimiento`),
  KEY `id_activo` (`id_activo`),
  KEY `ix_mantenimientos_id_mantenimiento` (`id_mantenimiento`),
  CONSTRAINT `mantenimientos_ibfk_1` FOREIGN KEY (`id_activo`) REFERENCES `activos` (`id_activo`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimientos`
--

LOCK TABLES `mantenimientos` WRITE;
/*!40000 ALTER TABLE `mantenimientos` DISABLE KEYS */;
INSERT INTO `mantenimientos` VALUES (9,13,'Correctivo','piezas desencajadas ','2026-11-02 00:00:00',20000.00),(11,14,'Correctivo','mantenimiento y cambio de pasta termica','2026-11-07 00:00:00',100000.00);
/*!40000 ALTER TABLE `mantenimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos`
--

DROP TABLE IF EXISTS `movimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `id_activo` int NOT NULL,
  `id_usuario` int NOT NULL,
  `tipo_movimiento` varchar(50) NOT NULL,
  `descripcion_detalle` text NOT NULL,
  `fecha_movimiento` datetime DEFAULT (now()),
  PRIMARY KEY (`id_movimiento`),
  KEY `id_activo` (`id_activo`),
  KEY `id_usuario` (`id_usuario`),
  KEY `ix_movimientos_id_movimiento` (`id_movimiento`),
  CONSTRAINT `movimientos_ibfk_1` FOREIGN KEY (`id_activo`) REFERENCES `activos` (`id_activo`),
  CONSTRAINT `movimientos_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos`
--

LOCK TABLES `movimientos` WRITE;
/*!40000 ALTER TABLE `movimientos` DISABLE KEYS */;
INSERT INTO `movimientos` VALUES (1,1,6,'Traslado de Ubicación','Activo trasladado de la ubicación ID 1 a la ubicación ID 1. Motivo: Traslado al nuevo edificio administrativo','2026-10-26 20:59:48');
/*!40000 ALTER TABLE `movimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`),
  KEY `ix_roles_id_rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador',NULL),(4,'Custodio','Administra el sistema, pero no puede modificar a los Administradores'),(5,'Profesor','Docente que puede recibir préstamos'),(6,'Alumno','Estudiante que puede recibir préstamos'),(7,'Visitante','Persona externa que puede recibir préstamos');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicaciones`
--

DROP TABLE IF EXISTS `ubicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicaciones` (
  `id_ubicacion` int NOT NULL AUTO_INCREMENT,
  `nombre_espacio` varchar(100) DEFAULT NULL,
  `edificio_bloque` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_ubicacion`),
  KEY `ix_ubicaciones_id_ubicacion` (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (1,'Sala de Sistemas 101','Bloque A','Sala principal de prácticas de programación y bases de datos'),(2,'Sala de Sistemas 101','Bloque A','Sala principal de prácticas'),(3,'Sala de Sistemas 1','Bloque Administrativo','Primer piso, ala norte'),(4,'Sala de Juntas','Bloque Principal','Segundo piso'),(5,'sala A ','A','Una sala :V'),(6,'Sala sistemas','A','');
/*!40000 ALTER TABLE `ubicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `numero_documento` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `id_rol` int NOT NULL,
  `estado_activo` tinyint(1) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `ix_usuarios_numero_documento` (`numero_documento`),
  KEY `id_rol` (`id_rol`),
  KEY `ix_usuarios_id_usuario` (`id_usuario`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'1023456789','Juan Pérez',1,0,'$2b$12$AwGkfT5qYKcpqko1MDQLnu349zyz5hVmJfNnaKVVcepqn4.t.FcSq','2026-10-24 23:45:44'),(3,'555555555','Prueba Token',1,0,'$2b$12$meO.o6NjxtqFfWfu2DRaie4zj1JEmlEYlE0DIT.QMW2KazuzEbQN2','2026-10-25 05:12:39'),(6,'1001','Carlos Admin',1,0,'$2b$12$5WXdbx4oovW4AlA40cTUqeUwGxZaSLTndGUlmT.D75DilDFmjJ9PK','2026-10-26 20:48:19'),(8,'22222222','naujnecito',1,1,'$2b$12$YYVxkEKftOASBZwbFvyAeejtqxSxdZ9MS7GzKb0.xbWqTxWhMcEqC','2026-10-27 15:06:43');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-08  0:24:37
