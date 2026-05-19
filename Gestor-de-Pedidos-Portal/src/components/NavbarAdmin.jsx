import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/productos",  label: "Productos" },
  { to: "/admin/clientes",   label: "Clientes" },
  { to: "/admin/pedidos",    label: "Pedidos" },
  { to: "/admin/pagos",      label: "Pagos" },
  { to: "/admin/facturas",    label: "Facturas" },
  { to: "/admin/categorias", label: "Categorías" },
];

export default function NavbarAdmin() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav style={s.nav}>
      <span style={s.brand}>⚙️ Panel Admin</span>
      <div style={s.links}>
        {LINKS.map(({ to, label }) => (
          <Link key={to} to={to}
            style={{ ...s.link, ...(pathname === to ? s.linkActive : {}) }}>
            {label}
          </Link>
        ))}
      </div>
      <div style={s.user}>
        <span style={s.badge}>ADMIN</span>
        <span style={s.name}>👤 {session?.nombre}</span>
        <button onClick={handleLogout} style={s.btn}>Salir</button>
      </div>
    </nav>
  );
}

const s = {
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#1e293b", padding: "12px 24px", borderBottom: "2px solid #334155",
  },
  brand: { fontWeight: "bold", fontSize: 17, color: "#38bdf8", whiteSpace: "nowrap" },
  links: { display: "flex", gap: 4 },
  link: {
    color: "#e2e8f0", textDecoration: "none", fontSize: 14,
    padding: "6px 14px", borderRadius: 6, transition: "all .15s",
  },
  linkActive: { background: "#0f172a", color: "#38bdf8", fontWeight: "bold" },
  user: { display: "flex", alignItems: "center", gap: 10 },
  badge: {
    fontSize: 10, padding: "2px 8px", borderRadius: 4,
    background: "#38bdf822", color: "#38bdf8", fontWeight: "bold",
  },
  name: { color: "#94a3b8", fontSize: 13 },
  btn: {
    background: "#38bdf8", color: "#0f172a", border: "none",
    borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: "bold",
  },
};
