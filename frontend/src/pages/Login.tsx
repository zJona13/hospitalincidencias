import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Check,
  CircleAlert,
  CircleHelp,
  Clock,
  Eye,
  EyeOff,
  Hospital,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const HOSPITAL = "Hospital Luis Heysen Incháustegui";
const EMAIL_RECORDADO = "incidencias:ultimo-correo";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const beneficios = [
  "Seguimiento en tiempo real de todas las incidencias",
  "Reportes, analítica y predicción por área",
  "Prioridades y tiempos de respuesta automatizados",
];

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recordar, setRecordar] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mayusculas, setMayusculas] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [errores, setErrores] = useState<{ email?: string; password?: string }>({});

  const sesionExpirada = searchParams.get("expirada") === "1";

  // Precargar el último correo usado en este equipo
  useEffect(() => {
    const guardado = localStorage.getItem(EMAIL_RECORDADO);
    if (guardado) {
      setEmail(guardado);
      setRecordar(true);
    }
    emailRef.current?.focus();
  }, []);

  const validar = () => {
    const nuevos: { email?: string; password?: string } = {};
    if (!email.trim()) {
      nuevos.email = "El correo institucional es obligatorio";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nuevos.email = "Ingresa un correo válido, por ejemplo nombre@hospital.com";
    }
    if (!password) {
      nuevos.password = "La contraseña es obligatoria";
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const detectarMayusculas = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setMayusculas(e.getModifierState?.("CapsLock") ?? false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!validar()) return;

    setIsLoading(true);

    try {
      await login(email.trim(), password);

      if (recordar) {
        localStorage.setItem(EMAIL_RECORDADO, email.trim());
      } else {
        localStorage.removeItem(EMAIL_RECORDADO);
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al Sistema de Gestión de Incidencias",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error en login:", error);
      // Mensaje genérico: no revela si el correo está registrado
      const mensaje =
        error?.response?.data?.message ||
        error?.message ||
        "Correo o contraseña incorrectos. Verifica tus datos e inténtalo nuevamente.";
      setErrorGeneral(mensaje);
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/40 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
        {/* Institucional */}
        <div className="hidden lg:flex flex-col justify-center gap-9">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 bg-primary rounded-xl flex items-center justify-center">
              <Hospital className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                Hospital
              </span>
              <h1 className="text-3xl font-bold leading-9 tracking-tight text-foreground">
                Luis Heysen Incháustegui
              </h1>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">
              Sistema de Gestión de Incidencias
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground max-w-[470px]">
              Registro, seguimiento y resolución de incidencias del personal médico, enfermería,
              administración y TI.
            </p>
          </div>

          <ul className="space-y-3.5">
            {beneficios.map((texto) => (
              <li key={texto} className="flex items-center gap-3">
                <span className="h-7 w-7 shrink-0 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-[15px] w-[15px] text-accent-foreground" strokeWidth={2.5} />
                </span>
                <span className="text-[15px] text-foreground/80">{texto}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-card/70 border border-border">
            <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
            <p className="text-[13px] leading-5 text-muted-foreground">
              Acceso restringido a personal autorizado. Todos los ingresos y acciones quedan
              registrados conforme a la política de seguridad de la información.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <Card className="p-8 shadow-xl border-border/60">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="h-12 w-12 shrink-0 bg-primary rounded-xl flex items-center justify-center">
              <Hospital className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-6 text-foreground">{HOSPITAL}</h1>
              <p className="text-sm text-muted-foreground">Gestión de Incidencias</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-foreground">Iniciar sesión</h2>
              <p className="text-sm text-muted-foreground">
                Ingresa con tu correo institucional para continuar.
              </p>
            </div>

            {sesionExpirada && !errorGeneral && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-primary/30 bg-accent p-4"
              >
                <Clock className="h-[18px] w-[18px] shrink-0 mt-0.5 text-accent-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-accent-foreground">Tu sesión expiró</p>
                  <p className="text-[13px] leading-5 text-accent-foreground/80">
                    Vuelve a ingresar para continuar donde quedaste.
                  </p>
                </div>
              </div>
            )}

            {errorGeneral && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-destructive/35 bg-destructive/5 p-4"
              >
                <CircleAlert className="h-[18px] w-[18px] shrink-0 mt-0.5 text-destructive" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-destructive">No pudimos iniciar sesión</p>
                  <p className="text-[13px] leading-5 text-destructive/85">{errorGeneral}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="nombre.apellido@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => errores.email && validar()}
                    className={`h-11 pl-10 ${errores.email ? "border-destructive" : ""}`}
                    aria-invalid={!!errores.email}
                    aria-describedby={errores.email ? "email-error" : undefined}
                    disabled={isLoading}
                  />
                </div>
                {errores.email && (
                  <p id="email-error" className="text-[13px] text-destructive">
                    {errores.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type={verPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={detectarMayusculas}
                    onBlur={() => {
                      setMayusculas(false);
                      if (errores.password) validar();
                    }}
                    className={`h-11 pl-10 pr-12 ${errores.password ? "border-destructive" : ""}`}
                    aria-invalid={!!errores.password}
                    aria-describedby={errores.password ? "password-error" : undefined}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={isLoading}
                  >
                    {verPassword ? (
                      <EyeOff className="h-[17px] w-[17px]" />
                    ) : (
                      <Eye className="h-[17px] w-[17px]" />
                    )}
                  </button>
                </div>
                {errores.password && (
                  <p id="password-error" className="text-[13px] text-destructive">
                    {errores.password}
                  </p>
                )}
                {mayusculas && (
                  <div className="flex items-center gap-2 rounded-lg border border-warning/45 bg-warning/10 px-3 py-2">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-warning" />
                    <p className="text-[13px] text-foreground/80">Bloq Mayús está activado</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 min-h-6">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="recordar"
                    checked={recordar}
                    onCheckedChange={(v) => setRecordar(v === true)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="recordar" className="font-normal text-foreground/80 cursor-pointer">
                    Recordar mi correo
                  </Label>
                </div>
                <Link
                  to="/recuperar"
                  className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button type="submit" className="w-full h-11 mt-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Verificando credenciales…
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>

            <div className="pt-5 border-t border-border space-y-3">
              <div className="flex items-center justify-center gap-2">
                <CircleHelp className="h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-[13px] text-muted-foreground">
                  ¿Problemas para acceder?{" "}
                  <a href="#" className="font-medium text-primary hover:underline">
                    Soporte TI
                  </a>{" "}
                  · anexo [ANEXO]
                </p>
              </div>
              <p className="text-xs text-center text-muted-foreground/80">
                Oficina de Tecnologías de la Información · v1.0
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
