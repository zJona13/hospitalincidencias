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
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, Area, CrearAreaData } from "@/services/admin.service";
import { catalogosService } from "@/services/catalogos.service";

export default function Areas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    responsable_id: "",
  });
  const queryClient = useQueryClient();

  // Cargar áreas
  const { data: areas = [], isLoading } = useQuery({
    queryKey: ['admin-areas', searchTerm],
    queryFn: () => adminService.areas.listar(undefined, searchTerm || undefined),
  });

  // Cargar usuarios para select de responsable
  const { data: usuarios = [] } = useQuery({
    queryKey: ['catalogos-usuarios'],
    queryFn: () => catalogosService.getUsuarios(),
  });

  // Mutación para crear área
  const crearMutation = useMutation({
    mutationFn: (data: CrearAreaData) => adminService.areas.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-areas'] });
      toast.success("Área creada exitosamente");
      setOpenDialog(false);
      setFormData({ nombre: "", codigo: "", responsable_id: "" });
      setEditingArea(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al crear área");
    },
  });

  // Mutación para actualizar área
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CrearAreaData & { activo?: boolean }> }) =>
      adminService.areas.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-areas'] });
      toast.success("Área actualizada exitosamente");
      setOpenDialog(false);
      setFormData({ nombre: "", codigo: "", responsable_id: "" });
      setEditingArea(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar área");
    },
  });

  // Mutación para eliminar área
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => adminService.areas.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-areas'] });
      toast.success("Área desactivada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar área");
    },
  });

  const handleCrearArea = () => {
    if (!formData.nombre || !formData.codigo) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const data: CrearAreaData = {
      codigo: formData.codigo.toUpperCase(),
      nombre: formData.nombre,
      responsable_id: formData.responsable_id ? parseInt(formData.responsable_id) : undefined,
    };

    if (editingArea) {
      actualizarMutation.mutate({ id: editingArea.id, data });
    } else {
      crearMutation.mutate(data);
    }
  };

  const handleEditarArea = (area: Area) => {
    setEditingArea(area);
    setFormData({
      nombre: area.nombre,
      codigo: area.codigo,
      responsable_id: area.responsable?.id?.toString() || "",
    });
    setOpenDialog(true);
  };

  const handleEliminarArea = (area: Area) => {
    if (confirm(`¿Estás seguro de desactivar el área "${area.nombre}"?`)) {
      eliminarMutation.mutate(area.id);
    }
  };

  const handleOpenDialog = (open: boolean) => {
    setOpenDialog(open);
    if (!open) {
      setFormData({ nombre: "", codigo: "", responsable_id: "" });
      setEditingArea(null);
    }
  };

  const filteredAreas = areas.filter(
    (area) =>
      area.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (area.responsable?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Áreas y Servicios
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las áreas y servicios del hospital
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={handleOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Área
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingArea ? "Editar Área" : "Crear Nueva Área"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del área *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Urgencias"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  placeholder="Ej: URG"
                  value={formData.codigo}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo: e.target.value.toUpperCase() })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsable">Responsable</Label>
                <Select
                  value={formData.responsable_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, responsable_id: value })
                  }
                >
                  <SelectTrigger id="responsable">
                    <SelectValue placeholder="Selecciona un responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin responsable</SelectItem>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id.toString()}>
                        {usuario.nombre}
                      </SelectItem>
                    ))}
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
                onClick={handleCrearArea}
                disabled={crearMutation.isPending || actualizarMutation.isPending}
              >
                {crearMutation.isPending || actualizarMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingArea ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  editingArea ? "Actualizar" : "Crear Área"
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
                placeholder="Buscar área..."
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
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Servicios</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAreas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay áreas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAreas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {area.codigo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{area.nombre}</TableCell>
                      <TableCell>
                        {area.responsable?.nombre || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{area.servicios || 0} servicios</Badge>
                      </TableCell>
                      <TableCell>
                        {area.activo ? (
                          <Badge className="bg-success text-success-foreground">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditarArea(area)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEliminarArea(area)}
                            disabled={eliminarMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
