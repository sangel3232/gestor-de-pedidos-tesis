import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotificaciones } from "../hooks/useNotificaciones";

const LINKS = [
  { to: "/tienda",           label: "🛍️ Tienda" },
  { to: "/tienda/pedidos",   label: "📦 Mis Pedidos" },
  { to: "/tienda/pagos",     label: "💳 Mis Pagos" },
  { to: "/tienda/facturas",  label: "🧾 Mis Facturas" },
];

export default function NavbarUsuario({ totalCarrito = 0, onAbrirCarrito }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { notificaciones, nuevas, marcarLeidas } = useNotificaciones();
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const toggleNotif = () => {
    setShowNotif(v => !v);
    if (!showNotif) marcarLeidas();
  };

  return (
    <nav style={s.nav}>
      <span style={s.brand}>🛒 Gestor de Pedidos</span>

      <div style={s.links}>
        {LINKS.map(({ to, label }) => (
          <Link key={to} to={to}
            style={{ ...s.link, ...(pathname === to ? s.linkActive : {}) }}>
            {label}
          </Link>
        ))}
        {onAbrirCarrito && (
          <button onClick={onAbrirCarrito} style={{ ...s.link, ...s.carritoBtn }}>
            🛒 Carrito
            {totalCarrito > 0 && <span style={s.cartCount}>{totalCarrito}</span>}
          </button>
        )}
      </div>

      <div style={s.user}>
        <span style={s.rolBadge}>USUARIO</span>
        <span style={s.name}>👤 {session?.nombre}</span>

        {/* Campana de notificaciones */}
        <div style={{ position: "relative" }}>
          <button onClick={toggleNotif} style={s.bellBtn} title="Notificaciones">
            🔔
            {nuevas > 0 && <span style={s.bellBadge}>{nuevas}</span>}
          </button>
          {showNotif && (
            <div style={s.notifDropdown}>
              <p style={s.notifTitle}>Notificaciones</p>
              {notificaciones.length === 0 && (
                <p style={s.notifEmpty}>Sin notificaciones</p>
              )}
              {notificaciones.slice(0, 5).map((n) => (
                <div key={n.id} style={s.notifItem}>
                  <p style={s.notifMsg}>{n.mensaje}</p>
                  <p style={s.notifTime}>{n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>

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
  brand: { fontWeight: "bold", fontSize: 17, color: "#4ade80", whiteSpace: "nowrap" },
  links: { display: "flex", gap: 4, alignItems: "center" },
  link: {
    color: "#e2e8f0", textDecoration: "none", fontSize: 14,
    padding: "6px 14px", borderRadius: 6,
  },
  linkActive: { background: "#0f172a", color: "#4ade80", fontWeight: "bold" },
  carritoBtn: {
    background: "#0f172a", border: "1px solid #334155", cursor: "pointer",
    position: "relative", display: "inline-flex", alignItems: "center", gap: 4,
    color: "#4ade80", borderRadius: 6, padding: "6px 12px",
  },
  cartCount: {
    position: "absolute", top: -4, right: -4, background: "#4ade80",
    color: "#0f172a", borderRadius: "50%", width: 18, height: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: "bold",
  },
  user: { display: "flex", alignItems: "center", gap: 10 },
  rolBadge: {
    fontSize: 10, padding: "2px 8px", borderRadius: 4,
    background: "#4ade8022", color: "#4ade80", fontWeight: "bold",
  },
  name: { color: "#94a3b8", fontSize: 13 },
  btn: {
    background: "#4ade80", color: "#0f172a", border: "none",
    borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: "bold",
  },
  bellBtn: {
    position: "relative", background: "transparent", border: "1px solid #334155",
    borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 16, color: "#e2e8f0",
  },
  bellBadge: {
    position: "absolute", top: -5, right: -5, background: "#ef4444",
    color: "#fff", borderRadius: "50%", width: 16, height: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: "bold",
  },
  notifDropdown: {
    position: "absolute", top: "calc(100% + 8px)", right: 0, width: 300,
    background: "#1e293b", border: "1px solid #334155", borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 1000, overflow: "hidden",
  },
  notifTitle: {
    margin: 0, padding: "10px 14px", fontSize: 13, fontWeight: "bold",
    color: "#94a3b8", borderBottom: "1px solid #334155",
  },
  notifEmpty: { padding: "12px 14px", color: "#64748b", fontSize: 13, margin: 0 },
  notifItem: {
    padding: "10px 14px", borderBottom: "1px solid #0f172a",
  },
  notifMsg:  { margin: 0, fontSize: 13, color: "#e2e8f0" },
  notifTime: { margin: "3px 0 0", fontSize: 11, color: "#64748b" },
};
