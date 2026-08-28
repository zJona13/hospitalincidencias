import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Check,
  Circle,
  CircleAlert,
  Eye,
  EyeOff,
  Hospital,
  LoaderCircle,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth.service";

// Mismas reglas que valida el backend en validarPassword()
const reglas = [
  { texto: "Al menos 8 caracteres", cumple: (p: string) => p.length >= 8 },
  { texto: "Una mayúscula y una minúscula", cumple: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { texto: "Al menos un número", cumple: (p: string) => /[0-9]/.test(p) },
];

const calcularFuerza = (p: string) => {
  let n = 0;
  if (p.length >= 8) n++;
  if (p.length >= 12) n++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p)) n++;
  if (/[^A-Za-z0-9]/.test(p)) n++;
  return n;
};

const etiquetasFuerza = ["", "Débil", "Aceptable", "Segura", "Muy segura"];

const RestablecerPassword = () => {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [estado, setEstado] = useState<"verificando" | "valido" | "invalido">("verificando");
  const [correo, setCorreo] = useState("");
  const [errorToken, setErrorToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    authService
      .verificarTokenRecuperacion(token)
      .then((data) => {
        if (!activo) return;
        setCorreo(data.email);
        setEstado("valido");
      })
      .catch((err: any) => {
        if (!activo) return;
        setErrorToken(
          err?.response?.data?.message ||
            "El enlace no es válido o ya venció. Solicita uno nuevo.",
        );
        setEstado("invalido");
      });
    return () => {
      activo = false;
    };
  }, [token]);

  const reglasOk = reglas.every((r) => r.cumple(password));
  const coinciden = password.length > 0 && password === confirmacion;
  const fuerza = calcularFuerza(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reglasOk) {
      setError("La contraseña no cumple los requisitos indicados.");
      return;
    }
    if (!coinciden) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.restablecerPassword(token, password);
      toast({
        title: "Contraseña actualizada",
        description: "Ya puedes iniciar sesión con tu nueva contraseña.",
      });
      navigate("/login");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "No pudimos actualizar la contraseña. Solicita un enlace nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        {estado === "verificando" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verificando el enlace…</p>
          </div>
        )}

        {estado === "invalido" && (
          <>
            <div className="space-y-3.5">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <CircleAlert className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-foreground">Enlace no válido</h1>
                <p className="text-sm leading-relaxed text-muted-foreground">{errorToken}</p>
              </div>
            </div>
            <Button asChild className="w-full h-11">
              <Link to="/recuperar">Solicitar un enlace nuevo</Link>
            </Button>
          </>
        )}

        {estado === "valido" && (
          <>
            <div className="space-y-3.5">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-foreground">
                  Define tu nueva contraseña
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Para la cuenta <span className="font-medium text-foreground">{correo}</span>.
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

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={verPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {verPassword ? (
                      <EyeOff className="h-[17px] w-[17px]" />
                    ) : (
                      <Eye className="h-[17px] w-[17px]" />
                    )}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <div className="grid grid-cols-4 gap-1 grow">
                      {[1, 2, 3, 4].map((n) => (
                        <span
                          key={n}
                          className={`h-1 rounded-full ${
                            n <= fuerza
                              ? fuerza <= 1
                                ? "bg-destructive"
                                : fuerza === 2
                                  ? "bg-warning"
                                  : "bg-success"
                              : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-20 text-right">
                      {etiquetasFuerza[fuerza]}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmacion">Repetir contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="confirmacion"
                    type={verPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmacion}
                    onChange={(e) => setConfirmacion(e.target.value)}
                    className={`h-11 pl-10 pr-11 ${
                      confirmacion.length > 0 && !coinciden ? "border-destructive" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {coinciden && (
                    <Check
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-success"
                      strokeWidth={2.5}
                    />
                  )}
                </div>
                {confirmacion.length > 0 && !coinciden && (
                  <p className="text-[13px] text-destructive">Las contraseñas no coinciden</p>
                )}
              </div>

              <div className="space-y-1.5 rounded-[10px] bg-muted px-4 py-3.5">
                <p className="text-[13px] font-semibold text-foreground pb-0.5">
                  La contraseña debe tener
                </p>
                {reglas.map((regla) => {
                  const ok = regla.cumple(password);
                  return (
                    <div
                      key={regla.texto}
                      className={`flex items-center gap-2 text-[13px] ${
                        ok ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      {ok ? (
                        <Check className="h-[15px] w-[15px] shrink-0" strokeWidth={2.5} />
                      ) : (
                        <Circle className="h-[15px] w-[15px] shrink-0" />
                      )}
                      {regla.texto}
                    </div>
                  );
                })}
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading || !reglasOk || !coinciden}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Guardando…
                  </>
                ) : (
                  "Guardar contraseña"
                )}
              </Button>
            </form>
          </>
        )}

        {estado !== "verificando" && (
          <div className="pt-5 border-t border-border">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a iniciar sesión
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RestablecerPassword;
