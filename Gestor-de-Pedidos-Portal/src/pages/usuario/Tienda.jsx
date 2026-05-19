import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  filtrarProductos, getProductos, getCarrito, agregarItemCarrito,
  actualizarItemCarrito, eliminarItemCarrito, vaciarCarrito,
  crearPedido, cambiarEstadoPedido, procesarPago, iniciarCheckout,
} from "../../api";
import NavbarUsuario from "../../components/NavbarUsuario";

const METODOS = ["TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA", "EFECTIVO"];

const BANCOS_TRANSFERENCIA = [
  { id: "NEQUI",       label: "🟣 Nequi",       tipo: "celular",  hint: "Número de celular registrado en Nequi" },
  { id: "DAVIPLATA",   label: "🔴 Daviplata",    tipo: "celular",  hint: "Número de celular registrado en Daviplata" },
  { id: "BANCOLOMBIA", label: "🟡 Bancolombia",  tipo: "cuenta",   hint: "Número de cuenta Bancolombia (ahorros/corriente)" },
  { id: "LLAVEREB",    label: "🔵 Llave (Bre-B)", tipo: "celular", hint: "Número de celular o alias registrado en Bre-B" },
  { id: "OTRO",        label: "🏦 Otro banco",   tipo: "cuenta",   hint: "Nombre del banco y número de cuenta" },
];

// Helpers para formato de tarjeta
const soloNumeros      = (v) => v.replace(/\D/g, "");
const formatTarjeta    = (v) => soloNumeros(v).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExpiracion = (v) => {
  const d = soloNumeros(v).slice(0, 4);
  if (d.length >= 3) return d.slice(0, 2) + "/" + d.slice(2);
  return d;
};

// Países y sus departamentos/estados
const PAISES_DEPARTAMENTOS = {
  "Colombia": [
    "Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá","Caldas",
    "Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca",
    "Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño",
    "Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés y Providencia",
    "Santander","Sucre","Tolima","Valle del Cauca","Vaupés","Vichada",
  ],
  "México": [
    "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas",
    "Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México",
    "Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán","Morelos","Nayarit",
    "Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí",
    "Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas",
  ],
  "Argentina": [
    "Buenos Aires","Catamarca","Chaco","Chubut","Córdoba","Corrientes","Entre Ríos",
    "Formosa","Jujuy","La Pampa","La Rioja","Mendoza","Misiones","Neuquén",
    "Río Negro","Salta","San Juan","San Luis","Santa Cruz","Santa Fe",
    "Santiago del Estero","Tierra del Fuego","Tucumán",
  ],
  "España": [
    "Andalucía","Aragón","Asturias","Baleares","Canarias","Cantabria",
    "Castilla-La Mancha","Castilla y León","Cataluña","Ceuta","Comunidad de Madrid",
    "Comunidad Valenciana","Extremadura","Galicia","La Rioja","Melilla","Murcia",
    "Navarra","País Vasco",
  ],
  "Perú": [
    "Amazonas","Áncash","Apurímac","Arequipa","Ayacucho","Cajamarca","Callao",
    "Cusco","Huancavelica","Huánuco","Ica","Junín","La Libertad","Lambayeque",
    "Lima","Loreto","Madre de Dios","Moquegua","Pasco","Piura","Puno",
    "San Martín","Tacna","Tumbes","Ucayali",
  ],
  "Chile": [
    "Arica y Parinacota","Tarapacá","Antofagasta","Atacama","Coquimbo",
    "Valparaíso","Metropolitana de Santiago","O'Higgins","Maule","Ñuble",
    "Biobío","La Araucanía","Los Ríos","Los Lagos","Aysén","Magallanes",
  ],
  "Ecuador": [
    "Azuay","Bolívar","Cañar","Carchi","Chimborazo","Cotopaxi","El Oro",
    "Esmeraldas","Galápagos","Guayas","Imbabura","Loja","Los Ríos","Manabí",
    "Morona Santiago","Napo","Orellana","Pastaza","Pichincha","Santa Elena",
    "Santo Domingo","Sucumbíos","Tungurahua","Zamora Chinchipe",
  ],
  "Venezuela": [
    "Amazonas","Anzoátegui","Apure","Aragua","Barinas","Bolívar","Carabobo",
    "Cojedes","Delta Amacuro","Distrito Capital","Falcón","Guárico","Lara",
    "Mérida","Miranda","Monagas","Nueva Esparta","Portuguesa","Sucre",
    "Táchira","Trujillo","Vargas","Yaracuy","Zulia",
  ],
  "Estados Unidos": [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
    "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
    "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
    "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
    "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
    "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
    "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
    "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
  ],
};

const PAISES = Object.keys(PAISES_DEPARTAMENTOS);

export default function Tienda() {
  const { session } = useAuth();
  const clienteId = session?.clienteId;

  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState({ precioMin: "", precioMax: "", soloConStock: false });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [vistaCarrito, setVistaCarrito] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("TARJETA_CREDITO");
  const [tarjeta, setTarjeta] = useState({ numero: "", titular: "", expiracion: "", cvv: "" });
  const [banco, setBanco] = useState("");
  const [datosBanco, setDatosBanco] = useState({ cuenta: "", titular: "" });
  const [envio, setEnvio] = useState({ pais: "", departamento: "", direccion: "" });
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [procesando, setProcesando] = useState(false);

  const cargarProductos = async () => {
    try {
      const params = {};
      if (busqueda)           params.nombre      = busqueda;
      if (filtros.precioMin)  params.precioMin   = filtros.precioMin;
      if (filtros.precioMax)  params.precioMax   = filtros.precioMax;
      if (filtros.soloConStock) params.soloConStock = true;
      const r = await filtrarProductos(params);
      setProductos(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error("Error cargando productos:", e);
      setProductos([]);
    }
  };

  // Carga inicial — sin filtros, muestra todos
  useEffect(() => {
    cargarProductos();
    if (clienteId) cargarCarrito();
  }, [clienteId]);

  // Recarga con debounce cuando cambian filtros o búsqueda
  useEffect(() => {
    const timer = setTimeout(() => cargarProductos(), 350);
    return () => clearTimeout(timer);
  }, [busqueda, filtros.precioMin, filtros.precioMax, filtros.soloConStock]);const cargarCarrito = async () => {
    try {
      const r = await getCarrito(clienteId);
      setCarrito(r.data);
    } catch { setCarrito({ items: [], total: 0 }); }
  };

  const notify = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 4000);
  };

  const handleAgregar = async (productoId) => {
    try {
      const r = await agregarItemCarrito(clienteId, { productoId, cantidad: 1 });
      setCarrito(r.data);
      notify("✅ Agregado al carrito");
    } catch (e) {
      notify("❌ " + (e.response?.data?.mensaje || "Error"), false);
    }
  };

  const handleCantidad = async (itemId, cantidad) => {
    const r = await actualizarItemCarrito(clienteId, itemId, cantidad);
    setCarrito(r.data);
  };

  const handleEliminarItem = async (itemId) => {
    const r = await eliminarItemCarrito(clienteId, itemId);
    setCarrito(r.data);
  };

  const handleCheckout = async () => {
    if (!carrito?.items?.length) { notify("El carrito está vacío", false); return; }
    if (!envio.pais)        { notify("Selecciona el país de destino", false); return; }
    if (!envio.departamento){ notify("Selecciona el departamento/estado", false); return; }
    if (!envio.direccion.trim()) { notify("Ingresa la dirección de entrega", false); return; }
    if (metodoPago === "TRANSFERENCIA" && !banco) {
      notify("Selecciona el banco para la transferencia", false); return;
    }
    if (metodoPago === "TRANSFERENCIA" && !datosBanco.cuenta.trim()) {
      notify("Ingresa el número de cuenta o celular del banco", false); return;
    }
    if (metodoPago === "TRANSFERENCIA" && !datosBanco.titular.trim()) {
      notify("Ingresa el nombre del titular de la cuenta", false); return;
    }

    setProcesando(true);
    try {
      const descripcion = carrito.items.map((i) => `${i.cantidad}x ${i.productoNombre}`).join(", ");
      const ciudadDestino = `${envio.departamento}, ${envio.pais}`;

      const pedidoRes = await crearPedido({
        descripcion,
        total: carrito.total,
        clienteId,
        ciudadDestino,
        direccionEntrega: envio.direccion.trim(),
      });
      const pedidoId = pedidoRes.data.id;
      await cambiarEstadoPedido(pedidoId, "CONFIRMADO");

      const pagoData = {
        pedidoId,
        metodoPago,
        ...(metodoPago !== "TRANSFERENCIA" && metodoPago !== "EFECTIVO" && {
          numeroTarjeta: tarjeta.numero,
          titularTarjeta: tarjeta.titular,
          fechaExpiracion: tarjeta.expiracion,
          cvv: tarjeta.cvv,
        }),
      };
      const pagoRes = await procesarPago(pagoData);

      if (pagoRes.data.estado === "COMPLETADO") {
        notify(`✅ ¡Pago exitoso! Ref: ${pagoRes.data.referenciaExterna}`);
        setShowPago(false);
        setVistaCarrito(false);
        setEnvio({ pais: "", departamento: "", direccion: "" });
        setBanco("");
        setDatosBanco({ cuenta: "", titular: "" });
        await vaciarCarrito(clienteId);
        cargarCarrito();
      } else {
        notify(`❌ Pago rechazado: ${pagoRes.data.mensajeRespuesta}`, false);
      }
    } catch (e) {
      notify("❌ " + (e.response?.data?.mensaje || "Error en el pago"), false);
    } finally {
      setProcesando(false);
    }
  };

  const totalItems = carrito?.items?.reduce((a, i) => a + i.cantidad, 0) || 0;
  const departamentos = envio.pais ? PAISES_DEPARTAMENTOS[envio.pais] || [] : [];

  return (
    <div style={s.page}>
      <NavbarUsuario totalCarrito={totalItems} onAbrirCarrito={() => { setVistaCarrito(true); setShowPago(false); }} />
      <div style={s.content}>

        {msg.text && (
          <motion.div style={{ ...s.toast, background: msg.ok ? "#14532d" : "#7f1d1d", borderColor: msg.ok ? "#4ade80" : "#f87171" }}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            {msg.text}
          </motion.div>
        )}

        <div style={s.header}>
          <div>
            <h2 style={s.title}>Tienda</h2>
            <p style={s.welcome}>Hola, {session?.nombre} 👋</p>
          </div>
          <button onClick={() => { setVistaCarrito(!vistaCarrito); setShowPago(false); }} style={s.carritoBtn}>
            🛒 Carrito
            {totalItems > 0 && <span style={s.badge}>{totalItems}</span>}
          </button>
        </div>

        <div style={s.layout}>
          {/* Catálogo */}
          <div style={{ flex: 1 }}>
            {/* Barra de búsqueda y filtros */}
            <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
              <input placeholder="🔍 Buscar productos..." value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)} style={{ ...s.search, marginBottom: 0, flex: 1 }} />
              <button onClick={() => setMostrarFiltros(!mostrarFiltros)}
                style={{ ...s.filtroToggle, background: mostrarFiltros ? "#38bdf8" : "#1e293b", color: mostrarFiltros ? "#0f172a" : "#e2e8f0" }}>
                ⚙️ Filtros
              </button>
            </div>

            {/* Panel de filtros */}
            <AnimatePresence>
              {mostrarFiltros && (
                <motion.div style={s.filtroPanel}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={s.filtroLabel}>Precio mínimo</label>
                      <input type="number" placeholder="$0" style={s.filtroInput}
                        value={filtros.precioMin}
                        onChange={(e) => setFiltros({ ...filtros, precioMin: e.target.value })} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={s.filtroLabel}>Precio máximo</label>
                      <input type="number" placeholder="$9999" style={s.filtroInput}
                        value={filtros.precioMax}
                        onChange={(e) => setFiltros({ ...filtros, precioMax: e.target.value })} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
                      <input type="checkbox" id="soloStock" checked={filtros.soloConStock}
                        onChange={(e) => setFiltros({ ...filtros, soloConStock: e.target.checked })} />
                      <label htmlFor="soloStock" style={{ color: "#94a3b8", fontSize: 13 }}>Solo con stock</label>
                    </div>
                    <button onClick={() => setFiltros({ precioMin: "", precioMax: "", soloConStock: false })}
                      style={{ ...s.filtroToggle, marginTop: 16, background: "#334155", color: "#94a3b8" }}>
                      Limpiar filtros
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={s.grid}>
              {productos.map((p) => (
                <motion.div key={p.id} style={s.productoCard}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Imagen del producto */}
                  <div style={s.productoImgContainer}>
                    {p.imagenUrl ? (
                      <img src={p.imagenUrl} alt={p.nombre} style={s.productoImg}
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                    ) : null}
                    <div style={{ ...s.productoImgFallback, display: p.imagenUrl ? "none" : "flex" }}>📦</div>
                    {p.stock === 0 && <div style={s.agotadoBadge}>Agotado</div>}
                    {p.stock > 0 && p.stock <= 5 && <div style={s.pocoBadge}>¡Últimas {p.stock}!</div>}
                  </div>
                  <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    <p style={s.productoNombre}>{p.nombre}</p>
                    <p style={s.productoDesc}>{p.descripcion || "Sin descripción"}</p>
                    <div style={s.productoFooter}>
                      <span style={s.productoPrecio}>${parseFloat(p.precio).toFixed(2)}</span>
                      <span style={{ fontSize: 11, color: p.stock > 0 ? "#4ade80" : "#f87171" }}>
                        {p.stock > 0 ? `Stock: ${p.stock}` : "Agotado"}
                      </span>
                    </div>
                    <button onClick={() => handleAgregar(p.id)} style={{
                      ...s.addBtn,
                      background: p.stock === 0 ? "#334155" : "#4ade80",
                      color: p.stock === 0 ? "#64748b" : "#0f172a",
                      cursor: p.stock === 0 ? "not-allowed" : "pointer",
                    }} disabled={p.stock === 0}>
                      {p.stock === 0 ? "Sin stock" : "🛒 Agregar"}
                    </button>
                  </div>
                </motion.div>
              ))}
              {productos.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                  <p style={{ fontSize: 40 }}>🔍</p>
                  <p>No se encontraron productos con esos filtros</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel carrito */}
          <AnimatePresence>
            {vistaCarrito && (
              <motion.div style={s.carritoPanel}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}>
                <div style={s.carritoPanelHeader}>
                  <h3 style={s.carritoTitle}>🛒 Mi Carrito</h3>
                  <button onClick={() => setVistaCarrito(false)} style={s.closeBtn}>✕</button>
                </div>

                {(!carrito?.items || carrito.items.length === 0) && (
                  <p style={s.empty}>El carrito está vacío</p>
                )}

                {carrito?.items?.map((item) => (
                  <div key={item.id} style={s.itemRow}>
                    <div style={{ flex: 1 }}>
                      <p style={s.itemNombre}>{item.productoNombre}</p>
                      <p style={s.itemPrecio}>${item.precioUnitario?.toFixed(2)} c/u</p>
                    </div>
                    <div style={s.qtyCtrl}>
                      <button style={s.qtyBtn} onClick={() => handleCantidad(item.id, item.cantidad - 1)}>−</button>
                      <span style={s.qty}>{item.cantidad}</span>
                      <button style={s.qtyBtn} onClick={() => handleCantidad(item.id, item.cantidad + 1)}>+</button>
                    </div>
                    <span style={s.itemSubtotal}>${item.subtotal?.toFixed(2)}</span>
                    <button onClick={() => handleEliminarItem(item.id)} style={s.removeBtn}>✕</button>
                  </div>
                ))}

                {carrito?.items?.length > 0 && (
                  <>
                    <div style={s.totalRow}>
                      <span>Total</span>
                      <span style={s.totalValue}>${carrito.total?.toFixed(2)}</span>
                    </div>

                    {!showPago ? (
                      <button onClick={() => setShowPago(true)} style={s.checkoutBtn}>
                        Proceder al pago →
                      </button>
                    ) : (
                      <motion.div style={{ display: "flex", flexDirection: "column", gap: 8 }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                        {/* ── Datos de envío ── */}
                        <p style={s.seccionLabel}>📦 Datos de envío</p>

                        <select
                          value={envio.pais}
                          onChange={(e) => setEnvio({ pais: e.target.value, departamento: "", direccion: envio.direccion })}
                          style={s.select}>
                          <option value="">Selecciona el país</option>
                          {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>

                        <select
                          value={envio.departamento}
                          onChange={(e) => setEnvio({ ...envio, departamento: e.target.value })}
                          style={s.select}
                          disabled={!envio.pais}>
                          <option value="">
                            {envio.pais ? "Selecciona el departamento / estado" : "Primero selecciona un país"}
                          </option>
                          {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>

                        <input
                          placeholder="Dirección de entrega (calle, número, barrio...)"
                          style={s.input}
                          value={envio.direccion}
                          onChange={(e) => setEnvio({ ...envio, direccion: e.target.value })}
                        />

                        {/* ── Método de pago ── */}
                        <p style={{ ...s.seccionLabel, marginTop: 4 }}>💳 Método de pago</p>

                        <select value={metodoPago} onChange={(e) => { setMetodoPago(e.target.value); setBanco(""); setDatosBanco({ cuenta: "", titular: "" }); }} style={s.select}>
                          {METODOS.map((m) => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
                        </select>

                        {/* ── Tarjeta ── */}
                        {(metodoPago === "TARJETA_CREDITO" || metodoPago === "TARJETA_DEBITO") && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ position: "relative" }}>
                              <input
                                placeholder="Número de tarjeta"
                                style={s.input}
                                inputMode="numeric"
                                value={tarjeta.numero}
                                maxLength={19}
                                onChange={(e) => setTarjeta({ ...tarjeta, numero: formatTarjeta(e.target.value) })}
                              />
                              {tarjeta.numero.replace(/\s/g, "").length > 0 && (
                                <span style={s.inputHint}>
                                  {tarjeta.numero.replace(/\s/g, "").length}/16
                                </span>
                              )}
                            </div>
                            <input
                              placeholder="Titular (como aparece en la tarjeta)"
                              style={s.input}
                              value={tarjeta.titular}
                              onChange={(e) => setTarjeta({ ...tarjeta, titular: e.target.value.toUpperCase() })}
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                              <div style={{ flex: 1, position: "relative" }}>
                                <input
                                  placeholder="MM/AA"
                                  style={s.input}
                                  inputMode="numeric"
                                  value={tarjeta.expiracion}
                                  maxLength={5}
                                  onChange={(e) => setTarjeta({ ...tarjeta, expiracion: formatExpiracion(e.target.value) })}
                                />
                              </div>
                              <input
                                placeholder="CVV"
                                style={{ ...s.input, flex: 1 }}
                                inputMode="numeric"
                                maxLength={4}
                                value={tarjeta.cvv}
                                onChange={(e) => setTarjeta({ ...tarjeta, cvv: soloNumeros(e.target.value).slice(0, 4) })}
                              />
                            </div>
                            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                              💡 Tarjeta terminada en 0000 simula rechazo
                            </p>
                          </div>
                        )}

                        {/* ── Transferencia bancaria ── */}
                        {metodoPago === "TRANSFERENCIA" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <p style={{ ...s.seccionLabel, marginTop: 0 }}>Selecciona el banco</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {BANCOS_TRANSFERENCIA.map((b) => (
                                <button key={b.id} type="button"
                                  onClick={() => { setBanco(b.id); setDatosBanco({ cuenta: "", titular: "" }); }}
                                  style={{
                                    padding: "8px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                                    border: banco === b.id ? "1px solid #38bdf8" : "1px solid #334155",
                                    background: banco === b.id ? "#38bdf822" : "transparent",
                                    color: banco === b.id ? "#38bdf8" : "#94a3b8",
                                    fontWeight: banco === b.id ? "bold" : "normal",
                                  }}>
                                  {b.label}
                                </button>
                              ))}
                            </div>

                            {banco && (() => {
                              const bancoInfo = BANCOS_TRANSFERENCIA.find(b => b.id === banco);
                              return (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                                    {bancoInfo.hint}
                                  </p>
                                  <input
                                    placeholder={bancoInfo.tipo === "celular" ? "Número de celular" : "Número de cuenta"}
                                    style={s.input}
                                    inputMode="numeric"
                                    value={datosBanco.cuenta}
                                    onChange={(e) => setDatosBanco({ ...datosBanco, cuenta: soloNumeros(e.target.value) })}
                                  />
                                  <input
                                    placeholder="Nombre completo del titular"
                                    style={s.input}
                                    value={datosBanco.titular}
                                    onChange={(e) => setDatosBanco({ ...datosBanco, titular: e.target.value })}
                                  />
                                  {banco === "OTRO" && (
                                    <input
                                      placeholder="Nombre del banco"
                                      style={s.input}
                                      value={datosBanco.nombreBanco || ""}
                                      onChange={(e) => setDatosBanco({ ...datosBanco, nombreBanco: e.target.value })}
                                    />
                                  )}
                                  <div style={s.infoBox}>
                                    <p style={{ margin: 0, fontSize: 12, color: "#fbbf24" }}>
                                      ⚠️ Al confirmar el pago, enviarás una solicitud de transferencia.
                                      El administrador verificará el pago y aprobará tu pedido.
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* ── Efectivo ── */}
                        {metodoPago === "EFECTIVO" && (
                          <div style={s.infoBox}>
                            <p style={{ margin: 0, fontSize: 12, color: "#fbbf24" }}>
                              💵 El pago en efectivo debe realizarse en el punto de entrega.
                              Tu pedido quedará confirmado y el administrador validará el pago.
                            </p>
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <button onClick={handleCheckout} style={s.checkoutBtn} disabled={procesando}>
                            {procesando ? "Procesando..." : `Pagar $${carrito.total?.toFixed(2)}`}
                          </button>
                          <button onClick={() => setShowPago(false)} style={s.cancelBtn}>Cancelar</button>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:    { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" },
  content: { padding: "24px 32px", position: "relative" },
  toast:   { padding: "12px 18px", borderRadius: 8, border: "1px solid", marginBottom: 16, fontSize: 14 },
  header:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title:   { color: "#4ade80", margin: 0 },
  welcome: { color: "#64748b", margin: "4px 0 0", fontSize: 14 },
  carritoBtn: {
    position: "relative", padding: "10px 20px", background: "#1e293b",
    color: "#e2e8f0", border: "1px solid #334155", borderRadius: 8,
    cursor: "pointer", fontSize: 15, fontWeight: "bold",
  },
  badge: {
    position: "absolute", top: -6, right: -6, background: "#4ade80",
    color: "#0f172a", borderRadius: "50%", width: 20, height: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: "bold",
  },
  layout:  { display: "flex", gap: 24, alignItems: "flex-start" },
  search:  {
    width: "100%", padding: "10px 16px", borderRadius: 8, marginBottom: 20,
    border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0",
    fontSize: 14, outline: "none", boxSizing: "border-box",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
  productoCard: {
    background: "#1e293b", borderRadius: 12,
    display: "flex", flexDirection: "column",
    border: "1px solid #334155", overflow: "hidden",
  },
  productoImgContainer: { position: "relative", width: "100%", height: 180, background: "#0f172a", overflow: "hidden" },
  productoImg:     { width: "100%", height: "100%", objectFit: "cover" },
  productoImgFallback: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#334155" },
  agotadoBadge:    { position: "absolute", top: 8, right: 8, background: "#ef4444", color: "#fff", fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: "bold" },
  pocoBadge:       { position: "absolute", top: 8, right: 8, background: "#f59e0b", color: "#0f172a", fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: "bold" },
  productoNombre:  { margin: 0, fontWeight: "bold", fontSize: 14 },
  productoDesc:    { margin: 0, fontSize: 12, color: "#64748b", flexGrow: 1, lineHeight: 1.4 },
  productoFooter:  { display: "flex", justifyContent: "space-between", alignItems: "center" },
  productoPrecio:  { color: "#4ade80", fontWeight: "bold", fontSize: 18 },
  addBtn: {
    padding: "9px", border: "none", borderRadius: 8,
    fontWeight: "bold", fontSize: 14, transition: "all .15s",
  },
  filtroToggle: {
    padding: "9px 16px", border: "1px solid #334155", borderRadius: 8,
    cursor: "pointer", fontSize: 13, fontWeight: "bold", whiteSpace: "nowrap",
  },
  filtroPanel: {
    background: "#1e293b", borderRadius: 10, padding: "14px 16px",
    marginBottom: 16, border: "1px solid #334155", overflow: "hidden",
  },
  filtroLabel: { fontSize: 12, color: "#94a3b8" },
  filtroInput: {
    padding: "8px 12px", borderRadius: 8, border: "1px solid #334155",
    background: "#0f172a", color: "#e2e8f0", fontSize: 13, outline: "none", width: 110,
  },
  carritoPanel: {
    width: 360, minWidth: 320, background: "#1e293b", borderRadius: 12,
    padding: "20px", position: "sticky", top: 20,
    border: "1px solid #334155", flexShrink: 0, maxHeight: "90vh", overflowY: "auto",
  },
  carritoPanelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  carritoTitle: { margin: 0, color: "#4ade80", fontSize: 16 },
  closeBtn:     { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 },
  itemRow:      { display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #0f172a" },
  itemNombre:   { margin: 0, fontSize: 13, fontWeight: "bold" },
  itemPrecio:   { margin: "2px 0 0", fontSize: 11, color: "#64748b" },
  qtyCtrl:      { display: "flex", alignItems: "center", gap: 4 },
  qtyBtn:       { width: 24, height: 24, background: "#334155", color: "#e2e8f0", border: "none", borderRadius: 5, cursor: "pointer" },
  qty:          { minWidth: 20, textAlign: "center", fontSize: 13 },
  itemSubtotal: { color: "#4ade80", fontSize: 13, fontWeight: "bold", minWidth: 55, textAlign: "right" },
  removeBtn:    { background: "transparent", color: "#f87171", border: "none", cursor: "pointer", fontSize: 14 },
  totalRow:     { display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid #334155", marginTop: 8 },
  totalValue:   { color: "#4ade80", fontWeight: "bold", fontSize: 20 },
  checkoutBtn: {
    flex: 1, padding: "11px", background: "#4ade80", color: "#0f172a",
    border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 14,
  },
  cancelBtn: {
    padding: "11px 14px", background: "#334155", color: "#e2e8f0",
    border: "none", borderRadius: 8, cursor: "pointer",
  },
  seccionLabel: { fontSize: 13, color: "#94a3b8", margin: "4px 0 2px", fontWeight: "bold" },
  select: {
    width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #334155",
    background: "#0f172a", color: "#e2e8f0", fontSize: 13, outline: "none",
  },
  input: {
    width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #334155",
    background: "#0f172a", color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box",
  },
  inputHint: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    fontSize: 11, color: "#64748b", pointerEvents: "none",
  },
  infoBox: {
    padding: "10px 12px", borderRadius: 8,
    background: "#0f172a", border: "1px solid #fbbf2433",
  },
  empty: { color: "#64748b", fontSize: 14, padding: "12px 0" },
};
