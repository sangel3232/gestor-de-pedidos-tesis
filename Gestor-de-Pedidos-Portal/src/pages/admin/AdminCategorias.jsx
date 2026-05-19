import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria,
} from "../../api";
import NavbarAdmin from "../../components/NavbarAdmin";

const EMPTY = { nombre: "", descripcion: "", icono: "📦" };

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm]             = useState(EMPTY);
  const [editId, setEditId]         = useState(null);
  const [msg, setMsg]               = useState({ text: "", ok: true });
  const [loading, setLoading]       = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = () => getCategorias().then((r) => setCategorias(r.data));

  const notify = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { notify("El nombre es obligatorio", false); return; }
    setLoading(true);
    const payload = {
      nombre:      form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      icono:       form.icono.trim() || "📦",
    };
    try {
      if (editId) {
        await actualizarCategoria(editId, payload);
        notify("✅ Categoría actualizada");
      } else {
        await crearCategoria(payload);
        notify("✅ Categoría creada");
      }
      setForm(EMPTY);
      setEditId(null);
      cargar();
    } catch (err) {
      notify("❌ " + (err.response?.data?.mensaje || "Error"), false);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (c) => {
    setEditId(c.id);
    setForm({ nombre: c.nombre, descripcion: c.descripcion || "", icono: c.icono || "📦" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    try {
      await eliminarCategoria(id);
      notify("Categoría eliminada");
      cargar();
    } catch (err) {
      notify("❌ " + (err.response?.data?.mensaje || "Error al eliminar"), false);
    }
  };

  const handleCancelar = () => { setForm(EMPTY); setEditId(null); };

  return (
    <div style={s.page}>
      <NavbarAdmin />
      <div style={s.content}>
        <h2 style={s.title}>Gestión de Categorías</h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={s.form}>
          <h3 style={s.formTitle}>{editId ? "✏️ Editar categoría" : "➕ Nueva categoría"}</h3>
          <div style={s.row}>
            <input
              name="icono"
              placeholder="Icono (emoji)"
              value={form.icono}
              onChange={handleChange}
              style={{ ...s.input, maxWidth: 90, textAlign: "center", fontSize: 22 }}
            />
            <input
              name="nombre"
              placeholder="Nombre de la categoría *"
              value={form.nombre}
              onChange={handleChange}
              style={{ ...s.input, flex: 2 }}
            />
            <input
              name="descripcion"
              placeholder="Descripción (opcional)"
              value={form.descripcion}
              onChange={handleChange}
              style={{ ...s.input, flex: 3 }}
            />
            <button type="submit" style={s.btnPrimary} disabled={loading}>
              {loading ? "Guardando..." : editId ? "Actualizar" : "Crear"}
            </button>
            {editId && (
              <button type="button" onClick={handleCancelar} style={s.btnSecondary}>
                Cancelar
              </button>
            )}
          </div>
          {msg.text && (
            <p style={{ color: msg.ok ? "#4ade80" : "#f87171", margin: 0, fontSize: 14 }}>
              {msg.text}
            </p>
          )}
        </form>

        {/* Tabla */}
        <div style={s.table}>
          <div style={s.thead}>
            <span>ID</span>
            <span>Icono</span>
            <span>Nombre</span>
            <span>Descripción</span>
            <span>Activo</span>
            <span>Acciones</span>
          </div>
          {categorias.length === 0 && <p style={s.empty}>Sin categorías.</p>}
          {categorias.map((c) => (
            <motion.div key={c.id} style={s.trow}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span style={{ color: "#64748b" }}>#{c.id}</span>
              <span style={{ fontSize: 22 }}>{c.icono || "📦"}</span>
              <span style={{ fontWeight: "bold" }}>{c.nombre}</span>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>{c.descripcion || "—"}</span>
              <span style={{ color: c.activo !== false ? "#4ade80" : "#f87171" }}>
                {c.activo !== false ? "✅ Sí" : "❌ No"}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => handleEditar(c)} style={s.btnEdit}>Editar</button>
                <button onClick={() => handleEliminar(c.id)} style={s.btnDel}>Eliminar</button>
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
  form: {
    background: "#1e293b", borderRadius: 10, padding: "20px 24px",
    marginBottom: 24, display: "flex", flexDirection: "column", gap: 12,
    border: "1px solid #334155",
  },
  formTitle: { margin: 0, color: "#94a3b8", fontSize: 15 },
  row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  input: {
    flex: "1 1 160px", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0",
    fontSize: 14, outline: "none",
  },
  btnPrimary: {
    padding: "10px 22px", background: "#38bdf8", color: "#0f172a",
    border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap",
  },
  btnSecondary: {
    padding: "10px 18px", background: "#334155", color: "#e2e8f0",
    border: "none", borderRadius: 8, cursor: "pointer",
  },
  table:  { background: "#1e293b", borderRadius: 10, overflow: "hidden", border: "1px solid #334155" },
  thead: {
    display: "grid", gridTemplateColumns: "60px 60px 1fr 2fr 80px 160px",
    padding: "10px 16px", background: "#0f172a", color: "#94a3b8", fontSize: 13, fontWeight: "bold",
  },
  trow: {
    display: "grid", gridTemplateColumns: "60px 60px 1fr 2fr 80px 160px",
    padding: "10px 16px", borderTop: "1px solid #0f172a", fontSize: 14, alignItems: "center",
  },
  btnEdit: {
    padding: "5px 12px", background: "#1e293b", color: "#38bdf8",
    border: "1px solid #334155", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: "bold",
  },
  btnDel: {
    padding: "5px 12px", background: "#f87171", color: "#0f172a",
    border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: "bold",
  },
  empty: { padding: 16, color: "#94a3b8" },
};
