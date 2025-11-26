import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { catalogosService } from "@/services/catalogos.service";
import { incidenciasService } from "@/services/incidencias.service";
import { archivosService } from "@/services/archivos.service";
import { IncidenciasRelacionadas } from "@/components/incidencia/IncidenciasRelacionadas";
import { useAuth } from "@/contexts/AuthContext";

const CrearIncidencia = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    area_id: "",
    servicio_id: "",
    tipo_incidencia_id: "",
    subtipo_incidencia_id: "",
    prioridad_id: "",
    responsable_id: "",
    piso: "",
    habitacion: "",
    cama: "",
    equipo: "",
    paciente_id: "",
  });

  const [archivos, setArchivos] = useState<File[]>([]);

  // Cargar catálogos
  const { data: areas = [] } = useQuery({
    queryKey: ['catalogos', 'areas'],
    queryFn: () => catalogosService.getAreas(),
  });

  const { data: tipos = [] } = useQuery({
    queryKey: ['catalogos', 'tipos'],
    queryFn: () => catalogosService.getTipos(),
  });

  const { data: prioridades = [] } = useQuery({
    queryKey: ['catalogos', 'prioridades'],
    queryFn: () => catalogosService.getPrioridades(),
  });

  const { data: servicios = [] } = useQuery({
    queryKey: ['catalogos', 'servicios', formData.area_id],
    queryFn: () => catalogosService.getServicios(formData.area_id ? parseInt(formData.area_id) : undefined),
    enabled: !!formData.area_id,
  });

  const { data: subtipos = [] } = useQuery({
    queryKey: ['catalogos', 'subtipos', formData.tipo_incidencia_id],
    queryFn: () => catalogosService.getSubtipos(formData.tipo_incidencia_id ? parseInt(formData.tipo_incidencia_id) : undefined),
    enabled: !!formData.tipo_incidencia_id,
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['catalogos', 'usuarios'],
    queryFn: () => catalogosService.getUsuarios(),
  });

  // Buscar incidencias relacionadas cuando hay criterios suficientes
  const tieneCriterios = !!(formData.tipo_incidencia_id || formData.area_id);
  const { data: incidenciasRelacionadas = [], isLoading: cargandoRelacionadas } = useQuery({
    queryKey: ['incidencias', 'relacionadas', formData.tipo_incidencia_id, formData.subtipo_incidencia_id, formData.area_id, formData.equipo, formData.titulo],
    queryFn: () => incidenciasService.buscarRelacionadas({
      tipo_incidencia_id: formData.tipo_incidencia_id ? parseInt(formData.tipo_incidencia_id) : undefined,
      subtipo_incidencia_id: formData.subtipo_incidencia_id ? parseInt(formData.subtipo_incidencia_id) : undefined,
      area_id: formData.area_id ? parseInt(formData.area_id) : undefined,
      equipo: formData.equipo || undefined,
      titulo: formData.titulo || undefined,
      descripcion: formData.descripcion || undefined,
    }),
    enabled: tieneCriterios,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) newErrors.titulo = "El título es obligatorio";
    else if (formData.titulo.length < 5) newErrors.titulo = "El título debe tener al menos 5 caracteres";

    if (!formData.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    else if (formData.descripcion.length < 20) newErrors.descripcion = "La descripción debe tener al menos 20 caracteres para asegurar suficiente detalle";

    if (!formData.area_id) newErrors.area_id = "El área es obligatoria";
    if (!formData.tipo_incidencia_id) newErrors.tipo_incidencia_id = "El tipo de incidencia es obligatorio";
    if (!formData.prioridad_id) newErrors.prioridad_id = "La prioridad es obligatoria";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear incidencia
      const data: any = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        area_id: parseInt(formData.area_id),
        tipo_incidencia_id: parseInt(formData.tipo_incidencia_id),
        prioridad_id: parseInt(formData.prioridad_id),
      };

      if (formData.servicio_id) data.servicio_id = parseInt(formData.servicio_id);
      if (formData.subtipo_incidencia_id) data.subtipo_incidencia_id = parseInt(formData.subtipo_incidencia_id);
      if (formData.responsable_id) data.responsable_id = parseInt(formData.responsable_id);
      if (formData.piso) data.piso = formData.piso;
      if (formData.habitacion) data.habitacion = formData.habitacion;
      if (formData.cama) data.cama = formData.cama;
      if (formData.equipo) data.equipo = formData.equipo;
      if (formData.paciente_id) data.paciente_id = formData.paciente_id;

      const resultado = await incidenciasService.crear(data);

      // Subir archivos si hay
      if (archivos.length > 0) {
        for (const archivo of archivos) {
          try {
            await archivosService.subir(resultado.codigo, archivo);
          } catch (error) {
            console.error('Error al subir archivo:', error);
          }
        }
      }

      toast({
        title: "Incidencia creada exitosamente",
        description: `La incidencia ha sido registrada con el código ${resultado.codigo}`,
      });
      navigate("/incidencias");
    } catch (error: any) {
      toast({
        title: "Error al crear incidencia",
        description: error.response?.data?.message || "Ocurrió un error al crear la incidencia",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/incidencias")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crear nueva incidencia</h1>
          <p className="text-muted-foreground mt-1">Registra un nuevo reporte de incidencia</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título de la incidencia *</Label>
                <Input
                  id="titulo"
                  placeholder="Ej: Fallo en sistema de rayos X"
                  value={formData.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  className={errors.titulo ? "border-destructive" : ""}
                />
                {errors.titulo && <p className="text-xs text-destructive">{errors.titulo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción detallada *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el problema con el mayor detalle posible..."
                  rows={6}
                  value={formData.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  className={errors.descripcion ? "border-destructive" : ""}
                />
                {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion}</p>}
                <p className="text-xs text-muted-foreground">
                  Incluye: qué sucedió, cuándo comenzó, qué se ha intentado, impacto en el servicio
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="area">Área *</Label>
                  <Select value={formData.area_id} onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, area_id: value, servicio_id: "" }));
                  }}>
                    <SelectTrigger id="area" className={errors.area_id ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecciona el área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.area_id && <p className="text-xs text-destructive">{errors.area_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicio">Servicio específico</Label>
                  <Select
                    value={formData.servicio_id}
                    onValueChange={(value) => handleChange("servicio_id", value)}
                    disabled={!formData.area_id}
                  >
                    <SelectTrigger id="servicio">
                      <SelectValue placeholder="Selecciona el servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicios.map((servicio) => (
                        <SelectItem key={servicio.id} value={servicio.id.toString()}>
                          {servicio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de incidencia *</Label>
                  <Select value={formData.tipo_incidencia_id} onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, tipo_incidencia_id: value, subtipo_incidencia_id: "" }));
                  }}>
                    <SelectTrigger id="tipo" className={errors.tipo_incidencia_id ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipo_incidencia_id && <p className="text-xs text-destructive">{errors.tipo_incidencia_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtipo">Subtipo</Label>
                  <Select
                    value={formData.subtipo_incidencia_id}
                    onValueChange={(value) => handleChange("subtipo_incidencia_id", value)}
                    disabled={!formData.tipo_incidencia_id}
                  >
                    <SelectTrigger id="subtipo">
                      <SelectValue placeholder="Selecciona el subtipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {subtipos.map((subtipo) => (
                        <SelectItem key={subtipo.id} value={subtipo.id.toString()}>
                          {subtipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad *</Label>
                <Select value={formData.prioridad_id} onValueChange={(value) => handleChange("prioridad_id", value)}>
                  <SelectTrigger id="prioridad" className={errors.prioridad_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecciona la prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map((prioridad) => (
                      <SelectItem key={prioridad.id} value={prioridad.id.toString()}>
                        {prioridad.nombre} - {prioridad.tiempo_resolucion_horas}h para resolver
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.prioridad_id && <p className="text-xs text-destructive">{errors.prioridad_id}</p>}
              </div>

              {/* Solo ADMIN TI puede asignar responsables */}
              {user?.rol === 'admin' && user?.tipo_admin === 'ti' && (
                <div className="space-y-2">
                  <Label htmlFor="responsable">Responsable</Label>
                  <Select value={formData.responsable_id} onValueChange={(value) => handleChange("responsable_id", value)}>
                    <SelectTrigger id="responsable">
                      <SelectValue placeholder="Selecciona un responsable (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id.toString()}>
                          {usuario.nombre} ({usuario.rol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Ubicación / Contexto</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="piso">Piso</Label>
                    <Input
                      id="piso"
                      placeholder="Ej: 3er piso"
                      value={formData.piso}
                      onChange={(e) => handleChange("piso", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="habitacion">Habitación</Label>
                    <Input
                      id="habitacion"
                      placeholder="Ej: 302"
                      value={formData.habitacion}
                      onChange={(e) => handleChange("habitacion", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cama">Cama</Label>
                    <Input
                      id="cama"
                      placeholder="Ej: Cama A"
                      value={formData.cama}
                      onChange={(e) => handleChange("cama", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="equipo">Equipo implicado</Label>
                    <Input
                      id="equipo"
                      placeholder="Ej: Monitor cardíaco #45"
                      value={formData.equipo}
                      onChange={(e) => handleChange("equipo", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Información clínica (opcional)</h3>
                <div className="space-y-2">
                  <Label htmlFor="paciente_id">ID de paciente / Código</Label>
                  <Input
                    id="paciente_id"
                    placeholder="Ingresa el código del paciente si aplica"
                    value={formData.paciente_id}
                    onChange={(e) => handleChange("paciente_id", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Solo código o identificador. No incluir información sensible.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Adjuntos</h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    <input
                      type="file"
                      id="archivos"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="archivos"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          Click para subir archivos o arrastra aquí
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Imágenes, PDF, documentos (máx. 10MB por archivo)
                        </p>
                      </div>
                    </label>
                  </div>

                  {archivos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Archivos seleccionados:</p>
                      {archivos.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-foreground truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Guía rápida</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-foreground mb-1">Prioridad Alta</p>
                  <p className="text-muted-foreground">
                    Impide completamente la atención al paciente o representa riesgo inmediato
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Prioridad Media</p>
                  <p className="text-muted-foreground">
                    Dificulta la operación pero existen alternativas temporales
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Prioridad Baja</p>
                  <p className="text-muted-foreground">
                    Problema menor que no afecta significativamente la operación
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="text-lg font-semibold text-foreground mb-2">Información importante</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Todos los campos marcados con * son obligatorios</li>
                <li>• La incidencia será asignada automáticamente al área correspondiente</li>
                <li>• Recibirás notificaciones sobre el progreso</li>
                <li>• Tiempo estimado de respuesta según prioridad</li>
              </ul>
            </Card>

            {/* Incidencias relacionadas */}
            {tieneCriterios && (
              <IncidenciasRelacionadas
                incidencias={incidenciasRelacionadas}
                isLoading={cargandoRelacionadas}
                titulo="Antecedentes similares"
                mostrarLimite={5}
              />
            )}

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Creando..." : "Crear incidencia"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/incidencias")}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CrearIncidencia;
