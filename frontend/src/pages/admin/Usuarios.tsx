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
import { UserPlus, Search, Edit, Power, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, Usuario, CrearUsuarioData } from "@/services/admin.service";
import { catalogosService } from "@/services/catalogos.service";

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    area_id: "",
    rol: "",
  });
  const queryClient = useQueryClient();

  // Cargar usuarios
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['admin-usuarios', searchTerm],
    queryFn: () => adminService.usuarios.listar(searchTerm || undefined),
  });

  // Cargar áreas para select
  const { data: areas = [] } = useQuery({
    queryKey: ['catalogos-areas'],
    queryFn: () => catalogosService.getAreas(),
  });

  // Mutación para crear usuario
  const crearMutation = useMutation({
    mutationFn: (data: CrearUsuarioData) => adminService.usuarios.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      toast.success("Usuario creado exitosamente");
      setOpenDialog(false);
      setFormData({ nombre: "", email: "", password: "", area_id: "", rol: "" });
      setEditingUsuario(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al crear usuario");
    },
  });

  // Mutación para actualizar usuario
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CrearUsuarioData> }) =>
      adminService.usuarios.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      toast.success("Usuario actualizado exitosamente");
      setOpenDialog(false);
      setFormData({ nombre: "", email: "", password: "", area_id: "", rol: "" });
      setEditingUsuario(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar usuario");
    },
  });

  // Mutación para cambiar estado
  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      adminService.usuarios.actualizar(id, { activo: !activo } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      toast.success("Estado del usuario actualizado");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar estado");
    },
  });

  // Mutación para eliminar usuario
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => adminService.usuarios.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      toast.success("Usuario desactivado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar usuario");
    },
  });

  const handleCrearUsuario = () => {
    if (!formData.nombre || !formData.email || !formData.rol) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (!editingUsuario && !formData.password) {
      toast.error("La contraseña es requerida para nuevos usuarios");
      return;
    }

    const data: CrearUsuarioData = {
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password,
      rol: formData.rol,
      area_id: formData.area_id ? parseInt(formData.area_id) : undefined,
    };

    if (editingUsuario) {
      const updateData: any = {
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        area_id: data.area_id,
      };
      if (formData.password) {
        // Cambiar contraseña por separado si se proporciona
        adminService.usuarios.cambiarPassword(editingUsuario.id, formData.password);
      }
      actualizarMutation.mutate({ id: editingUsuario.id, data: updateData });
    } else {
      crearMutation.mutate(data);
    }
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: "",
      area_id: usuario.area?.id?.toString() || "",
      rol: usuario.rol,
    });
    setOpenDialog(true);
  };

  const handleToggleEstado = (usuario: Usuario) => {
    toggleEstadoMutation.mutate({ id: usuario.id, activo: usuario.activo });
  };

  const handleOpenDialog = (open: boolean) => {
    setOpenDialog(open);
    if (!open) {
      setFormData({ nombre: "", email: "", password: "", area_id: "", rol: "" });
      setEditingUsuario(null);
    }
  };

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.area?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roles = [
    { value: "administrador", label: "Administrador" },
    { value: "medico", label: "Médico" },
    { value: "enfermero", label: "Enfermero" },
    { value: "tecnico", label: "Técnico" },
    { value: "usuario", label: "Usuario" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={handleOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingUsuario ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Dr. Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email institucional *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@hospital.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingUsuario ? "Nueva contraseña (opcional)" : "Contraseña *"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={editingUsuario ? "Dejar vacío para mantener" : "Contraseña"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área</Label>
                <Select
                  value={formData.area_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, area_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin área</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id.toString()}>
                        {area.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol *</Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value) =>
                    setFormData({ ...formData, rol: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((rol) => (
                      <SelectItem key={rol.value} value={rol.value}>
                        {rol.label}
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
                onClick={handleCrearUsuario}
                disabled={crearMutation.isPending || actualizarMutation.isPending}
              >
                {crearMutation.isPending || actualizarMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingUsuario ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  editingUsuario ? "Actualizar" : "Crear Usuario"
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
                placeholder="Buscar por nombre, email o área..."
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nombre}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.area?.nombre || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{usuario.rol}</Badge>
                      </TableCell>
                      <TableCell>
                        {usuario.activo ? (
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
                            onClick={() => handleEditarUsuario(usuario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleEstado(usuario)}
                            disabled={toggleEstadoMutation.isPending}
                          >
                            <Power className="h-4 w-4" />
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
