import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPagos, getClientes, getPagosPorCliente, confirmarPago, reembolsarPago } from "../../api";
import NavbarAdmin from "../../components/NavbarAdmin";

const COLORES = { COMPLETADO: "#4ade80", PENDIENTE: "#fbbf24", FALLIDO: "#f87171", REEMBOLSADO: "#a78bfa", SOLICITADO_REEMBOLSO: "#f59e0b" };

export default function AdminPagos() {
  const [pagos, setPagos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [modalPago, setModalPago] = useState(null); // pago seleccionado para reembolso

  useEffect(() => {
    getClientes().then((r) => setClientes(r.data.content || r.data));
    cargarPagos();
  }, []);

  const cargarPagos = async (clienteId = "") => {
    setLoading(true);
    try {
      const res = clienteId ? await getPagosPorCliente(clienteId) : await getPagos();
      setPagos(res.data);
    } finally { setLoading(false); }
  };

  const notify = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 5000);
  };

  const handleConfirmar = async (id) => {
    try {
      await confirmarPago(id);
      notify("✅ Pedido confirmado como PAGADO");
      cargarPagos(filtroCliente);
    } catch (e) {
      notify("❌ " + (e.response?.data?.mensaje || "No se pudo confirmar"), false);
    }
  };

  const handleReembolsarConfirmado = async () => {
    if (!modalPago) return;
    try {
      await reembolsarPago(modalPago.id, modalPago.motivoReembolso || "Reembolso administrativo");
      notify("✅ Reembolso procesado correctamente. El cliente recibirá el dinero en breve.");
      setModalPago(null);
      cargarPagos(filtroCliente);
    } catch (e) {
      notify("❌ " + (e.response?.data?.mensaje || "No se pudo procesar el reembolso"), false);
      setModalPago(null);
    }
  };

  const totalCobrado = pagos.filter(p => p.estado === "COMPLETADO").reduce((a, p) => a + (p.monto || 0), 0);

  return (
    <div style={s.page}>
      <NavbarAdmin />
      <div style={s.content}>
        <h2 style={s.title}>Pagos</h2>

        {msg.text && (
          <motion.p
            style={{ color: msg.ok ? "#4ade80" : "#f87171", marginBottom: 12, fontSize: 14 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {msg.text}
          </motion.p>
        )}

        {/* Stats */}
        <div style={s.stats}>
          {[
            { label: "Total",        value: pagos.length,                                                    color: "#38bdf8" },
            { label: "Completados",  value: pagos.filter(p => p.estado === "COMPLETADO").length,            color: "#4ade80" },
            { label: "Solicitudes",  value: pagos.filter(p => p.estado === "SOLICITADO_REEMBOLSO").length,  color: "#f59e0b" },
            { label: "Reembolsados", value: pagos.filter(p => p.estado === "REEMBOLSADO").length,           color: "#a78bfa" },
            { label: "Fallidos",     value: pagos.filter(p => p.estado === "FALLIDO").length,               color: "#f87171" },
            { label: "Facturado",    value: `$${totalCobrado.toFixed(2)}`,                                  color: "#4ade80" },
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
            onChange={(e) => { setFiltroCliente(e.target.value); cargarPagos(e.target.value); }}
            style={s.select}>
            <option value="">Todos</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        {/* Tabla */}
        <div style={s.table}>
          <div style={s.thead}>
            <span>ID</span><span>Pedido</span><span>Cliente</span><span>Est. Pedido</span>
            <span>Monto</span><span>Método</span><span>Estado</span><span>Referencia</span><span>Fecha</span><span>Acciones</span>
          </div>
          {loading && <p style={s.hint}>Cargando...</p>}
          {!loading && pagos.length === 0 && <p style={s.hint}>Sin pagos.</p>}
          {pagos.map((p) => (
            <motion.div key={p.id} style={s.row} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span>#{p.id}</span>
              <span>#{p.pedidoId}</span>
              <span>{p.clienteNombre || "-"}</span>
              <span style={{ color: p.pedidoEstado === "REEMBOLSADO" ? "#a78bfa" : "#e2e8f0", fontSize: 12 }}>
                {p.pedidoEstado || "-"}
              </span>
              <span style={{ color: "#4ade80", fontWeight: "bold" }}>${p.monto?.toFixed(2)}</span>
              <span style={{ fontSize: 12 }}>{p.metodoPago?.replace(/_/g, " ")}</span>
              <span style={{ color: COLORES[p.estado] || "#e2e8f0", fontWeight: "bold" }}>{p.estado}</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>{p.referenciaExterna || "—"}</span>
              <span style={{ fontSize: 12 }}>{p.procesadoEn ? new Date(p.procesadoEn).toLocaleString() : "—"}</span>
              <span style={s.actions}>
                {p.estado === "COMPLETADO" && p.pedidoEstado === "CONFIRMADO" && (
                  <button onClick={() => handleConfirmar(p.id)} style={s.confirmBtn}>
                    ✓ Confirmar
                  </button>
                )}
                {(p.estado === "COMPLETADO" || p.estado === "SOLICITADO_REEMBOLSO") &&
                 (p.pedidoEstado === "PAGADO" || p.pedidoEstado === "CONFIRMADO") && (
                  <button onClick={() => setModalPago(p)} style={p.estado === "SOLICITADO_REEMBOLSO" ? s.refundBtnAlert : s.refundBtn}>
                    {p.estado === "SOLICITADO_REEMBOLSO" ? "🔔 Aprobar reembolso" : "↩ Reembolsar"}
                  </button>
                )}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal de confirmación de reembolso */}
      <AnimatePresence>
        {modalPago && (
          <motion.div style={s.overlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={s.modal}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>

              <div style={s.modalIcon}>↩️</div>
              <h3 style={s.modalTitle}>Confirmar Reembolso</h3>
              <p style={s.modalDesc}>
                Estás a punto de reembolsar el pago <strong style={{ color: "#e2e8f0" }}>#{modalPago.id}</strong> del
                cliente <strong style={{ color: "#e2e8f0" }}>{modalPago.clienteNombre}</strong>.
              </p>
              <div style={s.modalInfo}>
                <span>Monto a reembolsar</span>
                <span style={{ color: "#4ade80", fontWeight: "bold", fontSize: 20 }}>
                  ${modalPago.monto?.toFixed(2)}
                </span>
              </div>
              <div style={s.modalInfo}>
                <span>Referencia</span>
                <span style={{ color: "#94a3b8", fontSize: 13 }}>{modalPago.referenciaExterna || "—"}</span>
              </div>
              <p style={s.modalWarning}>
                ⚠️ Esta acción marcará el pedido como <strong>REEMBOLSADO</strong> y no se puede deshacer.
              </p>

              <div style={s.modalBtns}>
                <button onClick={() => setModalPago(null)} style={s.cancelBtn}>
                  Cancelar
                </button>
                <button onClick={handleReembolsarConfirmado} style={s.confirmRefundBtn}>
                  Confirmar Reembolso
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  table:  { background: "#1e293b", borderRadius: 10, overflow: "hidden" },
  thead:  { display: "grid", gridTemplateColumns: "50px 70px 1fr 100px 100px 130px 110px 160px 140px 160px", padding: "10px 16px", background: "#0f172a", color: "#64748b", fontSize: 12, fontWeight: "bold" },
  row:    { display: "grid", gridTemplateColumns: "50px 70px 1fr 100px 100px 130px 110px 160px 140px 160px", padding: "10px 16px", borderTop: "1px solid #0f172a", fontSize: 13, alignItems: "center" },
  hint:   { padding: 16, color: "#64748b", fontSize: 14 },
  actions:    { display: "flex", gap: 6, flexWrap: "wrap" },
  confirmBtn:    { padding: "4px 10px", fontSize: 11, borderRadius: 6, border: "none", background: "#4ade80", color: "#0f172a", cursor: "pointer", fontWeight: "bold" },
  refundBtn:     { padding: "4px 10px", fontSize: 11, borderRadius: 6, border: "1px solid #a78bfa", background: "transparent", color: "#a78bfa", cursor: "pointer", fontWeight: "bold" },
  refundBtnAlert:{ padding: "4px 10px", fontSize: 11, borderRadius: 6, border: "1px solid #f59e0b", background: "#f59e0b22", color: "#f59e0b", cursor: "pointer", fontWeight: "bold" },
  // Modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "#1e293b", borderRadius: 16, padding: "32px 36px",
    width: 420, maxWidth: "90vw", border: "1px solid #334155",
    display: "flex", flexDirection: "column", gap: 14,
  },
  modalIcon:  { fontSize: 40, textAlign: "center" },
  modalTitle: { margin: 0, textAlign: "center", color: "#e2e8f0", fontSize: 20 },
  modalDesc:  { margin: 0, color: "#94a3b8", fontSize: 14, textAlign: "center", lineHeight: 1.6 },
  modalInfo:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0f172a", borderRadius: 8 },
  modalWarning: { margin: 0, color: "#fbbf24", fontSize: 13, textAlign: "center" },
  modalBtns: { display: "flex", gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, padding: "11px", background: "#334155", color: "#e2e8f0",
    border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14,
  },
  confirmRefundBtn: {
    flex: 2, padding: "11px", background: "#a78bfa", color: "#0f172a",
    border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 14,
  },
};
