import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDentistProfile } from "@/hooks/useDentistProfile";
import { MedicalRecord } from "@/hooks/useMedicalRecords";

export const useDentistMedicalRecords = () => {
  const { dentist } = useDentistProfile();

  const { data: medicalRecords = [], isLoading, error } = useQuery({
    queryKey: ["dentist-medical-records", dentist?.id],
    queryFn: async () => {
      if (!dentist?.id) {
        return [];
      }

      // Get patient IDs from appointments where this dentist is assigned
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("patient_id")
        .eq("dentist_id", dentist.id);

      if (appointmentsError) {
        console.error("Error fetching dentist appointments:", appointmentsError);
        throw appointmentsError;
      }

      if (!appointments || appointments.length === 0) {
        return [];
      }

      const uniquePatientIds = [...new Set(appointments.map(a => a.patient_id))];

      // Fetch medical records for patients this dentist has appointments with
      const { data: records, error: recordsError } = await supabase
        .from("medical_records")
        .select(`
          *,
          patients (
            id,
            name,
            phone,
            email
          )
        `)
        .in("patient_id", uniquePatientIds)
        .order("created_at", { ascending: false });

      if (recordsError) {
        console.error("Error fetching medical records:", recordsError);
        throw recordsError;
      }

      return records as MedicalRecord[];
    },
    enabled: !!dentist?.id,
  });

  return {
    medicalRecords,
    isLoading,
    error,
    dentistId: dentist?.id,
  };
};
