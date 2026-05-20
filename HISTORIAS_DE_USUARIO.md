# Historias de Usuario — Gestor de Pedidos
**Proyecto de Tesis | Sergio Angel | 2026**

---

## HU-001 · Autenticación con roles

**Como** usuario del sistema,  
**quiero** iniciar sesión con usuario y contraseña,  
**para** acceder a las funcionalidades según mi rol (ADMIN o USUARIO).

**Criterios de aceptación:**
- El sistema valida credenciales contra la BD
- Redirige a `/admin/dashboard` si es ADMIN
- Redirige a `/tienda` si es USUARIO
- Muestra error si las credenciales son incorrectas
- La sesión persiste en localStorage

---

## HU-002 · Registro de nuevos usuarios

**Como** visitante,  
**quiero** crear una cuenta de usuario,  
**para** poder realizar compras en la tienda.

**Criterios de aceptación:**
- Formulario con nombre, email, ciudad, usuario y contraseña
- Crea automáticamente un cliente asociado
- Valida que el email y usuario no estén en uso
- Inicia sesión automáticamente tras el registro

---

## HU-003 · Gestión de productos (Admin)

**Como** administrador,  
**quiero** crear, editar y desactivar productos,  
**para** mantener el catálogo actualizado.

**Criterios de aceptación:**
- CRUD completo de productos
- Campos: nombre, descripción, precio, stock, imagen URL, categoría
- Productos desactivados no aparecen en la tienda
- Stock visible y editable

---

## HU-004 · Catálogo de productos con filtros (Usuario)

**Como** usuario,  
**quiero** ver y filtrar los productos disponibles,  
**para** encontrar fácilmente lo que busco.

**Criterios de aceptación:**
- Grid de productos con imagen, nombre, precio y stock
- Buscador en tiempo real por nombre
- Filtros por precio mínimo/máximo y solo con stock
- Filtro por categoría con botones de acceso rápido
- Indicador "Agotado" y "¡Últimas X!" en productos con poco stock

---

## HU-005 · Carrito de compras

**Como** usuario,  
**quiero** agregar productos a un carrito,  
**para** gestionar mis compras antes de pagar.

**Criterios de aceptación:**
- Agregar/quitar productos del carrito
- Actualizar cantidades con validación de stock
- Mostrar subtotal por item y total general
- Carrito persiste entre sesiones
- Panel lateral deslizable con animaciones

---

## HU-006 · Proceso de pago

**Como** usuario,  
**quiero** pagar mis productos con diferentes métodos,  
**para** completar mi compra.

**Criterios de aceptación:**
- Selección de país, departamento y dirección de entrega
- Métodos: tarjeta crédito/débito, transferencia bancaria, efectivo
- Validación de número de tarjeta (solo dígitos, formato XXXX XXXX)
- Fecha de expiración en formato MM/AA
- Bancos disponibles: Nequi, Daviplata, Bancolombia, Bre-B
- Simulación de pago (tarjeta terminada en 0000 = rechazo)

---

## HU-007 · Seguimiento de pedidos

**Como** usuario,  
**quiero** ver el estado de mis pedidos en una línea de tiempo,  
**para** saber en qué etapa se encuentra mi compra.

**Criterios de aceptación:**
- Línea de tiempo visual: CREADO → CONFIRMADO → PAGADO → EN_CAMINO → ENTREGADO
- Paso activo con animación pulsante
- Estados CANCELADO y REEMBOLSADO con badge especial
- Muestra dirección de entrega y ciudad destino

---

## HU-008 · Gestión de pedidos (Admin)

**Como** administrador,  
**quiero** ver y gestionar todos los pedidos,  
**para** controlar el flujo de ventas.

**Criterios de aceptación:**
- Tabla con todos los pedidos y filtros por estado
- Botones para avanzar estado: CONFIRMADO → PAGADO → EN_CAMINO → ENTREGADO
- Botón para cancelar pedidos no pagados
- Colores diferenciados por estado

---

## HU-009 · Sistema de reembolsos

**Como** usuario,  
**quiero** solicitar el reembolso de un pago,  
**para** recuperar mi dinero si hay algún problema.

**Criterios de aceptación:**
- Botón "Solicitar reembolso" en pagos COMPLETADO
- Modal con 6 motivos predefinidos + campo libre
- Estado intermedio SOLICITADO_REEMBOLSO visible para el usuario
- Admin ve solicitudes pendientes destacadas en amarillo
- Admin aprueba con modal de confirmación
- Al aprobar: pago → REEMBOLSADO, pedido → REEMBOLSADO

---

## HU-010 · Factura electrónica

**Como** usuario,  
**quiero** recibir una factura electrónica de mis compras,  
**para** tener un comprobante de pago.

**Criterios de aceptación:**
- Factura generada automáticamente al completarse el pago
- Número único formato FAC-YYYY-XXXXXX
- Incluye: datos del cliente, descripción del pedido, subtotal, IVA 19%, total
- Descarga en PDF con diseño profesional
- Admin puede anular facturas
- Usuario ve historial de facturas en "Mis Facturas"

---

## HU-011 · Descuento automático de stock

**Como** administrador,  
**quiero** que el inventario se actualice automáticamente,  
**para** mantener el stock real sin intervención manual.

**Criterios de aceptación:**
- Al completarse el pago, el stock de cada producto se descuenta
- Al aprobarse un reembolso, el stock se restaura
- Logs de auditoría en cada operación de stock

---

## HU-012 · Reportes PDF

**Como** administrador,  
**quiero** descargar reportes en PDF,  
**para** analizar el rendimiento del negocio.

**Criterios de aceptación:**
- Reporte de ventas: filtrable por período, tabla de pedidos, totales por estado
- Reporte de inventario: lista de productos, stock bajo resaltado en rojo
- Botones de descarga en el Dashboard del admin
- PDFs con diseño corporativo (colores del sistema)

---

## HU-013 · Categorías de productos

**Como** administrador,  
**quiero** organizar los productos por categorías,  
**para** facilitar la navegación en la tienda.

**Criterios de aceptación:**
- CRUD de categorías con nombre, descripción e icono emoji
- Asignación de categoría al crear/editar producto
- Filtro por categoría en la tienda con botones de acceso rápido
- 10 categorías predefinidas: Laptops, Smartphones, Audio, etc.

---

## HU-014 · Notificaciones en tiempo real

**Como** usuario,  
**quiero** recibir notificaciones instantáneas,  
**para** saber cuando mi pago es procesado o reembolso aprobado.

**Criterios de aceptación:**
- Campana 🔔 en el navbar con contador de no leídas
- Notificación al completarse un pago exitoso
- Notificación al aprobarse un reembolso
- Dropdown con historial de últimas 5 notificaciones
- Implementado con Server-Sent Events (SSE)

---

## HU-015 · Pipeline CI/CD con Jenkins

**Como** equipo de desarrollo,  
**quiero** automatizar el despliegue del sistema,  
**para** garantizar entregas rápidas y confiables.

**Criterios de aceptación:**
- Pipeline: Checkout → Build → Test → Docker → Push → Deploy
- 3 ambientes: DEV, QA, RELEASE
- Aprobación manual requerida para QA y RELEASE
- Imágenes Docker publicadas en Docker Hub
- Despliegue automático en AWS EC2 via SSH
- Notificación de éxito/fallo al finalizar

---

## Resumen de implementación

| HU | Descripción | Estado |
|----|-------------|--------|
| HU-001 | Autenticación con roles | ✅ |
| HU-002 | Registro de usuarios | ✅ |
| HU-003 | Gestión de productos | ✅ |
| HU-004 | Catálogo con filtros | ✅ |
| HU-005 | Carrito de compras | ✅ |
| HU-006 | Proceso de pago | ✅ |
| HU-007 | Seguimiento de pedidos | ✅ |
| HU-008 | Gestión de pedidos admin | ✅ |
| HU-009 | Sistema de reembolsos | ✅ |
| HU-010 | Factura electrónica | ✅ |
| HU-011 | Descuento automático stock | ✅ |
| HU-012 | Reportes PDF | ✅ |
| HU-013 | Categorías de productos | ✅ |
| HU-014 | Notificaciones en tiempo real | ✅ |
| HU-015 | Pipeline CI/CD Jenkins | ✅ |
