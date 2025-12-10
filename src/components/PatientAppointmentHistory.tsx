import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, RefreshCw } from "lucide-react";

interface PatientAppointmentHistoryProps {
  patientId: string;
}

export const PatientAppointmentHistory = ({ patientId }: PatientAppointmentHistoryProps) => {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["patient-appointment-history", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          type,
          dentists:dentist_id (name)
        `)
        .eq("patient_id", patientId)
        .in("status", ["Faltou", "Remarcado"])
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const formatLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('pt-BR');
  };

  const faltasCount = appointments.filter(a => a.status === "Faltou").length;
  const remarcacoesCount = appointments.filter(a => a.status === "Remarcado").length;

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Carregando histórico...
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Nenhuma falta ou remarcação registrada
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium">{faltasCount} falta(s)</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium">{remarcacoesCount} remarcação(ões)</span>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {appointments.map((appointment) => (
          <div 
            key={appointment.id} 
            className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg text-sm"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span>{formatLocalDate(appointment.appointment_date)}</span>
              <span className="text-muted-foreground">{appointment.appointment_time.slice(0, 5)}</span>
              <span className="text-muted-foreground">- {appointment.type}</span>
            </div>
            <div className="flex items-center gap-2">
              {appointment.dentists?.name && (
                <span className="text-xs text-muted-foreground">
                  Dr(a). {appointment.dentists.name}
                </span>
              )}
              <Badge 
                className={
                  appointment.status === "Faltou" 
                    ? "bg-destructive text-destructive-foreground" 
                    : "bg-warning text-warning-foreground"
                }
              >
                {appointment.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
