import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getFacturasPorCliente, descargarFacturaPDF } from "../../api";
import NavbarUsuario from "../../components/NavbarUsuario";

const COLORES = { EMITIDA: "#4ade80", ANULADA: "#f87171" };

export default function MisFacturas() {
  const { session } = useAuth();
  const [facturas, setFacturas]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [descargando, setDescargando] = useState(null);

  useEffect(() => {
    if (!session?.clienteId) return;
    getFacturasPorCliente(session.clienteId)
      .then((r) => setFacturas(r.data))
      .catch(() => setFacturas([]))
      .finally(() => setLoading(false));
  }, [session]);

  const handleDescargar = async (id, numero) => {
    setDescargando(id);
    try {
      await descargarFacturaPDF(id, numero);
    } finally { setDescargando(null); }
  };

  const totalGastado = facturas
    .filter(f => f.estado === "EMITIDA")
    .reduce((a, f) => a + (f.total || 0), 0);

  return (
    <div style={s.page}>
      <NavbarUsuario />
      <div style={s.content}>
        <h2 style={s.title}>Mis Facturas</h2>

        <div style={s.stats}>
          <StatCard label="Total facturas"  value={facturas.length}                                     color="#38bdf8" />
          <StatCard label="Total pagado"    value={`$${totalGastado.toFixed(2)}`}                       color="#4ade80" />
        </div>

        {loading && <p style={s.hint}>Cargando...</p>}

        {!loading && facturas.length === 0 && (
          <div style={s.empty}>
            <p style={{ fontSize: 48 }}>🧾</p>
            <p>No tienes facturas aún. Las facturas se generan después de cada compra.</p>
          </div>
        )}

        <div style={s.list}>
          {facturas.map((f) => (
            <motion.div key={f.id} style={{ ...s.card, borderLeft: `4px solid ${COLORES[f.estado] || "#334155"}` }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>

              <div style={s.cardHeader}>
                <div>
                  <p style={s.numero}>🧾 {f.numeroFactura}</p>
                  <p style={s.fecha}>
                    {f.emitidaEn ? new Date(f.emitidaEn).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                  </p>
                </div>
                <span style={{ ...s.estadoBadge, color: COLORES[f.estado] }}>{f.estado}</span>
              </div>

              <p style={s.descripcion}>{f.pedidoDescripcion}</p>

              {/* Desglose de valores */}
              <div style={s.desglose}>
                <div style={s.desgloseRow}>
                  <span style={s.desgloseLabel}>Subtotal</span>
                  <span>${f.subtotal?.toFixed(2)}</span>
                </div>
                <div style={s.desgloseRow}>
                  <span style={s.desgloseLabel}>IVA ({f.impuestoPorcentaje}%)</span>
                  <span style={{ color: "#fbbf24" }}>${f.impuestoValor?.toFixed(2)}</span>
                </div>
                <div style={{ ...s.desgloseRow, borderTop: "1px solid #334155", paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontWeight: "bold" }}>Total</span>
                  <span style={{ color: "#4ade80", fontWeight: "bold", fontSize: 18 }}>${f.total?.toFixed(2)}</span>
                </div>
              </div>

              {f.metodoPago && (
                <p style={s.metodo}>💳 {f.metodoPago.replace(/_/g, " ")}</p>
              )}
              {f.ciudadDestino && (
                <p style={s.metodo}>📍 {f.ciudadDestino}</p>
              )}

              <button
                onClick={() => handleDescargar(f.id, f.numeroFactura)}
                style={s.downloadBtn}
                disabled={descargando === f.id}>
                {descargando === f.id ? "⏳ Descargando..." : "📄 Descargar PDF"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <motion.div style={{ ...s.statCard, borderTop: `3px solid ${color}` }}
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <p style={s.statLabel}>{label}</p>
      <p style={{ ...s.statValue, color }}>{value}</p>
    </motion.div>
  );
}

const s = {
  page:       { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" },
  content:    { padding: "28px 32px" },
  title:      { color: "#4ade80", marginBottom: 20 },
  stats:      { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 },
  statCard:   { background: "#1e293b", borderRadius: 10, padding: "16px 22px", minWidth: 140, flex: "1 1 130px" },
  statLabel:  { margin: 0, fontSize: 13, color: "#94a3b8" },
  statValue:  { margin: "6px 0 0", fontSize: 26, fontWeight: "bold" },
  hint:       { color: "#64748b" },
  empty:      { textAlign: "center", color: "#64748b", padding: "60px 0" },
  list:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 },
  card:       { background: "#1e293b", borderRadius: 14, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  numero:     { margin: 0, fontWeight: "bold", fontSize: 16, color: "#38bdf8" },
  fecha:      { margin: "4px 0 0", fontSize: 12, color: "#64748b" },
  estadoBadge:{ fontSize: 12, fontWeight: "bold" },
  descripcion:{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.5 },
  desglose:   { background: "#0f172a", borderRadius: 8, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 },
  desgloseRow:{ display: "flex", justifyContent: "space-between", fontSize: 13 },
  desgloseLabel: { color: "#64748b" },
  metodo:     { margin: 0, fontSize: 12, color: "#64748b" },
  downloadBtn: {
    padding: "10px", background: "#38bdf822", border: "1px solid #38bdf8",
    color: "#38bdf8", borderRadius: 8, cursor: "pointer", fontSize: 14,
    fontWeight: "bold", textAlign: "center",
  },
};
