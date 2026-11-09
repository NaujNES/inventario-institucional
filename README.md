# 📦 Sistema de Gestión de Inventario Institucional

![Status](https://img.shields.io/badge/Status-Completado-success)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)

Sistema web integral diseñado para la centralización, registro, control y trazabilidad de los activos fijos institucionales. Permite la administración eficiente de recursos, control de préstamos, seguimiento de mantenimientos y gestión de usuarios basada en roles.

## ✨ Características Principales

*   **Autenticación y Seguridad:** Inicio de sesión seguro con tokens JWT y contraseñas encriptadas mediante Bcrypt.
*   **Control de Acceso Basado en Roles (RBAC):** Módulos restringidos según el rol (Administrador, Custodio, etc.).
*   **Gestión de Activos (CRUD):** Registro detallado de bienes con categorías, ubicaciones, estados y fechas de adquisición.
*   **Módulo de Préstamos:** Asignación de activos con bloqueo automático de estado (cambio a "En Uso").
*   **Trazabilidad de Mantenimientos:** Registro de reparaciones que actualiza automáticamente el estado del activo.
*   **Generación de Reportes:** Exportación de inventario en formato CSV compatible con Excel.
*   **Diseño Moderno:** Interfaz de usuario responsiva con soporte para modo claro/oscuro.

## 🛠️ Stack Tecnológico

*   **Frontend:** React.js, Vite, Tailwind CSS, Axios.
*   **Backend:** Python 3.11, FastAPI, SQLAlchemy, JWT (JSON Web Tokens).
*   **Base de Datos:** MySQL 8.0.
*   **Despliegue:** Docker y Docker Compose (Arquitectura de microservicios).

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, es necesario contar con:
1.  [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución en el sistema operativo (Windows, macOS o Linux).
2.  Git (opcional, para clonar el repositorio).

## 🚀 Guía de Instalación y Despliegue

El proyecto está completamente dockerizado para garantizar la portabilidad del entorno sin necesidad de instalar dependencias locales (Node, Python o MySQL).

### Paso 1: Clonar o descargar el proyecto
Clona el repositorio o descomprime el archivo en una carpeta de tu elección y abre una terminal en la raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`).

### Paso 2: Construir y levantar los contenedores
Ejecuta el siguiente comando para descargar las imágenes y compilar la aplicación:

```bash
docker compose up -d --build
Nota: La primera ejecución puede tardar algunos minutos mientras descarga las imágenes base.

Paso 3: Restaurar la Base de Datos (Datos Iniciales)
El contenedor de la base de datos se inicia vacío. Para cargar la estructura y los datos iniciales, asegúrate de tener el archivo respaldo.sql en la raíz del proyecto y ejecuta:

1. Copiar el respaldo al contenedor:


docker cp respaldo.sql proyectoinventarioinstitucional-db-1:/respaldo.sql
2. Ejecutar el script SQL en MySQL:


docker exec -i proyectoinventarioinstitucional-db-1 mysql -uroot -p12345 inventario_institucional -e "source /respaldo.sql"
(Si usas PowerShell, usa docker.exe o la ruta absoluta del ejecutable de Docker).

Paso 4: Acceder a la aplicación
Una vez que los tres contenedores estén en estado "Running" (verde) en Docker Desktop, abre tu navegador web y visita:

👉 http://localhost

🔑 Credenciales de Acceso (Pruebas)
Nota sobre el primer inicio de sesión:
El sistema está programado para crear automáticamente un usuario Administrador la primera vez que se enciende con Docker.

Usuario: 1001

Contraseña: 123456
Una vez dentro, se recomienda ir al módulo de Usuarios y cambiar esta contraseña o crear un usuario personalizado para el administrador real.

🛑 Comandos Útiles de Docker
Detener el proyecto:


docker compose down
Ver logs de errores del backend:


docker logs proyectoinventarioinstitucional-backend-1
Reiniciar un servicio específico:


docker compose restart backend
