import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Reset y estilos globales responsive
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; }

  /* ── Navbar usuario responsive ── */
  .nav-hamburger { display: block !important; }
  .nav-links-desktop { display: none !important; }
  .nav-name { display: none !important; }

  @media (min-width: 768px) {
    .nav-hamburger { display: none !important; }
    .nav-links-desktop { display: flex !important; }
    .nav-name { display: inline !important; }
  }

  /* ── Tienda grid responsive ── */
  .tienda-layout {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  .tienda-catalogo { flex: 1; min-width: 0; }
  .tienda-carrito-panel {
    width: 100%;
    max-width: 360px;
    flex-shrink: 0;
  }

  @media (max-width: 767px) {
    .tienda-layout { flex-direction: column; }
    .tienda-carrito-panel { max-width: 100%; position: static !important; }
    .tienda-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 480px) {
    .tienda-grid {
      grid-template-columns: 1fr !important;
    }
  }

  /* ── Categorias scroll horizontal ── */
  .categorias-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }
  .categorias-scroll::-webkit-scrollbar { display: none; }

  /* ── Admin tablas responsive ── */
  @media (max-width: 767px) {
    .admin-table { overflow-x: auto; }
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
