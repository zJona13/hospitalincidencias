import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Esperar a que termine de cargar antes de verificar autenticación
    if (!loading && !isAuthenticated) {
      // Pequeño delay para evitar redirección inmediata durante el login
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          navigate("/login", { replace: true });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppTopbar />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
