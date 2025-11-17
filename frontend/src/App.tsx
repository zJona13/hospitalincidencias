import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Incidencias from "./pages/Incidencias";
import MisIncidencias from "./pages/MisIncidencias";
import IncidenciaDetalle from "./pages/IncidenciaDetalle";
import CrearIncidencia from "./pages/CrearIncidencia";
import Reportes from "./pages/Reportes";
import NotFound from "./pages/NotFound";
import Notificaciones from "./pages/Notificaciones";
import Perfil from "./pages/Perfil";
import Usuarios from "./pages/admin/Usuarios";
import Areas from "./pages/admin/Areas";
import TiposIncidencias from "./pages/admin/TiposIncidencias";
import Prioridades from "./pages/admin/Prioridades";
import Analiticas from "./pages/admin/Analiticas";
import AsignacionIncidencias from "./pages/admin/AsignacionIncidencias";
import EstadisticasAsignaciones from "./pages/admin/EstadisticasAsignaciones";
import Configuracion from "./pages/admin/Configuracion";
import { DashboardLayout } from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/incidencias" element={<Incidencias />} />
          <Route path="/incidencias/crear" element={<CrearIncidencia />} />
          <Route path="/incidencias/:codigo" element={<IncidenciaDetalle />} />
          <Route path="/incidencias/mis-incidencias" element={<MisIncidencias />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/admin/usuarios" element={<Usuarios />} />
          <Route path="/admin/areas" element={<Areas />} />
          <Route path="/admin/tipos" element={<TiposIncidencias />} />
          <Route path="/admin/prioridades" element={<Prioridades />} />
          <Route path="/admin/configuracion" element={<Configuracion />} />
          <Route path="/admin/analiticas" element={<Analiticas />} />
          <Route path="/admin-ti/asignacion" element={<AsignacionIncidencias />} />
          <Route path="/admin-ti/estadisticas" element={<EstadisticasAsignaciones />} />
        </Route>
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
