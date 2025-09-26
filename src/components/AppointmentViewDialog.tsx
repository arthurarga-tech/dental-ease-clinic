import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, FileText } from "lucide-react";
import { Appointment } from "@/hooks/useAppointments";

interface AppointmentViewDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AppointmentViewDialog = ({ appointment, open, onOpenChange }: AppointmentViewDialogProps) => {
  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmado":
        return "bg-success text-success-foreground";
      case "Em andamento":
        return "bg-warning text-warning-foreground";
      case "Concluído":
        return "bg-primary text-primary-foreground";
      case "Cancelado":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Consulta</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{appointment.patients.name}</h3>
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">{appointment.appointment_time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Consulta</p>
                  <p className="font-medium">{appointment.type}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{appointment.patients.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Duração</p>
                  <p className="font-medium">{appointment.duration} minutos</p>
                </div>
              </div>

              {appointment.patients.email && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{appointment.patients.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {appointment.notes && (
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Observações</p>
                <p className="font-medium whitespace-pre-wrap">{appointment.notes}</p>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p>Criado em: {new Date(appointment.created_at).toLocaleString('pt-BR')}</p>
            <p>Atualizado em: {new Date(appointment.updated_at).toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};