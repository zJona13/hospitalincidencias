import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { adminTiService } from "@/services/admin-ti.service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Loader2, Users, Clock, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function EstadisticasAsignaciones() {
  const { data: estadisticas, isLoading, error } = useQuery({
    queryKey: ['admin-ti-estadisticas'],
    queryFn: () => adminTiService.obtenerEstadisticas(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-destructive font-medium">Error al cargar estadísticas</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </div>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No hay datos disponibles</p>
      </div>
    );
  }

  // Validar y preparar datos con valores por defecto
  const porResponsable = estadisticas.por_responsable || [];
  const distribucionTemporal = estadisticas.distribucion_temporal || [];
  const porPrioridad = estadisticas.por_prioridad || [];
  const porArea = estadisticas.por_area || [];
  const topEficientes = estadisticas.top_eficientes || [];
  const fueraSLA = estadisticas.fuera_sla || [];
  const resumen = estadisticas.resumen || {
    total_asignadas: 0,
    pendientes: 0,
    resueltas: 0,
    en_progreso: 0,
  };

  const chartDataResponsable = porResponsable.slice(0, 10).map(r => ({
    name: r.nombre || 'Sin nombre',
    asignadas: r.total_asignadas || 0,
    resueltas: r.resueltas || 0,
    carga: r.carga_actual || 0,
  }));

  const chartDataTemporal = distribucionTemporal.map(d => ({
    fecha: d.fecha ? new Date(d.fecha).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' }) : '',
    cantidad: d.cantidad || 0,
  }));

  const chartDataPrioridad = porPrioridad.map(p => ({
    name: p.nombre || 'Sin nombre',
    asignadas: p.total_asignadas || 0,
    cumplimiento: p.cumplimiento_sla || 0,
    fuera_sla: p.fuera_sla || 0,
  }));

  const chartDataArea = porArea.map(a => ({
    name: a.nombre || 'Sin nombre',
    asignadas: a.total_asignadas || 0,
    sin_asignar: a.sin_asignar || 0,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Estadísticas de Asignaciones
        </h1>
        <p className="text-muted-foreground mt-1">
          Análisis completo del rendimiento de asignaciones de incidencias
        </p>
      </div>

      {/* Resumen general */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Asignadas</p>
              <p className="text-2xl font-bold">{resumen.total_asignadas || 0}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold">{resumen.pendientes || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resueltas</p>
              <p className="text-2xl font-bold">{resumen.resueltas || 0}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En Progreso</p>
              <p className="text-2xl font-bold">{resumen.en_progreso || 0}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Incidencias asignadas por responsable */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Incidencias por Responsable</h3>
          {chartDataResponsable.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataResponsable}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="asignadas" fill="#0088FE" name="Total Asignadas" />
                <Bar dataKey="resueltas" fill="#00C49F" name="Resueltas" />
                <Bar dataKey="carga" fill="#FF8042" name="Carga Actual" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay datos</p>
          )}
        </Card>

        {/* Distribución temporal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Asignaciones por Día (Últimos 30 días)</h3>
          {chartDataTemporal.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataTemporal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cantidad" stroke="#0088FE" name="Asignaciones" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay datos</p>
          )}
        </Card>

        {/* Por prioridad */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Asignaciones por Prioridad</h3>
          {chartDataPrioridad.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataPrioridad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="asignadas" fill="#0088FE" name="Total Asignadas" />
                <Bar dataKey="cumplimiento" fill="#00C49F" name="Cumplimiento SLA" />
                <Bar dataKey="fuera_sla" fill="#FF8042" name="Fuera SLA" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay datos</p>
          )}
        </Card>

        {/* Por área */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Asignaciones por Área</h3>
          {chartDataArea.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="asignadas" fill="#0088FE" name="Asignadas" />
                <Bar dataKey="sin_asignar" fill="#FF8042" name="Sin Asignar" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay datos</p>
          )}
        </Card>
      </div>

      {/* Tabla detallada por responsable */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detalle por Responsable</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Responsable</TableHead>
              <TableHead>Total Asignadas</TableHead>
              <TableHead>Abiertas</TableHead>
              <TableHead>En Progreso</TableHead>
              <TableHead>Resueltas</TableHead>
              <TableHead>Carga Actual</TableHead>
              <TableHead>Tiempo Prom. Asignación</TableHead>
              <TableHead>Tiempo Prom. Resolución</TableHead>
              <TableHead>Tasa Resolución</TableHead>
              <TableHead>Fuera SLA</TableHead>
              <TableHead>Eficiencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {porResponsable.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            ) : (
              porResponsable.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nombre || 'Sin nombre'}</TableCell>
                  <TableCell>{r.total_asignadas || 0}</TableCell>
                  <TableCell>{r.abiertas || 0}</TableCell>
                  <TableCell>{r.en_progreso || 0}</TableCell>
                  <TableCell>{r.resueltas || 0}</TableCell>
                  <TableCell>
                    <Badge variant={(r.carga_actual || 0) > 10 ? "destructive" : "secondary"}>
                      {r.carga_actual || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.tiempo_promedio_asignacion
                      ? `${Number(r.tiempo_promedio_asignacion).toFixed(1)}h`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {r.tiempo_promedio_resolucion
                      ? `${(Number(r.tiempo_promedio_resolucion) / 24).toFixed(1)}d`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{(r.tasa_resolucion || 0).toFixed(1)}%</TableCell>
                  <TableCell>
                    {(r.fuera_sla || 0) > 0 ? (
                      <Badge variant="destructive">{r.fuera_sla}</Badge>
                    ) : (
                      <Badge variant="secondary">0</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.eficiencia !== null && r.eficiencia !== undefined ? (
                      <Badge
                        variant={
                          r.eficiencia >= 80
                            ? "default"
                            : r.eficiencia >= 60
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {Number(r.eficiencia).toFixed(1)}%
                      </Badge>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Top responsables eficientes y fuera de SLA */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Top 5 Responsables Más Eficientes
          </h3>
          {topEficientes.length > 0 ? (
            <div className="space-y-3">
              {topEficientes.map((r, idx) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{r.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.resueltas_en_tiempo} de {r.total_asignadas} resueltas en tiempo
                    </p>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    {Number(r.eficiencia || 0).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay datos</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Responsables con Más Incidencias Fuera de SLA
          </h3>
          {fueraSLA.length > 0 ? (
            <div className="space-y-3">
              {fueraSLA.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{r.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      Incidencias fuera del tiempo límite
                    </p>
                  </div>
                  <Badge variant="destructive">{r.total_fuera_sla}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay datos</p>
          )}
        </Card>
      </div>

      {/* Resumen de tiempos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen de Tiempos</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Tiempo Promedio de Asignación</p>
            <p className="text-2xl font-bold">
              {(estadisticas.tiempo_promedio_asignacion_general || 0) > 0
                ? `${Number(estadisticas.tiempo_promedio_asignacion_general).toFixed(1)} horas`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tiempo Promedio de Resolución</p>
            <p className="text-2xl font-bold">
              {porResponsable.length > 0
                ? (() => {
                    const responsablesConTiempo = porResponsable.filter((r) => r.tiempo_promedio_resolucion);
                    if (responsablesConTiempo.length === 0) return "N/A";
                    const promedio = responsablesConTiempo.reduce(
                      (sum, r) => sum + (Number(r.tiempo_promedio_resolucion) || 0),
                      0
                    ) / responsablesConTiempo.length;
                    return `${(promedio / 24).toFixed(1)} días`;
                  })()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tiempo Promedio de Respuesta</p>
            <p className="text-2xl font-bold">
              {porResponsable.length > 0
                ? (() => {
                    const responsablesConRespuesta = porResponsable.filter((r) => r.tiempo_promedio_respuesta);
                    if (responsablesConRespuesta.length === 0) return "N/A";
                    const promedio = responsablesConRespuesta.reduce(
                      (sum, r) => sum + (Number(r.tiempo_promedio_respuesta) || 0),
                      0
                    ) / responsablesConRespuesta.length;
                    return `${promedio.toFixed(1)} horas`;
                  })()
                : "N/A"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

