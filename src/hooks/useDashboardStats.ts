import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePatients } from "./usePatients";
import { useMedicalRecords } from "./useMedicalRecords";

export const useDashboardStats = () => {
  const { patients } = usePatients();

  // Get today's appointments
  const todayString = new Date().toISOString().split('T')[0];

  const {
    data: todayAppointments = [],
    isLoading: isLoadingAppointments,
  } = useQuery({
    queryKey: ["appointments", "today", todayString],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (
            id,
            name,
            phone
          )
        `)
        .eq("appointment_date", todayString)
        .order("appointment_time");

      if (error) {
        console.error("Error fetching today's appointments:", error);
        throw error;
      }

      return data || [];
    },
  });

  // Get this month's medical records for revenue calculation
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  const {
    data: monthlyRecords = [],
    isLoading: isLoadingRecords,
  } = useQuery({
    queryKey: ["medical_records", "monthly", currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .gte("record_date", `${currentMonth}-01`)
        .lt("record_date", `${currentMonth}-32`);

      if (error) {
        console.error("Error fetching monthly records:", error);
        throw error;
      }

      return data || [];
    },
  });

  // Calculate stats
  const activePatients = patients.filter(p => p.status === "Ativo").length;
  
  const appointmentsToday = todayAppointments.length;
  
  // Simple revenue calculation - assume average price per procedure
  const averageProcedurePrice = 150; // R$ 150 per procedure
  const monthlyRevenue = monthlyRecords.length * averageProcedurePrice;
  
  // Pending appointments (appointments with status "Agendado")
  const pendingAppointments = todayAppointments.filter(a => a.status === "Agendado").length;

  // Get today's birthdays
  const today = new Date();
  const todayMD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const birthdayPatients = patients.filter(patient => {
    if (!patient.birth_date) return false;
    const birthDate = new Date(patient.birth_date);
    const birthMD = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
    return birthMD === todayMD;
  });

  return {
    stats: {
      activePatients,
      appointmentsToday,
      monthlyRevenue,
      pendingAppointments,
    },
    todayAppointments,
    birthdayPatients,
    isLoading: isLoadingAppointments || isLoadingRecords,
  };
};