import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DentistReceivable {
  id: string;
  period_start: string;
  period_end: string;
  gross_amount: number;
  card_fees_deducted: number;
  commission_percentage: number;
  net_amount: number;
  status: string;
  payment_date: string | null;
  notes: string | null;
}

export const useDentistReceivables = (dentistId?: string) => {
  const { data: receivables, isLoading } = useQuery({
    queryKey: ["dentist-receivables", dentistId],
    queryFn: async () => {
      if (!dentistId) return [];

      const { data, error } = await supabase
        .from("dentist_settlements")
        .select("*")
        .eq("dentist_id", dentistId)
        .order("period_start", { ascending: false });

      if (error) {
        console.error("Error fetching dentist receivables:", error);
        throw error;
      }

      return data as DentistReceivable[];
    },
    enabled: !!dentistId,
  });

  const pendingReceivables = receivables?.filter(
    (r) => r.status === "Pendente"
  ) || [];

  const totalPending = pendingReceivables.reduce(
    (sum, r) => sum + r.net_amount,
    0
  );

  const paidReceivables = receivables?.filter(
    (r) => r.status === "Pago"
  ) || [];

  const totalPaid = paidReceivables.reduce(
    (sum, r) => sum + r.net_amount,
    0
  );

  return {
    receivables: receivables || [],
    pendingReceivables,
    paidReceivables,
    totalPending,
    totalPaid,
    isLoading,
  };
};
