import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MedicalRecordEntry {
  id: string;
  medical_record_id: string;
  record_date: string;
  procedure_type: string;
  diagnosis: string;
  treatment: string;
  observations: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NewMedicalRecordEntry {
  medical_record_id: string;
  record_date: string;
  procedure_type: string;
  diagnosis: string;
  treatment: string;
  observations?: string;
  status: string;
}

export const useMedicalRecordEntries = (medicalRecordId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch entries for a specific medical record
  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ['medicalRecordEntries', medicalRecordId],
    queryFn: async () => {
      if (!medicalRecordId) return [];
      
      const { data, error } = await supabase
        .from('medical_record_entries')
        .select('*')
        .eq('medical_record_id', medicalRecordId)
        .order('record_date', { ascending: false });

      if (error) throw error;
      return data as MedicalRecordEntry[];
    },
    enabled: !!medicalRecordId,
  });

  // Create entry mutation
  const createEntry = useMutation({
    mutationFn: async (newEntry: NewMedicalRecordEntry) => {
      const { data, error } = await supabase
        .from('medical_record_entries')
        .insert([newEntry])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecordEntries'] });
      toast({
        title: "Consulta registrada",
        description: "A consulta foi adicionada ao prontuário.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar consulta",
        description: "Não foi possível adicionar a consulta. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error creating entry:', error);
    },
  });

  // Update entry mutation
  const updateEntry = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MedicalRecordEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('medical_record_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecordEntries'] });
      toast({
        title: "Consulta atualizada",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar consulta",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error updating entry:', error);
    },
  });

  // Delete entry mutation
  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medical_record_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecordEntries'] });
      toast({
        title: "Consulta excluída",
        description: "A consulta foi removida do prontuário.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir consulta",
        description: "Não foi possível remover a consulta. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error deleting entry:', error);
    },
  });

  return {
    entries,
    isLoading,
    error,
    createEntry: createEntry.mutate,
    updateEntry: updateEntry.mutate,
    deleteEntry: deleteEntry.mutate,
    isCreating: createEntry.isPending,
    isUpdating: updateEntry.isPending,
    isDeleting: deleteEntry.isPending,
  };
};
