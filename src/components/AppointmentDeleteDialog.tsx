import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Appointment } from "@/hooks/useAppointments";

interface AppointmentDeleteDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const AppointmentDeleteDialog = ({
  appointment,
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: AppointmentDeleteDialogProps) => {
  if (!appointment) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Tem certeza que deseja excluir esta consulta?</p>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p><strong>Paciente:</strong> {appointment.patients.name}</p>
              <p><strong>Data:</strong> {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> {appointment.appointment_time}</p>
              <p><strong>Tipo:</strong> {appointment.type}</p>
            </div>
            <p className="text-destructive font-medium">Esta ação não pode ser desfeita.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Excluir Consulta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};