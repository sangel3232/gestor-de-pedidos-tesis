import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginApi, registroApi } from "../api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [form, setForm] = useState({ username: "", password: "", nombre: "", email: "", ciudad: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let res;
      if (modo === "login") {
        res = await loginApi({ username: form.username, password: form.password });
      } else {
        if (!form.nombre || !form.email || !form.ciudad) {
          setError("Completa todos los campos"); setLoading(false); return;
        }
        res = await registroApi(form);
      }
      login(res.data);
      // Redirigir según rol
      navigate(res.data.rol === "ADMIN" ? "/admin/dashboard" : "/tienda");
    } catch (err) {
      setError(err.response?.data?.mensaje || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🛒</div>
        <h2 style={s.title}>Gestor de Pedidos</h2>

        {/* Tabs login / registro */}
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(modo === "login" ? s.tabActive : {}) }}
            onClick={() => { setModo("login"); setError(""); }}>
            Iniciar sesión
          </button>
          <button style={{ ...s.tab, ...(modo === "registro" ? s.tabActive : {}) }}
            onClick={() => { setModo("registro"); setError(""); }}>
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {modo === "registro" && (
            <>
              <Field label="Nombre completo" name="nombre" value={form.nombre} onChange={handleChange} />
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
              <Field label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} />
            </>
          )}
          <Field label="Usuario" name="username" value={form.username} onChange={handleChange}
            placeholder={modo === "login" ? "admin  /  usuario1" : "Elige un nombre de usuario"} />
          <Field label="Contraseña" name="password" type="password" value={form.password}
            onChange={handleChange} placeholder={modo === "login" ? "admin123  /  user123" : "Mínimo 4 caracteres"} />

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "Procesando..." : modo === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>

        {modo === "login" && (
          <div style={s.hints}>
            <p style={s.hintTitle}>Cuentas de prueba</p>
            <div style={s.hintRow}>
              <span style={s.badge}>ADMIN</span>
              <span>admin / admin123</span>
            </div>
            <div style={s.hintRow}>
              <span style={{ ...s.badge, background: "#4ade8022", color: "#4ade80" }}>USUARIO</span>
              <span>usuario1 / user123</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, color: "#94a3b8" }}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} style={s.input} />
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#0f172a",
  },
  card: {
    background: "#1e293b", borderRadius: 14, padding: "36px 32px",
    display: "flex", flexDirection: "column", gap: 16, width: 360,
    boxShadow: "0 12px 50px rgba(0,0,0,0.4)",
  },
  logo: { textAlign: "center", fontSize: 36 },
  title: { color: "#38bdf8", margin: 0, textAlign: "center", fontSize: 20 },
  tabs: { display: "flex", background: "#0f172a", borderRadius: 8, padding: 4, gap: 4 },
  tab: {
    flex: 1, padding: "8px", border: "none", borderRadius: 6,
    background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 14,
  },
  tabActive: { background: "#334155", color: "#e2e8f0", fontWeight: "bold" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: {
    padding: "10px 14px", borderRadius: 8, border: "1px solid #334155",
    background: "#0f172a", color: "#e2e8f0", fontSize: 14, outline: "none",
  },
  btn: {
    padding: "12px", background: "#38bdf8", color: "#0f172a",
    border: "none", borderRadius: 8, fontWeight: "bold",
    fontSize: 15, cursor: "pointer", marginTop: 4,
  },
  error: { color: "#f87171", fontSize: 13, margin: 0, textAlign: "center" },
  hints: {
    background: "#0f172a", borderRadius: 8, padding: "12px 14px",
    display: "flex", flexDirection: "column", gap: 6,
  },
  hintTitle: { margin: 0, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 },
  hintRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#e2e8f0" },
  badge: {
    fontSize: 10, padding: "2px 7px", borderRadius: 4,
    background: "#38bdf822", color: "#38bdf8", fontWeight: "bold",
  },
};
