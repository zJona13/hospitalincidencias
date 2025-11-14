import { useState } from "react";
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

const CrearIncidencia = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    area: "",
    servicio: "",
    tipo: "",
    subtipo: "",
    prioridad: "",
    piso: "",
    habitacion: "",
    cama: "",
    equipo: "",
    pacienteId: "",
  });

  const [archivos, setArchivos] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Incidencia creada exitosamente",
        description: "La incidencia ha sido registrada con el código INC-2024-016",
      });
      navigate("/incidencias");
      setIsSubmitting(false);
    }, 1000);
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción detallada *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el problema con el mayor detalle posible..."
                  rows={6}
                  value={formData.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Incluye: qué sucedió, cuándo comenzó, qué se ha intentado, impacto en el servicio
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="area">Área *</Label>
                  <Select value={formData.area} onValueChange={(value) => handleChange("area", value)} required>
                    <SelectTrigger id="area">
                      <SelectValue placeholder="Selecciona el área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgencias">Urgencias</SelectItem>
                      <SelectItem value="consultorios">Consultorios</SelectItem>
                      <SelectItem value="radiologia">Radiología</SelectItem>
                      <SelectItem value="laboratorio">Laboratorio</SelectItem>
                      <SelectItem value="farmacia">Farmacia</SelectItem>
                      <SelectItem value="quirofano">Quirófano</SelectItem>
                      <SelectItem value="hospitalizacion">Hospitalización</SelectItem>
                      <SelectItem value="administracion">Administración</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicio">Servicio específico</Label>
                  <Input
                    id="servicio"
                    placeholder="Ej: Sala 2"
                    value={formData.servicio}
                    onChange={(e) => handleChange("servicio", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de incidencia *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleChange("tipo", value)} required>
                    <SelectTrigger id="tipo">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinica">Clínica</SelectItem>
                      <SelectItem value="infraestructura">Infraestructura</SelectItem>
                      <SelectItem value="ti">Tecnología de Información</SelectItem>
                      <SelectItem value="equipamiento">Equipamiento médico</SelectItem>
                      <SelectItem value="suministros">Suministros</SelectItem>
                      <SelectItem value="seguridad">Seguridad</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtipo">Subtipo</Label>
                  <Input
                    id="subtipo"
                    placeholder="Ej: Hardware, software..."
                    value={formData.subtipo}
                    onChange={(e) => handleChange("subtipo", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad *</Label>
                <Select value={formData.prioridad} onValueChange={(value) => handleChange("prioridad", value)} required>
                  <SelectTrigger id="prioridad">
                    <SelectValue placeholder="Selecciona la prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critica">Crítica - Riesgo inmediato para pacientes</SelectItem>
                    <SelectItem value="alta">Alta - Impacto crítico en atención</SelectItem>
                    <SelectItem value="media">Media - Impacto moderado</SelectItem>
                    <SelectItem value="baja">Baja - Impacto mínimo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  <Label htmlFor="pacienteId">ID de paciente / Código</Label>
                  <Input
                    id="pacienteId"
                    placeholder="Ingresa el código del paciente si aplica"
                    value={formData.pacienteId}
                    onChange={(e) => handleChange("pacienteId", e.target.value)}
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
