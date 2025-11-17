import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  AlertCircle,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificacionesService } from "@/services/notificaciones.service";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Notificaciones() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("todas");

  // Obtener notificaciones
  const { data: notificaciones = [], isLoading } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: () => notificacionesService.listar(),
  });

  // Mutación para marcar como leída
  const marcarLeidaMutation = useMutation({
    mutationFn: (id: number) => notificacionesService.marcarLeida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });

  // Mutación para marcar todas como leídas
  const marcarTodasMutation = useMutation({
    mutationFn: () => notificacionesService.marcarTodasLeidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      toast({
        title: "Éxito",
        description: "Todas las notificaciones han sido marcadas como leídas",
      });
    },
  });

  const handleMarcarLeida = (id: number) => {
    marcarLeidaMutation.mutate(id);
  };

  const handleMarcarTodas = () => {
    marcarTodasMutation.mutate();
  };

  const handleVerIncidencia = (codigo: string) => {
    navigate(`/incidencias/${codigo}`);
  };


  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case "asignacion":
        return <UserPlus className="h-5 w-5 text-primary" />;
      case "cambio_estado":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "comentario":
        return <MessageSquare className="h-5 w-5 text-primary" />;
      case "vencimiento":
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const noLeidas = notificaciones.filter((n) => !n.leida);
  const leidas = notificaciones.filter((n) => n.leida);

  const formatTime = (fecha: string) => {
    const date = new Date(fecha);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'Hace unos momentos';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground mt-2">
            Mantente al día con las actualizaciones de incidencias
          </p>
        </div>
        <Button variant="outline" onClick={handleMarcarTodas} disabled={marcarTodasMutation.isPending}>
          {marcarTodasMutation.isPending ? "Marcando..." : "Marcar todas como leídas"}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="todas">
            Todas
            <Badge variant="secondary" className="ml-2">
              {notificaciones.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="no-leidas">
            No leídas
            <Badge variant="destructive" className="ml-2">
              {noLeidas.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="leidas">
            Leídas
            <Badge variant="secondary" className="ml-2">
              {leidas.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-3 mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Cargando notificaciones...</p>
              </CardContent>
            </Card>
          ) : notificaciones.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes notificaciones</p>
              </CardContent>
            </Card>
          ) : (
            notificaciones.map((notif) => (
              <Card
                key={notif.id}
                className={`transition-colors cursor-pointer ${
                  !notif.leida ? "bg-primary/5 border-primary/20" : ""
                }`}
                onClick={() => {
                  if (!notif.leida) handleMarcarLeida(notif.id);
                  if (notif.incidencia?.codigo) handleVerIncidencia(notif.incidencia.codigo);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIconByType(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {notif.titulo}
                            </h3>
                            {!notif.leida && (
                              <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notif.mensaje}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTime(notif.fecha)}
                          </p>
                        </div>
                        {notif.incidencia?.codigo && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerIncidencia(notif.incidencia!.codigo);
                            }}
                          >
                            Ver incidencia
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="no-leidas" className="space-y-3 mt-6">
          {noLeidas.length > 0 ? (
            noLeidas.map((notif) => (
              <Card key={notif.id} className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIconByType(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {notif.titulo}
                            </h3>
                            <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notif.descripcion}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notif.tiempo}
                          </p>
                        </div>
                        {notif.incidenciaId && (
                          <Button variant="ghost" size="sm">
                            Ver incidencia
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes notificaciones sin leer</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leidas" className="space-y-3 mt-6">
          {leidas.map((notif) => (
            <Card key={notif.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIconByType(notif.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {notif.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notif.descripcion}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notif.tiempo}
                        </p>
                      </div>
                      {notif.incidenciaId && (
                        <Button variant="ghost" size="sm">
                          Ver incidencia
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
