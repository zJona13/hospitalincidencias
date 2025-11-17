import { KPICard } from "@/components/dashboard/KPICard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Activity,
  TrendingUp,
  Calendar,
  Filter,
  Eye,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { incidenciasService } from "@/services/incidencias.service";

const Dashboard = () => {
  const navigate = useNavigate();

  // Obtener estadísticas
  const { data: estadisticas, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard', 'estadisticas'],
    queryFn: () => dashboardService.getEstadisticas(),
  });

  // Obtener tendencias
  const { data: tendencias, isLoading: loadingTendencias } = useQuery({
    queryKey: ['dashboard', 'tendencias'],
    queryFn: () => dashboardService.getTendencias(7),
  });

  // Obtener distribución por tipo
  const { data: distribucionTipo, isLoading: loadingTipo } = useQuery({
    queryKey: ['dashboard', 'distribuciones', 'tipo'],
    queryFn: () => dashboardService.getDistribuciones('tipo'),
  });

  // Obtener distribución por prioridad
  const { data: distribucionPrioridad, isLoading: loadingPrioridad } = useQuery({
    queryKey: ['dashboard', 'distribuciones', 'prioridad'],
    queryFn: () => dashboardService.getDistribuciones('prioridad'),
  });

  // Obtener incidencias recientes
  const { data: incidenciasRecientes = [], isLoading: loadingIncidencias } = useQuery({
    queryKey: ['incidencias', 'recientes'],
    queryFn: () => incidenciasService.listar({ limit: 5 }),
  });

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      alta: "bg-destructive text-destructive-foreground",
      media: "bg-warning text-warning-foreground",
      baja: "bg-success text-success-foreground",
      critica: "bg-destructive text-destructive-foreground",
    };
    return variants[priority.toLowerCase()] || variants.baja;
  };

  const getStatusBadge = (status: string) => {
    const labels: Record<string, string> = {
      abierta: "Abierta",
      en_progreso: "En progreso",
      resuelta: "Resuelta",
      cerrada: "Cerrada",
    };
    const variants: Record<string, string> = {
      abierta: "bg-muted text-muted-foreground",
      en_progreso: "bg-primary/10 text-primary",
      resuelta: "bg-success/10 text-success",
      cerrada: "bg-muted text-muted-foreground",
    };
    return { 
      label: labels[status] || status,
      className: variants[status] || variants.abierta
    };
  };

  // Formatear datos de tendencias para el gráfico
  const datosTendencia = tendencias?.map(t => ({
    dia: t.dia,
    cantidad: t.cantidad
  })) || [];

  // Formatear datos de distribución por tipo
  const datosPorTipo = distribucionTipo?.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: item.color || `hsl(${index * 60}, 70%, 50%)`
  })) || [];

  // Formatear datos de distribución por prioridad
  const datosPorPrioridad = distribucionPrioridad?.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: item.color || `hsl(${index * 60}, 70%, 50%)`
  })) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard de Incidencias</h1>
          <p className="text-muted-foreground mt-1">Resumen general del sistema</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select defaultValue="hoy">
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mes</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="todas">
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las áreas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total incidencias hoy"
          value={loadingStats ? "..." : estadisticas?.total.toString() || "0"}
          icon={Activity}
          trend={estadisticas?.tendencia ? {
            value: `${estadisticas.tendencia > 0 ? '+' : ''}${estadisticas.tendencia.toFixed(1)}%`,
            isPositive: estadisticas.tendencia > 0
          } : undefined}
          variant="primary"
        />
        <KPICard
          title="Abiertas"
          value={loadingStats ? "..." : estadisticas?.abiertas.toString() || "0"}
          icon={AlertCircle}
          variant="warning"
        />
        <KPICard
          title="En progreso"
          value={loadingStats ? "..." : estadisticas?.enProgreso.toString() || "0"}
          icon={Clock}
          variant="default"
        />
        <KPICard
          title="Resueltas"
          value={loadingStats ? "..." : estadisticas?.resueltas.toString() || "0"}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Tendencia semanal</h3>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          {loadingTendencias ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Cargando...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosTendencia}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Bar dataKey="cantidad" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Incidencias por tipo</h3>
          {loadingTipo ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Cargando...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosPorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Incidencias por prioridad */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Distribución por prioridad</h3>
        {loadingPrioridad ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Cargando...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={datosPorPrioridad}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {datosPorPrioridad.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Tabla de incidencias recientes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Incidencias recientes</h3>
          <Button variant="outline" size="sm" onClick={() => navigate("/incidencias")}>
            Ver todas
          </Button>
        </div>
        {loadingIncidencias ? (
          <div className="py-8 text-center text-muted-foreground">
            Cargando incidencias...
          </div>
        ) : incidenciasRecientes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No hay incidencias recientes
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Código</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Título</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Área</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Prioridad</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Responsable</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acción</th>
                </tr>
              </thead>
              <tbody>
                {incidenciasRecientes.map((inc) => {
                  const statusBadge = getStatusBadge(inc.estado);
                  return (
                    <tr key={inc.codigo} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{inc.codigo}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{inc.titulo}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{inc.area?.nombre || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge className={getPriorityBadge(inc.prioridad?.nombre || 'baja')}>
                          {inc.prioridad?.nombre || 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{inc.responsable?.nombre || '-'}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {inc.fechas?.creacion ? new Date(inc.fechas.creacion).toLocaleString('es-ES') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/incidencias/${inc.codigo}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
