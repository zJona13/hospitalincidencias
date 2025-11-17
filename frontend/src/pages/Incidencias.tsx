import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { catalogosService } from "@/services/catalogos.service";

const Incidencias = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroArea, setFiltroArea] = useState<string>("todas");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");

  // Obtener áreas para el filtro
  const { data: areas = [] } = useQuery({
    queryKey: ['catalogos', 'areas'],
    queryFn: () => catalogosService.getAreas(),
  });

  // Obtener prioridades para el filtro
  const { data: prioridades = [] } = useQuery({
    queryKey: ['catalogos', 'prioridades'],
    queryFn: () => catalogosService.getPrioridades(),
  });

  // Construir filtros
  const filtros: any = {};
  if (filtroArea !== "todas") filtros.area_id = parseInt(filtroArea);
  if (filtroEstado !== "todos") filtros.estado = filtroEstado;
  if (filtroPrioridad !== "todas") filtros.prioridad_id = parseInt(filtroPrioridad);
  if (searchTerm) filtros.search = searchTerm;

  // Obtener incidencias
  const { data: incidencias = [], isLoading } = useQuery({
    queryKey: ['incidencias', 'listado', filtros],
    queryFn: () => incidenciasService.listar(filtros),
  });

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      alta: "bg-destructive text-destructive-foreground",
      media: "bg-warning text-warning-foreground",
      baja: "bg-success text-success-foreground",
      critica: "bg-destructive text-destructive-foreground",
    };
    return variants[priority.toLowerCase()] || variants.baja;
  };

  const getStatusBadge = (status: string) => {
    const labels: Record<string, string> = {
      abierta: "Abierta",
      en_progreso: "En progreso",
      resuelta: "Resuelta",
      cerrada: "Cerrada",
    };
    const variants: Record<string, string> = {
      abierta: "bg-muted text-muted-foreground",
      en_progreso: "bg-primary/10 text-primary",
      resuelta: "bg-success/10 text-success",
      cerrada: "bg-muted text-muted-foreground",
    };
    return {
      label: labels[status] || status,
      className: variants[status] || variants.abierta,
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Todas las incidencias</h1>
          <p className="text-muted-foreground mt-1">Gestión y seguimiento completo</p>
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

          <Select value={filtroArea} onValueChange={setFiltroArea}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
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

          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
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

          <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las prioridades</SelectItem>
              {prioridades.map((prioridad) => (
                <SelectItem key={prioridad.id} value={prioridad.id.toString()}>
                  {prioridad.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de incidencias */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Cargando incidencias...
        </div>
      ) : incidencias.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No se encontraron incidencias</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {incidencias.map((inc) => {
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
                          <h3 className="text-lg font-semibold text-foreground">{inc.titulo}</h3>
                          <Badge className={getPriorityBadge(inc.prioridad?.nombre || 'baja')}>
                            {inc.prioridad?.nombre || 'N/A'}
                          </Badge>
                          <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground">{inc.codigo}</p>
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
                        <span className="font-medium text-foreground">{inc.tipo?.nombre || '-'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Responsable:</span>{" "}
                        <span className="font-medium text-foreground">{inc.responsable?.nombre || '-'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reportado por:</span>{" "}
                        <span className="font-medium text-foreground">{inc.reportadoPor?.nombre || '-'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fecha:</span>{" "}
                        <span className="font-medium text-foreground">
                          {inc.fechas?.creacion ? new Date(inc.fechas.creacion).toLocaleString('es-ES') : '-'}
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
          })}
        </div>
      )}
    </div>
  );
};

export default Incidencias;
