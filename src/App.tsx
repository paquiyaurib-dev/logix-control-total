import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, type UserRole, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { PermissionProvider } from './context/PermissionContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Materiales from './pages/Materiales';
import Ingresos from './pages/Ingresos';
import Salidas from './pages/Salidas';
import Despachos from './pages/Despachos';
import Inventarios from './pages/Inventarios';
import Activos from './pages/Activos';
import Empleados from './pages/Empleados';
import Flota from './pages/Flota';
import Reportes from './pages/Reportes';
import Alertas from './pages/Alertas';
import KPIs from './pages/KPIs';
import Configuracion from './pages/Configuracion';

function ProtectedRoute() {
  const { state } = useAuth();
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function RoleRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { state } = useAuth();
  if (!state.user || !allowedRoles.includes(state.user.rol)) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AppRoutes() {
  const { state } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={state.isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="materiales" element={<Materiales />} />
        <Route path="almacen" element={<Navigate to="/materiales" replace />} />
        <Route element={<RoleRoute allowedRoles={['Administrador', 'Supervisor', 'Bodeguero']} />}>
          <Route path="ingresos" element={<Ingresos />} />
          <Route path="salidas" element={<Salidas />} />
          <Route path="despachos" element={<Despachos />} />
        </Route>
        <Route path="inventarios" element={<Inventarios />} />
        <Route path="activos" element={<Activos />} />
        <Route path="empleados" element={<Empleados />} />
        <Route path="flota" element={<Flota />} />
        <Route element={<RoleRoute allowedRoles={['Administrador', 'Supervisor']} />}>
          <Route path="reportes" element={<Reportes />} />
          <Route path="kpis" element={<KPIs />} />
        </Route>
        <Route path="alertas" element={<Alertas />} />
        <Route element={<RoleRoute allowedRoles={['Administrador']} />}>
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PermissionProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </PermissionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
