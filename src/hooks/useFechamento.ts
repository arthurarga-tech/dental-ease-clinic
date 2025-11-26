import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CardFee {
  id: string;
  payment_method_id: string;
  fee_percentage: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  payment_methods?: {
    name: string;
  };
}

export interface DentistSettlement {
  id: string;
  dentist_id: string;
  period_start: string;
  period_end: string;
  gross_amount: number;
  card_fees_deducted: number;
  commission_percentage: number;
  net_amount: number;
  status: string;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  dentists?: {
    name: string;
    email: string;
  };
}

export interface NewCardFee {
  payment_method_id: string;
  fee_percentage: number;
  description?: string;
}

export interface NewSettlement {
  dentist_id: string;
  period_start: string;
  period_end: string;
  gross_amount: number;
  card_fees_deducted: number;
  commission_percentage: number;
  net_amount: number;
  status?: string;
  payment_date?: string;
  notes?: string;
}

export const useFechamento = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch card fees
  const { data: cardFees, isLoading: isLoadingCardFees } = useQuery({
    queryKey: ["cardFees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_fees")
        .select(`
          *,
          payment_methods (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CardFee[];
    },
  });

  // Fetch dentist settlements
  const { data: settlements, isLoading: isLoadingSettlements } = useQuery({
    queryKey: ["dentistSettlements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dentist_settlements")
        .select(`
          *,
          dentists (
            name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DentistSettlement[];
    },
  });

  // Fetch accounts payable (pending expenses)
  const { data: accountsPayable, isLoading: isLoadingAccountsPayable } = useQuery({
    queryKey: ["accountsPayable"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select(`
          *,
          financial_categories (
            name,
            type
          ),
          payment_methods (
            name
          )
        `)
        .eq("type", "Despesa")
        .in("status", ["Pendente", "Vencido"])
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Create card fee
  const createCardFee = useMutation({
    mutationFn: async (newFee: NewCardFee) => {
      const { data, error } = await supabase
        .from("card_fees")
        .insert(newFee)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardFees"] });
      toast({
        title: "Taxa cadastrada",
        description: "Taxa de cartão cadastrada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar taxa",
        description: error.message,
      });
    },
  });

  // Update card fee
  const updateCardFee = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CardFee> & { id: string }) => {
      const { data, error } = await supabase
        .from("card_fees")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardFees"] });
      toast({
        title: "Taxa atualizada",
        description: "Taxa de cartão atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar taxa",
        description: error.message,
      });
    },
  });

  // Create settlement
  const createSettlement = useMutation({
    mutationFn: async (newSettlement: NewSettlement) => {
      const { data, error } = await supabase
        .from("dentist_settlements")
        .insert(newSettlement)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dentistSettlements"] });
      toast({
        title: "Fechamento gerado",
        description: "Fechamento gerado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao gerar fechamento",
        description: error.message,
      });
    },
  });

  // Update settlement
  const updateSettlement = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DentistSettlement> & { id: string }) => {
      const { data, error } = await supabase
        .from("dentist_settlements")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dentistSettlements"] });
      toast({
        title: "Fechamento atualizado",
        description: "Fechamento atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar fechamento",
        description: error.message,
      });
    },
  });

  return {
    cardFees,
    isLoadingCardFees,
    settlements,
    isLoadingSettlements,
    accountsPayable,
    isLoadingAccountsPayable,
    createCardFee: createCardFee.mutate,
    updateCardFee: updateCardFee.mutate,
    createSettlement: createSettlement.mutate,
    updateSettlement: updateSettlement.mutate,
    isCreatingCardFee: createCardFee.isPending,
    isUpdatingCardFee: updateCardFee.isPending,
    isCreatingSettlement: createSettlement.isPending,
    isUpdatingSettlement: updateSettlement.isPending,
  };
};
