import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotificaciones } from "../hooks/useNotificaciones";

const LINKS = [
  { to: "/tienda",          label: "🛍️ Tienda" },
  { to: "/tienda/pedidos",  label: "📦 Pedidos" },
  { to: "/tienda/pagos",    label: "💳 Pagos" },
  { to: "/tienda/facturas", label: "🧾 Facturas" },
];

export default function NavbarUsuario({ totalCarrito = 0, onAbrirCarrito }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { notificaciones, nuevas, marcarLeidas } = useNotificaciones();
  const [showNotif, setShowNotif] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const toggleNotif = () => {
    setShowNotif(v => !v);
    if (!showNotif) marcarLeidas();
  };

  return (
    <nav style={s.nav}>
      {/* Brand */}
      <span style={s.brand}>🛒 Gestor de Pedidos</span>

      {/* Links desktop */}
      <div className="nav-links-desktop" style={s.linksDesktop}>
        {LINKS.map(({ to, label }) => (
          <Link key={to} to={to}
            style={{ ...s.link, ...(pathname === to ? s.linkActive : {}) }}>
            {label}
          </Link>
        ))}
      </div>

      {/* Acciones */}
      <div style={s.actions}>
        {onAbrirCarrito && (
          <button onClick={onAbrirCarrito} style={s.carritoBtn}>
            🛒
            {totalCarrito > 0 && <span style={s.cartCount}>{totalCarrito}</span>}
          </button>
        )}

        <div style={{ position: "relative" }}>
          <button onClick={toggleNotif} style={s.iconBtn}>
            🔔
            {nuevas > 0 && <span style={s.bellBadge}>{nuevas}</span>}
          </button>
          {showNotif && (
            <div style={s.notifDropdown}>
              <p style={s.notifTitle}>Notificaciones</p>
              {notificaciones.length === 0
                ? <p style={s.notifEmpty}>Sin notificaciones</p>
                : notificaciones.slice(0, 5).map((n) => (
                    <div key={n.id} style={s.notifItem}>
                      <p style={s.notifMsg}>{n.mensaje}</p>
                      <p style={s.notifTime}>{n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : ""}</p>
                    </div>
                  ))
              }
            </div>
          )}
        </div>

        <span className="nav-name" style={s.name}>👤 {session?.nombre?.split(" ")[0]}</span>

        <button onClick={handleLogout} style={s.btn}>Salir</button>

        {/* Hamburguesa solo móvil */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(v => !v)} style={s.hamburger}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {LINKS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              style={{ ...s.mobileLink, ...(pathname === to ? s.mobileLinkActive : {}) }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", background: "#1e293b", padding: "10px 16px",
    borderBottom: "2px solid #334155", position: "relative",
  },
  brand:        { fontWeight: "bold", fontSize: 16, color: "#4ade80", whiteSpace: "nowrap" },
  linksDesktop: { display: "flex", gap: 2, alignItems: "center" },
  link: {
    color: "#94a3b8", textDecoration: "none", fontSize: 13,
    padding: "6px 10px", borderRadius: 6, whiteSpace: "nowrap",
  },
  linkActive:   { background: "#0f172a", color: "#4ade80", fontWeight: "bold" },
  actions:      { display: "flex", alignItems: "center", gap: 8 },
  carritoBtn: {
    position: "relative", background: "#0f172a", border: "1px solid #334155",
    cursor: "pointer", color: "#4ade80", borderRadius: 6, padding: "6px 10px", fontSize: 16,
  },
  cartCount: {
    position: "absolute", top: -4, right: -4, background: "#4ade80",
    color: "#0f172a", borderRadius: "50%", width: 16, height: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: "bold",
  },
  iconBtn: {
    position: "relative", background: "transparent", border: "1px solid #334155",
    borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 15, color: "#e2e8f0",
  },
  bellBadge: {
    position: "absolute", top: -5, right: -5, background: "#ef4444",
    color: "#fff", borderRadius: "50%", width: 15, height: 15,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: "bold",
  },
  name:      { color: "#94a3b8", fontSize: 12, whiteSpace: "nowrap" },
  btn: {
    background: "#4ade80", color: "#0f172a", border: "none",
    borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: "bold",
  },
  hamburger: {
    background: "transparent", border: "1px solid #334155", color: "#e2e8f0",
    borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 16,
  },
  notifDropdown: {
    position: "absolute", top: "calc(100% + 8px)", right: 0, width: 280,
    background: "#1e293b", border: "1px solid #334155", borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 1000,
  },
  notifTitle:  { margin: 0, padding: "10px 14px", fontSize: 12, fontWeight: "bold", color: "#94a3b8", borderBottom: "1px solid #334155" },
  notifEmpty:  { padding: "12px 14px", color: "#64748b", fontSize: 13, margin: 0 },
  notifItem:   { padding: "10px 14px", borderBottom: "1px solid #0f172a" },
  notifMsg:    { margin: 0, fontSize: 13, color: "#e2e8f0" },
  notifTime:   { margin: "3px 0 0", fontSize: 11, color: "#64748b" },
  mobileMenu: {
    width: "100%", display: "flex", flexDirection: "column", gap: 4,
    padding: "8px 0", borderTop: "1px solid #334155", marginTop: 8,
  },
  mobileLink:       { color: "#94a3b8", textDecoration: "none", fontSize: 14, padding: "8px 12px", borderRadius: 6 },
  mobileLinkActive: { background: "#0f172a", color: "#4ade80", fontWeight: "bold" },
};
