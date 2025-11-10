import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    ? new Date(lastAppointmentDate)
    : new Date(createdAt);

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
