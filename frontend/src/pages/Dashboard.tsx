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

const Dashboard = () => {
  const navigate = useNavigate();

  const incidenciasTendencia = [
    { dia: "Lun", cantidad: 12 },
    { dia: "Mar", cantidad: 19 },
    { dia: "Mie", cantidad: 15 },
    { dia: "Jue", cantidad: 22 },
    { dia: "Vie", cantidad: 18 },
    { dia: "Sab", cantidad: 8 },
    { dia: "Dom", cantidad: 5 },
  ];

  const incidenciasPorTipo = [
    { name: "Clínica", value: 45, color: "hsl(var(--primary))" },
    { name: "Infraestructura", value: 30, color: "hsl(var(--warning))" },
    { name: "TI", value: 25, color: "hsl(var(--success))" },
  ];

  const incidenciasPorPrioridad = [
    { name: "Alta", value: 20, color: "hsl(var(--destructive))" },
    { name: "Media", value: 45, color: "hsl(var(--warning))" },
    { name: "Baja", value: 35, color: "hsl(var(--success))" },
  ];

  const incidenciasRecientes = [
    {
      codigo: "INC-2024-015",
      titulo: "Fallo en sistema de rayos X",
      area: "Radiología",
      prioridad: "alta",
      estado: "en_progreso",
      responsable: "Dr. García",
      fecha: "2024-11-14 08:30",
    },
    {
      codigo: "INC-2024-014",
      titulo: "Aire acondicionado no funciona",
      area: "Urgencias",
      prioridad: "media",
      estado: "abierta",
      responsable: "Mantenimiento",
      fecha: "2024-11-14 07:15",
    },
    {
      codigo: "INC-2024-013",
      titulo: "Red lenta en consultorios",
      area: "TI",
      prioridad: "media",
      estado: "en_progreso",
      responsable: "Ing. Martínez",
      fecha: "2024-11-13 16:45",
    },
    {
      codigo: "INC-2024-012",
      titulo: "Falta de insumos médicos",
      area: "Farmacia",
      prioridad: "alta",
      estado: "abierta",
      responsable: "Lic. López",
      fecha: "2024-11-13 14:20",
    },
    {
      codigo: "INC-2024-011",
      titulo: "Cerradura de puerta rota",
      area: "Consultorios",
      prioridad: "baja",
      estado: "resuelta",
      responsable: "Mantenimiento",
      fecha: "2024-11-13 11:00",
    },
  ];

  const getPriorityBadge = (priority: string) => {
    const variants = {
      alta: "bg-destructive text-destructive-foreground",
      media: "bg-warning text-warning-foreground",
      baja: "bg-success text-success-foreground",
    };
    return variants[priority as keyof typeof variants] || variants.baja;
  };

  const getStatusBadge = (status: string) => {
    const labels = {
      abierta: "Abierta",
      en_progreso: "En progreso",
      resuelta: "Resuelta",
      cerrada: "Cerrada",
    };
    const variants = {
      abierta: "bg-muted text-muted-foreground",
      en_progreso: "bg-primary/10 text-primary",
      resuelta: "bg-success/10 text-success",
      cerrada: "bg-muted text-muted-foreground",
    };
    return { 
      label: labels[status as keyof typeof labels] || status,
      className: variants[status as keyof typeof variants] || variants.abierta
    };
  };

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
              <SelectItem value="urgencias">Urgencias</SelectItem>
              <SelectItem value="consultorios">Consultorios</SelectItem>
              <SelectItem value="laboratorio">Laboratorio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total incidencias hoy"
          value="24"
          icon={Activity}
          trend={{ value: "+12%", isPositive: true }}
          variant="primary"
        />
        <KPICard
          title="Abiertas"
          value="8"
          icon={AlertCircle}
          variant="warning"
        />
        <KPICard
          title="En progreso"
          value="11"
          icon={Clock}
          variant="default"
        />
        <KPICard
          title="Resueltas"
          value="5"
          icon={CheckCircle2}
          trend={{ value: "+8%", isPositive: true }}
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incidenciasTendencia}>
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
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Incidencias por tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incidenciasPorTipo}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {incidenciasPorTipo.map((entry, index) => (
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
        </Card>
      </div>

      {/* Incidencias por prioridad */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Distribución por prioridad</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={incidenciasPorPrioridad}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {incidenciasPorPrioridad.map((entry, index) => (
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
      </Card>

      {/* Tabla de incidencias recientes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Incidencias recientes</h3>
          <Button variant="outline" size="sm" onClick={() => navigate("/incidencias")}>
            Ver todas
          </Button>
        </div>
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
                    <td className="py-3 px-4 text-sm text-muted-foreground">{inc.area}</td>
                    <td className="py-3 px-4">
                      <Badge className={getPriorityBadge(inc.prioridad)}>
                        {inc.prioridad.charAt(0).toUpperCase() + inc.prioridad.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{inc.responsable}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{inc.fecha}</td>
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
      </Card>
    </div>
  );
};

export default Dashboard;
