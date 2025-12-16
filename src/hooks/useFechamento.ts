import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";

export interface DentistCommissionCalculation {
  dentist_id: string;
  dentist_name: string;
  dentist_email: string | null;
  commission_percentage: number;
  total_revenue: number;
  card_fees_total: number;
  net_after_fees: number;
  commission_amount: number;
  transactions_count: number;
  transactions: Array<{
    id: string;
    amount: number;
    description: string | null;
    transaction_date: string;
    payment_method_name: string | null;
    card_fee_percentage: number;
    card_fee_amount: number;
  }>;
}

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

  // Delete settlement
  const deleteSettlement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dentist_settlements")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dentistSettlements"] });
      toast({
        title: "Fechamento excluído",
        description: "Fechamento excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir fechamento",
        description: error.message,
      });
    },
  });

  // State for commission calculations
  const [commissionCalculations, setCommissionCalculations] = useState<DentistCommissionCalculation[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate commissions for a period
  const calculateCommissions = useCallback(async (periodStart: string, periodEnd: string) => {
    setIsCalculating(true);
    try {
      // Fetch all revenue transactions with dentist_id in the period
      const { data: transactions, error: transError } = await supabase
        .from("financial_transactions")
        .select(`
          id,
          amount,
          description,
          transaction_date,
          dentist_id,
          payment_method_id,
          payment_methods (
            id,
            name
          )
        `)
        .eq("type", "Receita")
        .eq("status", "Pago")
        .not("dentist_id", "is", null)
        .gte("transaction_date", periodStart)
        .lte("transaction_date", periodEnd);

      if (transError) throw transError;

      // Fetch all dentists
      const { data: dentists, error: dentError } = await supabase
        .from("dentists")
        .select("id, name, email, commission_percentage")
        .eq("status", "Ativo");

      if (dentError) throw dentError;

      // Fetch card fees
      const { data: fees, error: feeError } = await supabase
        .from("card_fees")
        .select("payment_method_id, fee_percentage");

      if (feeError) throw feeError;

      // Create a map of payment method fees
      const feeMap = new Map<string, number>();
      fees?.forEach(fee => {
        feeMap.set(fee.payment_method_id, Number(fee.fee_percentage));
      });

      // Group transactions by dentist and calculate
      const dentistMap = new Map<string, DentistCommissionCalculation>();

      // Initialize with all active dentists
      dentists?.forEach(dentist => {
        dentistMap.set(dentist.id, {
          dentist_id: dentist.id,
          dentist_name: dentist.name,
          dentist_email: dentist.email,
          commission_percentage: Number(dentist.commission_percentage) || 50,
          total_revenue: 0,
          card_fees_total: 0,
          net_after_fees: 0,
          commission_amount: 0,
          transactions_count: 0,
          transactions: [],
        });
      });

      // Process transactions
      transactions?.forEach(trans => {
        if (!trans.dentist_id) return;

        const dentistCalc = dentistMap.get(trans.dentist_id);
        if (!dentistCalc) return;

        const amount = Number(trans.amount);
        const paymentMethodId = trans.payment_method_id;
        const feePercentage = paymentMethodId ? (feeMap.get(paymentMethodId) || 0) : 0;
        const feeAmount = amount * (feePercentage / 100);

        dentistCalc.total_revenue += amount;
        dentistCalc.card_fees_total += feeAmount;
        dentistCalc.transactions_count += 1;
        dentistCalc.transactions.push({
          id: trans.id,
          amount: amount,
          description: trans.description,
          transaction_date: trans.transaction_date,
          payment_method_name: trans.payment_methods?.name || null,
          card_fee_percentage: feePercentage,
          card_fee_amount: feeAmount,
        });
      });

      // Calculate final values
      dentistMap.forEach(calc => {
        calc.net_after_fees = calc.total_revenue - calc.card_fees_total;
        calc.commission_amount = calc.net_after_fees * (calc.commission_percentage / 100);
      });

      // Filter only dentists with transactions and convert to array
      const results = Array.from(dentistMap.values()).filter(calc => calc.transactions_count > 0);
      
      setCommissionCalculations(results);
      
      if (results.length === 0) {
        toast({
          title: "Nenhuma transação encontrada",
          description: "Não há receitas com dentista associado no período selecionado.",
        });
      }

      return results;
    } catch (error: any) {
      console.error("Error calculating commissions:", error);
      toast({
        variant: "destructive",
        title: "Erro ao calcular comissões",
        description: error.message || "Ocorreu um erro ao calcular as comissões.",
      });
      return [];
    } finally {
      setIsCalculating(false);
    }
  }, [toast]);

  // Helper to get next 10th of month
  const getNextTenth = () => {
    const today = new Date();
    const currentDay = today.getDate();
    let targetDate: Date;
    
    if (currentDay < 10) {
      // Still this month
      targetDate = new Date(today.getFullYear(), today.getMonth(), 10);
    } else {
      // Next month
      targetDate = new Date(today.getFullYear(), today.getMonth() + 1, 10);
    }
    
    return targetDate.toISOString().split('T')[0];
  };

  // Generate settlement from calculation
  const generateSettlement = useCallback(async (
    calculation: DentistCommissionCalculation,
    periodStart: string,
    periodEnd: string
  ) => {
    try {
      // 1. Create settlement
      const settlement: NewSettlement = {
        dentist_id: calculation.dentist_id,
        period_start: periodStart,
        period_end: periodEnd,
        gross_amount: calculation.total_revenue,
        card_fees_deducted: calculation.card_fees_total,
        commission_percentage: calculation.commission_percentage,
        net_amount: calculation.commission_amount,
        status: "Pendente",
      };

      const { data: settlementData, error: settlementError } = await supabase
        .from("dentist_settlements")
        .insert(settlement)
        .select()
        .single();

      if (settlementError) throw settlementError;

      // 2. Find "Salário" category
      const { data: categories, error: catError } = await supabase
        .from("financial_categories")
        .select("id")
        .eq("name", "Salários")
        .eq("type", "Despesa")
        .limit(1);

      if (catError) throw catError;

      const categoryId = categories?.[0]?.id;
      if (!categoryId) {
        toast({
          variant: "destructive",
          title: "Categoria não encontrada",
          description: "Categoria 'Salários' não encontrada. Crie a categoria antes de gerar o fechamento.",
        });
        return;
      }

      // 3. Create expense transaction
      const today = new Date().toISOString().split('T')[0];
      const dueDate = getNextTenth();

      const { error: transError } = await supabase
        .from("financial_transactions")
        .insert({
          type: "Despesa",
          category_id: categoryId,
          amount: calculation.commission_amount,
          transaction_date: today,
          due_date: dueDate,
          status: "Pendente",
          description: `Fechamento ${calculation.dentist_name}`,
          dentist_id: calculation.dentist_id,
        });

      if (transError) throw transError;

      queryClient.invalidateQueries({ queryKey: ["dentistSettlements"] });
      queryClient.invalidateQueries({ queryKey: ["accountsPayable"] });
      queryClient.invalidateQueries({ queryKey: ["financialTransactions"] });

      toast({
        title: "Fechamento gerado",
        description: `Fechamento e despesa de ${calculation.dentist_name} criados com sucesso.`,
      });
    } catch (error: any) {
      console.error("Error generating settlement:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar fechamento",
        description: error.message,
      });
    }
  }, [queryClient, toast]);

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
    deleteSettlement: deleteSettlement.mutate,
    isCreatingCardFee: createCardFee.isPending,
    isUpdatingCardFee: updateCardFee.isPending,
    isCreatingSettlement: createSettlement.isPending,
    isUpdatingSettlement: updateSettlement.isPending,
    isDeletingSettlement: deleteSettlement.isPending,
    // Commission calculation
    commissionCalculations,
    isCalculating,
    calculateCommissions,
    generateSettlement,
  };
};
