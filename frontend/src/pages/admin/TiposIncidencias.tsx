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
import { Plus, Search, Edit, AlertCircle, Wrench, Monitor, FileText } from "lucide-react";
import { toast } from "sonner";

interface TipoIncidencia {
  id: string;
  nombre: string;
  categoria: string;
  color: string;
  icono: string;
  subtipos: number;
  activo: boolean;
}

const iconMap = {
  AlertCircle,
  Wrench,
  Monitor,
  FileText,
};

export default function TiposIncidencias() {
  const [tipos] = useState<TipoIncidencia[]>([
    {
      id: "1",
      nombre: "Clínica",
      categoria: "Atención al paciente",
      color: "bg-destructive",
      icono: "AlertCircle",
      subtipos: 8,
      activo: true,
    },
    {
      id: "2",
      nombre: "Infraestructura",
      categoria: "Mantenimiento",
      color: "bg-warning",
      icono: "Wrench",
      subtipos: 12,
      activo: true,
    },
    {
      id: "3",
      nombre: "Tecnología",
      categoria: "TI y Sistemas",
      color: "bg-primary",
      icono: "Monitor",
      subtipos: 15,
      activo: true,
    },
    {
      id: "4",
      nombre: "Administrativa",
      categoria: "Gestión",
      color: "bg-secondary",
      icono: "FileText",
      subtipos: 6,
      activo: true,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    color: "",
    icono: "",
  });

  const handleCrearTipo = () => {
    if (!formData.nombre || !formData.categoria || !formData.color || !formData.icono) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    toast.success("Tipo de incidencia creado exitosamente");
    setOpenDialog(false);
    setFormData({ nombre: "", categoria: "", color: "", icono: "" });
  };

  const handleToggleActivo = (tipo: TipoIncidencia) => {
    toast.success(
      `Tipo "${tipo.nombre}" ${tipo.activo ? "desactivado" : "activado"} exitosamente`
    );
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

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Tipo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del tipo</Label>
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
                <Label htmlFor="categoria">Categoría</Label>
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
                <Label htmlFor="color">Color</Label>
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
                <Label htmlFor="icono">Icono</Label>
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
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCrearTipo}>Crear Tipo</Button>
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
              {filteredTipos.map((tipo) => {
                const IconComponent = iconMap[tipo.icono as keyof typeof iconMap];
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
                      <Badge variant="secondary">{tipo.subtipos} subtipos</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={tipo.activo}
                          onCheckedChange={() => handleToggleActivo(tipo)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {tipo.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
