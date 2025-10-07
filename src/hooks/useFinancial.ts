import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FinancialCategory {
  id: string;
  name: string;
  type: "Receita" | "Despesa";
  description?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
}

export interface Partner {
  id: string;
  name: string;
}

export interface FinancialTransaction {
  id: string;
  type: "Receita" | "Despesa";
  patient_id?: string;
  appointment_id?: string;
  category_id: string;
  payment_method_id?: string;
  amount: number;
  description?: string;
  transaction_date: string;
  due_date?: string;
  status: "Pendente" | "Pago" | "Vencido" | "Cancelado";
  created_at: string;
  updated_at: string;
  financial_categories: FinancialCategory;
  payment_methods?: PaymentMethod;
  patients?: {
    id: string;
    name: string;
  };
  transaction_partners?: {
    partner_id: string;
    partners: Partner;
  }[];
}

export interface NewTransaction {
  type: "Receita" | "Despesa";
  patient_id?: string;
  appointment_id?: string;
  category_id: string;
  payment_method_id?: string;
  amount: number;
  description?: string;
  transaction_date: string;
  due_date?: string;
  status: "Pendente" | "Pago" | "Vencido" | "Cancelado";
  partner_ids?: string[];
}

export const useFinancial = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch transactions
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
  } = useQuery({
    queryKey: ["financial_transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select(`
          *,
          financial_categories (
            id,
            name,
            type,
            description
          ),
          payment_methods (
            id,
            name
          ),
          patients (
            id,
            name
          ),
          transaction_partners (
            partner_id,
            partners (
              id,
              name
            )
          )
        `)
        .order("transaction_date", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }

      return data as FinancialTransaction[];
    },
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ["financial_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      return data as FinancialCategory[];
    },
  });

  // Fetch payment methods
  const {
    data: paymentMethods = [],
    isLoading: isLoadingPaymentMethods,
  } = useQuery({
    queryKey: ["payment_methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching payment methods:", error);
        throw error;
      }

      return data as PaymentMethod[];
    },
  });

  // Fetch partners
  const {
    data: partners = [],
    isLoading: isLoadingPartners,
  } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching partners:", error);
        throw error;
      }

      return data as Partner[];
    },
  });

  // Create transaction
  const createTransaction = useMutation({
    mutationFn: async (newTransaction: NewTransaction) => {
      const { partner_ids, ...transactionData } = newTransaction;
      
      const { data, error } = await supabase
        .from("financial_transactions")
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        console.error("Error creating transaction:", error);
        throw error;
      }

      // Insert partner associations if provided
      if (partner_ids && partner_ids.length > 0) {
        const partnerAssociations = partner_ids.map(partner_id => ({
          transaction_id: data.id,
          partner_id,
        }));

        const { error: partnerError } = await supabase
          .from("transaction_partners")
          .insert(partnerAssociations);

        if (partnerError) {
          console.error("Error associating partners:", partnerError);
          throw partnerError;
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_transactions"] });
      toast({
        title: "Transação cadastrada",
        description: "A transação foi cadastrada com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating transaction:", error);
      toast({
        title: "Erro ao cadastrar transação",
        description: "Ocorreu um erro ao cadastrar a transação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update transaction
  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<NewTransaction> & { id: string }) => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating transaction:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_transactions"] });
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error updating transaction:", error);
      toast({
        title: "Erro ao atualizar transação",
        description: "Ocorreu um erro ao atualizar a transação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Delete transaction
  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financial_transactions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting transaction:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_transactions"] });
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Erro ao excluir transação",
        description: "Ocorreu um erro ao excluir a transação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    transactions,
    categories,
    paymentMethods,
    partners,
    isLoadingTransactions,
    isLoadingCategories,
    isLoadingPaymentMethods,
    isLoadingPartners,
    createTransaction: createTransaction.mutate,
    updateTransaction: updateTransaction.mutate,
    deleteTransaction: deleteTransaction.mutate,
    isCreating: createTransaction.isPending,
    isUpdating: updateTransaction.isPending,
    isDeleting: deleteTransaction.isPending,
  };
};
