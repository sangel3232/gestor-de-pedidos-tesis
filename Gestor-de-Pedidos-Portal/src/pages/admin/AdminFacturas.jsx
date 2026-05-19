import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getFacturas, generarFactura, anularFactura,
  descargarFacturaPDF, getClientes, getFacturasPorCliente,
} from "../../api";
import NavbarAdmin from "../../components/NavbarAdmin";

const COLORES = { EMITIDA: "#4ade80", ANULADA: "#f87171" };

export default function AdminFacturas() {
  const [facturas, setFacturas]         = useState([]);
  const [clientes, setClientes]         = useState([]);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [loading, setLoading]           = useState(false);
  const [msg, setMsg]                   = useState({ text: "", ok: true });
  const [descargando, setDescargando]   = useState(null);

  useEffect(() => {
    getClientes().then((r) => setClientes(r.data.content || r.data));
    cargar();
  }, []);

  const cargar = async (clienteId = "") => {
    setLoading(true);
    try {
      const res = clienteId ? await getFacturasPorCliente(clienteId) : await getFacturas();
      setFacturas(res.data);
    } finally { setLoading(false); }
  };

  const notify = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 4000);
  };

  const handleGenerar = async (pagoId) => {
    try {
      await generarFactura(pagoId);
      notify("✅ Factura generada correctamente");
      cargar(filtroCliente);
    } catch (e) {
      notify("❌ " + (e.response?.data?.mensaje || "Error al generar factura"), false);
    }
  };

  const handleAnular = async (id, numero) => {
    if (!window.confirm(`¿Anular la factura ${numero}? Esta acción no se puede deshacer.`)) return;
    try {
      await anularFactura(id);
      notify(`✅ Factura ${numero} anulada`);
      cargar(filtroCliente);
    } catch (e) {
      notify("❌ " + (e.response?.data?.mensaje || "Error"), false);
    }
  };

  const handleDescargar = async (id, numero) => {
    setDescargando(id);
    try {
      await descargarFacturaPDF(id, numero);
    } catch (e) {
      notify("❌ Error al descargar el PDF", false);
    } finally { setDescargando(null); }
  };

  const totalEmitido = facturas
    .filter(f => f.estado === "EMITIDA")
    .reduce((a, f) => a + (f.total || 0), 0);

  return (
    <div style={s.page}>
      <NavbarAdmin />
      <div style={s.content}>
        <h2 style={s.title}>Facturas Electrónicas</h2>

        {msg.text && (
          <motion.p style={{ color: msg.ok ? "#4ade80" : "#f87171", marginBottom: 12, fontSize: 14 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {msg.text}
          </motion.p>
        )}

        {/* Stats */}
        <div style={s.stats}>
          {[
            { label: "Total facturas",  value: facturas.length,                                        color: "#38bdf8" },
            { label: "Emitidas",        value: facturas.filter(f => f.estado === "EMITIDA").length,    color: "#4ade80" },
            { label: "Anuladas",        value: facturas.filter(f => f.estado === "ANULADA").length,    color: "#f87171" },
            { label: "Total facturado", value: `$${totalEmitido.toFixed(2)}`,                          color: "#4ade80" },
          ].map(({ label, value, color }) => (
            <motion.div key={label} style={{ ...s.statCard, borderTop: `3px solid ${color}` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <p style={s.statLabel}>{label}</p>
              <p style={{ ...s.statValue, color }}>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filtro */}
        <div style={s.filtroRow}>
          <label style={s.label}>Filtrar por cliente:</label>
          <select value={filtroCliente}
            onChange={(e) => { setFiltroCliente(e.target.value); cargar(e.target.value); }}
            style={s.select}>
            <option value="">Todos</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        {/* Tabla */}
        <div style={s.table}>
          <div style={s.thead}>
            <span>N° Factura</span><span>Cliente</span><span>Descripción</span>
            <span>Subtotal</span><span>IVA</span><span>Total</span>
            <span>Método</span><span>Estado</span><span>Fecha</span><span>Acciones</span>
          </div>
          {loading && <p style={s.hint}>Cargando...</p>}
          {!loading && facturas.length === 0 && <p style={s.hint}>Sin facturas.</p>}
          {facturas.map((f) => (
            <motion.div key={f.id} style={s.row} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span style={{ color: "#38bdf8", fontWeight: "bold", fontSize: 12 }}>{f.numeroFactura}</span>
              <span style={{ fontSize: 12 }}>{f.clienteNombre}</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{f.pedidoDescripcion?.substring(0, 30)}...</span>
              <span style={{ fontSize: 12 }}>${f.subtotal?.toFixed(2)}</span>
              <span style={{ fontSize: 12, color: "#fbbf24" }}>${f.impuestoValor?.toFixed(2)}</span>
              <span style={{ color: "#4ade80", fontWeight: "bold" }}>${f.total?.toFixed(2)}</span>
              <span style={{ fontSize: 11 }}>{f.metodoPago?.replace(/_/g, " ") || "—"}</span>
              <span style={{ color: COLORES[f.estado], fontWeight: "bold", fontSize: 12 }}>{f.estado}</span>
              <span style={{ fontSize: 11 }}>
                {f.emitidaEn ? new Date(f.emitidaEn).toLocaleDateString("es-ES") : "—"}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => handleDescargar(f.id, f.numeroFactura)}
                  style={s.pdfBtn} disabled={descargando === f.id}>
                  {descargando === f.id ? "..." : "📄 PDF"}
                </button>
                {f.estado === "EMITIDA" && (
                  <button onClick={() => handleAnular(f.id, f.numeroFactura)} style={s.anularBtn}>
                    Anular
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page:    { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" },
  content: { padding: "28px 32px" },
  title:   { color: "#38bdf8", marginBottom: 20 },
  stats:   { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 },
  statCard:  { background: "#1e293b", borderRadius: 10, padding: "16px 22px", minWidth: 130, flex: "1 1 120px" },
  statLabel: { margin: 0, fontSize: 13, color: "#94a3b8" },
  statValue: { margin: "6px 0 0", fontSize: 26, fontWeight: "bold" },
  filtroRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  label:  { fontSize: 13, color: "#94a3b8" },
  select: { padding: "9px 14px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: 14, outline: "none", minWidth: 220 },
  table:  { background: "#1e293b", borderRadius: 10, overflow: "auto" },
  thead:  { display: "grid", gridTemplateColumns: "130px 1fr 1fr 90px 80px 100px 110px 80px 90px 140px", padding: "10px 16px", background: "#0f172a", color: "#64748b", fontSize: 12, fontWeight: "bold", minWidth: 900 },
  row:    { display: "grid", gridTemplateColumns: "130px 1fr 1fr 90px 80px 100px 110px 80px 90px 140px", padding: "10px 16px", borderTop: "1px solid #0f172a", fontSize: 13, alignItems: "center", minWidth: 900 },
  hint:   { padding: 16, color: "#64748b" },
  pdfBtn: { padding: "4px 8px", background: "#38bdf822", border: "1px solid #38bdf8", color: "#38bdf8", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: "bold" },
  anularBtn: { padding: "4px 8px", background: "#ef444422", border: "1px solid #f87171", color: "#f87171", borderRadius: 6, cursor: "pointer", fontSize: 11 },
};
