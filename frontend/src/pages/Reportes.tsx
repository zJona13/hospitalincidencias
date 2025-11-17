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
import { useQuery } from "@tanstack/react-query";
import { analiticasService, ReporteAvanzado } from "@/services/analiticas.service";
import { catalogosService } from "@/services/catalogos.service";

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
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar catálogos
  const { data: areas = [] } = useQuery({
    queryKey: ['catalogos-areas'],
    queryFn: () => catalogosService.getAreas(),
  });

  const { data: tipos = [] } = useQuery({
    queryKey: ['catalogos-tipos'],
    queryFn: () => catalogosService.getTipos(),
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['catalogos-usuarios'],
    queryFn: () => catalogosService.getUsuarios(),
  });

  // Cargar datos de reportes
  const { data: reporteData, isLoading: isLoadingReporte } = useQuery({
    queryKey: ['reportes-avanzados', appliedFilters],
    queryFn: () => {
      const params: any = {};
      if (appliedFilters?.fechaInicio) params.fecha_inicio = appliedFilters.fechaInicio;
      if (appliedFilters?.fechaFin) params.fecha_fin = appliedFilters.fechaFin;
      if (appliedFilters?.area && appliedFilters.area !== "todas") {
        const areaId = parseInt(appliedFilters.area);
        if (!isNaN(areaId)) params.area_id = areaId;
      }
      if (appliedFilters?.tipo && appliedFilters.tipo !== "todos") {
        const tipoId = parseInt(appliedFilters.tipo);
        if (!isNaN(tipoId)) params.tipo_incidencia_id = tipoId;
      }
      return analiticasService.obtenerReportesAvanzados(params);
    },
    enabled: appliedFilters !== null,
  });

  // Procesar datos para gráficos
  const incidenciasPorArea = reporteData?.distribucion_area?.map(item => ({
    name: item.nombre,
    value: item.cantidad,
  })) || [];

  const incidenciasPorTipo = reporteData?.distribucion_tipo?.map(item => ({
    name: item.nombre,
    value: item.cantidad,
  })) || [];

  const tiempoResolucionPorArea = reporteData?.distribucion_area?.map(item => ({
    area: item.nombre,
    tiempo: reporteData.estadisticas?.tiempo_promedio_resolucion ? 
      (reporteData.estadisticas.tiempo_promedio_resolucion / 24).toFixed(1) : 0,
  })) || [];

  const incidenciasFueraSLA: any[] = []; // TODO: Implementar cuando haya endpoint específico

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

  const handleAplicarFiltros = () => {
    setIsLoading(true);
    setAppliedFilters({ ...filters });
    toast.success("Aplicando filtros...");
    setTimeout(() => setIsLoading(false), 500);
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
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.nombre}
                  </SelectItem>
                ))}
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
                {tipos.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id.toString()}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
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
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id.toString()}>
                    {usuario.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex items-end">
            <Button 
              className="w-full" 
              onClick={handleAplicarFiltros}
              disabled={isLoading || isLoadingReporte}
            >
              {isLoading || isLoadingReporte ? "Aplicando..." : "Aplicar filtros"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      {isLoadingReporte && appliedFilters ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">Cargando datos...</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Incidencias por área */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Incidencias por área
            </h3>
            {incidenciasPorArea.length > 0 ? (
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
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {appliedFilters ? "No hay datos para los filtros seleccionados" : "Aplica filtros para ver los datos"}
              </p>
            )}
          </Card>

          {/* Incidencias por tipo */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Incidencias por tipo
            </h3>
            {incidenciasPorTipo.length > 0 ? (
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
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {appliedFilters ? "No hay datos para los filtros seleccionados" : "Aplica filtros para ver los datos"}
              </p>
            )}
          </Card>

          {/* Tiempo medio de resolución por área */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Tiempo medio de resolución por área (días)
            </h3>
            {tiempoResolucionPorArea.length > 0 ? (
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
                    name="Días promedio"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {appliedFilters ? "No hay datos para los filtros seleccionados" : "Aplica filtros para ver los datos"}
              </p>
            )}
          </Card>

          {/* Incidencias fuera del SLA */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Incidencias fuera del SLA
            </h3>
            {incidenciasFueraSLA.length > 0 ? (
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
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No hay incidencias fuera del SLA
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Resumen estadístico */}
      {reporteData?.estadisticas && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Incidencias</div>
            <div className="text-2xl font-bold">{reporteData.estadisticas.total || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Abiertas</div>
            <div className="text-2xl font-bold">{reporteData.estadisticas.abiertas || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">En Progreso</div>
            <div className="text-2xl font-bold">{reporteData.estadisticas.en_progreso || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Resueltas</div>
            <div className="text-2xl font-bold">{reporteData.estadisticas.resueltas || 0}</div>
          </Card>
        </div>
      )}

      {/* Tabla detallada */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Resumen de estadísticas
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
        {reporteData ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Tiempo promedio de resolución:</strong>{" "}
                {reporteData.estadisticas.tiempo_promedio_resolucion
                  ? `${(reporteData.estadisticas.tiempo_promedio_resolucion / 24).toFixed(1)} días`
                  : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Personas afectadas promedio:</strong>{" "}
                {reporteData.estadisticas.personas_promedio
                  ? reporteData.estadisticas.personas_promedio.toFixed(1)
                  : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Pacientes afectados promedio:</strong>{" "}
                {reporteData.estadisticas.pacientes_promedio
                  ? reporteData.estadisticas.pacientes_promedio.toFixed(1)
                  : "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Aplica filtros para ver las estadísticas
          </p>
        )}
      </Card>
    </div>
  );
};

export default Reportes;
