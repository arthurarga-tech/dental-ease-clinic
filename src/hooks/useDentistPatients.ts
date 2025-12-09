import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDentistProfile } from "@/hooks/useDentistProfile";
import { Patient } from "@/hooks/usePatients";

export const useDentistPatients = () => {
  const { dentist } = useDentistProfile();

  const { data: patients = [], isLoading, error } = useQuery({
    queryKey: ["dentist-patients", dentist?.id],
    queryFn: async () => {
      if (!dentist?.id) {
        return [];
      }

      // Get patients that have appointments with this dentist
      const { data: appointmentPatients, error: appointmentError } = await supabase
        .from("appointments")
        .select("patient_id")
        .eq("dentist_id", dentist.id);

      if (appointmentError) {
        console.error("Error fetching appointment patients:", appointmentError);
        throw appointmentError;
      }

      // Get patients that have medical record entries from this dentist
      const { data: medicalEntries, error: entriesError } = await supabase
        .from("medical_record_entries")
        .select("medical_record_id")
        .eq("dentist_id", dentist.id);

      if (entriesError) {
        console.error("Error fetching medical entries:", entriesError);
        throw entriesError;
      }

      // Get the patient IDs from medical records
      let medicalRecordPatientIds: string[] = [];
      if (medicalEntries && medicalEntries.length > 0) {
        const recordIds = [...new Set(medicalEntries.map(e => e.medical_record_id))];
        const { data: records, error: recordsError } = await supabase
          .from("medical_records")
          .select("patient_id")
          .in("id", recordIds);
        
        if (recordsError) {
          console.error("Error fetching medical records:", recordsError);
          throw recordsError;
        }
        medicalRecordPatientIds = records?.map(r => r.patient_id) || [];
      }

      // Combine unique patient IDs
      const appointmentPatientIds = appointmentPatients?.map(a => a.patient_id) || [];
      const uniquePatientIds = [...new Set([...appointmentPatientIds, ...medicalRecordPatientIds])];

      if (uniquePatientIds.length === 0) {
        return [];
      }

      // Fetch patient details with last appointment date
      const { data: patientsData, error: patientsError } = await supabase
        .from("patients")
        .select(`
          *,
          appointments!inner(appointment_date)
        `)
        .in("id", uniquePatientIds)
        .order("name");

      if (patientsError) {
        // Fallback without the inner join if no appointments
        const { data: fallbackPatients, error: fallbackError } = await supabase
          .from("patients")
          .select("*")
          .in("id", uniquePatientIds)
          .order("name");

        if (fallbackError) {
          console.error("Error fetching patients:", fallbackError);
          throw fallbackError;
        }

        return (fallbackPatients || []).map(patient => ({
          ...patient,
          last_appointment_date: undefined
        })) as Patient[];
      }

      // Process to get the latest appointment date for each patient
      const patientMap = new Map<string, any>();
      patientsData?.forEach(row => {
        const existing = patientMap.get(row.id);
        const appointments = row.appointments as { appointment_date: string }[] | null;
        const appointmentDate = appointments?.[0]?.appointment_date;
        
        if (!existing) {
          patientMap.set(row.id, {
            ...row,
            appointments: undefined,
            last_appointment_date: appointmentDate
          });
        } else if (appointmentDate && (!existing.last_appointment_date || appointmentDate > existing.last_appointment_date)) {
          existing.last_appointment_date = appointmentDate;
        }
      });

      return Array.from(patientMap.values()) as Patient[];
    },
    enabled: !!dentist?.id,
  });

  return {
    patients,
    isLoading,
    error,
    dentistId: dentist?.id,
  };
};
