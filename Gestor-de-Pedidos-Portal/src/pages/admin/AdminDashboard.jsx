import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPedidos, getClientes, getPagos, descargarReporteVentas, descargarReporteProductos } from "../../api";
import NavbarAdmin from "../../components/NavbarAdmin";

const ESTADOS = ["CREADO", "CONFIRMADO", "PAGADO", "CANCELADO"];
const COLORES = { CREADO: "#38bdf8", CONFIRMADO: "#a78bfa", PAGADO: "#4ade80", CANCELADO: "#f87171" };

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [descargando, setDescargando] = useState("");

  useEffect(() => {
    getPedidos().then((r) => setPedidos(r.data.content || r.data));
    getClientes().then((r) => setClientes(r.data.content || r.data));
    getPagos().then((r) => setPagos(r.data));
  }, []);

  const descargarPDF = async (tipo) => {
    setDescargando(tipo);
    try {
      const hoy   = new Date().toISOString().split("T")[0];
      const inicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
      const res = tipo === "ventas"
        ? await descargarReporteVentas(inicio, hoy)
        : await descargarReporteProductos();
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href  = url;
      link.download = tipo === "ventas" ? `reporte-ventas-${hoy}.pdf` : `reporte-inventario-${hoy}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Error al generar el reporte PDF");
    } finally {
      setDescargando("");
    }
  };

  const totalPagado = pagos
    .filter((p) => p.estado === "COMPLETADO")
    .reduce((acc, p) => acc + (p.monto || 0), 0);

  return (
    <div style={s.page}>
      <NavbarAdmin />
      <div style={s.content}>
        <h2 style={s.title}>Dashboard</h2>

        {/* Botones de reportes */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={() => descargarPDF("ventas")} disabled={descargando === "ventas"}
            style={s.reportBtn}>
            {descargando === "ventas" ? "⏳ Generando..." : "📄 Reporte de Ventas (PDF)"}
          </button>
          <button onClick={() => descargarPDF("productos")} disabled={descargando === "productos"}
            style={{ ...s.reportBtn, background: "#a78bfa22", borderColor: "#a78bfa", color: "#a78bfa" }}>
            {descargando === "productos" ? "⏳ Generando..." : "📦 Reporte de Inventario (PDF)"}
          </button>
        </div>

        <div style={s.grid}>
          <Card label="Total Pedidos" value={pedidos.length} color="#38bdf8" />
          <Card label="Clientes" value={clientes.length} color="#a78bfa" />
          <Card label="Pagos completados" value={pagos.filter(p => p.estado === "COMPLETADO").length} color="#4ade80" />
          <Card label="Total facturado" value={`$${totalPagado.toFixed(2)}`} color="#4ade80" />
          {ESTADOS.map((e) => (
            <Card key={e} label={e} value={pedidos.filter(p => p.estado === e).length} color={COLORES[e]} />
          ))}
        </div>

        <h3 style={s.subtitle}>Últimos pedidos</h3>
        <div style={s.table}>
          <div style={s.thead}>
            <span>ID</span><span>Descripción</span>
            <span>Cliente</span><span>Total</span><span>Estado</span><span>Fecha</span>
          </div>
          {pedidos.slice(0, 10).map((p) => (
            <motion.div key={p.id} style={s.row}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
              <span>#{p.id}</span>
              <span>{p.descripcion}</span>
              <span>{p.cliente?.nombre || "-"}</span>
              <span>${p.total?.toFixed(2)}</span>
              <span style={{ color: COLORES[p.estado] }}>{p.estado}</span>
              <span>{p.fecha ? new Date(p.fecha).toLocaleDateString() : "-"}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, color }) {
  return (
    <motion.div style={{ ...s.card, borderTop: `3px solid ${color}` }}
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <p style={s.cardLabel}>{label}</p>
      <p style={{ ...s.cardValue, color }}>{value}</p>
    </motion.div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" },
  content: { padding: "28px 32px" },
  title: { color: "#38bdf8", marginBottom: 20 },
  subtitle: { color: "#94a3b8", margin: "28px 0 12px" },
  reportBtn: {
    padding: "9px 18px", background: "#38bdf822", border: "1px solid #38bdf8",
    color: "#38bdf8", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: "bold",
  },
  grid: { display: "flex", flexWrap: "wrap", gap: 16 },
  card: { background: "#1e293b", borderRadius: 10, padding: "18px 24px", minWidth: 150, flex: "1 1 140px", border: "1px solid #334155" },
  cardLabel: { margin: 0, fontSize: 13, color: "#94a3b8" },
  cardValue: { margin: "6px 0 0", fontSize: 28, fontWeight: "bold" },
  table: { background: "#1e293b", borderRadius: 10, overflow: "hidden", border: "1px solid #334155" },
  thead: {
    display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px 120px 120px",
    padding: "10px 16px", background: "#0f172a", color: "#94a3b8", fontSize: 13, fontWeight: "bold",
  },
  row: {
    display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px 120px 120px",
    padding: "10px 16px", borderTop: "1px solid #0f172a", fontSize: 14,
  },
};
