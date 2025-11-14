import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Incidencias from "./pages/Incidencias";
import IncidenciaDetalle from "./pages/IncidenciaDetalle";
import CrearIncidencia from "./pages/CrearIncidencia";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/incidencias" element={<Incidencias />} />
            <Route path="/incidencias/crear" element={<CrearIncidencia />} />
            <Route path="/incidencias/:codigo" element={<IncidenciaDetalle />} />
            <Route path="/incidencias/mis-incidencias" element={<Incidencias />} />
            <Route path="/reportes" element={<Dashboard />} />
            <Route path="/admin/usuarios" element={<Dashboard />} />
            <Route path="/admin/areas" element={<Dashboard />} />
            <Route path="/admin/tipos" element={<Dashboard />} />
            <Route path="/admin/prioridades" element={<Dashboard />} />
            <Route path="/admin/configuracion" element={<Dashboard />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
