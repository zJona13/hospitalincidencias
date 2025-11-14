import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, Filter, Eye } from "lucide-react";

const Incidencias = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const incidencias = [
    {
      codigo: "INC-2024-015",
      titulo: "Fallo en sistema de rayos X",
      descripcion: "El sistema de rayos X no se enciende correctamente",
      area: "Radiología",
      tipo: "TI",
      prioridad: "alta",
      estado: "en_progreso",
      responsable: "Dr. García",
      reportadoPor: "Dra. Martínez",
      fecha: "2024-11-14 08:30",
    },
    {
      codigo: "INC-2024-014",
      titulo: "Aire acondicionado no funciona",
      descripcion: "Sistema de climatización fuera de servicio",
      area: "Urgencias",
      tipo: "Infraestructura",
      prioridad: "media",
      estado: "abierta",
      responsable: "Mantenimiento",
      reportadoPor: "Enf. López",
      fecha: "2024-11-14 07:15",
    },
    {
      codigo: "INC-2024-013",
      titulo: "Red lenta en consultorios",
      descripcion: "Velocidad de internet muy reducida",
      area: "Consultorios",
      tipo: "TI",
      prioridad: "media",
      estado: "en_progreso",
      responsable: "Ing. Martínez",
      reportadoPor: "Dr. Pérez",
      fecha: "2024-11-13 16:45",
    },
    {
      codigo: "INC-2024-012",
      titulo: "Falta de insumos médicos",
      descripcion: "Stock bajo de material quirúrgico",
      area: "Farmacia",
      tipo: "Clínica",
      prioridad: "alta",
      estado: "abierta",
      responsable: "Lic. López",
      reportadoPor: "Dr. Ramírez",
      fecha: "2024-11-13 14:20",
    },
    {
      codigo: "INC-2024-011",
      titulo: "Cerradura de puerta rota",
      descripcion: "Puerta de consultorio 3 no cierra bien",
      area: "Consultorios",
      tipo: "Infraestructura",
      prioridad: "baja",
      estado: "resuelta",
      responsable: "Mantenimiento",
      reportadoPor: "Recepción",
      fecha: "2024-11-13 11:00",
    },
  ];

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Todas las incidencias</h1>
          <p className="text-muted-foreground mt-1">Gestión y seguimiento completo</p>
        </div>
        <Button onClick={() => navigate("/incidencias/crear")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva incidencia
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código o título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select defaultValue="todas">
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las áreas</SelectItem>
              <SelectItem value="urgencias">Urgencias</SelectItem>
              <SelectItem value="consultorios">Consultorios</SelectItem>
              <SelectItem value="radiologia">Radiología</SelectItem>
              <SelectItem value="laboratorio">Laboratorio</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="todos">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="abierta">Abierta</SelectItem>
              <SelectItem value="en_progreso">En progreso</SelectItem>
              <SelectItem value="resuelta">Resuelta</SelectItem>
              <SelectItem value="cerrada">Cerrada</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="todas">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las prioridades</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de incidencias */}
      <div className="space-y-4">
        {incidencias.map((inc) => {
          const statusBadge = getStatusBadge(inc.estado);
          return (
            <Card key={inc.codigo} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/incidencias/${inc.codigo}`)}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{inc.titulo}</h3>
                        <Badge className={getPriorityBadge(inc.prioridad)}>
                          {inc.prioridad.charAt(0).toUpperCase() + inc.prioridad.slice(1)}
                        </Badge>
                        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                      </div>
                      <p className="text-sm font-mono text-muted-foreground">{inc.codigo}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{inc.descripcion}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Área:</span>{" "}
                      <span className="font-medium text-foreground">{inc.area}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>{" "}
                      <span className="font-medium text-foreground">{inc.tipo}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Responsable:</span>{" "}
                      <span className="font-medium text-foreground">{inc.responsable}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reportado por:</span>{" "}
                      <span className="font-medium text-foreground">{inc.reportadoPor}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha:</span>{" "}
                      <span className="font-medium text-foreground">{inc.fecha}</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/incidencias/${inc.codigo}`);
                }}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Incidencias;
