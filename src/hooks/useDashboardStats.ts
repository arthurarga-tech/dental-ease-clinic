import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePatients } from "./usePatients";
import { useDentists } from "./useDentists";
import { useMedicalRecords } from "./useMedicalRecords";
import { parseLocalDate } from "@/lib/utils";

export const useDashboardStats = () => {
  const { patients } = usePatients();
  const { dentists } = useDentists();

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

  // Get financial transactions for revenue calculation
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
  } = useQuery({
    queryKey: ["financial_transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*");

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }

      return data || [];
    },
  });

  // Calculate stats
  const activePatients = patients.filter(p => p.status === "Ativo").length;
  
  const appointmentsToday = todayAppointments.length;
  
  // Financial calculations from real data
  const receitas = transactions.filter((t: any) => t.type === "Receita" && t.status === "Pago");
  const despesas = transactions.filter((t: any) => t.type === "Despesa" && t.status === "Pago");
  const receitasPendentes = transactions.filter((t: any) => t.type === "Receita" && t.status === "Pendente");
  
  const totalReceitas = receitas.reduce((sum, t: any) => sum + Number(t.amount), 0);
  const totalDespesas = despesas.reduce((sum, t: any) => sum + Number(t.amount), 0);
  const receitasPendentesTotal = receitasPendentes.reduce((sum, t: any) => sum + Number(t.amount), 0);
  const monthlyRevenue = totalReceitas;
  
  // Pending appointments (appointments with status "Agendado")
  const pendingAppointments = todayAppointments.filter(a => a.status === "Agendado").length;

  // Get today's birthdays
  const today = new Date();
  const todayMD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const birthdayPatients = patients.filter(patient => {
    if (!patient.birth_date) return false;
    const birthDate = parseLocalDate(patient.birth_date);
    const birthMD = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
    return birthMD === todayMD;
  });

  const birthdayDentists = dentists.filter(dentist => {
    if (!dentist.birth_date) return false;
    const birthDate = parseLocalDate(dentist.birth_date);
    const birthMD = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
    return birthMD === todayMD;
  });

  return {
    stats: {
      activePatients,
      appointmentsToday,
      monthlyRevenue,
      pendingAppointments,
      totalReceitas,
      totalDespesas,
      receitasPendentesTotal,
      receitasPendentesCount: receitasPendentes.length,
      saldoAtual: totalReceitas - totalDespesas,
    },
    todayAppointments,
    birthdayPatients,
    birthdayDentists,
    isLoading: isLoadingAppointments || isLoadingTransactions,
  };
};