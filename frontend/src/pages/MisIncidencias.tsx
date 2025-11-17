import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, Filter, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { incidenciasService } from "@/services/incidencias.service";

const MisIncidencias = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoTab, setTipoTab] = useState<"creadas" | "asignadas" | "todas">("creadas");

  // Obtener incidencias
  const { data: incidenciasCreadasPorMi = [], isLoading: loadingCreadas } = useQuery({
    queryKey: ['mis-incidencias', 'creadas', searchTerm],
    queryFn: () => incidenciasService.misIncidencias('creadas', searchTerm ? { search: searchTerm } : undefined),
  });

  const { data: incidenciasAsignadasAMi = [], isLoading: loadingAsignadas } = useQuery({
    queryKey: ['mis-incidencias', 'asignadas', searchTerm],
    queryFn: () => incidenciasService.misIncidencias('asignadas', searchTerm ? { search: searchTerm } : undefined),
  });


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
      className: variants[status as keyof typeof variants] || variants.abierta,
    };
  };

  const renderIncidentCard = (inc: any) => {
    const statusBadge = getStatusBadge(inc.estado);
    return (
      <Card
        key={inc.codigo}
        className="p-6 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigate(`/incidencias/${inc.codigo}`)}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {inc.titulo}
                      </h3>
                      <Badge className={getPriorityBadge(inc.prioridad?.nombre || 'baja')}>
                        {inc.prioridad?.nombre || 'N/A'}
                      </Badge>
                      <Badge className={statusBadge.className}>
                        {statusBadge.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground">
                      {inc.codigo}
                    </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{inc.descripcion}</p>

            <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Área:</span>{" "}
                    <span className="font-medium text-foreground">{inc.area?.nombre || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>{" "}
                    <span className="font-medium text-foreground">{inc.tipo || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Responsable:</span>{" "}
                    <span className="font-medium text-foreground">
                      {inc.responsable?.nombre || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reportado por:</span>{" "}
                    <span className="font-medium text-foreground">
                      {inc.reportadoPor?.nombre || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fecha:</span>{" "}
                    <span className="font-medium text-foreground">
                      {inc.fecha ? new Date(inc.fecha).toLocaleString('es-ES') : '-'}
                    </span>
                  </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/incidencias/${inc.codigo}`);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalle
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis incidencias</h1>
          <p className="text-muted-foreground mt-1">
            Incidencias creadas por ti o asignadas a ti
          </p>
        </div>
        <Button onClick={() => navigate("/incidencias/crear")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva incidencia
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código o título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select defaultValue="todas">
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las áreas</SelectItem>
              <SelectItem value="urgencias">Urgencias</SelectItem>
              <SelectItem value="consultorios">Consultorios</SelectItem>
              <SelectItem value="radiologia">Radiología</SelectItem>
              <SelectItem value="laboratorio">Laboratorio</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="todos">
            <SelectTrigger>
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

          <Select defaultValue="todas">
            <SelectTrigger>
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
      </Card>

      {/* Tabs para Creadas por mí / Asignadas a mí */}
      <Tabs value={tipoTab} onValueChange={(v) => setTipoTab(v as "creadas" | "asignadas" | "todas")} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="creadas">
            Creadas por mí ({incidenciasCreadasPorMi.length})
          </TabsTrigger>
          <TabsTrigger value="asignadas">
            Asignadas a mí ({incidenciasAsignadasAMi.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creadas" className="space-y-4">
          {loadingCreadas ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : incidenciasCreadasPorMi.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No has creado ninguna incidencia</p>
            </Card>
          ) : (
            incidenciasCreadasPorMi.map((inc) => renderIncidentCard(inc))
          )}
        </TabsContent>

        <TabsContent value="asignadas" className="space-y-4">
          {loadingAsignadas ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : incidenciasAsignadasAMi.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No tienes incidencias asignadas</p>
            </Card>
          ) : (
            incidenciasAsignadasAMi.map((inc) => renderIncidentCard(inc))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MisIncidencias;
