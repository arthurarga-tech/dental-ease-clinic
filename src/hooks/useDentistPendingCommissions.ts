import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDentistPendingCommissions = (dentistId?: string, commissionPercentage?: number) => {
  const { data, isLoading } = useQuery({
    queryKey: ["dentist-pending-commissions", dentistId],
    queryFn: async () => {
      if (!dentistId) return { totalPendingCommission: 0 };

      // Fetch all paid revenue transactions for this dentist
      const { data: transactions, error: transactionsError } = await supabase
        .from("financial_transactions")
        .select(`
          id,
          amount,
          payment_method_id,
          transaction_date
        `)
        .eq("dentist_id", dentistId)
        .eq("type", "Receita")
        .eq("status", "Pago");

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        throw transactionsError;
      }

      // Fetch card fees to deduct from card payments
      const { data: cardFees, error: cardFeesError } = await supabase
        .from("card_fees")
        .select("payment_method_id, fee_percentage");

      if (cardFeesError) {
        console.error("Error fetching card fees:", cardFeesError);
        throw cardFeesError;
      }

      // Fetch already paid/settled amounts
      const { data: settlements, error: settlementsError } = await supabase
        .from("dentist_settlements")
        .select("gross_amount, period_start, period_end")
        .eq("dentist_id", dentistId);

      if (settlementsError) {
        console.error("Error fetching settlements:", settlementsError);
        throw settlementsError;
      }

      // Create a map of payment method to fee percentage
      const feeMap = new Map<string, number>();
      cardFees?.forEach((fee) => {
        feeMap.set(fee.payment_method_id, fee.fee_percentage);
      });

      // Calculate gross revenue and net revenue (after card fees)
      let grossRevenue = 0;
      let totalCardFees = 0;

      transactions?.forEach((transaction) => {
        grossRevenue += transaction.amount;
        
        // Deduct card fees if applicable
        if (transaction.payment_method_id && feeMap.has(transaction.payment_method_id)) {
          const feePercentage = feeMap.get(transaction.payment_method_id) || 0;
          totalCardFees += transaction.amount * (feePercentage / 100);
        }
      });

      const netRevenue = grossRevenue - totalCardFees;

      // Calculate total settled gross amounts
      const settledGrossAmount = settlements?.reduce((sum, s) => sum + s.gross_amount, 0) || 0;

      // Calculate pending gross (unsettled revenue)
      const pendingGross = grossRevenue - settledGrossAmount;

      // Calculate pending card fees proportionally
      const pendingCardFees = grossRevenue > 0 
        ? (pendingGross / grossRevenue) * totalCardFees 
        : 0;

      // Calculate pending net amount
      const pendingNet = pendingGross - pendingCardFees;

      // Apply commission percentage
      const commission = commissionPercentage ?? 50;
      const totalPendingCommission = pendingNet * (commission / 100);

      return {
        totalPendingCommission: Math.max(0, totalPendingCommission),
        pendingGross,
        pendingCardFees,
        pendingNet,
      };
    },
    enabled: !!dentistId,
  });

  return {
    totalPendingCommission: data?.totalPendingCommission || 0,
    isLoading,
  };
};
