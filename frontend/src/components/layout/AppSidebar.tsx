import {
  LayoutDashboard,
  AlertCircle,
  List,
  UserCircle,
  PlusCircle,
  BarChart3,
  Settings,
  Users,
  Building2,
  Flag,
  Clock,
  Hospital
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, UserCheck, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
  const { open } = useSidebar();
  const { user } = useAuth();

  const isAdmin = user?.rol === 'administrador';
  const isAdminTI = isAdmin && user?.tipo_admin === 'ti';
  const isAdminGeneral = isAdmin && user?.tipo_admin === 'general';

  const mainMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  ];

  const incidenciasItems = [
    { title: "Ver todas", url: "/incidencias", icon: List },
    { title: "Mis incidencias", url: "/incidencias/mis-incidencias", icon: UserCircle },
    { title: "Crear incidencia", url: "/incidencias/crear", icon: PlusCircle },
  ];

  const reportesItems = [
    { title: "Reportes", url: "/reportes", icon: BarChart3 },
  ];

  // Items específicos para Admin TI
  const adminTIItems = [
    { title: "Asignación de Incidencias", url: "/admin-ti/asignacion", icon: UserCheck },
    { title: "Estadísticas de Asignaciones", url: "/admin-ti/estadisticas", icon: BarChart3 },
  ];

  // Items específicos para Admin General (Director)
  const adminGeneralItems = [
    { title: "Analíticas y Predicciones", url: "/admin/analiticas", icon: TrendingUp },
  ];

  // Items comunes para todos los administradores
  const adminItems = [
    { title: "Usuarios y roles", url: "/admin/usuarios", icon: Users },
    { title: "Áreas y servicios", url: "/admin/areas", icon: Building2 },
    { title: "Tipos de incidencias", url: "/admin/tipos", icon: AlertCircle },
    { title: "Prioridades y SLA", url: "/admin/prioridades", icon: Flag },
    { title: "Configuración", url: "/admin/configuracion", icon: Settings },
  ];

  return (
    <Sidebar className={open ? "w-64" : "w-16"}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Hospital className="h-5 w-5 text-primary-foreground" />
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-sidebar-foreground">Hospital General</span>
              <span className="text-xs text-muted-foreground">Gestión de Incidencias</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                <span className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">
                  Incidencias
                </span>
                {open && <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {incidenciasItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md transition-colors"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <item.icon className="h-5 w-5" />
                          {open && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Sección Reportes - Solo Admin TI */}
        {isAdminTI && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {reportesItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-5 w-5" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Sección Admin TI */}
        {isAdminTI && (
          <SidebarGroup>
            <Collapsible defaultOpen={false} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                  <span className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">
                    Admin TI
                  </span>
                  {open && <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />}
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminTIItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md transition-colors"
                            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          >
                            <item.icon className="h-5 w-5" />
                            {open && <span className="text-sm">{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Sección Admin General (Director) - Predicciones y Analíticas */}
        {isAdminGeneral && (
          <SidebarGroup>
            <Collapsible defaultOpen={true} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                  <span className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">
                    Predicciones y Analíticas
                  </span>
                  {open && <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />}
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminGeneralItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md transition-colors"
                            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          >
                            <item.icon className="h-5 w-5" />
                            {open && <span className="text-sm">{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Sección Administración - Solo para administradores */}
        {isAdmin && (
          <SidebarGroup>
            <Collapsible defaultOpen={false} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                  <span className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">
                    Administración
                  </span>
                  {open && <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />}
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md transition-colors"
                            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          >
                            <item.icon className="h-5 w-5" />
                            {open && <span className="text-sm">{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
