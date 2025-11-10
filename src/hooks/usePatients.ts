import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  birth_date?: string;
  address?: string;
  medical_notes?: string;
  status: "Ativo" | "Inativo";
  created_at: string;
  updated_at: string;
  last_appointment_date?: string;
}

export interface NewPatient {
  name: string;
  email?: string;
  phone: string;
  birth_date?: string;
  address?: string;
  medical_notes?: string;
}

export const usePatients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all patients
  const {
    data: patients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select(`
          *,
          appointments(appointment_date)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching patients:", error);
        throw error;
      }

      // Process data to extract last appointment date
      const patientsWithLastAppointment = data.map((patient: any) => {
        const appointments = patient.appointments || [];
        const lastAppointment = appointments.length > 0
          ? appointments.reduce((latest: any, current: any) => {
              return new Date(current.appointment_date) > new Date(latest.appointment_date)
                ? current
                : latest;
            })
          : null;

        return {
          ...patient,
          last_appointment_date: lastAppointment?.appointment_date,
          appointments: undefined, // Remove appointments array
        };
      });

      return patientsWithLastAppointment as Patient[];
    },
  });

  // Create new patient
  const createPatient = useMutation({
    mutationFn: async (newPatient: NewPatient) => {
      const { data, error } = await supabase
        .from("patients")
        .insert([newPatient])
        .select()
        .single();

      if (error) {
        console.error("Error creating patient:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({
        title: "Paciente cadastrado!",
        description: "O paciente foi cadastrado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating patient:", error);
      toast({
        title: "Erro ao cadastrar paciente",
        description: "Ocorreu um erro ao cadastrar o paciente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update patient
  const updatePatient = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Patient> & { id: string }) => {
      const { data, error } = await supabase
        .from("patients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating patient:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({
        title: "Paciente atualizado!",
        description: "Os dados do paciente foram atualizados com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error updating patient:", error);
      toast({
        title: "Erro ao atualizar paciente",
        description: "Ocorreu um erro ao atualizar o paciente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Delete patient
  const deletePatient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("patients").delete().eq("id", id);

      if (error) {
        console.error("Error deleting patient:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({
        title: "Paciente removido!",
        description: "O paciente foi removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error deleting patient:", error);
      toast({
        title: "Erro ao remover paciente",
        description: "Ocorreu um erro ao remover o paciente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    patients,
    isLoading,
    error,
    createPatient: createPatient.mutate,
    updatePatient: updatePatient.mutate,
    deletePatient: deletePatient.mutate,
    isCreating: createPatient.isPending,
    isUpdating: updatePatient.isPending,
    isDeleting: deletePatient.isPending,
  };
};