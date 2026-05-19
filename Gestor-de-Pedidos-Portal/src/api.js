import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "" });

// ── Auth ──────────────────────────────────────────────
export const loginApi    = (data) => api.post("/auth/login", data);
export const registroApi = (data) => api.post("/auth/registro", data);

// ── Clientes ──────────────────────────────────────────
export const getClientes     = ()     => api.get("/clientes");
export const crearCliente    = (data) => api.post("/clientes", data);
export const getClientePorId = (id)   => api.get(`/clientes/${id}`);

// ── Pedidos ───────────────────────────────────────────
export const getPedidos           = ()           => api.get("/pedidos");
export const getPedidosPorEstado  = (estado)     => api.get(`/pedidos/estado/${estado}`);
export const getPedidosPorCliente = (id)         => api.get(`/pedidos/cliente/${id}`);
export const crearPedido          = (data)       => api.post("/pedidos", data);
export const eliminarPedido       = (id)         => api.delete(`/pedidos/${id}`);
export const cambiarEstadoPedido  = (id, estado) => api.patch(`/pedidos/${id}/estado`, { estado });

// ── Productos ─────────────────────────────────────────
export const getProductos       = ()         => api.get("/productos");
export const crearProducto      = (data)     => api.post("/productos", data);
export const actualizarProducto = (id, data) => api.put(`/productos/${id}`, data);
export const eliminarProducto   = (id)       => api.delete(`/productos/${id}`);
export const filtrarProductos   = (params)   => api.get("/productos/filtrar", { params });

// ── Carrito ───────────────────────────────────────────
export const getCarrito            = (clienteId)                   => api.get(`/carrito/cliente/${clienteId}`);
export const agregarItemCarrito    = (clienteId, data)             => api.post(`/carrito/cliente/${clienteId}/items`, data);
export const actualizarItemCarrito = (clienteId, itemId, cantidad) => api.patch(`/carrito/cliente/${clienteId}/items/${itemId}`, { cantidad });
export const eliminarItemCarrito   = (clienteId, itemId)           => api.delete(`/carrito/cliente/${clienteId}/items/${itemId}`);
export const vaciarCarrito         = (clienteId)                   => api.delete(`/carrito/cliente/${clienteId}/vaciar`);
export const iniciarCheckout       = (clienteId)                   => api.post(`/carrito/cliente/${clienteId}/checkout`);

// ── Pagos ─────────────────────────────────────────────
export const procesarPago       = (data)      => api.post("/pagos/procesar", data);
export const getPagos           = ()          => api.get("/pagos");
export const getPagosPorCliente = (clienteId) => api.get(`/pagos/cliente/${clienteId}`);
export const getPagoPorPedido   = (pedidoId)  => api.get(`/pagos/pedido/${pedidoId}`);
export const confirmarPago      = (id)        => api.patch(`/pagos/${id}/confirmar`);
export const solicitarReembolso = (id, motivo)=> api.patch(`/pagos/${id}/solicitar-reembolso`, { motivo });
export const reembolsarPago     = (id, motivo)=> api.patch(`/pagos/${id}/reembolsar`, { motivo });

// ── Reportes ──────────────────────────────────────────
export const descargarReporteVentas    = (desde, hasta) =>
  api.get(`/reportes/ventas?desde=${desde}&hasta=${hasta}`, { responseType: "blob" });
export const descargarReporteProductos = () =>
  api.get("/reportes/productos", { responseType: "blob" });

// ── Facturas ──────────────────────────────────────────
export const generarFactura        = (pagoId)     => api.post(`/facturas/generar/${pagoId}`);
export const getFacturas           = ()           => api.get("/facturas");
export const getFacturaPorPago     = (pagoId)     => api.get(`/facturas/pago/${pagoId}`);
export const getFacturasPorCliente = (clienteId)  => api.get(`/facturas/cliente/${clienteId}`);
export const anularFactura         = (id)         => api.patch(`/facturas/${id}/anular`);
export const descargarFacturaPDF   = (id, numero) =>
  api.get(`/facturas/${id}/pdf`, { responseType: "blob" })
     .then(res => {
       const url  = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
       const link = document.createElement("a");
       link.href  = url;
       link.download = `${numero}.pdf`;
       link.click();
       window.URL.revokeObjectURL(url);
     });
