import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte uma string de data YYYY-MM-DD para Date object sem considerar timezone
 * Evita problemas de timezone ao interpretar datas armazenadas como strings
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formata um Date object para string YYYY-MM-DD sem considerar timezone
 * Garante que o dia não mude devido a conversões de timezone
 */
export function formatLocalDate(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    date = new Date();
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Retorna a data atual formatada como YYYY-MM-DD
 */
export function getTodayLocalDate(): string {
  return formatLocalDate(new Date());
}

export type PatientStatusType = "Ativo" | "Em Alerta" | "Inativo";

export interface PatientStatusInfo {
  status: PatientStatusType;
  variant: "default" | "warning" | "destructive";
  icon: string;
  daysSinceLastActivity: number;
}

export function calculatePatientStatus(
  createdAt: string,
  lastAppointmentDate?: string
): PatientStatusInfo {
  const now = new Date();
  const referenceDate = lastAppointmentDate
    ? parseLocalDate(lastAppointmentDate)
    : parseLocalDate(createdAt.split('T')[0]); // Handle ISO datetime strings

  const diffTime = Math.abs(now.getTime() - referenceDate.getTime());
  const daysSinceLastActivity = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // < 90 dias (3 meses) = Ativo
  if (daysSinceLastActivity < 90) {
    return {
      status: "Ativo",
      variant: "default",
      icon: "✓",
      daysSinceLastActivity,
    };
  }

  // 90-180 dias (3-6 meses) = Em Alerta
  if (daysSinceLastActivity <= 180) {
    return {
      status: "Em Alerta",
      variant: "warning",
      icon: "⚠",
      daysSinceLastActivity,
    };
  }

  // > 180 dias (6 meses) = Inativo
  return {
    status: "Inativo",
    variant: "destructive",
    icon: "✗",
    daysSinceLastActivity,
  };
}
