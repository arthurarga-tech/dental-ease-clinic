import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PatientIndicators {
  hasActiveBudget: boolean;
  hasMedicalRecord: boolean;
}

export const usePatientIndicators = () => {
  // Fetch patients with active budgets (Pendente or Aprovado)
  const { data: patientsWithBudgets } = useQuery({
    queryKey: ["patient-budget-indicators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("patient_id, status")
        .in("status", ["Pendente", "Aprovado"]);

      if (error) throw error;

      // Return set of patient IDs with active budgets
      const patientIds = new Set<string>();
      data?.forEach((budget) => patientIds.add(budget.patient_id));
      return patientIds;
    },
  });

  // Fetch patients with medical records
  const { data: patientsWithRecords } = useQuery({
    queryKey: ["patient-record-indicators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_records")
        .select("patient_id");

      if (error) throw error;

      // Return set of patient IDs with medical records
      const patientIds = new Set<string>();
      data?.forEach((record) => patientIds.add(record.patient_id));
      return patientIds;
    },
  });

  const getIndicators = (patientId: string): PatientIndicators => {
    return {
      hasActiveBudget: patientsWithBudgets?.has(patientId) || false,
      hasMedicalRecord: patientsWithRecords?.has(patientId) || false,
    };
  };

  return {
    getIndicators,
    isLoading: !patientsWithBudgets || !patientsWithRecords,
  };
};
