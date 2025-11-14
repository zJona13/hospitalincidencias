import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit, Clock, User, Building2, Flag, FileText, MessageSquare } from "lucide-react";
import { useState } from "react";

const IncidenciaDetalle = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [nuevoComentario, setNuevoComentario] = useState("");

  // Mock data - en producción vendría de una API
  const incidencia = {
    codigo: codigo,
    titulo: "Fallo en sistema de rayos X",
    descripcion: "El sistema de rayos X en la sala 2 no se enciende correctamente. Se ha intentado reiniciar el equipo múltiples veces sin éxito. El problema comenzó esta mañana alrededor de las 8:00 AM.",
    area: "Radiología",
    servicio: "Diagnóstico por Imagen",
    tipo: "TI",
    prioridad: "alta",
    estado: "en_progreso",
    responsable: "Dr. García",
    reportadoPor: "Dra. Martínez",
    fechaCreacion: "2024-11-14 08:30",
    fechaActualizacion: "2024-11-14 09:45",
    sla: "4 horas",
    tiempoTranscurrido: "1h 15min",
    comentarios: [
      {
        autor: "Dr. García",
        fecha: "2024-11-14 09:00",
        texto: "He revisado el equipo. Parece ser un problema de software. Contactando con el proveedor.",
      },
      {
        autor: "Ing. López",
        fecha: "2024-11-14 09:30",
        texto: "Proveedor confirmó que enviarán un técnico en las próximas 2 horas.",
      },
    ],
  };

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

  const statusBadge = getStatusBadge(incidencia.estado);

  const handleAgregarComentario = () => {
    if (nuevoComentario.trim()) {
      // Aquí iría la lógica para agregar el comentario
      console.log("Nuevo comentario:", nuevoComentario);
      setNuevoComentario("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/incidencias")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-foreground">{incidencia.titulo}</h1>
            <Badge className={getPriorityBadge(incidencia.prioridad)}>
              {incidencia.prioridad.charAt(0).toUpperCase() + incidencia.prioridad.slice(1)}
            </Badge>
            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
          </div>
          <p className="text-sm font-mono text-muted-foreground">{incidencia.codigo}</p>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Descripción</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{incidencia.descripcion}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Comentarios y seguimiento</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              {incidencia.comentarios.map((comentario, index) => (
                <div key={index} className="border-l-2 border-primary pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{comentario.autor}</span>
                    <span className="text-xs text-muted-foreground">{comentario.fecha}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comentario.texto}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Agregar comentario</label>
              <Textarea
                placeholder="Escribe un comentario sobre el progreso de la incidencia..."
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAgregarComentario}>Agregar comentario</Button>
            </div>
          </Card>
        </div>

        {/* Información lateral */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Detalles</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Área</p>
                  <p className="font-medium text-foreground">{incidencia.area}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Servicio</p>
                  <p className="font-medium text-foreground">{incidencia.servicio}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Flag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium text-foreground">{incidencia.tipo}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Responsable</p>
                  <p className="font-medium text-foreground">{incidencia.responsable}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Reportado por</p>
                  <p className="font-medium text-foreground">{incidencia.reportadoPor}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Fecha de creación</p>
                  <p className="font-medium text-foreground">{incidencia.fechaCreacion}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Última actualización</p>
                  <p className="font-medium text-foreground">{incidencia.fechaActualizacion}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-warning/50 bg-warning/5">
            <h3 className="text-lg font-semibold text-foreground mb-4">SLA</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo límite</p>
                <p className="text-xl font-bold text-foreground">{incidencia.sla}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiempo transcurrido</p>
                <p className="text-xl font-bold text-warning">{incidencia.tiempoTranscurrido}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IncidenciaDetalle;
