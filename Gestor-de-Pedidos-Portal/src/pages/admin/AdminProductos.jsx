import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProductos, crearProducto, actualizarProducto, eliminarProducto } from "../../api";
import NavbarAdmin from "../../components/NavbarAdmin";

const EMPTY = { nombre: "", descripcion: "", precio: "", stock: "", imagenUrl: "" };

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = () => getProductos().then((r) => setProductos(r.data));

  const notify = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio || form.stock === "") {
      notify("Nombre, precio y stock son obligatorios", false); return;
    }
    setLoading(true);
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      imagenUrl: form.imagenUrl || null,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
    };
    try {
      if (editId) {
        await actualizarProducto(editId, payload);
        notify("✅ Producto actualizado");
      } else {
        await crearProducto(payload);
        notify("✅ Producto creado");
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

  const handleEditar = (p) => {
    setEditId(p.id);
    setForm({ nombre: p.nombre, descripcion: p.descripcion || "", precio: p.precio, stock: p.stock, imagenUrl: p.imagenUrl || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Desactivar este producto?")) return;
    await eliminarProducto(id);
    notify("Producto desactivado");
    cargar();
  };

  const handleCancelar = () => { setForm(EMPTY); setEditId(null); };

  return (
    <div style={s.page}>
      <NavbarAdmin />
      <div style={s.content}>
        <h2 style={s.title}>Gestión de Productos</h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={s.form}>
          <h3 style={s.formTitle}>{editId ? "✏️ Editar producto" : "➕ Nuevo producto"}</h3>
          <div style={s.row}>
            <input name="nombre" placeholder="Nombre del producto *" value={form.nombre}
              onChange={handleChange} style={{ ...s.input, flex: 2 }} />
            <input name="precio" placeholder="Precio *" type="number" step="0.01" min="0"
              value={form.precio} onChange={handleChange} style={{ ...s.input, maxWidth: 130 }} />
            <input name="stock" placeholder="Stock *" type="number" min="0"
              value={form.stock} onChange={handleChange} style={{ ...s.input, maxWidth: 110 }} />
          </div>
          <div style={s.row}>
            <input name="descripcion" placeholder="Descripción (opcional)"
              value={form.descripcion} onChange={handleChange} style={{ ...s.input, flex: 1 }} />
            <input name="imagenUrl" placeholder="URL de imagen (opcional)"
              value={form.imagenUrl} onChange={handleChange} style={{ ...s.input, flex: 1 }} />
            <button type="submit" style={s.btnPrimary} disabled={loading}>
              {loading ? "Guardando..." : editId ? "Actualizar" : "Crear producto"}
            </button>
            {editId && (
              <button type="button" onClick={handleCancelar} style={s.btnSecondary}>
                Cancelar
              </button>
            )}
          </div>
          {msg.text && <p style={{ color: msg.ok ? "#4ade80" : "#f87171", margin: 0, fontSize: 14 }}>{msg.text}</p>}
        </form>

        {/* Tabla */}
        <div style={s.table}>
          <div style={s.thead}>
            <span>ID</span><span>Nombre</span><span>Descripción</span>
            <span>Precio</span><span>Stock</span><span>Acciones</span>
          </div>
          {productos.length === 0 && <p style={s.empty}>Sin productos.</p>}
          {productos.map((p) => (
            <motion.div key={p.id} style={s.trow}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span style={{ color: "#64748b" }}>#{p.id}</span>
              <span style={{ fontWeight: "bold" }}>{p.nombre}</span>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>{p.descripcion || "—"}</span>
              <span style={{ color: "#4ade80", fontWeight: "bold" }}>${parseFloat(p.precio).toFixed(2)}</span>
              <span style={{ color: p.stock === 0 ? "#f87171" : "#e2e8f0" }}>
                {p.stock === 0 ? "Sin stock" : p.stock}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => handleEditar(p)} style={s.btnEdit}>Editar</button>
                <button onClick={() => handleEliminar(p.id)} style={s.btnDel}>Desactivar</button>
              </div>
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
  row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  input: {
    flex: "1 1 160px", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 14, outline: "none",
  },
  btnPrimary: {
    padding: "10px 22px", background: "#38bdf8", color: "#0f172a",
    border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap",
  },
  btnSecondary: {
    padding: "10px 18px", background: "#334155", color: "#e2e8f0",
    border: "none", borderRadius: 8, cursor: "pointer",
  },
  table: { background: "#1e293b", borderRadius: 10, overflow: "hidden", border: "1px solid #334155" },
  thead: {
    display: "grid", gridTemplateColumns: "60px 1fr 1fr 110px 90px 160px",
    padding: "10px 16px", background: "#0f172a", color: "#94a3b8", fontSize: 13, fontWeight: "bold",
  },
  trow: {
    display: "grid", gridTemplateColumns: "60px 1fr 1fr 110px 90px 160px",
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
