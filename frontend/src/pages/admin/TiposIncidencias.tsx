import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit, Trash2, Loader2, AlertCircle, Wrench, Monitor, FileText } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, Tipo, CrearTipoData } from "@/services/admin.service";

const iconMap = {
  AlertCircle,
  Wrench,
  Monitor,
  FileText,
};

export default function TiposIncidencias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTipo, setEditingTipo] = useState<Tipo | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    color: "",
    icono: "",
  });
  const queryClient = useQueryClient();

  // Cargar tipos
  const { data: tipos = [], isLoading } = useQuery({
    queryKey: ['admin-tipos'],
    queryFn: () => adminService.tipos.listar(),
  });

  // Mutación para crear tipo
  const crearMutation = useMutation({
    mutationFn: (data: CrearTipoData) => adminService.tipos.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tipos'] });
      toast.success("Tipo de incidencia creado exitosamente");
      setOpenDialog(false);
      setFormData({ nombre: "", categoria: "", color: "", icono: "" });
      setEditingTipo(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al crear tipo");
    },
  });

  // Mutación para actualizar tipo
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CrearTipoData & { activo?: boolean }> }) =>
      adminService.tipos.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tipos'] });
      toast.success("Tipo de incidencia actualizado exitosamente");
      setOpenDialog(false);
      setFormData({ nombre: "", categoria: "", color: "", icono: "" });
      setEditingTipo(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar tipo");
    },
  });

  // Mutación para eliminar tipo
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => adminService.tipos.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tipos'] });
      toast.success("Tipo desactivado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar tipo");
    },
  });

  // Mutación para toggle activo
  const toggleActivoMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      adminService.tipos.actualizar(id, { activo: !activo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tipos'] });
      toast.success("Estado actualizado");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar estado");
    },
  });

  const handleCrearTipo = () => {
    if (!formData.nombre || !formData.categoria || !formData.color || !formData.icono) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const data: CrearTipoData = {
      nombre: formData.nombre,
      categoria: formData.categoria,
      color: formData.color,
      icono: formData.icono,
    };

    if (editingTipo) {
      actualizarMutation.mutate({ id: editingTipo.id, data });
    } else {
      crearMutation.mutate(data);
    }
  };

  const handleEditarTipo = (tipo: Tipo) => {
    setEditingTipo(tipo);
    setFormData({
      nombre: tipo.nombre,
      categoria: tipo.categoria,
      color: tipo.color,
      icono: tipo.icono,
    });
    setOpenDialog(true);
  };

  const handleEliminarTipo = (tipo: Tipo) => {
    if (confirm(`¿Estás seguro de desactivar el tipo "${tipo.nombre}"?`)) {
      eliminarMutation.mutate(tipo.id);
    }
  };

  const handleToggleActivo = (tipo: Tipo) => {
    toggleActivoMutation.mutate({ id: tipo.id, activo: tipo.activo });
  };

  const handleOpenDialog = (open: boolean) => {
    setOpenDialog(open);
    if (!open) {
      setFormData({ nombre: "", categoria: "", color: "", icono: "" });
      setEditingTipo(null);
    }
  };

  const filteredTipos = tipos.filter(
    (tipo) =>
      tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipo.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tipos de Incidencias
          </h1>
          <p className="text-muted-foreground mt-2">
            Configura los tipos y subtipos de incidencias
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={handleOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingTipo ? "Editar Tipo" : "Crear Nuevo Tipo"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del tipo *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Clínica"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Input
                  id="categoria"
                  placeholder="Ej: Atención al paciente"
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) =>
                    setFormData({ ...formData, color: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-destructive">Rojo</SelectItem>
                    <SelectItem value="bg-warning">Amarillo</SelectItem>
                    <SelectItem value="bg-primary">Azul</SelectItem>
                    <SelectItem value="bg-success">Verde</SelectItem>
                    <SelectItem value="bg-secondary">Gris</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icono">Icono *</Label>
                <Select
                  value={formData.icono}
                  onValueChange={(value) =>
                    setFormData({ ...formData, icono: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un icono" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AlertCircle">Alerta</SelectItem>
                    <SelectItem value="Wrench">Herramienta</SelectItem>
                    <SelectItem value="Monitor">Monitor</SelectItem>
                    <SelectItem value="FileText">Documento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenDialog(false)}
                disabled={crearMutation.isPending || actualizarMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCrearTipo}
                disabled={crearMutation.isPending || actualizarMutation.isPending}
              >
                {crearMutation.isPending || actualizarMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingTipo ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  editingTipo ? "Actualizar" : "Crear Tipo"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tipo de incidencia..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icono</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Subtipos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTipos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay tipos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTipos.map((tipo) => {
                    const IconComponent = iconMap[tipo.icono as keyof typeof iconMap] || AlertCircle;
                    return (
                      <TableRow key={tipo.id}>
                        <TableCell>
                          <div className={`${tipo.color} h-10 w-10 rounded-lg flex items-center justify-center text-white`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{tipo.nombre}</TableCell>
                        <TableCell>{tipo.categoria}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{(tipo as any).subtipos || 0} subtipos</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={tipo.activo}
                              onCheckedChange={() => handleToggleActivo(tipo)}
                              disabled={toggleActivoMutation.isPending}
                            />
                            <span className="text-sm text-muted-foreground">
                              {tipo.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditarTipo(tipo)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEliminarTipo(tipo)}
                              disabled={eliminarMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
