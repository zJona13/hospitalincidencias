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

interface Notificacion {
  id: string;
  tipo: "asignacion" | "cambio_estado" | "comentario" | "vencimiento";
  titulo: string;
  descripcion: string;
  tiempo: string;
  leida: boolean;
  incidenciaId?: string;
}

export default function Notificaciones() {
  const [notificaciones] = useState<Notificacion[]>([
    {
      id: "1",
      tipo: "asignacion",
      titulo: "Nueva incidencia asignada",
      descripcion: "INC-2024-001 - Urgencias: Equipo de rayos X no funciona",
      tiempo: "Hace 5 minutos",
      leida: false,
      incidenciaId: "INC-2024-001",
    },
    {
      id: "2",
      tipo: "cambio_estado",
      titulo: "Incidencia actualizada",
      descripcion: "INC-2024-002 - Cambió a estado: En progreso",
      tiempo: "Hace 1 hora",
      leida: false,
      incidenciaId: "INC-2024-002",
    },
    {
      id: "3",
      tipo: "comentario",
      titulo: "Nuevo comentario",
      descripcion: 'Dr. Juan Pérez comentó: "Ya estoy revisando el equipo"',
      tiempo: "Hace 2 horas",
      leida: true,
      incidenciaId: "INC-2024-001",
    },
    {
      id: "4",
      tipo: "cambio_estado",
      titulo: "Incidencia resuelta",
      descripcion: "INC-2024-003 - Laboratorio: Problema resuelto exitosamente",
      tiempo: "Hace 3 horas",
      leida: true,
      incidenciaId: "INC-2024-003",
    },
    {
      id: "5",
      tipo: "vencimiento",
      titulo: "Incidencia próxima a vencer",
      descripcion: "INC-2024-004 - Vence en 2 horas según SLA",
      tiempo: "Hace 4 horas",
      leida: true,
      incidenciaId: "INC-2024-004",
    },
    {
      id: "6",
      tipo: "asignacion",
      titulo: "Reasignación de incidencia",
      descripcion: "INC-2024-005 - Te han reasignado esta incidencia",
      tiempo: "Hace 5 horas",
      leida: true,
      incidenciaId: "INC-2024-005",
    },
  ]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground mt-2">
            Mantente al día con las actualizaciones de incidencias
          </p>
        </div>
        <Button variant="outline">Marcar todas como leídas</Button>
      </div>

      <Tabs defaultValue="todas" className="w-full">
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
          {notificaciones.map((notif) => (
            <Card
              key={notif.id}
              className={`transition-colors ${
                !notif.leida ? "bg-primary/5 border-primary/20" : ""
              }`}
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
