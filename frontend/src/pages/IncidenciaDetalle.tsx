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
import { ArrowLeft, Edit, Clock, User, Building2, Flag, FileText, MessageSquare, Download, UserCheck, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Timeline } from "@/components/incidencia/Timeline";
import { FormularioResolucion } from "@/components/incidencia/FormularioResolucion";
import { IncidenciasRelacionadas } from "@/components/incidencia/IncidenciasRelacionadas";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { incidenciasService } from "@/services/incidencias.service";
import { historialService } from "@/services/historial.service";
import { comentariosService } from "@/services/comentarios.service";
import { archivosService } from "@/services/archivos.service";

const IncidenciaDetalle = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [isReasignDialogOpen, setIsReasignDialogOpen] = useState(false);
  const [nuevoResponsable, setNuevoResponsable] = useState("");
  const [isResolverDialogOpen, setIsResolverDialogOpen] = useState(false);

  // Obtener incidencia desde la API
  const { data: incidenciaData, isLoading: cargandoIncidencia } = useQuery({
    queryKey: ['incidencias', codigo],
    queryFn: () => incidenciasService.obtener(codigo!),
    enabled: !!codigo,
  });

  // Obtener incidencias relacionadas
  const { data: incidenciasRelacionadas = [], isLoading: cargandoRelacionadas } = useQuery({
    queryKey: ['incidencias', codigo, 'relacionadas'],
    queryFn: () => incidenciasService.obtenerRelacionadas(codigo!),
    enabled: !!codigo,
  });

  // Obtener historial/timeline
  const { data: historialData = [], isLoading: cargandoHistorial } = useQuery({
    queryKey: ['incidencias', codigo, 'historial'],
    queryFn: () => historialService.obtener(codigo!),
    enabled: !!codigo,
  });

  // Obtener comentarios
  const { data: comentariosData = [], isLoading: cargandoComentarios } = useQuery({
    queryKey: ['incidencias', codigo, 'comentarios'],
    queryFn: () => comentariosService.listar(codigo!),
    enabled: !!codigo,
  });

  // Obtener archivos adjuntos
  const { data: archivosData = [], isLoading: cargandoArchivos } = useQuery({
    queryKey: ['incidencias', codigo, 'archivos'],
    queryFn: () => archivosService.listar(codigo!),
    enabled: !!codigo,
  });

  // Transformar historial al formato Timeline
  const timeline = historialData.map((evento) => ({
    tipo: evento.tipo as "creacion" | "asignacion" | "estado" | "comentario" | "adjunto" | "prioridad" | "reasignacion" | "resolucion",
    fecha: new Date(evento.fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    usuario: evento.usuario.nombre,
    detalle: evento.descripcion,
    estadoPrevio: evento.estadoPrevio || undefined,
    estadoNuevo: evento.estadoNuevo || undefined,
  }));

  // Transformar comentarios al formato esperado
  const comentarios = comentariosData.map((comentario) => ({
    autor: comentario.autor.nombre,
    fecha: new Date(comentario.fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    texto: comentario.texto,
  }));

  // Transformar archivos al formato esperado
  const adjuntos = archivosData.map((archivo) => ({
    id: archivo.id,
    nombre: archivo.nombre,
    tipo: archivo.tipo,
    tamano: archivo.tamanoFormateado,
    fecha: new Date(archivo.fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
  }));

  // Usar datos reales de la API
  const incidencia = incidenciaData;

  const getPriorityBadge = (priority: string | { nivel?: string; nombre?: string } | undefined) => {
    // Normalizar prioridad: puede venir como string o como objeto desde la API
    let priorityStr = '';
    if (typeof priority === 'string') {
      priorityStr = priority;
    } else if (priority && typeof priority === 'object') {
      // Usar nivel si está disponible, sino nombre, sino 'baja' por defecto
      priorityStr = priority.nivel || priority.nombre || 'baja';
    } else {
      priorityStr = 'baja';
    }
    
    // Normalizar a minúsculas para comparación
    priorityStr = priorityStr.toLowerCase();
    
    const variants = {
      critica: "bg-destructive text-destructive-foreground",
      alta: "bg-destructive text-destructive-foreground",
      media: "bg-warning text-warning-foreground",
      baja: "bg-success text-success-foreground",
    };
    return variants[priorityStr as keyof typeof variants] || variants.baja;
  };

  // Función auxiliar para obtener el texto de prioridad
  const getPriorityText = (priority: string | { nivel?: string; nombre?: string } | undefined): string => {
    if (typeof priority === 'string') {
      return priority.charAt(0).toUpperCase() + priority.slice(1);
    } else if (priority && typeof priority === 'object') {
      const text = priority.nombre || priority.nivel || 'Baja';
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
    return 'Baja';
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

  // Mostrar loading si está cargando la incidencia
  if (cargandoIncidencia || !incidencia) {
    return (
      <div className="p-6">
        <p>Cargando incidencia...</p>
      </div>
    );
  }

  const statusBadge = getStatusBadge(incidencia.estado);

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim() || !codigo) {
      return;
    }

    try {
      await comentariosService.agregar(codigo, nuevoComentario.trim());
      toast({
        title: "Comentario agregado",
        description: "El comentario se ha registrado correctamente.",
      });
      setNuevoComentario("");
      // Invalidar query de comentarios para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['incidencias', codigo, 'comentarios'] });
      // Invalidar query de historial para actualizar timeline
      queryClient.invalidateQueries({ queryKey: ['incidencias', codigo, 'historial'] });
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
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
              {getPriorityText(incidencia.prioridad)}
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
                <p className="font-medium text-foreground">
                  {typeof incidencia.reportadoPor === 'string' 
                    ? incidencia.reportadoPor 
                    : incidencia.reportadoPor?.nombre || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de reporte</p>
                <p className="font-medium text-foreground">
                  {incidencia.fechas?.creacion || incidencia.fechaCreacion || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Ubicación</p>
                <p className="font-medium text-foreground">
                  {incidencia.ubicacion?.piso && incidencia.ubicacion?.habitacion
                    ? `${incidencia.ubicacion.piso} - ${incidencia.ubicacion.habitacion}`
                    : incidencia.ubicacion?.piso || incidencia.ubicacion?.habitacion || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Equipo</p>
                <p className="font-medium text-foreground">
                  {incidencia.ubicacion?.equipo || 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          {/* Incidencias relacionadas */}
          <IncidenciasRelacionadas
            incidencias={incidenciasRelacionadas}
            isLoading={cargandoRelacionadas}
            titulo="Incidencias relacionadas"
            mostrarLimite={5}
          />

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Línea de tiempo</h2>
            </div>
            {cargandoHistorial ? (
              <p className="text-sm text-muted-foreground">Cargando línea de tiempo...</p>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay eventos en la línea de tiempo</p>
            ) : (
              <Timeline eventos={timeline} />
            )}
          </Card>

          {/* Sección de Resolución */}
          {incidencia.estado === 'resuelta' || incidencia.estado === 'cerrada' ? (
            <Card className="p-6 border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-foreground">Resolución</h2>
              </div>
              {incidencia.resolucion ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Solución Aplicada</p>
                    <p className="text-foreground">{incidencia.resolucion.solucion_aplicada}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pasos Seguidos</p>
                    <p className="text-foreground whitespace-pre-line">{incidencia.resolucion.pasos_seguidos}</p>
                  </div>
                  {incidencia.resolucion.recursos_utilizados && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Recursos Utilizados</p>
                      <p className="text-foreground">{incidencia.resolucion.recursos_utilizados}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo Invertido</p>
                      <p className="font-medium text-foreground">
                        {Math.floor(incidencia.resolucion.tiempo_invertido_minutos / 60)}h {incidencia.resolucion.tiempo_invertido_minutos % 60}min
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Resuelto por</p>
                      <p className="font-medium text-foreground">{incidencia.resolucion.resuelto_por.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Resolución</p>
                      <p className="font-medium text-foreground">
                        {new Date(incidencia.resolucion.fecha_resolucion).toLocaleString('es-PE')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No hay detalles de resolución disponibles</p>
              )}
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Resolver Incidencia</h2>
                </div>
                <Dialog open={isResolverDialogOpen} onOpenChange={setIsResolverDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Resolver Incidencia</DialogTitle>
                    </DialogHeader>
                    <FormularioResolucion
                      codigo={codigo || ''}
                      onResuelto={() => {
                        setIsResolverDialogOpen(false);
                        // Recargar datos de la incidencia
                        window.location.reload();
                      }}
                      onCancel={() => setIsResolverDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-sm text-muted-foreground">
                Completa el formulario de resolución con todos los detalles de cómo se solucionó la incidencia.
              </p>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Comentarios</h2>
            </div>
            
            {cargandoComentarios ? (
              <p className="text-sm text-muted-foreground mb-6">Cargando comentarios...</p>
            ) : (
              <div className="space-y-4 mb-6">
                {comentarios.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay comentarios aún</p>
                ) : (
                  comentarios.map((comentario, index) => (
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
                  ))
                )}
              </div>
            )}

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
            
            {cargandoArchivos ? (
              <p className="text-sm text-muted-foreground">Cargando archivos...</p>
            ) : adjuntos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay archivos adjuntos</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {adjuntos.map((adjunto) => (
                  <div key={adjunto.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => archivosService.descargar(adjunto.id, adjunto.nombre)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            
            {incidencia.responsable && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg mb-6">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {typeof incidencia.responsable === 'string'
                      ? incidencia.responsable.split(' ').map(n => n[0]).join('')
                      : incidencia.responsable.nombre?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {typeof incidencia.responsable === 'string'
                      ? incidencia.responsable
                      : incidencia.responsable.nombre || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">Responsable</p>
                </div>
              </div>
            )}

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
                  value={typeof incidencia.prioridad === 'string' 
                    ? incidencia.prioridad 
                    : (incidencia.prioridad?.nivel || incidencia.prioridad?.nombre || 'baja')} 
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
                <Select defaultValue={typeof incidencia.area === 'string' ? incidencia.area : incidencia.area?.nombre}>
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
                  <p className="font-medium text-foreground">
                    {typeof incidencia.area === 'string' 
                      ? incidencia.area 
                      : incidencia.area?.nombre || 'N/A'}
                  </p>
                </div>
              </div>

              {incidencia.servicio && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Servicio</p>
                    <p className="font-medium text-foreground">
                      {typeof incidencia.servicio === 'string' 
                        ? incidencia.servicio 
                        : incidencia.servicio?.nombre || 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {incidencia.tipo && (
                <div className="flex items-start gap-3">
                  <Flag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium text-foreground">
                      {typeof incidencia.tipo === 'string' 
                        ? incidencia.tipo 
                        : incidencia.tipo?.nombre || 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Fecha de creación</p>
                  <p className="font-medium text-foreground">
                    {incidencia.fechas?.creacion || incidencia.fechaCreacion || 'N/A'}
                  </p>
                </div>
              </div>

              {(incidencia.fechas?.vencimiento || incidencia.fechaVencimiento) && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Fecha de vencimiento</p>
                    <p className="font-medium text-foreground">
                      {incidencia.fechas?.vencimiento || incidencia.fechaVencimiento}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Última actualización</p>
                  <p className="font-medium text-foreground">
                    {incidencia.fechas?.actualizacion || incidencia.fechaActualizacion || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-warning/50 bg-warning/5">
            <h3 className="text-lg font-semibold text-foreground mb-4">SLA</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo límite</p>
                <p className="text-xl font-bold text-foreground">
                  {cargandoIncidencia ? 'Cargando...' : (incidencia.sla ?? 'N/A')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiempo transcurrido</p>
                <p className="text-xl font-bold text-warning">
                  {cargandoIncidencia ? 'Cargando...' : (incidencia.tiempoTranscurrido ?? 'N/A')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IncidenciaDetalle;
