import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { analiticasService } from "@/services/analiticas.service";
import { 
  TrendingUp, Users, Activity, AlertTriangle, DollarSign, Clock, 
  UserCheck, BarChart3, Loader2, TrendingDown, TrendingUp as TrendingUpIcon 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Analiticas() {
  const [periodo, setPeriodo] = useState<'mensual' | 'trimestral' | 'anual'>('mensual');
  const [tab, setTab] = useState('resumen');

  const { data: predicciones = [], isLoading } = useQuery({
    queryKey: ['predicciones', periodo],
    queryFn: () => analiticasService.obtenerPredicciones(periodo, undefined, true),
  });

  const { data: metricasDirector, isLoading: isLoadingMetricas } = useQuery({
    queryKey: ['metricas-director', periodo],
    queryFn: () => analiticasService.obtenerMetricasDirector(periodo),
  });

  const prediccionesPorTipo = predicciones.filter(p => p.tipo_incidencia_id);
  const prediccionesPorArea = predicciones.filter(p => p.area_id);

  // Calcular totales
  const totalPersonas = predicciones.reduce((sum, p) => sum + (p.personas_afectadas_estimadas || 0), 0);
  const totalPacientes = predicciones.reduce((sum, p) => sum + (p.pacientes_afectados_estimados || 0), 0);
  const totalCosto = predicciones.reduce((sum, p) => sum + ((p as any).costo_estimado || 0), 0);
  const totalHorasHombre = predicciones.reduce((sum, p) => sum + ((p as any).horas_hombre_estimadas || 0), 0);
  const totalPersonal = predicciones.reduce((sum, p) => sum + ((p as any).personal_necesario || 0), 0);
  const totalTiempoAtencion = predicciones.reduce((sum, p) => sum + ((p as any).tiempo_atencion_perdido_horas || 0), 0);
  const probabilidadPromedio = predicciones.length > 0 
    ? predicciones.reduce((sum, p) => sum + p.probabilidad, 0) / predicciones.length 
    : 0;

  // Datos para gráficos
  const chartDataTipo = prediccionesPorTipo.map(p => ({
    name: p.tipo_incidencia_nombre || 'Desconocido',
    probabilidad: p.probabilidad,
    personas: p.personas_afectadas_estimadas || 0,
    pacientes: p.pacientes_afectados_estimados || 0,
    costo: (p as any).costo_estimado || 0,
  }));

  const chartDataArea = prediccionesPorArea.map(p => ({
    name: p.area_nombre || p.departamento_predicho || 'Desconocido',
    probabilidad: p.probabilidad,
    pacientes: p.pacientes_afectados_estimados || 0,
    costo: (p as any).costo_estimado || 0,
  }));

  // Top incidencias más probables
  const topPredicciones = [...predicciones]
    .sort((a, b) => b.probabilidad - a.probabilidad)
    .slice(0, 15);

  // Tendencias estacionales
  const tendenciasData = metricasDirector?.tendencias_estacionales?.map((t: any) => ({
    mes: new Date(2024, t.mes - 1).toLocaleDateString('es-PE', { month: 'short' }),
    cantidad: t.cantidad,
    personas: Math.round(t.personas_promedio || 0),
    pacientes: Math.round(t.pacientes_promedio || 0),
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analíticas y Predicciones</h1>
          <p className="text-muted-foreground mt-1">
            Predicciones de incidencias futuras basadas en análisis histórico
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={(v: 'mensual' | 'trimestral' | 'anual') => setPeriodo(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensual">Mensual</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            disabled={isLoading || isLoadingMetricas}
          >
            {isLoading || isLoadingMetricas ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recalculando...
              </>
            ) : (
              "Recalcular"
            )}
          </Button>
        </div>
      </div>

      {/* Alertas y recomendaciones */}
      {metricasDirector?.alertas && metricasDirector.alertas.length > 0 && (
        <div className="space-y-2">
          {metricasDirector.alertas.map((alerta: any, idx: number) => (
            <Alert key={idx} variant={alerta.nivel === 'alto' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alerta.tipo.toUpperCase()}</AlertTitle>
              <AlertDescription>{alerta.mensaje}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Resumen ejecutivo mejorado */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Probabilidad Promedio</p>
              <p className="text-2xl font-bold">{probabilidadPromedio.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Personas Afectadas</p>
              <p className="text-2xl font-bold">{totalPersonas.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pacientes Afectados</p>
              <p className="text-2xl font-bold">{totalPacientes.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Costo Estimado</p>
              <p className="text-2xl font-bold">S/ {totalCosto.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Horas-Hombre</p>
              <p className="text-2xl font-bold">{totalHorasHombre.toLocaleString()}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Personal Necesario</p>
              <p className="text-2xl font-bold">{totalPersonal}</p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Resumen del director */}
      {metricasDirector && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resumen Ejecutivo</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Tiempo de Atención Perdido</p>
              <p className="text-2xl font-bold">
                {metricasDirector.resumen?.tiempo_atencion_perdido_horas 
                  ? `${(metricasDirector.resumen.tiempo_atencion_perdido_horas / 24).toFixed(1)} días`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Personal Necesario Total</p>
              <p className="text-2xl font-bold">
                {metricasDirector.resumen?.personal_necesario_total || 0} personas
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Costo Total Estimado</p>
              <p className="text-2xl font-bold">
                S/ {metricasDirector.resumen?.costo_total_estimado?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="predicciones">Top Predicciones</TabsTrigger>
          <TabsTrigger value="tipos">Por Tipo</TabsTrigger>
          <TabsTrigger value="areas">Por Área</TabsTrigger>
          <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top incidencias críticas */}
            {metricasDirector?.top_incidencias_criticas && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Top 15 Incidencias Más Críticas</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {metricasDirector.top_incidencias_criticas.map((pred: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {pred.tipo_incidencia_nombre || pred.area_nombre || 'General'}
                          </p>
                          {pred.departamento_predicho && (
                            <p className="text-sm text-muted-foreground">{pred.departamento_predicho}</p>
                          )}
                        </div>
                        <Badge variant="outline">{pred.probabilidad.toFixed(1)}%</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Pacientes</p>
                          <p className="font-medium">{pred.pacientes_afectados_estimados || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Costo Est.</p>
                          <p className="font-medium">
                            S/ {pred.metadatos?.costo_estimado?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Áreas de mayor riesgo */}
            {metricasDirector?.areas_mayor_riesgo && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Áreas de Mayor Riesgo</h2>
                <div className="space-y-3">
                  {metricasDirector.areas_mayor_riesgo.slice(0, 10).map((area: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{area.area_nombre}</p>
                        <Badge variant="outline">
                          {area.probabilidad_promedio.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Predicciones</p>
                          <p className="font-medium">{area.total_predicciones}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pacientes</p>
                          <p className="font-medium">{area.pacientes_afectados}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Costo</p>
                          <p className="font-medium">S/ {area.costo_total.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Recomendaciones */}
          {metricasDirector?.recomendaciones && metricasDirector.recomendaciones.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recomendaciones</h2>
              <ul className="space-y-2">
                {metricasDirector.recomendaciones.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predicciones" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Predicciones Más Probables</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : topPredicciones.length === 0 ? (
              <p className="text-muted-foreground">No hay predicciones disponibles</p>
            ) : (
              <div className="space-y-4">
                {topPredicciones.map((pred, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-lg">
                          {pred.tipo_incidencia_nombre || pred.area_nombre || 'General'}
                        </p>
                        {pred.departamento_predicho && (
                          <p className="text-sm text-muted-foreground">{pred.departamento_predicho}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {pred.probabilidad.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Personas Afectadas</p>
                        <p className="font-medium text-lg">{pred.personas_afectadas_estimadas || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pacientes Afectados</p>
                        <p className="font-medium text-lg">{pred.pacientes_afectados_estimados || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Costo Estimado</p>
                        <p className="font-medium text-lg">
                          S/ {((pred as any).costo_estimado || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Personal Necesario</p>
                        <p className="font-medium text-lg">{(pred as any).personal_necesario || 0}</p>
                      </div>
                    </div>
                    {(pred as any).tiempo_atencion_perdido_horas && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                          Tiempo de atención perdido: {((pred as any).tiempo_atencion_perdido_horas / 24).toFixed(1)} días
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="tipos" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Predicciones por Tipo de Incidencia</h2>
            {chartDataTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartDataTipo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="probabilidad" fill="#0088FE" name="Probabilidad (%)" />
                  <Bar dataKey="personas" fill="#00C49F" name="Personas Afectadas" />
                  <Bar dataKey="pacientes" fill="#FFBB28" name="Pacientes Afectados" />
                  <Bar dataKey="costo" fill="#FF8042" name="Costo (S/)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No hay datos disponibles</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Predicciones por Área/Departamento</h2>
            {chartDataArea.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartDataArea}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="probabilidad" fill="#FF8042" name="Probabilidad (%)" />
                  <Bar dataKey="pacientes" fill="#FFBB28" name="Pacientes Afectados" />
                  <Bar dataKey="costo" fill="#8884d8" name="Costo (S/)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No hay datos disponibles</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tendencias Estacionales</h2>
            {tendenciasData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={tendenciasData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cantidad" stroke="#0088FE" name="Cantidad de Incidencias" />
                  <Line type="monotone" dataKey="personas" stroke="#00C49F" name="Personas Promedio" />
                  <Line type="monotone" dataKey="pacientes" stroke="#FFBB28" name="Pacientes Promedio" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No hay datos disponibles</p>
            )}
          </Card>

          {/* Comparación con período anterior */}
          {metricasDirector?.comparacion_periodo_anterior && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Comparación con Período Anterior</h2>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Anterior</p>
                  <p className="text-2xl font-bold">
                    {metricasDirector.comparacion_periodo_anterior.total || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Personas Promedio</p>
                  <p className="text-2xl font-bold">
                    {metricasDirector.comparacion_periodo_anterior.personas_promedio 
                      ? metricasDirector.comparacion_periodo_anterior.personas_promedio.toFixed(1)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pacientes Promedio</p>
                  <p className="text-2xl font-bold">
                    {metricasDirector.comparacion_periodo_anterior.pacientes_promedio 
                      ? metricasDirector.comparacion_periodo_anterior.pacientes_promedio.toFixed(1)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                  <p className="text-2xl font-bold">
                    {metricasDirector.comparacion_periodo_anterior.tiempo_promedio 
                      ? `${(metricasDirector.comparacion_periodo_anterior.tiempo_promedio / 24).toFixed(1)} días`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
