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

      // Fetch existing settlements to exclude transactions from closed periods
      const { data: settlements, error: settlementsError } = await supabase
        .from("dentist_settlements")
        .select("period_start, period_end")
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

      // Helper function to check if a transaction date is within any settlement period
      const isInSettledPeriod = (transactionDate: string): boolean => {
        if (!settlements || settlements.length === 0) return false;
        
        const txDate = new Date(transactionDate);
        return settlements.some((settlement) => {
          const periodStart = new Date(settlement.period_start);
          const periodEnd = new Date(settlement.period_end);
          return txDate >= periodStart && txDate <= periodEnd;
        });
      };

      // Calculate pending revenue (only transactions NOT in any settled period)
      let pendingGross = 0;
      let pendingCardFees = 0;

      transactions?.forEach((transaction) => {
        // Skip transactions that are within a settled period
        if (isInSettledPeriod(transaction.transaction_date)) {
          return;
        }

        pendingGross += transaction.amount;
        
        // Deduct card fees if applicable
        if (transaction.payment_method_id && feeMap.has(transaction.payment_method_id)) {
          const feePercentage = feeMap.get(transaction.payment_method_id) || 0;
          pendingCardFees += transaction.amount * (feePercentage / 100);
        }
      });

      // Calculate pending net amount (after card fees)
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
