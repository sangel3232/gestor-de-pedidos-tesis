import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getPagosPorCliente, solicitarReembolso } from "../../api";
import NavbarUsuario from "../../components/NavbarUsuario";

const COLORES = { COMPLETADO: "#4ade80", PENDIENTE: "#fbbf24", FALLIDO: "#f87171", REEMBOLSADO: "#a78bfa", SOLICITADO_REEMBOLSO: "#f59e0b" };
const ICONOS  = { COMPLETADO: "✅", PENDIENTE: "⏳", FALLIDO: "❌", REEMBOLSADO: "↩️", SOLICITADO_REEMBOLSO: "🔔" };

const MOTIVOS = [
  "Producto no llegó",
  "Producto llegó dañado",
  "Producto no coincide con la descripción",
  "Me arrepentí de la compra",
  "Compra duplicada",
  "Otro motivo",
];

export default function MisPagos() {
  const { session } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);       // pago seleccionado
  const [motivo, setMotivo] = useState("");
  const [motivoCustom, setMotivoCustom] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });

  useEffect(() => {
    if (!session?.clienteId) return;
    cargarPagos();
  }, [session]);

  const cargarPagos = () => {
    setLoading(true);
    getPagosPorCliente(session.clienteId)
      .then((r) => setPagos(r.data))
      .catch(() => setPagos([]))
      .finally(() => setLoading(false));
  };

  const notify = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 5000);
  };

  const abrirModal = (pago) => {
    setModal(pago);
    setMotivo("");
    setMotivoCustom("");
  };

  const handleSolicitarReembolso = async () => {
    const motivoFinal = motivo === "Otro motivo" ? motivoCustom.trim() : motivo;
    if (!motivoFinal) { notify("Selecciona o escribe el motivo del reembolso", false); return; }

    setProcesando(true);
    try {
      await solicitarReembolso(modal.id, motivoFinal);
      notify("✅ Solicitud enviada. El administrador procesará tu reembolso en breve.");
      setModal(null);
      cargarPagos();
    } catch (e) {
      notify("❌ " + (e.response?.data?.mensaje || "No se pudo enviar la solicitud"), false);
    } finally {
      setProcesando(false);
    }
  };

  const totalGastado = pagos
    .filter((p) => p.estado === "COMPLETADO")
    .reduce((a, p) => a + (p.monto || 0), 0);

  return (
    <div style={s.page}>
      <NavbarUsuario />
      <div style={s.content}>
        <h2 style={s.title}>Mis Pagos</h2>

        {msg.text && (
          <motion.p style={{ color: msg.ok ? "#4ade80" : "#f87171", marginBottom: 16, fontSize: 14 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {msg.text}
          </motion.p>
        )}

        <div style={s.stats}>
          <StatCard label="Total pagos"   value={pagos.length}                                          color="#38bdf8" />
          <StatCard label="Completados"   value={pagos.filter((p) => p.estado === "COMPLETADO").length} color="#4ade80" />
          <StatCard label="Reembolsados"  value={pagos.filter((p) => p.estado === "REEMBOLSADO").length}color="#a78bfa" />
          <StatCard label="Total gastado" value={`$${totalGastado.toFixed(2)}`}                         color="#4ade80" />
        </div>

        {loading && <p style={s.hint}>Cargando...</p>}

        {!loading && pagos.length === 0 && (
          <div style={s.empty}>
            <p style={{ fontSize: 48 }}>💳</p>
            <p>No tienes pagos registrados aún.</p>
          </div>
        )}

        <div style={s.list}>
          {pagos.map((p) => (
            <motion.div key={p.id}
              style={{ ...s.card, borderLeft: `4px solid ${COLORES[p.estado] || "#334155"}` }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>

              <div style={s.cardHeader}>
                <span style={s.pagoId}>{ICONOS[p.estado]} Pago #{p.id}</span>
                <span style={{ ...s.estadoBadge, color: COLORES[p.estado] }}>{p.estado}</span>
              </div>

              <p style={s.pedidoRef}>Pedido #{p.pedidoId} — {p.pedidoDescripcion}</p>

              <div style={s.cardFooter}>
                <div>
                  <p style={s.monto}>${p.monto?.toFixed(2)}</p>
                  <p style={s.metodo}>{p.metodoPago?.replace(/_/g, " ")}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  {p.referenciaExterna && <p style={s.ref}>Ref: {p.referenciaExterna}</p>}
                  <p style={s.fecha}>
                    {p.procesadoEn
                      ? new Date(p.procesadoEn).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Botón reembolso solo si el pago está COMPLETADO */}
              {p.estado === "COMPLETADO" && (
                <button onClick={() => abrirModal(p)} style={s.reembolsoBtn}>
                  ↩ Solicitar reembolso
                </button>
              )}

              {p.estado === "SOLICITADO_REEMBOLSO" && (
                <p style={s.solicitudTag}>🔔 Solicitud enviada — pendiente de aprobación</p>
              )}

              {p.estado === "REEMBOLSADO" && p.mensajeRespuesta && (
                <p style={s.motivoTag}>💬 {p.mensajeRespuesta}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal solicitud de reembolso */}
      <AnimatePresence>
        {modal && (
          <motion.div style={s.overlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={s.modal}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>

              <div style={{ fontSize: 40, textAlign: "center" }}>↩️</div>
              <h3 style={s.modalTitle}>Solicitar Reembolso</h3>

              <div style={s.modalInfo}>
                <span style={{ color: "#94a3b8" }}>Monto</span>
                <span style={{ color: "#4ade80", fontWeight: "bold", fontSize: 20 }}>
                  ${modal.monto?.toFixed(2)}
                </span>
              </div>
              <div style={s.modalInfo}>
                <span style={{ color: "#94a3b8" }}>Pedido</span>
                <span style={{ color: "#e2e8f0" }}>#{modal.pedidoId}</span>
              </div>

              <p style={s.modalLabel}>¿Por qué deseas el reembolso?</p>

              <div style={s.motivosList}>
                {MOTIVOS.map((m) => (
                  <button key={m} onClick={() => setMotivo(m)}
                    style={{ ...s.motivoBtn, ...(motivo === m ? s.motivoBtnActive : {}) }}>
                    {m}
                  </button>
                ))}
              </div>

              {motivo === "Otro motivo" && (
                <textarea
                  placeholder="Describe el motivo..."
                  value={motivoCustom}
                  onChange={(e) => setMotivoCustom(e.target.value)}
                  style={s.textarea}
                  rows={3}
                />
              )}

              <p style={{ fontSize: 12, color: "#64748b", margin: 0, textAlign: "center" }}>
                ⚠️ Una vez aprobado, el reembolso puede tardar hasta 15 días hábiles.
              </p>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setModal(null)} style={s.cancelBtn}>Cancelar</button>
                <button onClick={handleSolicitarReembolso} style={s.confirmBtn} disabled={procesando}>
                  {procesando ? "Procesando..." : "Confirmar Reembolso"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  statCard:   { background: "#1e293b", borderRadius: 10, padding: "16px 22px", minWidth: 130, flex: "1 1 120px" },
  statLabel:  { margin: 0, fontSize: 13, color: "#94a3b8" },
  statValue:  { margin: "6px 0 0", fontSize: 26, fontWeight: "bold" },
  hint:       { color: "#64748b" },
  empty:      { textAlign: "center", color: "#64748b", padding: "60px 0" },
  list:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
  card:       { background: "#1e293b", borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 0 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  pagoId:     { fontWeight: "bold", fontSize: 15 },
  estadoBadge:{ fontSize: 12, fontWeight: "bold" },
  pedidoRef:  { margin: "0 0 12px", fontSize: 13, color: "#64748b" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
  monto:      { margin: 0, color: "#4ade80", fontWeight: "bold", fontSize: 22 },
  metodo:     { margin: "4px 0 0", fontSize: 12, color: "#94a3b8" },
  ref:        { margin: 0, fontSize: 11, color: "#64748b" },
  fecha:      { margin: "4px 0 0", fontSize: 13, color: "#94a3b8" },
  reembolsoBtn: {
    marginTop: 14, padding: "9px", background: "transparent",
    border: "1px solid #a78bfa", color: "#a78bfa", borderRadius: 8,
    cursor: "pointer", fontSize: 13, fontWeight: "bold",
  },
  motivoTag:    { marginTop: 8, fontSize: 12, color: "#a78bfa", fontStyle: "italic" },
  solicitudTag: { marginTop: 8, fontSize: 12, color: "#f59e0b", fontStyle: "italic" },
  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: {
    background: "#1e293b", borderRadius: 16, padding: "28px 32px",
    width: 440, maxWidth: "92vw", border: "1px solid #334155",
    display: "flex", flexDirection: "column", gap: 14,
  },
  modalTitle: { margin: 0, textAlign: "center", color: "#e2e8f0", fontSize: 19 },
  modalInfo:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0f172a", borderRadius: 8 },
  modalLabel: { margin: 0, fontSize: 13, color: "#94a3b8", fontWeight: "bold" },
  motivosList: { display: "flex", flexWrap: "wrap", gap: 8 },
  motivoBtn: {
    padding: "7px 14px", borderRadius: 20, border: "1px solid #334155",
    background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13,
  },
  motivoBtnActive: { background: "#a78bfa22", borderColor: "#a78bfa", color: "#a78bfa", fontWeight: "bold" },
  textarea: {
    width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #334155",
    background: "#0f172a", color: "#e2e8f0", fontSize: 13, outline: "none",
    resize: "vertical", boxSizing: "border-box",
  },
  cancelBtn: {
    flex: 1, padding: "11px", background: "#334155", color: "#e2e8f0",
    border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14,
  },
  confirmBtn: {
    flex: 2, padding: "11px", background: "#a78bfa", color: "#0f172a",
    border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 14,
  },
};
