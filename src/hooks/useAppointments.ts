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

  // Create new appointment
  const createAppointment = useMutation({
    mutationFn: async (newAppointment: NewAppointment) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert([newAppointment])
        .select()
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
    onError: (error) => {
      console.error("Error creating appointment:", error);
      toast({
        title: "Erro ao agendar consulta",
        description: "Ocorreu um erro ao agendar a consulta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update appointment
  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updateData)
        .eq("id", id)
        .select()
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
    onError: (error) => {
      console.error("Error updating appointment:", error);
      toast({
        title: "Erro ao atualizar consulta",
        description: "Ocorreu um erro ao atualizar a consulta. Tente novamente.",
        variant: "destructive",
      });
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