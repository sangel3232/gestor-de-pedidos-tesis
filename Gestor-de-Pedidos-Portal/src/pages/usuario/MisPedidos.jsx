import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getPedidosPorCliente } from "../../api";
import NavbarUsuario from "../../components/NavbarUsuario";

// Pasos del tracking en orden
const PASOS = [
  { estado: "CREADO",     label: "Pedido creado",    icono: "📋" },
  { estado: "CONFIRMADO", label: "Confirmado",        icono: "✅" },
  { estado: "PAGADO",     label: "Pago recibido",     icono: "💳" },
  { estado: "EN_CAMINO",  label: "En camino",         icono: "🚚" },
  { estado: "ENTREGADO",  label: "Entregado",         icono: "📦" },
];

const COLORES = {
  CREADO: "#38bdf8", CONFIRMADO: "#a78bfa", PAGADO: "#4ade80",
  EN_CAMINO: "#fb923c", ENTREGADO: "#22c55e",
  CANCELADO: "#f87171", REEMBOLSADO: "#c084fc",
};

function indicePaso(estado) {
  return PASOS.findIndex(p => p.estado === estado);
}

function TrackingTimeline({ estado }) {
  const idx = indicePaso(estado);
  const cancelado   = estado === "CANCELADO";
  const reembolsado = estado === "REEMBOLSADO";

  if (cancelado || reembolsado) {
    return (
      <div style={tl.container}>
        <div style={{ ...tl.badge, background: COLORES[estado] + "22", color: COLORES[estado] }}>
          {cancelado ? "❌ Pedido cancelado" : "↩️ Pedido reembolsado"}
        </div>
      </div>
    );
  }

  return (
    <div style={tl.container}>
      {PASOS.map((paso, i) => {
        const completado = i <= idx;
        const activo     = i === idx;
        return (
          <div key={paso.estado} style={tl.paso}>
            {/* Línea conectora */}
            {i > 0 && (
              <div style={{ ...tl.linea, background: i <= idx ? COLORES[PASOS[idx].estado] : "#334155" }} />
            )}
            {/* Círculo */}
            <motion.div
              style={{
                ...tl.circulo,
                background: completado ? COLORES[PASOS[idx].estado] : "#1e293b",
                border: `2px solid ${completado ? COLORES[PASOS[idx].estado] : "#334155"}`,
                boxShadow: activo ? `0 0 12px ${COLORES[paso.estado]}88` : "none",
              }}
              animate={activo ? { scale: [1, 1.15, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.8 }}>
              <span style={{ fontSize: activo ? 16 : 13 }}>{paso.icono}</span>
            </motion.div>
            {/* Label */}
            <p style={{ ...tl.label, color: completado ? "#e2e8f0" : "#475569", fontWeight: activo ? "bold" : "normal" }}>
              {paso.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

const tl = {
  container: { display: "flex", alignItems: "flex-start", gap: 0, marginTop: 16, marginBottom: 4, position: "relative" },
  paso:      { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" },
  linea:     { position: "absolute", top: 18, right: "50%", width: "100%", height: 2, zIndex: 0 },
  circulo:   { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, position: "relative" },
  label:     { fontSize: 10, textAlign: "center", marginTop: 6, lineHeight: 1.3 },
  badge:     { padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: "bold" },
};

export default function MisPedidos() {
  const { session } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.clienteId) return;
    getPedidosPorCliente(session.clienteId)
      .then((r) => setPedidos(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div style={s.page}>
      <NavbarUsuario />
      <div style={s.content}>
        <h2 style={s.title}>Mis Pedidos</h2>

        {loading && <p style={s.hint}>Cargando...</p>}

        {!loading && pedidos.length === 0 && (
          <div style={s.empty}>
            <p style={{ fontSize: 48 }}>📦</p>
            <p>Aún no tienes pedidos. ¡Ve a la tienda y haz tu primera compra!</p>
          </div>
        )}

        <div style={s.list}>
          {pedidos.map((p) => (
            <motion.div key={p.id} style={s.card}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>

              <div style={s.cardHeader}>
                <span style={s.pedidoId}>Pedido #{p.id}</span>
                <span style={{ ...s.estadoBadge, background: (COLORES[p.estado] || "#334155") + "22", color: COLORES[p.estado] || "#94a3b8" }}>
                  {p.estado}
                </span>
              </div>

              <p style={s.descripcion}>{p.descripcion}</p>

              {p.ciudadDestino && (
                <p style={s.meta}>📍 {p.ciudadDestino}</p>
              )}
              {p.direccionEntrega && (
                <p style={s.meta}>🏠 {p.direccionEntrega}</p>
              )}

              {/* Línea de tiempo de seguimiento */}
              <TrackingTimeline estado={p.estado} />

              {p.observacionCancelacion && (
                <p style={s.obs}>💬 {p.observacionCancelacion}</p>
              )}

              <div style={s.cardFooter}>
                <span style={s.total}>${p.total?.toFixed(2)}</span>
                <span style={s.fecha}>
                  {p.fecha ? new Date(p.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" },
  content:    { padding: "28px 32px" },
  title:      { color: "#4ade80", marginBottom: 24 },
  hint:       { color: "#64748b" },
  empty:      { textAlign: "center", color: "#64748b", padding: "60px 0" },
  list:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 },
  card:       { background: "#1e293b", borderRadius: 14, padding: "20px 22px", border: "1px solid #334155" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  pedidoId:   { fontWeight: "bold", fontSize: 15 },
  estadoBadge:{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: "bold" },
  descripcion:{ margin: "0 0 8px", fontSize: 14, color: "#cbd5e1", lineHeight: 1.5 },
  meta:       { margin: "2px 0", fontSize: 12, color: "#64748b" },
  obs:        { margin: "8px 0 0", fontSize: 12, color: "#f87171", fontStyle: "italic" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid #334155" },
  total:      { color: "#4ade80", fontWeight: "bold", fontSize: 20 },
  fecha:      { color: "#64748b", fontSize: 13 },
};
