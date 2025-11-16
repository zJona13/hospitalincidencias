import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Shield, Bell, Lock } from "lucide-react";
import { toast } from "sonner";

export default function Perfil() {
  const [userData] = useState({
    nombre: "Dr. Juan Pérez",
    email: "juan.perez@hospital.com",
    area: "Urgencias",
    rol: "Médico",
  });

  const [notificaciones, setNotificaciones] = useState({
    email: true,
    sistema: true,
    asignaciones: true,
    comentarios: true,
    cambiosEstado: false,
  });

  const [passwordData, setPasswordData] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });

  const handleSaveNotificaciones = () => {
    toast.success("Preferencias de notificaciones actualizadas");
  };

  const handleChangePassword = () => {
    if (!passwordData.actual || !passwordData.nueva || !passwordData.confirmar) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    if (passwordData.nueva !== passwordData.confirmar) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (passwordData.nueva.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    toast.success("Contraseña actualizada exitosamente");
    setPasswordData({ actual: "", nueva: "", confirmar: "" });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Información del Usuario */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{userData.nombre}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{userData.email}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{userData.area}</Badge>
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  {userData.rol}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" defaultValue={userData.nombre} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email institucional</Label>
              <Input id="email" type="email" defaultValue={userData.email} disabled />
              <p className="text-xs text-muted-foreground">
                El email no puede ser modificado. Contacta a TI si necesitas cambiarlo.
              </p>
            </div>
          </div>

          <Button>Guardar cambios</Button>
        </CardContent>
      </Card>

      {/* Cambiar Contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="actual">Contraseña actual</Label>
            <Input
              id="actual"
              type="password"
              value={passwordData.actual}
              onChange={(e) =>
                setPasswordData({ ...passwordData, actual: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nueva">Nueva contraseña</Label>
            <Input
              id="nueva"
              type="password"
              value={passwordData.nueva}
              onChange={(e) =>
                setPasswordData({ ...passwordData, nueva: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmar">Confirmar nueva contraseña</Label>
            <Input
              id="confirmar"
              type="password"
              value={passwordData.confirmar}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmar: e.target.value })
              }
            />
          </div>

          <Button onClick={handleChangePassword}>Cambiar Contraseña</Button>
        </CardContent>
      </Card>

      {/* Preferencias de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferencias de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notif">Notificaciones por email</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones en tu correo electrónico
                </p>
              </div>
              <Switch
                id="email-notif"
                checked={notificaciones.email}
                onCheckedChange={(checked) =>
                  setNotificaciones({ ...notificaciones, email: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sistema-notif">Notificaciones del sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Muestra notificaciones en la aplicación
                </p>
              </div>
              <Switch
                id="sistema-notif"
                checked={notificaciones.sistema}
                onCheckedChange={(checked) =>
                  setNotificaciones({ ...notificaciones, sistema: checked })
                }
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Tipos de notificaciones</h4>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="asignaciones">Nuevas asignaciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Cuando se te asigna una nueva incidencia
                  </p>
                </div>
                <Switch
                  id="asignaciones"
                  checked={notificaciones.asignaciones}
                  onCheckedChange={(checked) =>
                    setNotificaciones({ ...notificaciones, asignaciones: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="comentarios">Nuevos comentarios</Label>
                  <p className="text-sm text-muted-foreground">
                    Comentarios en incidencias que sigues
                  </p>
                </div>
                <Switch
                  id="comentarios"
                  checked={notificaciones.comentarios}
                  onCheckedChange={(checked) =>
                    setNotificaciones({ ...notificaciones, comentarios: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cambios">Cambios de estado</Label>
                  <p className="text-sm text-muted-foreground">
                    Cambios en el estado de tus incidencias
                  </p>
                </div>
                <Switch
                  id="cambios"
                  checked={notificaciones.cambiosEstado}
                  onCheckedChange={(checked) =>
                    setNotificaciones({ ...notificaciones, cambiosEstado: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveNotificaciones}>
            Guardar preferencias
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
