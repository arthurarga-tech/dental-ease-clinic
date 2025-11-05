import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MedicalRecord {
  id: string;
  patient_id: string;
  record_date: string;
  procedure_type: string;
  diagnosis: string;
  treatment: string;
  observations: string | null;
  status: string;
  odontogram: Record<string, any>;
  created_at: string;
  updated_at: string;
  patients: {
    id: string;
    name: string;
  };
}

export interface NewMedicalRecord {
  patient_id: string;
  record_date: string;
  procedure_type: string;
  diagnosis: string;
  treatment: string;
  observations?: string;
  status: string;
  odontogram?: Record<string, any>;
}

export const useMedicalRecords = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all medical records with patient information
  const { data: medicalRecords = [], isLoading, error } = useQuery({
    queryKey: ['medicalRecords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients (
            id,
            name
          )
        `)
        .order('record_date', { ascending: false });

      if (error) throw error;
      return data as MedicalRecord[];
    },
  });

  // Create medical record mutation
  const createMedicalRecord = useMutation({
    mutationFn: async (newRecord: NewMedicalRecord) => {
      // Check if patient already has a medical record
      const { data: existingRecords } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', newRecord.patient_id);

      // If exists, move it to medical_record_entries
      if (existingRecords && existingRecords.length > 0) {
        const oldRecord = existingRecords[0];
        
        // Create entry from old record
        await supabase
          .from('medical_record_entries')
          .insert({
            medical_record_id: oldRecord.id,
            record_date: oldRecord.record_date,
            procedure_type: oldRecord.procedure_type,
            diagnosis: oldRecord.diagnosis,
            treatment: oldRecord.treatment,
            observations: oldRecord.observations,
            status: oldRecord.status
          });

        // Delete old record
        await supabase
          .from('medical_records')
          .delete()
          .eq('id', oldRecord.id);
      }

      // Create new record
      const { data, error } = await supabase
        .from('medical_records')
        .insert([newRecord])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      toast({
        title: "Registro criado com sucesso",
        description: "O prontuário foi adicionado ao sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar registro",
        description: "Não foi possível adicionar o prontuário. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error creating medical record:', error);
    },
  });

  // Update medical record mutation
  const updateMedicalRecord = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MedicalRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('medical_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      toast({
        title: "Registro atualizado com sucesso",
        description: "As alterações foram salvas no prontuário.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar registro",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error updating medical record:', error);
    },
  });

  // Delete medical record mutation
  const deleteMedicalRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      toast({
        title: "Registro excluído com sucesso",
        description: "O prontuário foi removido do sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir registro",
        description: "Não foi possível remover o prontuário. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error deleting medical record:', error);
    },
  });

  return {
    medicalRecords,
    isLoading,
    error,
    createMedicalRecord: createMedicalRecord.mutate,
    updateMedicalRecord: updateMedicalRecord.mutate,
    deleteMedicalRecord: deleteMedicalRecord.mutate,
    isCreating: createMedicalRecord.isPending,
    isUpdating: updateMedicalRecord.isPending,
    isDeleting: deleteMedicalRecord.isPending,
  };
};