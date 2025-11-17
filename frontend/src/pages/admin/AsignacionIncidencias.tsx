import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminTiService } from "@/services/admin-ti.service";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Clock, AlertCircle, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AsignacionIncidencias() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [asignarDialog, setAsignarDialog] = useState<{ open: boolean; incidencia: any | null }>({
    open: false,
    incidencia: null,
  });
  const [responsableId, setResponsableId] = useState("");

  const { data: pendientes, isLoading } = useQuery({
    queryKey: ['incidencias-pendientes'],
    queryFn: () => adminTiService.listarPendientes(50, 0),
  });

  const asignarMutation = useMutation({
    mutationFn: ({ codigo, responsableId }: { codigo: string; responsableId: number }) =>
      adminTiService.asignarIncidencia(codigo, responsableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidencias-pendientes'] });
      setAsignarDialog({ open: false, incidencia: null });
      setResponsableId("");
      toast({
        title: "Incidencia asignada",
        description: "La incidencia ha sido asignada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo asignar la incidencia",
        variant: "destructive",
      });
    },
  });

  const handleAsignar = () => {
    if (!responsableId) {
      toast({
        title: "Error",
        description: "Selecciona un responsable",
        variant: "destructive",
      });
      return;
    }

    if (asignarDialog.incidencia) {
      asignarMutation.mutate({
        codigo: asignarDialog.incidencia.codigo,
        responsableId: parseInt(responsableId),
      });
    }
  };

  const getPriorityColor = (nivel: string) => {
    const colors: Record<string, string> = {
      P1: "bg-destructive",
      P2: "bg-orange-500",
      P3: "bg-yellow-500",
      P4: "bg-blue-500",
    };
    return colors[nivel] || "bg-muted";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asignación de Incidencias</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona la asignación de incidencias pendientes a responsables
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Incidencias Pendientes de Asignación</h2>
          {pendientes && (
            <Badge variant="outline">{pendientes.paginacion.total} pendientes</Badge>
          )}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Cargando incidencias...</p>
        ) : !pendientes || pendientes.data.length === 0 ? (
          <div className="text-center py-8">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay incidencias pendientes de asignación</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendientes.data.map((incidencia) => (
              <div
                key={incidencia.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3
                        className="font-semibold text-foreground cursor-pointer hover:underline"
                        onClick={() => navigate(`/incidencias/${incidencia.codigo}`)}
                      >
                        {incidencia.titulo}
                      </h3>
                      <Badge className={getPriorityColor(incidencia.prioridad?.nivel || "")}>
                        {incidencia.prioridad?.nivel || "N/A"}
                      </Badge>
                      <Badge variant="outline">{incidencia.codigo}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {incidencia.descripcion}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      {incidencia.area && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{incidencia.area.nombre}</span>
                        </div>
                      )}
                      {incidencia.tipo && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{incidencia.tipo.nombre}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(incidencia.fecha_creacion).toLocaleDateString('es-PE')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Dialog
                    open={asignarDialog.open && asignarDialog.incidencia?.id === incidencia.id}
                    onOpenChange={(open) =>
                      setAsignarDialog({ open, incidencia: open ? incidencia : null })
                    }
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setAsignarDialog({ open: true, incidencia })}
                        size="sm"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Asignar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Asignar Incidencia</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>{incidencia.codigo}</strong> - {incidencia.titulo}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="responsable">Responsable</Label>
                          <Select value={responsableId} onValueChange={setResponsableId}>
                            <SelectTrigger id="responsable">
                              <SelectValue placeholder="Selecciona un responsable" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* En producción, esto vendría de una lista de usuarios */}
                              <SelectItem value="1">Usuario Ejemplo 1</SelectItem>
                              <SelectItem value="2">Usuario Ejemplo 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setAsignarDialog({ open: false, incidencia: null })}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleAsignar}
                            disabled={asignarMutation.isPending || !responsableId}
                          >
                            {asignarMutation.isPending ? "Asignando..." : "Asignar"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

