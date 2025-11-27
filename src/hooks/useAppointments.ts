import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string | null;
  appointment_date: string;
  appointment_time: string;
  type: string;
  duration: number;
  status: "Agendado" | "Confirmado" | "Em andamento" | "Concluído" | "Cancelado";
  notes?: string;
  created_at: string;
  updated_at: string;
  patients: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

export interface NewAppointment {
  patient_id: string;
  dentist_id: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  duration: number;
  notes?: string;
}

export const useAppointments = (selectedDate?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch appointments for a specific date
  const {
    data: appointments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["appointments", selectedDate],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          patients (
            id,
            name,
            phone,
            email
          )
        `)
        .order("appointment_time");

      if (selectedDate) {
        query = query.eq("appointment_date", selectedDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }

      return data as Appointment[];
    },
    enabled: !!selectedDate,
  });

  // Check for appointment conflicts
  const checkConflict = async (
    dentistId: string,
    date: string,
    time: string,
    duration: number,
    excludeAppointmentId?: string
  ) => {
    const { data: existingAppointments } = await supabase
      .from("appointments")
      .select("id, appointment_time, duration")
      .eq("dentist_id", dentistId)
      .eq("appointment_date", date)
      .neq("status", "Cancelado");

    if (!existingAppointments) return false;

    const [hours, minutes] = time.split(":").map(Number);
    const newStartMinutes = hours * 60 + minutes;
    const newEndMinutes = newStartMinutes + duration;

    for (const apt of existingAppointments) {
      if (excludeAppointmentId && apt.id === excludeAppointmentId) continue;

      const [aptHours, aptMinutes] = apt.appointment_time.split(":").map(Number);
      const aptStartMinutes = aptHours * 60 + aptMinutes;
      const aptEndMinutes = aptStartMinutes + apt.duration;

      // Check overlap: start1 < end2 AND start2 < end1
      if (newStartMinutes < aptEndMinutes && aptStartMinutes < newEndMinutes) {
        return true;
      }
    }

    return false;
  };

  // Create new appointment
  const createAppointment = useMutation({
    mutationFn: async (newAppointment: NewAppointment) => {
      // Check for conflicts
      const hasConflict = await checkConflict(
        newAppointment.dentist_id,
        newAppointment.appointment_date,
        newAppointment.appointment_time,
        newAppointment.duration
      );

      if (hasConflict) {
        throw new Error("CONFLICT");
      }

      const { data, error } = await supabase
        .from("appointments")
        .insert([newAppointment])
        .select(`
          id,
          patient_id,
          dentist_id,
          appointment_date,
          appointment_time,
          type,
          duration,
          status,
          notes,
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        console.error("Error creating appointment:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Consulta agendada",
        description: "A consulta foi agendada com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error("Error creating appointment:", error);
      if (error.message === "CONFLICT") {
        toast({
          title: "Conflito de horário",
          description: "Já existe uma consulta agendada neste horário para este dentista.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao agendar consulta",
          description: "Ocorreu um erro ao agendar a consulta. Tente novamente.",
          variant: "destructive",
        });
      }
    },
  });

  // Update appointment
  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Appointment> & { id: string }) => {
      // Check for conflicts if time-related fields are being updated
      if (updateData.dentist_id && updateData.appointment_date && updateData.appointment_time && updateData.duration) {
        const hasConflict = await checkConflict(
          updateData.dentist_id,
          updateData.appointment_date,
          updateData.appointment_time,
          updateData.duration,
          id // Exclude current appointment from conflict check
        );

        if (hasConflict) {
          throw new Error("CONFLICT");
        }
      }

      const { data, error } = await supabase
        .from("appointments")
        .update(updateData)
        .eq("id", id)
        .select(`
          id,
          patient_id,
          dentist_id,
          appointment_date,
          appointment_time,
          type,
          duration,
          status,
          notes,
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        console.error("Error updating appointment:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Consulta atualizada",
        description: "A consulta foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating appointment:", error);
      if (error.message === "CONFLICT") {
        toast({
          title: "Conflito de horário",
          description: "Já existe uma consulta agendada neste horário para este dentista.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao atualizar consulta",
          description: "Ocorreu um erro ao atualizar a consulta. Tente novamente.",
          variant: "destructive",
        });
      }
    },
  });

  // Delete appointment
  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);

      if (error) {
        console.error("Error deleting appointment:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Consulta excluída",
        description: "A consulta foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error deleting appointment:", error);
      toast({
        title: "Erro ao excluir consulta",
        description: "Ocorreu um erro ao excluir a consulta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    appointments,
    isLoading,
    error,
    createAppointment: createAppointment.mutate,
    updateAppointment: updateAppointment.mutate,
    deleteAppointment: deleteAppointment.mutate,
    isCreating: createAppointment.isPending,
    isUpdating: updateAppointment.isPending,
    isDeleting: deleteAppointment.isPending,
  };
};