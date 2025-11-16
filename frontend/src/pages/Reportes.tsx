import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, Save, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

const Reportes = () => {
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    area: "todas",
    tipo: "todos",
    prioridad: "todas",
    estado: "todos",
    responsable: "todos",
  });

  // Mock data para gráficos
  const incidenciasPorArea = [
    { name: "Urgencias", value: 45 },
    { name: "Consultorios", value: 32 },
    { name: "Radiología", value: 28 },
    { name: "Laboratorio", value: 21 },
    { name: "Farmacia", value: 18 },
    { name: "UCI", value: 15 },
  ];

  const incidenciasPorTipo = [
    { name: "TI", value: 65 },
    { name: "Infraestructura", value: 48 },
    { name: "Clínica", value: 42 },
    { name: "Administrativa", value: 28 },
  ];

  const tiempoResolucionPorArea = [
    { area: "Urgencias", tiempo: 4.5 },
    { area: "Consultorios", tiempo: 6.2 },
    { area: "Radiología", tiempo: 5.8 },
    { area: "Laboratorio", tiempo: 7.1 },
    { area: "Farmacia", tiempo: 3.9 },
    { area: "UCI", tiempo: 2.8 },
  ];

  const incidenciasFueraSLA = [
    {
      codigo: "INC-2024-015",
      titulo: "Fallo en sistema de rayos X",
      area: "Radiología",
      prioridad: "alta",
      diasExcedidos: 3,
    },
    {
      codigo: "INC-2024-012",
      titulo: "Falta de insumos médicos",
      area: "Farmacia",
      prioridad: "alta",
      diasExcedidos: 2,
    },
    {
      codigo: "INC-2024-009",
      titulo: "Sistema de climatización fallando",
      area: "UCI",
      prioridad: "media",
      diasExcedidos: 5,
    },
  ];

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--destructive))",
    "hsl(var(--muted))",
    "hsl(var(--accent))",
  ];

  const handleExportPDF = () => {
    toast.success("Exportando reporte a PDF...");
    // Implementar exportación a PDF
  };

  const handleExportExcel = () => {
    toast.success("Exportando reporte a Excel...");
    // Implementar exportación a Excel
  };

  const handleSaveConfig = () => {
    toast.success("Configuración de reporte guardada");
    // Implementar guardado de configuración
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      alta: "bg-destructive text-destructive-foreground",
      media: "bg-warning text-warning-foreground",
      baja: "bg-success text-success-foreground",
    };
    return variants[priority as keyof typeof variants] || variants.baja;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground mt-1">
            Análisis y estadísticas de incidencias
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveConfig}>
            <Save className="mr-2 h-4 w-4" />
            Guardar configuración
          </Button>
        </div>
      </div>

      {/* Filtros avanzados */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Filtros avanzados
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha inicio</Label>
            <Input
              id="fechaInicio"
              type="date"
              value={filters.fechaInicio}
              onChange={(e) =>
                setFilters({ ...filters, fechaInicio: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha fin</Label>
            <Input
              id="fechaFin"
              type="date"
              value={filters.fechaFin}
              onChange={(e) =>
                setFilters({ ...filters, fechaFin: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Área</Label>
            <Select
              value={filters.area}
              onValueChange={(value) => setFilters({ ...filters, area: value })}
            >
              <SelectTrigger id="area">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                <SelectItem value="urgencias">Urgencias</SelectItem>
                <SelectItem value="consultorios">Consultorios</SelectItem>
                <SelectItem value="radiologia">Radiología</SelectItem>
                <SelectItem value="laboratorio">Laboratorio</SelectItem>
                <SelectItem value="farmacia">Farmacia</SelectItem>
                <SelectItem value="uci">UCI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={filters.tipo}
              onValueChange={(value) => setFilters({ ...filters, tipo: value })}
            >
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="ti">TI</SelectItem>
                <SelectItem value="infraestructura">Infraestructura</SelectItem>
                <SelectItem value="clinica">Clínica</SelectItem>
                <SelectItem value="administrativa">Administrativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prioridad">Prioridad</Label>
            <Select
              value={filters.prioridad}
              onValueChange={(value) =>
                setFilters({ ...filters, prioridad: value })
              }
            >
              <SelectTrigger id="prioridad">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={filters.estado}
              onValueChange={(value) =>
                setFilters({ ...filters, estado: value })
              }
            >
              <SelectTrigger id="estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="abierta">Abierta</SelectItem>
                <SelectItem value="en_progreso">En progreso</SelectItem>
                <SelectItem value="resuelta">Resuelta</SelectItem>
                <SelectItem value="cerrada">Cerrada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsable">Responsable</Label>
            <Select
              value={filters.responsable}
              onValueChange={(value) =>
                setFilters({ ...filters, responsable: value })
              }
            >
              <SelectTrigger id="responsable">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los responsables</SelectItem>
                <SelectItem value="garcia">Dr. García</SelectItem>
                <SelectItem value="martinez">Ing. Martínez</SelectItem>
                <SelectItem value="lopez">Lic. López</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex items-end">
            <Button className="w-full">Aplicar filtros</Button>
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Incidencias por área */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Incidencias por área
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incidenciasPorArea}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--primary))" name="Incidencias" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Incidencias por tipo */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Incidencias por tipo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incidenciasPorTipo}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {incidenciasPorTipo.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Tiempo medio de resolución por área */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Tiempo medio de resolución por área (horas)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tiempoResolucionPorArea}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="tiempo"
                fill="hsl(var(--success))"
                name="Horas promedio"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Incidencias fuera del SLA */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Incidencias fuera del SLA
          </h3>
          <div className="space-y-3">
            {incidenciasFueraSLA.map((inc) => (
              <div
                key={inc.codigo}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{inc.titulo}</p>
                  <p className="text-sm text-muted-foreground">{inc.codigo}</p>
                  <p className="text-sm text-muted-foreground">{inc.area}</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={getPriorityBadge(inc.prioridad)}>
                    {inc.prioridad.charAt(0).toUpperCase() + inc.prioridad.slice(1)}
                  </Badge>
                  <p className="text-sm font-medium text-destructive">
                    +{inc.diasExcedidos} días
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tabla detallada */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Tabla detallada de incidencias
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha creación</TableHead>
              <TableHead>Tiempo resolución</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono">INC-2024-015</TableCell>
              <TableCell>Fallo en sistema de rayos X</TableCell>
              <TableCell>Radiología</TableCell>
              <TableCell>TI</TableCell>
              <TableCell>
                <Badge className="bg-destructive text-destructive-foreground">
                  Alta
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className="bg-primary/10 text-primary">En progreso</Badge>
              </TableCell>
              <TableCell>Dr. García</TableCell>
              <TableCell>2024-11-14</TableCell>
              <TableCell>5.2h</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono">INC-2024-014</TableCell>
              <TableCell>Aire acondicionado no funciona</TableCell>
              <TableCell>Urgencias</TableCell>
              <TableCell>Infraestructura</TableCell>
              <TableCell>
                <Badge className="bg-warning text-warning-foreground">Media</Badge>
              </TableCell>
              <TableCell>
                <Badge className="bg-muted text-muted-foreground">Abierta</Badge>
              </TableCell>
              <TableCell>Mantenimiento</TableCell>
              <TableCell>2024-11-14</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono">INC-2024-013</TableCell>
              <TableCell>Red lenta en consultorios</TableCell>
              <TableCell>Consultorios</TableCell>
              <TableCell>TI</TableCell>
              <TableCell>
                <Badge className="bg-warning text-warning-foreground">Media</Badge>
              </TableCell>
              <TableCell>
                <Badge className="bg-primary/10 text-primary">En progreso</Badge>
              </TableCell>
              <TableCell>Ing. Martínez</TableCell>
              <TableCell>2024-11-13</TableCell>
              <TableCell>8.5h</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Reportes;
