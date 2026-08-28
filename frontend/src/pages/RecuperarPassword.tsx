import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  CircleAlert,
  Clock,
  Hospital,
  KeyRound,
  LoaderCircle,
  Mail,
  MailCheck,
} from "lucide-react";
import { authService } from "@/services/auth.service";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEGUNDOS_REENVIO = 60;

// carlos.martinez@hospital.com -> c*************z@hospital.com
const enmascararEmail = (email: string) => {
  const [usuario, dominio] = email.split("@");
  if (!dominio) return email;
  if (usuario.length <= 2) return `${usuario[0]}*@${dominio}`;
  return `${usuario[0]}${"*".repeat(usuario.length - 2)}${usuario.slice(-1)}@${dominio}`;
};

const pasos = [
  "Abre el correo del Sistema de Incidencias y pulsa el botón del enlace.",
  "Define tu nueva contraseña. El enlace vence a los 30 minutos.",
  "Vuelve a ingresar con tu correo y la contraseña nueva.",
];

const RecuperarPassword = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (segundos <= 0) return;
    const id = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [segundos]);

  const solicitar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Ingresa un correo válido, por ejemplo nombre@hospital.com");
      return;
    }

    setIsLoading(true);
    try {
      await authService.solicitarRecuperacion(email.trim());
      setEnviado(true);
      setSegundos(SEGUNDOS_REENVIO);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "No pudimos procesar la solicitud. Inténtalo nuevamente en unos minutos.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const reloj = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary/5 via-background to-accent/40 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 bg-primary rounded-[10px] flex items-center justify-center">
          <Hospital className="h-5 w-5 text-primary-foreground" />
        </div>
        <p className="text-[15px] font-semibold text-foreground">
          Hospital Luis Heysen Incháustegui
        </p>
      </div>

      <Card className="w-full max-w-[480px] p-8 shadow-xl border-border/60 space-y-6">
        {!enviado ? (
          <>
            <div className="space-y-3.5">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-foreground">Recuperar contraseña</h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Ingresa tu correo institucional y te enviaremos un enlace para crear una
                  contraseña nueva.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-destructive/35 bg-destructive/5 p-4"
              >
                <CircleAlert className="h-[18px] w-[18px] shrink-0 mt-0.5 text-destructive" />
                <p className="text-[13px] leading-5 text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={solicitar} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={emailRef}
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="nombre.apellido@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`h-11 pl-10 ${error ? "border-destructive" : ""}`}
                    aria-invalid={!!error}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  "Enviar enlace de recuperación"
                )}
              </Button>

              <div className="flex items-start gap-2.5 rounded-[10px] bg-muted p-3">
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <p className="text-[13px] leading-5 text-muted-foreground">
                  El enlace vence a los 30 minutos y solo puede usarse una vez. Si no lo recibes,
                  revisa la carpeta de correo no deseado.
                </p>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="space-y-3.5">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <MailCheck className="h-6 w-6 text-success" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-foreground">Revisa tu correo</h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Si{" "}
                  <span className="font-medium text-foreground">
                    {enmascararEmail(email.trim())}
                  </span>{" "}
                  corresponde a una cuenta activa, enviamos un enlace para restablecer la
                  contraseña.
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-[10px] bg-muted p-4">
              <p className="text-[13px] font-semibold text-foreground">Qué sigue</p>
              {pasos.map((paso, i) => (
                <div key={paso} className="flex items-start gap-2.5">
                  <span className="h-5 w-5 shrink-0 rounded-full bg-card border border-border flex items-center justify-center text-[11px] font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <p className="text-[13px] leading-5 text-foreground/80">{paso}</p>
                </div>
              ))}
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-destructive/35 bg-destructive/5 p-4"
              >
                <CircleAlert className="h-[18px] w-[18px] shrink-0 mt-0.5 text-destructive" />
                <p className="text-[13px] leading-5 text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2.5">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                disabled={segundos > 0 || isLoading}
                onClick={() => solicitar()}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Enviando…
                  </>
                ) : segundos > 0 ? (
                  `Reenviar enlace en ${reloj}`
                ) : (
                  "Reenviar enlace"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Solo puedes solicitar un enlace cada minuto.
              </p>
            </div>
          </>
        )}

        <div className="pt-5 border-t border-border space-y-3">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a iniciar sesión
          </Link>
          <p className="text-[13px] text-center text-muted-foreground">
            ¿No tienes acceso a tu correo? Escribe a{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Soporte TI
            </a>{" "}
            · anexo [ANEXO]
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RecuperarPassword;
