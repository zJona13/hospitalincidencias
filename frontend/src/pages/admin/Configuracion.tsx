import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bell, 
  Clock, 
  Database, 
  Shield, 
  Save,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function Configuracion() {
  const [configuracion, setConfiguracion] = useState({
    notificaciones: {
      email: true,
      push: false,
      asignaciones: true,
      comentarios: true,
      cambios_estado: true,
    },
    sistema: {
      nombre_hospital: "Hospital General",
      email_contacto: "contacto@hospital.com",
      telefono: "+51 123 456 789",
      direccion: "Av. Principal 123",
    },
    sla: {
      recordatorios_automaticos: true,
      dias_antes_vencimiento: 1,
      notificar_fuera_sla: true,
    },
    seguridad: {
      sesion_timeout_minutos: 30,
      requerir_cambio_password: false,
      dias_cambio_password: 90,
    },
  });

  const handleSave = () => {
    // TODO: Implementar guardado en backend
    toast.success("Configuración guardada exitosamente");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona la configuración general del sistema de incidencias
        </p>
      </div>

      <Tabs defaultValue="sistema" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sistema">
            <Settings className="mr-2 h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="notificaciones">
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="sla">
            <Clock className="mr-2 h-4 w-4" />
            SLA y Tiempos
          </TabsTrigger>
          <TabsTrigger value="seguridad">
            <Shield className="mr-2 h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sistema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Hospital</CardTitle>
              <CardDescription>
                Configura los datos básicos de identificación del hospital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_hospital">Nombre del Hospital</Label>
                <Input
                  id="nombre_hospital"
                  value={configuracion.sistema.nombre_hospital}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      sistema: {
                        ...configuracion.sistema,
                        nombre_hospital: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_contacto">Email de Contacto</Label>
                <Input
                  id="email_contacto"
                  type="email"
                  value={configuracion.sistema.email_contacto}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      sistema: {
                        ...configuracion.sistema,
                        email_contacto: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={configuracion.sistema.telefono}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      sistema: {
                        ...configuracion.sistema,
                        telefono: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={configuracion.sistema.direccion}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      sistema: {
                        ...configuracion.sistema,
                        direccion: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Base de Datos</CardTitle>
              <CardDescription>
                Información sobre la base de datos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Estado de la Base de Datos</p>
                  <p className="text-sm text-muted-foreground">
                    Conexión activa y funcionando correctamente
                  </p>
                </div>
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Conectado
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Última Respaldo</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('es-PE', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Database className="mr-2 h-4 w-4" />
                  Crear Respaldo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Gestiona cómo y cuándo se envían las notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notif-email">Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones por correo electrónico
                    </p>
                  </div>
                  <Switch
                    id="notif-email"
                    checked={configuracion.notificaciones.email}
                    onCheckedChange={(checked) =>
                      setConfiguracion({
                        ...configuracion,
                        notificaciones: {
                          ...configuracion.notificaciones,
                          email: checked,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notif-push">Notificaciones Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones en tiempo real en el navegador
                    </p>
                  </div>
                  <Switch
                    id="notif-push"
                    checked={configuracion.notificaciones.push}
                    onCheckedChange={(checked) =>
                      setConfiguracion({
                        ...configuracion,
                        notificaciones: {
                          ...configuracion.notificaciones,
                          push: checked,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="font-medium">Tipos de Notificaciones</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-asignaciones">Asignaciones de Incidencias</Label>
                      <Switch
                        id="notif-asignaciones"
                        checked={configuracion.notificaciones.asignaciones}
                        onCheckedChange={(checked) =>
                          setConfiguracion({
                            ...configuracion,
                            notificaciones: {
                              ...configuracion.notificaciones,
                              asignaciones: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-comentarios">Nuevos Comentarios</Label>
                      <Switch
                        id="notif-comentarios"
                        checked={configuracion.notificaciones.comentarios}
                        onCheckedChange={(checked) =>
                          setConfiguracion({
                            ...configuracion,
                            notificaciones: {
                              ...configuracion.notificaciones,
                              comentarios: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-cambios">Cambios de Estado</Label>
                      <Switch
                        id="notif-cambios"
                        checked={configuracion.notificaciones.cambios_estado}
                        onCheckedChange={(checked) =>
                          setConfiguracion({
                            ...configuracion,
                            notificaciones: {
                              ...configuracion.notificaciones,
                              cambios_estado: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de SLA</CardTitle>
              <CardDescription>
                Gestiona los tiempos y recordatorios relacionados con los SLA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sla-recordatorios">Recordatorios Automáticos</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar recordatorios automáticos antes del vencimiento del SLA
                  </p>
                </div>
                <Switch
                  id="sla-recordatorios"
                  checked={configuracion.sla.recordatorios_automaticos}
                  onCheckedChange={(checked) =>
                    setConfiguracion({
                      ...configuracion,
                      sla: {
                        ...configuracion.sla,
                        recordatorios_automaticos: checked,
                      },
                    })
                  }
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="dias-antes">Días Antes del Vencimiento</Label>
                <Input
                  id="dias-antes"
                  type="number"
                  min="0"
                  max="7"
                  value={configuracion.sla.dias_antes_vencimiento}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      sla: {
                        ...configuracion.sla,
                        dias_antes_vencimiento: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Número de días antes del vencimiento para enviar recordatorios
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sla-notificar">Notificar Fuera de SLA</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar notificaciones cuando una incidencia exceda el tiempo del SLA
                  </p>
                </div>
                <Switch
                  id="sla-notificar"
                  checked={configuracion.sla.notificar_fuera_sla}
                  onCheckedChange={(checked) =>
                    setConfiguracion({
                      ...configuracion,
                      sla: {
                        ...configuracion.sla,
                        notificar_fuera_sla: checked,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>
                Gestiona las políticas de seguridad y sesiones de usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sesion-timeout">Timeout de Sesión (minutos)</Label>
                <Input
                  id="sesion-timeout"
                  type="number"
                  min="5"
                  max="480"
                  value={configuracion.seguridad.sesion_timeout_minutos}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      seguridad: {
                        ...configuracion.seguridad,
                        sesion_timeout_minutos: parseInt(e.target.value) || 30,
                      },
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Tiempo de inactividad antes de cerrar la sesión automáticamente
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requerir-cambio">Requerir Cambio de Contraseña</Label>
                  <p className="text-sm text-muted-foreground">
                    Forzar a los usuarios a cambiar su contraseña periódicamente
                  </p>
                </div>
                <Switch
                  id="requerir-cambio"
                  checked={configuracion.seguridad.requerir_cambio_password}
                  onCheckedChange={(checked) =>
                    setConfiguracion({
                      ...configuracion,
                      seguridad: {
                        ...configuracion.seguridad,
                        requerir_cambio_password: checked,
                      },
                    })
                  }
                />
              </div>
              {configuracion.seguridad.requerir_cambio_password && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="dias-cambio">Días para Cambio de Contraseña</Label>
                    <Input
                      id="dias-cambio"
                      type="number"
                      min="30"
                      max="365"
                      value={configuracion.seguridad.dias_cambio_password}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          seguridad: {
                            ...configuracion.seguridad,
                            dias_cambio_password: parseInt(e.target.value) || 90,
                          },
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Número de días después de los cuales se requiere cambiar la contraseña
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}

