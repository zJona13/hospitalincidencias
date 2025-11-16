import { Clock, User, MessageSquare, FileText, CheckCircle, AlertCircle, PlayCircle, PauseCircle } from "lucide-react";

interface TimelineEvent {
  tipo: "creacion" | "asignacion" | "estado" | "comentario" | "adjunto";
  fecha: string;
  usuario: string;
  detalle: string;
  estadoPrevio?: string;
  estadoNuevo?: string;
}

interface TimelineProps {
  eventos: TimelineEvent[];
}

const getEventIcon = (tipo: string) => {
  switch (tipo) {
    case "creacion":
      return <AlertCircle className="h-4 w-4" />;
    case "asignacion":
      return <User className="h-4 w-4" />;
    case "estado":
      return <PlayCircle className="h-4 w-4" />;
    case "comentario":
      return <MessageSquare className="h-4 w-4" />;
    case "adjunto":
      return <FileText className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getEventColor = (tipo: string) => {
  switch (tipo) {
    case "creacion":
      return "text-primary";
    case "asignacion":
      return "text-blue-500";
    case "estado":
      return "text-green-500";
    case "comentario":
      return "text-purple-500";
    case "adjunto":
      return "text-orange-500";
    default:
      return "text-muted-foreground";
  }
};

export const Timeline = ({ eventos }: TimelineProps) => {
  return (
    <div className="space-y-4">
      {eventos.map((evento, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`rounded-full p-2 bg-background border-2 ${getEventColor(evento.tipo)}`}>
              {getEventIcon(evento.tipo)}
            </div>
            {index < eventos.length - 1 && (
              <div className="w-0.5 h-full min-h-[40px] bg-border mt-2" />
            )}
          </div>
          
          <div className="flex-1 pb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-foreground text-sm">{evento.usuario}</span>
              <span className="text-xs text-muted-foreground">{evento.fecha}</span>
            </div>
            <p className="text-sm text-muted-foreground">{evento.detalle}</p>
            {evento.estadoPrevio && evento.estadoNuevo && (
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">{evento.estadoPrevio}</span>
                {" → "}
                <span className="font-medium">{evento.estadoNuevo}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
