import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  ExternalLink,
  AlertCircle,
  Loader2,
  User
} from "lucide-react";
import { IncidenciaRelacionada } from "@/services/incidencias.service";

interface IncidenciasRelacionadasProps {
  incidencias: IncidenciaRelacionada[];
  isLoading?: boolean;
  titulo?: string;
  mostrarLimite?: number;
}

export const IncidenciasRelacionadas = ({
  incidencias,
  isLoading = false,
  titulo = "Incidencias relacionadas",
  mostrarLimite = 5
}: IncidenciasRelacionadasProps) => {
  const navigate = useNavigate();
  const incidenciasMostrar = incidencias.slice(0, mostrarLimite);

  const getStatusBadge = (estado: string) => {
    const variants = {
      abierta: "bg-muted text-muted-foreground",
      en_progreso: "bg-primary/10 text-primary",
      resuelta: "bg-success/10 text-success",
      cerrada: "bg-muted text-muted-foreground",
    };
    const labels = {
      abierta: "Abierta",
      en_progreso: "En progreso",
      resuelta: "Resuelta",
      cerrada: "Cerrada",
    };
    return {
      label: labels[estado as keyof typeof labels] || estado,
      className: variants[estado as keyof typeof variants] || variants.abierta,
    };
  };

  const getPriorityBadge = (prioridad?: { nombre: string; color: string } | null) => {
    if (!prioridad) return null;
    return (
      <Badge 
        className="text-xs"
        style={{ backgroundColor: prioridad.color + '20', color: prioridad.color }}
      >
        {prioridad.nombre}
      </Badge>
    );
  };

  const formatTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) {
      return `${horas}h ${mins}min`;
    }
    return `${mins}min`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (incidencias.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No se encontraron incidencias relacionadas
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
          <Badge variant="outline" className="text-xs">
            {incidencias.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {incidenciasMostrar.map((incidencia) => {
          const statusBadge = getStatusBadge(incidencia.estado);
          
          return (
            <div
              key={incidencia.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold text-foreground hover:text-primary"
                      onClick={() => navigate(`/incidencias/${incidencia.codigo}`)}
                    >
                      {incidencia.codigo}
                    </Button>
                    <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    {getPriorityBadge(incidencia.prioridad)}
                  </div>
                  <h4 className="font-medium text-foreground mb-1 line-clamp-2">
                    {incidencia.titulo}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {incidencia.descripcion}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/incidencias/${incidencia.codigo}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
                {incidencia.area && (
                  <div className="flex items-center gap-1">
                    <span>{incidencia.area.nombre}</span>
                  </div>
                )}
                {incidencia.equipo && (
                  <div className="flex items-center gap-1">
                    <span>Equipo: {incidencia.equipo}</span>
                  </div>
                )}
                {incidencia.reportadoPor && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="font-medium text-foreground">
                      {incidencia.reportadoPor.nombre}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(incidencia.fechaCreacion).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {incidencia.resolucion && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span>Resuelta</span>
                    </div>
                    <div className="bg-success/5 border border-success/20 rounded-lg p-3 space-y-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Solución aplicada:
                        </p>
                        <p className="text-sm text-foreground line-clamp-2">
                          {incidencia.resolucion.solucion_aplicada}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Tiempo: {formatTiempo(incidencia.resolucion.tiempo_invertido_minutos)}
                        </span>
                        <span>
                          {new Date(incidencia.resolucion.fecha_resolucion).toLocaleDateString('es-PE')}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {incidencias.length > mostrarLimite && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Mostrando {mostrarLimite} de {incidencias.length} incidencias relacionadas
          </p>
        </div>
      )}
    </Card>
  );
};

