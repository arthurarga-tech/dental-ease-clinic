import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Budget {
  id: string;
  patient_id: string;
  dentist_id: string | null;
  budget_date: string;
  procedures: string;
  total_amount: number;
  discount: number;
  final_amount: number;
  status: string;
  valid_until: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patients?: {
    id: string;
    name: string;
    phone: string;
  };
  dentists?: {
    id: string;
    name: string;
  };
}

export interface NewBudget {
  patient_id: string;
  dentist_id?: string;
  budget_date: string;
  procedures: string;
  total_amount: number;
  discount?: number;
  final_amount: number;
  status: string;
  valid_until: string;
  notes?: string;
}

export const useBudgets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select(`
          *,
          patients (
            id,
            name,
            phone
          ),
          dentists (
            id,
            name
          )
        `)
        .order("budget_date", { ascending: false });

      if (error) throw error;
      return data as Budget[];
    },
  });

  // Check if patient has an active (Pendente or Aprovado) budget
  const checkDuplicateBudget = async (patientId: string, excludeBudgetId?: string): Promise<boolean> => {
    const query = supabase
      .from("budgets")
      .select("id")
      .eq("patient_id", patientId)
      .in("status", ["Pendente", "Aprovado"]);
    
    if (excludeBudgetId) {
      query.neq("id", excludeBudgetId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data?.length || 0) > 0;
  };

  const createBudget = useMutation({
    mutationFn: async (newBudget: NewBudget) => {
      const { data, error } = await supabase
        .from("budgets")
        .insert([newBudget])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({
        title: "Orçamento criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar orçamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<NewBudget> & { id: string }) => {
      const { data, error } = await supabase
        .from("budgets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({
        title: "Orçamento atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar orçamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({
        title: "Orçamento excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir orçamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    budgets,
    isLoading,
    createBudget: createBudget.mutate,
    updateBudget: updateBudget.mutate,
    deleteBudget: deleteBudget.mutate,
    isCreating: createBudget.isPending,
    isUpdating: updateBudget.isPending,
    isDeleting: deleteBudget.isPending,
    checkDuplicateBudget,
  };
};
