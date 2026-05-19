import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Auth
import Login from "./pages/Login";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminClientes  from "./pages/admin/AdminClientes";
import AdminPedidos   from "./pages/admin/AdminPedidos";
import AdminPagos     from "./pages/admin/AdminPagos";
import AdminFacturas    from "./pages/admin/AdminFacturas";
import AdminCategorias from "./pages/admin/AdminCategorias";

// Usuario
import Tienda      from "./pages/usuario/Tienda";
import MisPedidos  from "./pages/usuario/MisPedidos";
import MisPagos    from "./pages/usuario/MisPagos";
import MisFacturas from "./pages/usuario/MisFacturas";

// Rutas protegidas por rol
function RequireAuth({ children, rol }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/" replace />;
  if (rol && session.rol !== rol) {
    // Redirigir al área correcta si el rol no coincide
    return <Navigate to={session.rol === "ADMIN" ? "/admin/dashboard" : "/tienda"} replace />;
  }
  return children;
}

function AppRoutes() {
  const { session } = useAuth();

  return (
    <Routes>
      {/* Público */}
      <Route path="/"
        element={
          session
            ? <Navigate to={session.rol === "ADMIN" ? "/admin/dashboard" : "/tienda"} replace />
            : <Login />
        }
      />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<RequireAuth rol="ADMIN"><AdminDashboard /></RequireAuth>} />
      <Route path="/admin/productos"  element={<RequireAuth rol="ADMIN"><AdminProductos /></RequireAuth>} />
      <Route path="/admin/clientes"   element={<RequireAuth rol="ADMIN"><AdminClientes /></RequireAuth>} />
      <Route path="/admin/pedidos"    element={<RequireAuth rol="ADMIN"><AdminPedidos /></RequireAuth>} />
      <Route path="/admin/pagos"      element={<RequireAuth rol="ADMIN"><AdminPagos /></RequireAuth>} />
      <Route path="/admin/facturas"    element={<RequireAuth rol="ADMIN"><AdminFacturas /></RequireAuth>} />
      <Route path="/admin/categorias"  element={<RequireAuth rol="ADMIN"><AdminCategorias /></RequireAuth>} />

      {/* Usuario */}
      <Route path="/tienda"           element={<RequireAuth rol="USUARIO"><Tienda /></RequireAuth>} />
      <Route path="/tienda/pedidos"   element={<RequireAuth rol="USUARIO"><MisPedidos /></RequireAuth>} />
      <Route path="/tienda/pagos"     element={<RequireAuth rol="USUARIO"><MisPagos /></RequireAuth>} />
      <Route path="/tienda/facturas"  element={<RequireAuth rol="USUARIO"><MisFacturas /></RequireAuth>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
