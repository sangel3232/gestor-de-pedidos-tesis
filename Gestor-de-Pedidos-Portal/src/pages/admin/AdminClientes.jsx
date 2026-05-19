import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getClientes, crearCliente } from "../../api";
import NavbarAdmin from "../../components/NavbarAdmin";

const EMPTY = { nombre: "", email: "", ciudad: "" };

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [loading, setLoading] = useState(false);

  const cargar = () => getClientes().then((r) => setClientes(r.data.content || r.data));
  useEffect(() => { cargar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.ciudad) {
      setMsg({ text: "Completa todos los campos", ok: false }); return;
    }
    setLoading(true);
    try {
      await crearCliente(form);
      setForm(EMPTY);
      setMsg({ text: "✅ Cliente creado", ok: true });
      cargar();
    } catch (err) {
      setMsg({ text: "❌ " + (err.response?.data?.mensaje || "Error"), ok: false });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ text: "", ok: true }), 3000);
    }
  };

  return (
    <div style={s.page}>
      <NavbarAdmin />
      <div style={s.content}>
        <h2 style={s.title}>Clientes</h2>
        <form onSubmit={handleSubmit} style={s.form}>
          <h3 style={s.formTitle}>Nuevo cliente</h3>
          <div style={s.row}>
            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} style={s.input} />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} style={s.input} />
            <input name="ciudad" placeholder="Ciudad" value={form.ciudad} onChange={handleChange} style={s.input} />
            <button type="submit" style={s.btn} disabled={loading}>{loading ? "Guardando..." : "Agregar"}</button>
          </div>
          {msg.text && <p style={{ color: msg.ok ? "#4ade80" : "#f87171", margin: 0, fontSize: 14 }}>{msg.text}</p>}
        </form>

        <div style={s.table}>
          <div style={s.thead}>
            <span>ID</span><span>Nombre</span><span>Email</span><span>Ciudad</span><span>Estado</span>
          </div>
          {clientes.length === 0 && <p style={s.empty}>Sin clientes.</p>}
          {clientes.map((c) => (
            <motion.div key={c.id} style={s.trow} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span style={{ color: "#64748b" }}>#{c.id}</span>
              <span>{c.nombre}</span>
              <span style={{ color: "#94a3b8" }}>{c.email}</span>
              <span>{c.ciudad}</span>
              <span style={{ color: c.activo ? "#4ade80" : "#f87171" }}>{c.activo ? "Activo" : "Inactivo"}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" },
  content: { padding: "28px 32px" },
  title: { color: "#38bdf8", marginBottom: 20 },
  form: { background: "#1e293b", borderRadius: 10, padding: "20px 24px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 12, border: "1px solid #334155" },
  formTitle: { margin: 0, color: "#94a3b8", fontSize: 15 },
  row: { display: "flex", gap: 12, flexWrap: "wrap" },
  input: { flex: "1 1 160px", padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 14, outline: "none" },
  btn: { padding: "10px 22px", background: "#38bdf8", color: "#0f172a", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" },
  table: { background: "#1e293b", borderRadius: 10, overflow: "hidden", border: "1px solid #334155" },
  thead: { display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 100px", padding: "10px 16px", background: "#0f172a", color: "#94a3b8", fontSize: 13, fontWeight: "bold" },
  trow: { display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 100px", padding: "10px 16px", borderTop: "1px solid #0f172a", fontSize: 14 },
  empty: { padding: 16, color: "#94a3b8" },
};
