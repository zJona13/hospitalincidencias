import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { notificacionesService } from "@/services/notificaciones.service";

export function AppTopbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);

  useEffect(() => {
    // Cargar contador de notificaciones no leídas
    const cargarNotificaciones = async () => {
      try {
        const count = await notificacionesService.contarNoLeidas();
        setNotificationCount(count);
        
        // Cargar últimas 3 notificaciones no leídas para el dropdown
        const notifs = await notificacionesService.listar(false);
        setNotificaciones(notifs.slice(0, 3));
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      }
    };

    cargarNotificaciones();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const getRolDisplay = (rol: string, tipoAdmin?: string | null) => {
    if (rol === 'administrador') {
      if (tipoAdmin === 'ti') return 'Admin TI';
      if (tipoAdmin === 'general') return 'Admin General';
      return 'Administrador';
    }
    const roles: Record<string, string> = {
      'medico': 'Médico',
      'enfermero': 'Enfermero',
      'tecnico': 'Técnico',
      'usuario': 'Usuario'
    };
    return roles[rol] || rol;
  };

  const formatFecha = (fecha: string) => {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = ahora.getTime() - fechaNotif.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    return fechaNotif.toLocaleDateString('es-ES');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center gap-4 px-4">
        <SidebarTrigger />
        
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar incidencia, código, paciente..."
              className="pl-10 bg-background"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {notificaciones.length > 0 ? (
                  notificaciones.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-2 py-3 hover:bg-accent rounded-md cursor-pointer"
                      onClick={() => {
                        if (notif.incidencia) {
                          navigate(`/incidencias/${notif.incidencia.codigo}`);
                        }
                      }}
                    >
                      <p className="text-sm font-medium">{notif.titulo}</p>
                      <p className="text-xs text-muted-foreground">{notif.mensaje}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFecha(notif.fecha)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                    No hay notificaciones nuevas
                  </div>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center text-sm"
                  onClick={() => navigate("/notificaciones")}
                >
                  Ver todas las notificaciones
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{user?.nombre || 'Usuario'}</span>
                  <span className="text-xs text-muted-foreground">
                    {user ? getRolDisplay(user.rol, user.tipo_admin) : 'Usuario'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/perfil")}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
