# Gestor-de-Pedidos-Portal

## Descripción

Gestor-de-Pedidos-Portal es la interfaz web del sistema de gestión de pedidos. Está diseñada para que usuarios y administradores gestionen productos, pedidos y pagos mediante una experiencia moderna y responsive.

## Características

- Panel de administración para gestionar productos, clientes, pedidos y pagos.
- Vista de tienda para usuarios, con carrito, búsqueda de productos y proceso de pago.
- Sistema de cancelación de pedidos con motivo registrado.
- Confirmación y reembolso de pagos desde el panel administrativo.
- Interfaz en español con estilo actualizado.

## Tecnologías

- React 18
- Vite
- Axios para llamadas a API
- Framer Motion para animaciones ligeras

## Requisitos

- Node.js 18+ instalado
- npm
- Backend Spring Boot corriendo para consumir la API

## Instalación

1. Abre una terminal en la carpeta `Gestor-de-Pedidos-Portal`
2. Ejecuta:
   ```bash
   npm install
   ```

## Ejecución en desarrollo

```bash
npm run dev
```

Esto inicia el frontend en modo de desarrollo y normalmente estará disponible en `http://localhost:5173`.

## Compilación para producción

```bash
npm run build
```

El resultado se genera en la carpeta `dist`.

## Estructura del proyecto

- `src/`
  - `api.js` — cliente HTTP para conectarse con el backend.
  - `App.jsx`, `main.jsx` — punto de arranque de la aplicación.
  - `components/` — componentes reutilizables como barras de navegación.
  - `context/` — contexto de autenticación.
  - `pages/` — páginas principales para usuario y administración.

## Flujo recomendado

1. Inicia el backend del proyecto principal.
2. Inicia el frontend con `npm run dev`.
3. Accede con credenciales de prueba desde la pantalla de login.

## Notas

- Asegúrate de que la URL del backend esté configurada correctamente en `src/api.js`.
- El portal está pensado para integrarse con el backend del proyecto principal `gestor_pedidos`.

## Contribuciones

Si deseas mejorar este portal, abre un issue o un pull request con tus cambios.
