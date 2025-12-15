import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PatientDentist {
  dentist_id: string;
  dentist_name: string;
}

export const usePatientAppointmentDentists = (patientId: string | undefined) => {
  const { data: appointmentDentists, isLoading } = useQuery({
    queryKey: ["patient-appointment-dentists", patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          dentist_id,
          dentists (
            id,
            name
          )
        `)
        .eq("patient_id", patientId)
        .not("dentist_id", "is", null);

      if (error) throw error;

      // Get unique dentists
      const uniqueDentists = new Map<string, PatientDentist>();
      data?.forEach((apt: any) => {
        if (apt.dentist_id && apt.dentists) {
          uniqueDentists.set(apt.dentist_id, {
            dentist_id: apt.dentist_id,
            dentist_name: apt.dentists.name,
          });
        }
      });

      return Array.from(uniqueDentists.values());
    },
    enabled: !!patientId,
  });

  return {
    appointmentDentists: appointmentDentists || [],
    isLoading,
  };
};
