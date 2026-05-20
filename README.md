# 🛒 Gestor de Pedidos

Sistema completo de gestión de pedidos con carrito de compras, pasarela de pagos, facturación electrónica y despliegue automatizado con Jenkins CI/CD en AWS.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE                          │
│              React + Vite (Nginx)                   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────┐
│                   BACKEND                           │
│           Spring Boot 3.4 + Java 21                 │
│    Auth │ Productos │ Carrito │ Pagos │ Facturas     │
└──────────────────────┬──────────────────────────────┘
                       │ JDBC
┌──────────────────────▼──────────────────────────────┐
│                 BASE DE DATOS                       │
│         PostgreSQL 15 + Liquibase                   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, Vite, Framer Motion, Axios |
| Backend | Spring Boot 3.4.3, Java 21, JPA/Hibernate |
| Base de datos | PostgreSQL 15, Liquibase |
| Contenedores | Docker, Docker Compose |
| CI/CD | Jenkins, GitHub |
| Cloud | AWS EC2 |
| Registry | Docker Hub |

---

## 📋 Funcionalidades

### 👤 Roles
- **ADMIN** — Gestión completa del sistema
- **USUARIO** — Compras, carrito y seguimiento de pedidos

### 🛍️ Módulos
- **Autenticación** — Login/Registro con roles
- **Catálogo** — Productos con imágenes, categorías y filtros
- **Carrito** — Gestión de items con control de stock
- **Pedidos** — Seguimiento con línea de tiempo (CREADO → EN_CAMINO → ENTREGADO)
- **Pagos** — Pasarela simulada (tarjeta, transferencia, efectivo)
- **Reembolsos** — Solicitud de usuario + aprobación de admin
- **Facturas** — Generación automática de factura electrónica con PDF
- **Reportes** — PDF de ventas e inventario
- **Notificaciones** — Tiempo real con SSE

---

## 🌐 Ambientes desplegados

| Ambiente | Frontend | Backend |
|----------|----------|---------|
| DEV | http://3.129.13.116:5174 | http://3.129.13.116:8081 |
| QA | http://18.223.119.161:5175 | http://18.223.119.161:8082 |

### Cuentas de prueba
| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | ADMIN |
| `usuario1` | `user123` | USUARIO |

---

## 🔧 Instalación local

### Requisitos
- Java 21
- Maven 3.8+
- Node.js 20+
- PostgreSQL 15
- Docker (opcional)

### Backend

```bash
# 1. Crear la base de datos
psql -U postgres -c "CREATE DATABASE gestor_pedidos_dev;"

# 2. Entrar a la carpeta del backend
cd gestor_pedidos

# 3. Ejecutar
mvn spring-boot:run
```

El backend arranca en `http://localhost:8080` y Liquibase crea las tablas automáticamente.

### Frontend

```bash
# 1. Entrar a la carpeta del frontend
cd Gestor-de-Pedidos-Portal

# 2. Instalar dependencias
npm install

# 3. Ejecutar en desarrollo
npm run dev
```

El frontend arranca en `http://localhost:5173`.

---

## 🐳 Docker Compose

```bash
# DEV
cd gestor_pedidos
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d

# QA
docker-compose -f docker-compose.qa.yml --env-file .env.qa up -d
```

---

## 🔄 Pipeline CI/CD

El pipeline Jenkins automatiza:

```
Checkout → Build Backend → Build Frontend → 
Build Docker → Push Docker Hub → 
[Aprobación] → Deploy QA → 
[Aprobación] → Deploy RELEASE
```

### Configurar Jenkins
1. Instalar plugins: Pipeline, Git, Docker Pipeline
2. Agregar credenciales:
   - `github-credentials` — Token de GitHub
   - `dockerhub-credentials` — Token de Docker Hub
   - `ec2-qa-host` — IP de la EC2 QA
3. Crear Pipeline apuntando al `Jenkinsfile` del repositorio

---

## 📁 Estructura del proyecto

```
gestor_pedidos/                 # Backend Spring Boot
├── src/main/java/
│   └── com/sergio/gestor_pedidos/
│       ├── controller/         # REST endpoints
│       ├── service/            # Lógica de negocio
│       ├── model/              # Entidades JPA
│       ├── repository/         # Spring Data JPA
│       ├── dto/                # Data Transfer Objects
│       └── mapper/             # Conversión DTO ↔ Entity
├── src/main/resources/
│   └── db/changelog/           # Migraciones Liquibase
├── Dockerfile
└── docker-compose.*.yml

Gestor-de-Pedidos-Portal/       # Frontend React
├── src/
│   ├── pages/
│   │   ├── admin/              # Panel administrador
│   │   └── usuario/            # Tienda de usuario
│   ├── components/             # Navbar, componentes
│   ├── context/                # AuthContext
│   ├── hooks/                  # useNotificaciones
│   └── api.js                  # Llamadas al backend
├── Dockerfile
└── nginx.conf

Jenkinsfile                     # Pipeline CI/CD
```

---

## 📊 API Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/registro` | Registrar usuario |
| GET | `/productos` | Listar productos |
| GET | `/productos/filtrar` | Filtrar productos |
| GET | `/carrito/cliente/{id}` | Ver carrito |
| POST | `/carrito/cliente/{id}/items` | Agregar al carrito |
| POST | `/pedidos` | Crear pedido |
| POST | `/pagos/procesar` | Procesar pago |
| GET | `/facturas/cliente/{id}` | Mis facturas |
| GET | `/facturas/{id}/pdf` | Descargar factura PDF |
| GET | `/reportes/ventas` | Reporte de ventas PDF |
| GET | `/notificaciones/suscribir/{id}` | SSE notificaciones |

---

## 👨‍💻 Autor

**Sergio Angel** — Proyecto de Tesis  
Universidad — 2026
