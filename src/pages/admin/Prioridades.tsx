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
import { Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Prioridad {
  id: string;
  nombre: string;
  nivel: string;
  color: string;
  tiempoRespuesta: string;
  tiempoResolucion: string;
}

export default function Prioridades() {
  const [prioridades, setPrioridades] = useState<Prioridad[]>([
    {
      id: "1",
      nombre: "Crítica",
      nivel: "P1",
      color: "bg-priority-high",
      tiempoRespuesta: "15",
      tiempoResolucion: "2",
    },
    {
      id: "2",
      nombre: "Alta",
      nivel: "P2",
      color: "bg-destructive",
      tiempoRespuesta: "30",
      tiempoResolucion: "4",
    },
    {
      id: "3",
      nombre: "Media",
      nivel: "P3",
      color: "bg-priority-medium",
      tiempoRespuesta: "120",
      tiempoResolucion: "24",
    },
    {
      id: "4",
      nombre: "Baja",
      nivel: "P4",
      color: "bg-priority-low",
      tiempoRespuesta: "240",
      tiempoResolucion: "72",
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Prioridad>>({});

  const handleEdit = (prioridad: Prioridad) => {
    setEditingId(prioridad.id);
    setEditFormData({
      tiempoRespuesta: prioridad.tiempoRespuesta,
      tiempoResolucion: prioridad.tiempoResolucion,
    });
  };

  const handleSave = (id: string) => {
    setPrioridades(
      prioridades.map((p) =>
        p.id === id
          ? {
              ...p,
              tiempoRespuesta: editFormData.tiempoRespuesta || p.tiempoRespuesta,
              tiempoResolucion: editFormData.tiempoResolucion || p.tiempoResolucion,
            }
          : p
      )
    );
    setEditingId(null);
    toast.success("SLA actualizado exitosamente");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const formatTime = (minutes: string) => {
    const mins = parseInt(minutes);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    return `${hours}h`;
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
              {prioridades.map((prioridad) => (
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
                          value={editFormData.tiempoRespuesta}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              tiempoRespuesta: e.target.value,
                            })
                          }
                        />
                        <span className="text-sm text-muted-foreground">minutos</span>
                      </div>
                    ) : (
                      <span>{formatTime(prioridad.tiempoRespuesta)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === prioridad.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-24"
                          value={editFormData.tiempoResolucion}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              tiempoResolucion: e.target.value,
                            })
                          }
                        />
                        <span className="text-sm text-muted-foreground">horas</span>
                      </div>
                    ) : (
                      <span>{formatTime(prioridad.tiempoResolucion)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === prioridad.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSave(prioridad.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancel}
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
              ))}
            </TableBody>
          </Table>

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
