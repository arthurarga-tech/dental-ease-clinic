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

      // Get medical records that have entries created by this dentist
      const { data: entriesData, error: entriesError } = await supabase
        .from("medical_record_entries")
        .select("medical_record_id")
        .eq("dentist_id", dentist.id);

      if (entriesError) {
        console.error("Error fetching dentist entries:", entriesError);
        throw entriesError;
      }

      if (!entriesData || entriesData.length === 0) {
        return [];
      }

      const uniqueRecordIds = [...new Set(entriesData.map(e => e.medical_record_id))];

      // Fetch medical records with patient data
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
        .in("id", uniqueRecordIds)
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
