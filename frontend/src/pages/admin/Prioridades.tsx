import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Edit, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, Prioridad, CrearPrioridadData } from "@/services/admin.service";

export default function Prioridades() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{
    tiempo_respuesta_minutos?: number;
    tiempo_resolucion_horas?: number;
  }>({});
  const queryClient = useQueryClient();

  // Cargar prioridades
  const { data: prioridades = [], isLoading } = useQuery({
    queryKey: ['admin-prioridades'],
    queryFn: () => adminService.prioridades.listar(),
  });

  // Mutación para actualizar prioridad
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CrearPrioridadData> }) =>
      adminService.prioridades.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prioridades'] });
      toast.success("SLA actualizado exitosamente");
      setEditingId(null);
      setEditFormData({});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar SLA");
    },
  });

  const handleEdit = (prioridad: Prioridad) => {
    setEditingId(prioridad.id);
    setEditFormData({
      tiempo_respuesta_minutos: prioridad.tiempo_respuesta_minutos,
      tiempo_resolucion_horas: prioridad.tiempo_resolucion_horas,
    });
  };

  const handleSave = (id: number) => {
    actualizarMutation.mutate({
      id,
      data: {
        tiempo_respuesta_minutos: editFormData.tiempo_respuesta_minutos,
        tiempo_resolucion_horas: editFormData.tiempo_resolucion_horas,
      },
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const hrs = hours % 24;
    return hrs > 0 ? `${days}d ${hrs}h` : `${days}d`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Prioridades y SLA
        </h1>
        <p className="text-muted-foreground mt-2">
          Configura los tiempos objetivo de respuesta y resolución
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Niveles de Prioridad</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Tiempo de Respuesta</TableHead>
                  <TableHead>Tiempo de Resolución</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prioridades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay prioridades registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  prioridades.map((prioridad) => (
                    <TableRow key={prioridad.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {prioridad.nivel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${prioridad.color}`} />
                          <span className="font-medium">{prioridad.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingId === prioridad.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-24"
                              value={editFormData.tiempo_respuesta_minutos}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  tiempo_respuesta_minutos: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                            <span className="text-sm text-muted-foreground">minutos</span>
                          </div>
                        ) : (
                          <span>{formatTime(prioridad.tiempo_respuesta_minutos)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === prioridad.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-24"
                              value={editFormData.tiempo_resolucion_horas}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  tiempo_resolucion_horas: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                            <span className="text-sm text-muted-foreground">horas</span>
                          </div>
                        ) : (
                          <span>{formatHours(prioridad.tiempo_resolucion_horas)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === prioridad.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSave(prioridad.id)}
                              disabled={actualizarMutation.isPending}
                            >
                              {actualizarMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancel}
                              disabled={actualizarMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(prioridad)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Información sobre SLA</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• El tiempo de respuesta es el tiempo máximo para asignar un responsable</li>
              <li>• El tiempo de resolución es el tiempo máximo para resolver la incidencia</li>
              <li>• Los tiempos se calculan en horario laboral (Lun-Vie, 8:00-18:00)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
