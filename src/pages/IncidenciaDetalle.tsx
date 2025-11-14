import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Edit, Clock, User, Building2, Flag, FileText, MessageSquare, Download, UserCheck } from "lucide-react";
import { useState } from "react";
import { Timeline } from "@/components/incidencia/Timeline";
import { useToast } from "@/hooks/use-toast";

const IncidenciaDetalle = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [isReasignDialogOpen, setIsReasignDialogOpen] = useState(false);
  const [nuevoResponsable, setNuevoResponsable] = useState("");

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
    fechaVencimiento: "2024-11-14 12:30",
    sla: "4 horas",
    tiempoTranscurrido: "1h 15min",
    ubicacion: {
      piso: "2do piso",
      habitacion: "Sala 2",
      equipo: "Rayos X Digital #3"
    },
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
    adjuntos: [
      {
        nombre: "error_screenshot.png",
        tipo: "imagen",
        tamano: "245 KB",
        fecha: "2024-11-14 08:32"
      },
      {
        nombre: "reporte_tecnico.pdf",
        tipo: "pdf",
        tamano: "1.2 MB",
        fecha: "2024-11-14 09:15"
      }
    ],
    timeline: [
      {
        tipo: "creacion" as const,
        fecha: "2024-11-14 08:30",
        usuario: "Dra. Martínez",
        detalle: "Creó la incidencia"
      },
      {
        tipo: "asignacion" as const,
        fecha: "2024-11-14 08:35",
        usuario: "Sistema",
        detalle: "Asignada a Dr. García (Jefe de Mantenimiento)"
      },
      {
        tipo: "estado" as const,
        fecha: "2024-11-14 08:40",
        usuario: "Dr. García",
        detalle: "Cambió el estado",
        estadoPrevio: "Abierta",
        estadoNuevo: "En progreso"
      },
      {
        tipo: "comentario" as const,
        fecha: "2024-11-14 09:00",
        usuario: "Dr. García",
        detalle: "He revisado el equipo. Parece ser un problema de software. Contactando con el proveedor."
      },
      {
        tipo: "adjunto" as const,
        fecha: "2024-11-14 09:15",
        usuario: "Dr. García",
        detalle: "Agregó archivo: reporte_tecnico.pdf"
      },
      {
        tipo: "comentario" as const,
        fecha: "2024-11-14 09:30",
        usuario: "Ing. López",
        detalle: "Proveedor confirmó que enviarán un técnico en las próximas 2 horas."
      }
    ]
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
      toast({
        title: "Comentario agregado",
        description: "El comentario se ha registrado correctamente.",
      });
      setNuevoComentario("");
    }
  };

  const handleReasignar = () => {
    if (nuevoResponsable) {
      toast({
        title: "Incidencia reasignada",
        description: `La incidencia ha sido asignada a ${nuevoResponsable}`,
      });
      setIsReasignDialogOpen(false);
      setNuevoResponsable("");
    }
  };

  const handleCambioEstado = (nuevoEstado: string) => {
    toast({
      title: "Estado actualizado",
      description: `El estado cambió a: ${getStatusBadge(nuevoEstado).label}`,
    });
  };

  const handleCambioPrioridad = (nuevaPrioridad: string) => {
    toast({
      title: "Prioridad actualizada",
      description: `La prioridad cambió a: ${nuevaPrioridad}`,
    });
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
            <p className="text-muted-foreground leading-relaxed mb-4">{incidencia.descripcion}</p>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Reportado por</p>
                <p className="font-medium text-foreground">{incidencia.reportadoPor}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de reporte</p>
                <p className="font-medium text-foreground">{incidencia.fechaCreacion}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ubicación</p>
                <p className="font-medium text-foreground">
                  {incidencia.ubicacion.piso} - {incidencia.ubicacion.habitacion}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Equipo</p>
                <p className="font-medium text-foreground">{incidencia.ubicacion.equipo}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Línea de tiempo</h2>
            </div>
            <Timeline eventos={incidencia.timeline} />
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Comentarios</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              {incidencia.comentarios.map((comentario, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {comentario.autor.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{comentario.autor}</span>
                        <span className="text-xs text-muted-foreground">{comentario.fecha}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground ml-11">{comentario.texto}</p>
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

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Archivos adjuntos</h2>
            </div>
            
            <div className="grid gap-3 md:grid-cols-2">
              {incidencia.adjuntos.map((adjunto, index) => (
                <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{adjunto.nombre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{adjunto.tamano}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{adjunto.fecha}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Información lateral */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Responsable</h3>
              <Dialog open={isReasignDialogOpen} onOpenChange={setIsReasignDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Reasignar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reasignar incidencia</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="responsable">Nuevo responsable</Label>
                      <Select value={nuevoResponsable} onValueChange={setNuevoResponsable}>
                        <SelectTrigger id="responsable">
                          <SelectValue placeholder="Selecciona un responsable" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr. García">Dr. García</SelectItem>
                          <SelectItem value="Ing. López">Ing. López</SelectItem>
                          <SelectItem value="Téc. Ramírez">Téc. Ramírez</SelectItem>
                          <SelectItem value="Dr. Fernández">Dr. Fernández</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleReasignar} className="w-full">
                      Confirmar reasignación
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg mb-6">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {incidencia.responsable.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{incidencia.responsable}</p>
                <p className="text-sm text-muted-foreground">Jefe de Mantenimiento</p>
              </div>
            </div>

            <Separator className="my-4" />

            <h3 className="text-lg font-semibold text-foreground mb-4">Edición rápida</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="estado-edit">Estado</Label>
                <Select 
                  value={incidencia.estado} 
                  onValueChange={handleCambioEstado}
                >
                  <SelectTrigger id="estado-edit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abierta">Abierta</SelectItem>
                    <SelectItem value="en_progreso">En progreso</SelectItem>
                    <SelectItem value="resuelta">Resuelta</SelectItem>
                    <SelectItem value="cerrada">Cerrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad-edit">Prioridad</Label>
                <Select 
                  value={incidencia.prioridad} 
                  onValueChange={handleCambioPrioridad}
                >
                  <SelectTrigger id="prioridad-edit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critica">Crítica</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area-edit">Área</Label>
                <Select defaultValue={incidencia.area}>
                  <SelectTrigger id="area-edit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Radiología">Radiología</SelectItem>
                    <SelectItem value="Urgencias">Urgencias</SelectItem>
                    <SelectItem value="Consultorios">Consultorios</SelectItem>
                    <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Información</h3>
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
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Fecha de creación</p>
                  <p className="font-medium text-foreground">{incidencia.fechaCreacion}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Fecha de vencimiento</p>
                  <p className="font-medium text-foreground">{incidencia.fechaVencimiento}</p>
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
