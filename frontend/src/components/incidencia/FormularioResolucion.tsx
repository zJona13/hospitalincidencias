import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, X } from "lucide-react";
import { incidenciasService } from "@/services/incidencias.service";

interface FormularioResolucionProps {
  codigo: string;
  onResuelto: () => void;
  onCancel: () => void;
}

export function FormularioResolucion({ codigo, onResuelto, onCancel }: FormularioResolucionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    solucion_aplicada: "",
    pasos_seguidos: "",
    recursos_utilizados: "",
    tiempo_invertido_minutos: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.solucion_aplicada.trim()) {
      newErrors.solucion_aplicada = "La solución aplicada es requerida";
    } else if (formData.solucion_aplicada.trim().length < 10) {
      newErrors.solucion_aplicada = "La solución debe tener al menos 10 caracteres";
    }

    if (!formData.pasos_seguidos.trim()) {
      newErrors.pasos_seguidos = "Los pasos seguidos son requeridos";
    } else if (formData.pasos_seguidos.trim().length < 10) {
      newErrors.pasos_seguidos = "Los pasos deben tener al menos 10 caracteres";
    }

    if (!formData.tiempo_invertido_minutos) {
      newErrors.tiempo_invertido_minutos = "El tiempo invertido es requerido";
    } else {
      const tiempo = parseInt(formData.tiempo_invertido_minutos);
      if (isNaN(tiempo) || tiempo <= 0) {
        newErrors.tiempo_invertido_minutos = "El tiempo debe ser un número positivo";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos requeridos correctamente",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await incidenciasService.resolver(codigo, {
        solucion_aplicada: formData.solucion_aplicada.trim(),
        pasos_seguidos: formData.pasos_seguidos.trim(),
        recursos_utilizados: formData.recursos_utilizados.trim() || undefined,
        tiempo_invertido_minutos: parseInt(formData.tiempo_invertido_minutos),
      });

      toast({
        title: "Incidencia resuelta",
        description: "La incidencia ha sido resuelta exitosamente",
      });

      onResuelto();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo resolver la incidencia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="solucion_aplicada">
          Solución Aplicada <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="solucion_aplicada"
          placeholder="Describe la solución que se aplicó para resolver la incidencia..."
          value={formData.solucion_aplicada}
          onChange={(e) =>
            setFormData({ ...formData, solucion_aplicada: e.target.value })
          }
          className={errors.solucion_aplicada ? "border-destructive" : ""}
          rows={4}
          required
        />
        {errors.solucion_aplicada && (
          <p className="text-sm text-destructive">{errors.solucion_aplicada}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pasos_seguidos">
          Pasos Seguidos <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="pasos_seguidos"
          placeholder="Describe los pasos que se siguieron para resolver la incidencia..."
          value={formData.pasos_seguidos}
          onChange={(e) =>
            setFormData({ ...formData, pasos_seguidos: e.target.value })
          }
          className={errors.pasos_seguidos ? "border-destructive" : ""}
          rows={4}
          required
        />
        {errors.pasos_seguidos && (
          <p className="text-sm text-destructive">{errors.pasos_seguidos}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="recursos_utilizados">Recursos Utilizados</Label>
        <Textarea
          id="recursos_utilizados"
          placeholder="Equipos, materiales, personal, etc. utilizados (opcional)..."
          value={formData.recursos_utilizados}
          onChange={(e) =>
            setFormData({ ...formData, recursos_utilizados: e.target.value })
          }
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tiempo_invertido_minutos">
          Tiempo Invertido (minutos) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="tiempo_invertido_minutos"
          type="number"
          min="1"
          placeholder="Ej: 120"
          value={formData.tiempo_invertido_minutos}
          onChange={(e) =>
            setFormData({ ...formData, tiempo_invertido_minutos: e.target.value })
          }
          className={errors.tiempo_invertido_minutos ? "border-destructive" : ""}
          required
        />
        {errors.tiempo_invertido_minutos && (
          <p className="text-sm text-destructive">{errors.tiempo_invertido_minutos}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tiempo total invertido en resolver la incidencia en minutos
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <CheckCircle className="h-4 w-4 mr-2" />
          {loading ? "Resolviendo..." : "Resolver Incidencia"}
        </Button>
      </div>
    </form>
  );
}

