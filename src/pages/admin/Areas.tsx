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
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Area {
  id: string;
  nombre: string;
  codigo: string;
  responsable: string;
  servicios: number;
}

export default function Areas() {
  const [areas] = useState<Area[]>([
    {
      id: "1",
      nombre: "Urgencias",
      codigo: "URG",
      responsable: "Dr. Juan Pérez",
      servicios: 5,
    },
    {
      id: "2",
      nombre: "Unidad de Cuidados Intensivos",
      codigo: "UCI",
      responsable: "Dra. María García",
      servicios: 3,
    },
    {
      id: "3",
      nombre: "Laboratorio",
      codigo: "LAB",
      responsable: "Lic. Carlos López",
      servicios: 8,
    },
    {
      id: "4",
      nombre: "Radiología",
      codigo: "RAD",
      responsable: "Dr. Ana Martínez",
      servicios: 4,
    },
    {
      id: "5",
      nombre: "Tecnología de la Información",
      codigo: "TI",
      responsable: "Ing. Roberto Sánchez",
      servicios: 6,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    responsable: "",
  });

  const handleCrearArea = () => {
    if (!formData.nombre || !formData.codigo || !formData.responsable) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    toast.success("Área creada exitosamente");
    setOpenDialog(false);
    setFormData({ nombre: "", codigo: "", responsable: "" });
  };

  const handleEliminarArea = (area: Area) => {
    toast.success(`Área "${area.nombre}" eliminada exitosamente`);
  };

  const filteredAreas = areas.filter(
    (area) =>
      area.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.responsable.toLowerCase().includes(searchTerm.toLowerCase())
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

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Área
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Área</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del área</Label>
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
                <Label htmlFor="codigo">Código</Label>
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
                <Input
                  id="responsable"
                  placeholder="Nombre del responsable"
                  value={formData.responsable}
                  onChange={(e) =>
                    setFormData({ ...formData, responsable: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCrearArea}>Crear Área</Button>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {area.codigo}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{area.nombre}</TableCell>
                  <TableCell>{area.responsable}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{area.servicios} servicios</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEliminarArea(area)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
